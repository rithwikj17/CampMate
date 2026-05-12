import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      login(response.data.data.accessToken, response.data.data.user);
      navigate('/');
    } catch (err) {
      console.error("Login failed", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid credentials or server error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-base flex flex-col md:flex-row animate-fade-in z-50">
      
      {/* Visual / Ambient Panel - Left Side */}
      <div className="hidden md:flex md:w-1/2 relative flex-col items-start justify-end p-12 overflow-hidden border-r border-white/5">
        
        {/* Ambient Dark Mesh Background */}
        <div className="absolute inset-0 bg-base z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-accent-ai rounded-full mix-blend-screen filter blur-[150px] opacity-20" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-sky-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10"></div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 text-white/50 mb-4">
            <div className="w-8 h-px bg-white/20"></div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] font-semibold">CampMate Core</span>
          </div>
          <h1 className="text-5xl lg:text-6xl text-white font-light leading-tight tracking-tight shadow-sm font-display">
            The Digital<br />
            <span className="font-medium bg-gradient-to-r from-brand-400 to-sky-300 bg-clip-text text-transparent">Nervous System</span><br />
            of your Campus.
          </h1>
          <p className="text-white/60 text-lg max-w-md pt-4 font-light">
            One platform that knows where everything is, what's happening, and who's running it.
          </p>
        </div>
      </div>

      {/* Login Panel - Right Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-surface-dark relative">
        <div className="absolute top-0 right-0 p-8 w-full flex justify-end">
          <div className="text-brand-500/30">
             <BookOpen size={24} />
          </div>
        </div>
        
        <div className="w-full max-w-sm animate-slide-left">
          <div className="md:hidden flex items-center gap-3 mb-10">
             <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-glow">
                <BookOpen size={20} />
             </div>
             <span className="text-white font-display text-2xl font-bold tracking-tight">CampMate</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-display font-medium text-white tracking-tight">Welcome back</h2>
            <p className="text-white/40 mt-2 text-sm font-light">Enter your credentials to access the portal.</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-start gap-3 shadow-sm blur-0 backdrop-blur-md">
              <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-white/50 uppercase tracking-widest">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-400 text-white/30">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-base/50 border border-white/10 rounded-xl text-white placeholder-white/20 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all font-sans text-sm backdrop-blur-sm"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-white/50 uppercase tracking-widest">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-400 text-white/30">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-base/50 border border-white/10 rounded-xl text-white placeholder-white/20 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all font-sans text-sm backdrop-blur-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-glow text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-dark focus:ring-brand-500 transition-all disabled:opacity-50 font-medium text-sm group"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
            
            <div className="pt-8">
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-md">
                <span className="font-mono text-[10px] uppercase tracking-widest text-white/30 block mb-2">Demo Access</span>
                <ul className="space-y-2 text-xs text-white/50 font-light">
                  <li className="flex items-center justify-between">
                    <span>Student:</span>
                    <span className="font-mono text-white/80 bg-white/5 px-2 py-0.5 rounded">Any Email</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Admin:</span>
                    <span className="font-mono text-white/80 bg-white/5 px-2 py-0.5 rounded">admin@campmate.com</span>
                  </li>
                </ul>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
