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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-500">Loading CampMate...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {user && <Navbar />}
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/events" element={user ? <Events /> : <Navigate to="/login" />} />
          <Route path="/clubs" element={user ? <Clubs /> : <Navigate to="/login" />} />
          <Route path="/map" element={user ? <CampusMap /> : <Navigate to="/login" />} />
        </Routes>
      </main>

      {user && <ChatbotWidget />}
    </div>
  );
}

export default App;
