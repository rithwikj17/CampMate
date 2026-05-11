import React, { useState, useEffect, useRef } from 'react';
import { X, Bell, CheckCheck, Calendar, Users, Megaphone, Trophy, Info, Sparkles } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'event',
    title: 'Annual Hackathon Reminder',
    message: 'The 24-hour hackathon starts in 2 days. Make sure your team is ready!',
    time: '10 min ago',
    read: false,
    icon: Calendar,
    color: 'text-brand-400',
    bg: 'bg-brand-500/10 border-brand-500/20',
  },
  {
    id: 2,
    type: 'club',
    title: 'Robotics Club Meeting',
    message: 'Weekly meeting rescheduled to Friday 5 PM at Robotics Lab.',
    time: '2 hr ago',
    read: false,
    icon: Users,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
  },
  {
    id: 3,
    type: 'announcement',
    title: 'E-Summit Registration Closing',
    message: "Only 24 hours left to register for E-Summit 2026. Don't miss out!",
    time: '1 day ago',
    read: false,
    icon: Megaphone,
    color: 'text-accent-ai',
    bg: 'bg-accent-ai/10 border-accent-ai/20',
  },
  {
    id: 4,
    type: 'achievement',
    title: 'Registration Confirmed!',
    message: 'You have successfully registered for Literature Fest.',
    time: '2 days ago',
    read: true,
    icon: Trophy,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 5,
    type: 'system',
    title: 'New Club Added',
    message: 'The Data Science Club is now live on CampMate. Join to get updates.',
    time: '3 days ago',
    read: true,
    icon: Sparkles,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    id: 6,
    type: 'announcement',
    title: 'Campus Map Updated',
    message: 'New locations have been added to the campus map including the new sports complex.',
    time: '4 days ago',
    read: true,
    icon: Info,
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
  },
];

const NotificationsPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('all');
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    if (isOpen) {
      setTimeout(() => document.addEventListener('mousedown', handler), 100);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]" onClick={onClose} />
      )}

      {/* Slide-in Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-surface-dark border-l border-white/10 z-[100] flex flex-col shadow-[−20px_0_60px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-xs text-white/40 font-mono">{unreadCount} unread</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                title="Mark all as read"
                className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <CheckCheck size={13} /> All read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-6 py-3 border-b border-white/5 shrink-0">
          {['all', 'unread'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ${
                filter === tab
                  ? 'bg-brand-600 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {tab}
              {tab === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Bell className="w-7 h-7 text-white/20" />
              </div>
              <div>
                <p className="text-white/60 font-medium">All caught up!</p>
                <p className="text-white/30 text-sm mt-1">No {filter === 'unread' ? 'unread ' : ''}notifications.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map(notif => {
                const Icon = notif.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className={`group relative p-5 hover:bg-white/[0.02] transition-colors cursor-pointer ${!notif.read ? 'bg-white/[0.02]' : ''}`}
                  >
                    {/* Unread indicator */}
                    {!notif.read && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-400 rounded-full shadow-[0_0_6px] shadow-brand-400" />
                    )}

                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center ${notif.bg}`}>
                        <Icon size={16} className={notif.color} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`text-sm font-semibold leading-tight ${notif.read ? 'text-white/60' : 'text-white'}`}>
                            {notif.title}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); dismiss(notif.id); }}
                            className="shrink-0 opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-white/60 rounded transition-all"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mb-2">
                          {notif.message}
                        </p>
                        <span className="text-[10px] font-mono text-white/25 tracking-widest uppercase">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <p className="text-center text-xs text-white/20 font-mono tracking-widest uppercase">
            CampMate · Notification Center
          </p>
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;
