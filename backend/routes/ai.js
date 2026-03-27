const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../db');
const OpenAI = require('openai');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const { sendSuccess, sendError } = require('../utils/response');

// Initialize OpenAI client
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (e) {
  console.warn("OpenAI API key missing or invalid setup.");
}

// Rate limiting middleware: max 20 requests per minute per IP
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  message: { error: 'Too many requests from this IP, please try again after a minute' },
  standardHeaders: true,
  legacyHeaders: false,
});

// In-memory storage for session history (max 5 messages per session)
const sessions = new Map();

router.post('/chat', verifyToken, aiLimiter, async (req, res) => {
  try {
    const { message, sessionId: clientSessionId } = req.body;
    
    if (!message) {
      return sendError(res, 400, 'Message is required.');
    }

    if (!openai) {
      return sendError(res, 503, 'OpenAI API is not configured on the server.');
    }

    // 4. Maintain session and history
    const sessionId = clientSessionId || crypto.randomUUID();
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
    }
    const history = sessions.get(sessionId);

    // 1. Classify the user's question
    const classificationRes = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 'You are a classifier. Classify the user prompt into exactly one of these categories: "events", "clubs", "locations", or "general". Reply with ONLY the category name in lowercase.' 
        },
        { role: 'user', content: message }
      ],
      max_tokens: 10,
      temperature: 0
    });
    
    const category = classificationRes.choices[0].message.content.trim().toLowerCase();

    // 2. Query relevant PostgreSQL table based on classification
    let context = '';
    let sources = [];

    if (category.includes('events') || category === 'events') {
      const result = await db.query('SELECT title, description, date, time, venue FROM events ORDER BY date ASC LIMIT 5');
      sources = result.rows.map(r => r.title);
      context = result.rows.map(r => `Event: ${r.title}\nDate: ${new Date(r.date).toLocaleDateString()} at ${r.time}\nVenue: ${r.venue}\nDesc: ${r.description}`).join('\n\n');
    } else if (category.includes('clubs') || category === 'clubs') {
      const result = await db.query('SELECT club_name, description FROM clubs LIMIT 10');
      sources = result.rows.map(r => r.club_name);
      context = result.rows.map(r => `Club: ${r.club_name}\nDesc: ${r.description}`).join('\n\n');
    } else if (category.includes('locations') || category === 'locations') {
      const result = await db.query('SELECT location_name, description FROM campus_locations LIMIT 10');
      sources = result.rows.map(r => r.location_name);
      context = result.rows.map(r => `Location: ${r.location_name}\nDesc: ${r.description}`).join('\n\n');
    } else {
      context = 'General knowledge or no specific database records found.';
    }

    if (!context) {
      context = 'No matching campus records found.';
    }

    // 3. System prompt construction
    const systemPrompt = `You are CampMate, a helpful campus assistant for BVRIT. Answer only based on the provided context. If unsure, say so.\n\nContext:\n${context}`;

    // Add user message to history
    history.push({ role: 'user', content: message });
    
    // Ensure history does not exceed 5 messages (for this session)
    if (history.length > 5) {
      history.splice(0, history.length - 5);
    }

    // Build the messages array for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history
    ];

    // Generate completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 250,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    // Add assistant's reply to history
    history.push({ role: 'assistant', content: reply });
    if (history.length > 5) {
      history.splice(0, history.length - 5);
    }

    // 5. Return JSON payload
    return sendSuccess(res, 'AI response generated successfully', { reply, sources, sessionId });

  } catch (err) {
    console.error("OpenAI Error:", err.message || err);
    return sendError(res, 500, 'Failed to communicate with AI Service');
  }
});

module.exports = router;
