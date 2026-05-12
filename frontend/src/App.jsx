import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Events from './pages/Events';
import Clubs from './pages/Clubs';
import CampusMap from './pages/CampusMap';
import Profile from './pages/Profile';
import ChatbotWidget from './components/ChatbotWidget';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-sky-400 flex items-center justify-center shadow-glow animate-pulse mb-6">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      </div>
      <p className="text-white/40 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing Interface…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-light dark:bg-base flex flex-col font-sans transition-colors duration-300">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 animate-slide-left min-h-0">
        <Routes>
          <Route path="/login"   element={!user ? <Login />     : <Navigate to="/" />} />
          <Route path="/"        element={user  ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/events"  element={user  ? <Events />    : <Navigate to="/login" />} />
          <Route path="/clubs"   element={user  ? <Clubs />     : <Navigate to="/login" />} />
          <Route path="/map"     element={user  ? <CampusMap /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user  ? <Profile />   : <Navigate to="/login" />} />
        </Routes>
      </main>

      {user && <ChatbotWidget />}
    </div>
  );
}

export default App;
