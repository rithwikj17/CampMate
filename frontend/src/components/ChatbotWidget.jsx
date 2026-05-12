import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, Cpu } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE from '../api';

const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, 15); // ms per character
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}</span>;
};

const ChatbotWidget = () => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hi! I am CampMate Core. I can help navigate the campus or find active events. How can I assist?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.post(`${API_BASE}/api/ai/chat`, { message: userMsg.text }, config);
      
      const replyText = response.data?.data?.reply || response.data?.reply || "I'm not sure how to respond to that.";
      const botMsg = { id: Date.now(), sender: 'bot', text: replyText };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorText = error.response?.data?.error || error.response?.data?.message || "Connection lost. Please try again later.";
      const botMsg = { id: Date.now(), sender: 'bot', text: errorText };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 pointer-events-none flex flex-col items-end justify-end">
      {/* AI Ambient Orb */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 animate-float pointer-events-auto'} absolute bottom-0 right-0 w-14 h-14 bg-accent-ai text-white rounded-full shadow-ai-glow hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all duration-500 flex items-center justify-center group`}
      >
        <div className="absolute inset-0 bg-white/20 rounded-full blur-sm group-hover:blur-md transition-all"></div>
        <Sparkles size={24} className="relative z-10 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Cinematic Chat Window */}
      <div 
        className={`${
          isOpen 
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100' 
          : 'opacity-0 translate-y-10 pointer-events-none scale-95'
        } w-[340px] sm:w-[400px] bg-surface-dark border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(139,92,246,0.15)] flex flex-col transition-all duration-500 origin-bottom-right overflow-hidden`}
        style={{ height: '600px', maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="bg-white/5 border-b border-white/10 p-5 flex justify-between items-center text-white relative backdrop-blur-md">
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-accent-ai/20 p-2.5 rounded-xl border border-accent-ai/30 shadow-ai-glow">
              <Cpu size={20} className="text-accent-ai" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm tracking-wide">CampMate Core</h3>
              <p className="text-[10px] uppercase tracking-widest text-accent-ai font-mono flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-ai animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="relative z-10 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-base">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.sender === 'user' 
                ? 'bg-brand-600 text-white rounded-tr-sm border border-brand-500/50' 
                : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-sm'
              }`}>
                <p className="text-sm font-light leading-relaxed">
                  {msg.sender === 'bot' ? <TypewriterText text={msg.text} /> : msg.text}
                </p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white/5 text-white border border-white/10 px-4 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-ai rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-accent-ai rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-accent-ai rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 bg-surface-dark border-t border-white/10">
          <div className="relative flex items-center group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full bg-base text-white placeholder-white/30 text-sm rounded-2xl pl-4 pr-12 py-3.5 border border-white/10 focus:outline-none focus:border-accent-ai focus:ring-1 focus:ring-accent-ai transition-all font-light"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 bg-accent-ai text-white rounded-xl hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-accent-ai transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="mt-3 flex justify-center items-center gap-1.5 text-[10px] text-white/30 font-mono uppercase tracking-widest">
             <Sparkles size={10} className="text-accent-ai/70"/> AI answers may vary
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatbotWidget;
