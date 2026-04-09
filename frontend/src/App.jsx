import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Events from './pages/Events';
import Clubs from './pages/Clubs';
import CampusMap from './pages/CampusMap';
import ChatbotWidget from './components/ChatbotWidget';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f7ff]">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow animate-pulse mb-4">
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      </div>
      <p className="gradient-text font-bold text-lg tracking-wide">Loading CampMate…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f7ff] flex flex-col font-sans">
      {/* Ambient background blobs */}
      {user && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="blob absolute -top-32 -left-32 w-96 h-96 bg-brand-200/40" />
          <div className="blob absolute top-1/2 -right-48 w-[500px] h-[500px] bg-violet-200/30" style={{ animationDelay: '3s' }} />
          <div className="blob absolute -bottom-32 left-1/4 w-80 h-80 bg-indigo-200/30" style={{ animationDelay: '6s' }} />
        </div>
      )}

      {user && <Navbar />}

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/"      element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/events" element={user ? <Events /> : <Navigate to="/login" />} />
          <Route path="/clubs"  element={user ? <Clubs /> : <Navigate to="/login" />} />
          <Route path="/map"    element={user ? <CampusMap /> : <Navigate to="/login" />} />
        </Routes>
      </main>

      {user && <ChatbotWidget />}
    </div>
  );
}

export default App;
