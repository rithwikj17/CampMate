import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, BookOpen } from 'lucide-react';
import axios from 'axios';

// Mock API for login since backend might not be running immediately
const mockLogin = async (email, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          token: 'mock-jwt-token',
          user: { id: 1, name: 'Demo User', email, role: email.includes('admin') ? 'Administrator' : email.includes('club') ? 'Club Member' : 'Student' }
        }
      });
    }, 1000);
  });
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Connect to real backend API securely through Vite Proxy
      const response = await axios.post('/api/auth/login', { email, password });
      login(response.data.data.accessToken, response.data.data.user);
    } catch (error) {
      console.error("Login failed", error);
      alert("Invalid credentials. Try any email and password for demo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md w-full glass rounded-3xl p-8 shadow-2xl animate-fade-in relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{animationDelay: '2s'}}></div>

        <div className="relative z-10">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/20 transform -rotate-6">
              <BookOpen size={32} />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome to CampMate</h1>
            <p className="text-gray-500 mt-2 text-sm">Your all-in-one campus information hub</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="student@campmate.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-70 font-medium"
            >
              {loading ? 'Entering...' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
            
            <p className="text-xs text-center text-gray-400 mt-4">
              Demo Mode: Enter any email/password. Use 'admin@' for Administrator role, 'club@' for Club Member role.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
