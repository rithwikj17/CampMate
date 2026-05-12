const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../db');
const OpenAI = require('openai');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const { sendSuccess, sendError } = require('../utils/response');

// Initialize OpenAI client
let openai = null; // Mocked

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

router.post('/chat', aiLimiter, async (req, res) => {
  try {
    const { message, sessionId: clientSessionId } = req.body;
    
    if (!message) {
      return sendError(res, 400, 'Message is required.');
    }

    // 4. Maintain session and history
    const sessionId = clientSessionId || crypto.randomUUID();
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, []);
    }
    const history = sessions.get(sessionId);

    // 1. Mock classify the user's question
    const lowerMessage = message.toLowerCase();
    let category = 'general';
    if (lowerMessage.includes('event') || lowerMessage.includes('hackathon') || lowerMessage.includes('fest')) {
        category = 'events';
    } else if (lowerMessage.includes('club') || lowerMessage.includes('join')) {
        category = 'clubs';
    } else if (lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('block') || lowerMessage.includes('hostel')) {
        category = 'locations';
    }

    // 2. Query relevant PostgreSQL table based on classification
    let context = '';
    let sources = [];
    let reply = '';

    if (category === 'events') {
      const result = await db.query('SELECT title, description, date, time, venue FROM events ORDER BY date ASC LIMIT 3');
      sources = result.rows.map(r => r.title);
      if (result.rows.length > 0) {
          reply = "Here are some upcoming events I found:\n" + result.rows.map(r => `- **${r.title}** on ${new Date(r.date).toLocaleDateString()} at ${r.time} (${r.venue})`).join('\n');
      } else {
          reply = "I couldn't find any upcoming events right now.";
      }
    } else if (category === 'clubs') {
      const result = await db.query('SELECT club_name, description FROM clubs LIMIT 3');
      sources = result.rows.map(r => r.club_name);
      if (result.rows.length > 0) {
          reply = "We have several active clubs on campus:\n" + result.rows.map(r => `- **${r.club_name}**: ${r.description}`).join('\n');
      } else {
          reply = "I couldn't find any clubs in the database.";
      }
    } else if (category === 'locations') {
      const result = await db.query('SELECT location_name, description FROM campus_locations LIMIT 3');
      sources = result.rows.map(r => r.location_name);
      if (result.rows.length > 0) {
          reply = "Here are some notable campus locations:\n" + result.rows.map(r => `- **${r.location_name}**: ${r.description}`).join('\n');
      } else {
          reply = "I couldn't find any locations.";
      }
    } else {
      reply = "I'm your ambient CampMate AI! I can help you find events, clubs, or campus locations. Just ask me something like 'What events are happening?' or 'Tell me about the robotics club'.";
    }

    // Add user message to history
    history.push({ role: 'user', content: message });
    
    // Ensure history does not exceed 5 messages (for this session)
    if (history.length > 5) {
      history.splice(0, history.length - 5);
    }

    // Add assistant's reply to history
    history.push({ role: 'assistant', content: reply });
    if (history.length > 5) {
      history.splice(0, history.length - 5);
    }

    // 5. Return JSON payload
    return sendSuccess(res, 'AI response generated successfully', { reply, sources, sessionId });

  } catch (err) {
    console.error("Mock AI Error:", err.message || err);
    return sendError(res, 500, 'Failed to process AI request');
  }
});

module.exports = router;
