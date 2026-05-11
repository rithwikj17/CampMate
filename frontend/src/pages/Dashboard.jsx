import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Bell, Sparkles, MapPin, ChevronRight, Activity, TrendingUp, Zap, ArrowUpRight, Plus, X, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../api';

const METRICS = [
  {
    label: 'Upcoming Events',
    value: '12',
    change: '+3 this week',
    icon: Calendar,
    gradient: 'from-brand-600 to-sky-500',
    bg: 'bg-surface-dark border-brand-500/20',
    iconBg: 'bg-brand-500/20 text-brand-400',
    textChange: 'text-brand-400 bg-brand-500/10',
    link: '/events',
  },
  {
    label: 'My Registered',
    value: '3',
    change: '2 upcoming',
    icon: Activity,
    gradient: 'from-accent-teal to-sky-400',
    bg: 'bg-surface-dark border-accent-teal/20',
    iconBg: 'bg-accent-teal/20 text-accent-teal',
    textChange: 'text-accent-teal bg-accent-teal/10',
    link: '/events',
  },
  {
    label: 'New Announcements',
    value: '5',
    change: '2 unread',
    icon: Bell,
    gradient: 'from-accent-ai to-brand-500',
    bg: 'bg-surface-dark border-accent-ai/20',
    iconBg: 'bg-accent-ai/20 text-accent-ai',
    textChange: 'text-accent-ai bg-accent-ai/10',
    link: '/clubs',
  },
];

const ANNOUNCEMENTS = [
  { id: 1, club: 'Robotics Club', message: 'Meeting postponed to Friday 5 PM.', time: '2h ago', dot: 'bg-sky-500', link: '/clubs' },
  { id: 2, club: 'CCB', message: 'Auditions for the annual play are open!', time: '1d ago', dot: 'bg-brand-500', link: '/clubs' },
  { id: 3, club: 'E-Cell', message: 'E-Summit registrations close tomorrow!', time: '2d ago', dot: 'bg-accent-ai', link: '/events' },
];

const CLUB_COLORS = {
  'Coding Club':            'bg-brand-500',
  'CCB':                    'bg-accent-ai',
  'CCB Dance Crew':         'bg-purple-500',
  'Natyanandhana':          'bg-orange-400',
  'Musically BVRIT':        'bg-accent-teal',
  'Garuda':                 'bg-red-500',
  'E-Cell':                 'bg-amber-400',
  'MHC (Mental Health Club)': 'bg-teal-400',
  'Chalana Chitram BVRIT':  'bg-sky-500',
  'Sports Club':            'bg-lime-500',
};

// Quick Add Event Modal (lightweight version on Dashboard)
const QuickAddEventModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ title: '', date: '', venue: '', category: 'Technology' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    onCreated(form);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
        <style>{`@keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-surface-800 bg-gradient-to-r from-brand-50 to-sky-50 dark:from-surface-800 dark:to-surface-800/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Calendar size={18} className="text-brand-600" /> Quick Add Event</h2>
          <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-surface-200 rounded-xl transition-colors"><X size={18} className="text-gray-500 dark:text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title *</label>
            <input required type="text" value={form.title} onChange={set('title')} placeholder="e.g. Tech Talk 2026"
              className="w-full border border-gray-200 dark:border-surface-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-surface-dark dark:text-white transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
              <input required type="date" value={form.date} onChange={set('date')}
                className="w-full border border-gray-200 dark:border-surface-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-surface-dark dark:text-white transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={form.category} onChange={set('category')}
                className="w-full border border-gray-200 dark:border-surface-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-surface-dark dark:text-white transition-all">
                {['Technology', 'Cultural', 'Business', 'Sports'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Venue</label>
            <input type="text" value={form.venue} onChange={set('venue')} placeholder="e.g. Main Auditorium"
              className="w-full border border-gray-200 dark:border-surface-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-surface-dark dark:text-white transition-all" />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">For full options, go to the <Link to="/events" onClick={onClose} className="text-brand-600 dark:text-brand-400 underline">Events page</Link>.</p>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 dark:border-surface-800 text-gray-600 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-surface-800 transition-colors">Cancel</button>
            <button type="submit"
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/20">Create Event</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Quick Add Club Modal
const QuickAddClubModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', category: 'Tech', description: '' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onCreated(form);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
        <style>{`@keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-surface-800 bg-gradient-to-r from-purple-50 to-brand-50 dark:from-surface-800 dark:to-surface-800/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><Sparkles size={18} className="text-purple-600 dark:text-purple-400" /> Quick Add Club</h2>
          <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-surface-200 rounded-xl transition-colors"><X size={18} className="text-gray-500 dark:text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Club Name *</label>
            <input required type="text" value={form.name} onChange={set('name')} placeholder="e.g. Photography Club"
              className="w-full border border-gray-200 dark:border-surface-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-surface-dark dark:text-white transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select value={form.category} onChange={set('category')}
              className="w-full border border-gray-200 dark:border-surface-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-surface-dark dark:text-white transition-all">
              {['Tech', 'Arts', 'Business', 'Sports', 'Science', 'Other'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={set('description')} placeholder="What is this club about?"
              className="w-full border border-gray-200 dark:border-surface-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-surface-dark dark:text-white resize-none transition-all" />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">For full options, go to the <Link to="/clubs" onClick={onClose} className="text-brand-600 dark:text-brand-400 underline">Clubs page</Link>.</p>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 dark:border-surface-800 text-gray-600 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-surface-800 transition-colors">Cancel</button>
            <button type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-500/20">Create Club</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Toast
const Toast = ({ message, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl animate-slide-up">
      <CheckCircle size={16} /> {message}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddClub, setShowAddClub] = useState(false);
  const [toast, setToast] = useState(null);

  const canCreate = user?.role === 'Administrator' || user?.role === 'Club Member';

  useEffect(() => {
    axios.get(`${API_BASE}/api/events?upcoming=true&limit=4`)
      .then(res => { if (res.data?.data) setRecommendedEvents(res.data.data); })
      .catch(err => console.error('Failed to fetch recommended events:', err))
      .finally(() => setLoadingEvents(false));
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return timeString; }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try { return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return dateString; }
  };

  const QUICK_LINKS = [
    { name: 'Global Map Engine', path: '/map',    emoji: '🗺️' },
    { name: 'My Timeline',       path: '/events',  emoji: '📅' },
    { name: 'Intel Hub',         path: '/clubs',   emoji: '🎭' },
    { name: 'Profile Settings',  path: '/profile', emoji: '⚙️' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16 pt-4">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      {showAddEvent && (
        <QuickAddEventModal
          onClose={() => setShowAddEvent(false)}
          onCreated={(ev) => setToast(`Event "${ev.title}" created! View it in Events ➜`)}
        />
      )}
      {showAddClub && (
        <QuickAddClubModal
          onClose={() => setShowAddClub(false)}
          onCreated={(cl) => setToast(`Club "${cl.name}" created! View it in Clubs ➜`)}
        />
      )}

      {/* Hero Header */}
      <div className="relative rounded-[2rem] overflow-hidden p-8 md:p-12 shadow-[0_30px_60px_rgba(37,99,235,0.15)] bg-surface-dark border border-white/5">
        
        {/* Dynamic Glow Background */}
        <div className="absolute inset-0 z-0">
           <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[150%] bg-gradient-to-br from-brand-600 via-sky-500 to-transparent opacity-20 blur-[100px] mix-blend-screen animate-pulse"></div>
           <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[100%] bg-accent-ai opacity-10 blur-[80px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10 font-mono text-[10px] uppercase tracking-widest text-brand-300">
              <Zap className="w-3 h-3 text-brand-400" /> System Active
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-brand-400 to-sky-300 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-white/60 text-lg font-light leading-relaxed">
              Your control center for campus operations, mission updates, and real-time active events.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 shrink-0">
            {canCreate && (
              <>
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="inline-flex items-center justify-center gap-2 bg-brand-600/80 hover:bg-brand-600 text-white font-medium text-sm px-5 py-3 rounded-xl transition-all border border-brand-500/40 hover:border-brand-400 hover:-translate-y-0.5 backdrop-blur-sm"
                >
                  <Plus className="w-4 h-4" /> Add Event
                </button>
                <button
                  onClick={() => setShowAddClub(true)}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium text-sm px-5 py-3 rounded-xl transition-all border border-white/15 hover:border-white/30 hover:-translate-y-0.5 backdrop-blur-sm"
                >
                  <Sparkles className="w-4 h-4" /> Add Club
                </button>
              </>
            )}
            <Link to="/events"
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium text-sm px-5 py-3 rounded-xl transition-all border border-white/10 hover:border-white/20 hover:-translate-y-0.5 group backdrop-blur-sm"
            >
              Global Feed <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Control Room Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {METRICS.map((m, i) => (
          <Link key={i} to={m.link}
            className={`relative overflow-hidden rounded-3xl p-6 ${m.bg} border transition-all duration-300 hover:border-white/20 hover:shadow-card-hover hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] group cursor-pointer`}
            style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`absolute -inset-10 bg-gradient-to-br ${m.gradient} opacity-0 group-hover:opacity-[0.05] transition-opacity blur-3xl`} />
            
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.iconBg}`}>
                <m.icon className="h-6 w-6" />
              </div>
              <span className={`flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full ${m.textChange}`}>
                <TrendingUp className="w-3 h-3" /> {m.change}
              </span>
            </div>
            <div className="relative z-10 flex flex-col justify-end">
              <p className="text-5xl font-display font-medium text-white tracking-tighter mb-1">{m.value}</p>
              <p className="text-xs font-mono uppercase tracking-widest text-white/40">{m.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recommended Events */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-brand-500/10 pb-3">
            <h2 className="text-sm font-mono font-bold uppercase tracking-[0.2em] text-brand-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Priority Missions
            </h2>
            <Link to="/events" className="text-xs font-mono uppercase tracking-widest text-white/40 hover:text-brand-400 transition-colors flex items-center">
               View all <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          {loadingEvents ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-surface-dark border border-white/5 rounded-3xl p-5 animate-pulse h-48" />
              ))}
            </div>
          ) : recommendedEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {recommendedEvents.slice(0, 4).map((ev, i) => {
                const dotColor = CLUB_COLORS[ev.organizer_name] || 'bg-brand-500';
                return (
                  <div key={ev.id}
                    onClick={() => navigate('/events')}
                    className="group bg-surface-dark border border-white/5 rounded-3xl p-6 hover:border-brand-500/30 hover:bg-white/[0.02] hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-card hover:shadow-glow-sm"
                    style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2 text-white/60">
                         <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${dotColor}`} />
                         <span className="text-xs font-mono tracking-wider uppercase">{ev.organizer_name}</span>
                      </div>
                      <span className="text-[10px] font-mono tracking-widest px-2 py-0.5 bg-white/5 text-white/40 rounded border border-white/10 uppercase">{ev.category}</span>
                    </div>
                    <h3 className="font-display font-medium text-xl text-white mb-4 group-hover:text-brand-400 transition-colors line-clamp-1">{ev.title}</h3>
                    <div className="flex flex-col gap-2 font-mono text-xs text-white/40 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-brand-500" />
                        <span>{formatDate(ev.date)} · <span className="text-brand-300">{formatTime(ev.time)}</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-brand-500" />
                        <span className="truncate max-w-[200px]">{ev.venue}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/events'); }}
                      className="w-full flex justify-center py-2.5 bg-white/5 hover:bg-brand-600 text-white/80 hover:text-white text-xs font-mono tracking-widest uppercase rounded-xl transition-all border border-white/5 group-hover:border-transparent"
                    >
                      View & Register
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-dark border border-white/5 rounded-3xl p-12 text-center text-white/30 flex flex-col items-center justify-center">
               <Calendar className="h-10 w-10 mb-4 opacity-50" />
               <p className="font-mono text-sm tracking-widest uppercase">No pending missions</p>
               {canCreate && (
                 <button
                   onClick={() => setShowAddEvent(true)}
                   className="mt-6 flex items-center gap-2 px-4 py-2.5 bg-brand-600/20 hover:bg-brand-600/40 text-brand-400 border border-brand-500/30 rounded-xl text-xs font-mono uppercase tracking-widest transition-all"
                 >
                   <Plus size={14} /> Create First Event
                 </button>
               )}
            </div>
          )}
        </div>

        {/* System Logs & Quick Links */}
        <div className="space-y-6">
          <div className="bg-surface-dark border border-white/5 rounded-3xl overflow-hidden shadow-card">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-sm font-mono font-bold uppercase tracking-[0.2em] text-accent-ai flex items-center gap-2">
                  <Bell className="w-4 h-4" /> System Core Logs
                </h2>
              </div>
              <div className="divide-y divide-white/5">
                {ANNOUNCEMENTS.map((ann) => (
                  <Link key={ann.id} to={ann.link} className="block p-5 hover:bg-white/[0.02] transition-colors group cursor-pointer">
                     <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                           <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${ann.dot}`} />
                           <span className="text-xs font-mono tracking-wider uppercase text-white/80">{ann.club}</span>
                        </div>
                        <span className="text-[10px] font-mono text-white/30 tracking-widest">{ann.time}</span>
                     </div>
                     <p className="text-sm text-white/50 leading-relaxed font-light pl-3.5 border-l border-white/10 group-hover:text-white/70 transition-colors">{ann.message}</p>
                  </Link>
                ))}
              </div>
          </div>

          {/* Quick Links */}
          <div className="bg-surface-dark border border-white/5 rounded-3xl p-5 shadow-card">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white/40 mb-4 pb-2 border-b border-white/5">Quick Navigation</p>
            <div className="space-y-2">
              {QUICK_LINKS.map(({ name, path, emoji }) => (
                <Link key={path} to={path}
                  className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-brand-600/20 hover:border-brand-500/30 text-sm font-mono tracking-wide text-white/70 hover:text-brand-300 transition-colors group">
                  <span className="flex items-center gap-3">{emoji} {name}</span>
                  <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>

            {/* Quick admin actions */}
            {canCreate && (
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white/20 mb-3">Admin Actions</p>
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-brand-500/10 border border-brand-500/20 rounded-xl hover:bg-brand-500/20 hover:border-brand-500/40 text-sm font-mono tracking-wide text-brand-300 transition-colors group"
                >
                  <span className="flex items-center gap-3"><Calendar size={14} /> Create New Event</span>
                  <Plus size={14} className="text-brand-400 group-hover:rotate-90 transition-transform" />
                </button>
                <button
                  onClick={() => setShowAddClub(true)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 hover:border-purple-500/40 text-sm font-mono tracking-wide text-purple-300 transition-colors group"
                >
                  <span className="flex items-center gap-3"><Sparkles size={14} /> Create New Club</span>
                  <Plus size={14} className="text-purple-400 group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
