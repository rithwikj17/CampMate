import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, CornerDownRight } from 'lucide-react';
import axios from 'axios';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize and persist session ID
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('chatSessionId');
    if (stored) return stored;
    const newId = crypto.randomUUID();
    localStorage.setItem('chatSessionId', newId);
    return newId;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([
           { role: 'bot', text: 'Hi! I am CampMate AI, your campus assistant. You can ask me about events, clubs, or campus locations. How can I help you today?', time: new Date() }
        ]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input.trim(), time: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai/chat',
        { message: userMessage.text, sessionId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      const data = response.data.data; // Accommodate standard response format (.data.data) or simple format
      const reply = data?.reply || response.data.reply;
      const sources = data?.sources || response.data.sources || [];

      setMessages(prev => [...prev, { 
         role: 'bot', 
         text: reply, 
         sources: sources,
         time: new Date() 
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
         role: 'bot', 
         text: 'Oops. I am having trouble connecting to the campus brain right now. Please try again later.',
         isError: true,
         time: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className={`${isOpen ? 'scale-0' : 'scale-100'} transition-transform duration-300 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl shadow-blue-500/30 flex items-center justify-center group`}
        >
          <MessageSquare className="w-6 h-6 group-hover:animate-pulse" />
        </button>
      </div>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 sm:w-[380px] w-[calc(100%-48px)] h-[550px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-50 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-blue-600 p-4 rounded-t-2xl flex justify-between items-center text-white shrink-0 shadow-sm relative z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full border border-white/30 hidden sm:block">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">CampMate AI</h3>
              <p className="text-blue-100 text-xs flex items-center">
                 <span className="w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>
                 Online
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative">
          {messages.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-end max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-700 ml-2' : 'bg-blue-100 text-blue-700 mr-2 border border-blue-200'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`p-3 rounded-2xl text-[0.9rem] leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : msg.isError 
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 rounded-bl-sm'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                </div>
              </div>

              {/* Timestamp & Sources layer */}
              <div className={`mt-1 flex flex-col ${msg.role === 'user' ? 'items-end mr-10' : 'items-start ml-10'}`}>
                  <span className="text-[10px] text-slate-400 font-medium">
                     {formatTime(msg.time)}
                  </span>
                  
                  {/* Sources Chips */}
                  {msg.sources && msg.sources.length > 0 && (
                     <div className="mt-1.5 flex flex-wrap gap-1">
                       <span className="text-[10px] text-slate-400 flex items-center font-semibold mr-1">
                          <CornerDownRight className="w-3 h-3 mr-0.5" /> Context sources:
                       </span>
                       {msg.sources.map((src, i) => (
                          <span key={i} className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold truncate max-w-[120px]">
                            {src}
                          </span>
                       ))}
                     </div>
                  )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-end">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-2 border border-blue-200">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-4 shadow-sm flex space-x-1.5 items-center h-10 text-blue-500">
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 shrink-0">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about clubs, events..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder-slate-400"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-1.5 text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </form>

      </div>
    </>
  );
};

export default ChatBot;
