import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Tent, Bell, Menu, X, User, LogOut, Calendar, Settings, Home, Users, Map, LayoutDashboard, Sun, Moon } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationsPanel from './NotificationsPanel';

const NAV_LINKS = [
  { name: 'Home',   path: '/',       icon: Home },
  { name: 'Events', path: '/events', icon: Calendar },
  { name: 'Clubs',  path: '/clubs',  icon: Users },
  { name: 'Map',    path: '/map',    icon: Map },
];

// Static unread count for demonstration (3 unread notifications)
const UNREAD_COUNT = 3;

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen]       = useState(false);
  const [isNotifOpen, setIsNotifOpen]           = useState(false);
  const [scrolled, setScrolled]                 = useState(false);

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/api/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (err) {
      console.error('Backend logout error', err);
    }
    navigate('/login');
    setIsProfileOpen(false);
    logout();
  };

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-surface-dark/90 backdrop-blur-xl shadow-lg shadow-brand-500/5 border-b border-brand-100/60 dark:border-surface-800'
          : 'bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-surface-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
                  <Tent className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 opacity-0 group-hover:opacity-30 blur transition-opacity duration-300" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block gradient-text">CampMate</span>
            </NavLink>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ name, path, icon: Icon }) => (
                <NavLink
                  key={name}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-glow-sm'
                        : 'text-gray-500 hover:bg-brand-50 hover:text-brand-700'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {name}
                </NavLink>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 transition-all duration-200"
                    title="Toggle Dark Mode"
                  >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>

                  {/* Notification Bell */}
                  <button
                    id="notif-bell-btn"
                    onClick={() => setIsNotifOpen(true)}
                    className="relative p-2 rounded-xl text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 transition-all duration-200"
                    title="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {UNREAD_COUNT > 0 && (
                      <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                        {UNREAD_COUNT}
                      </span>
                    )}
                  </button>

                  {/* Profile */}
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-brand-50 transition-all duration-200 border border-transparent hover:border-brand-100"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden">
                        {user.profile_picture_url
                          ? <img src={user.profile_picture_url} alt="Avatar" className="w-full h-full object-cover" />
                          : user.name?.charAt(0).toUpperCase() || 'U'
                        }
                      </div>
                      <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user.name?.split(' ')[0]}</span>
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-dark rounded-2xl shadow-xl ring-1 ring-brand-100 dark:ring-surface-800 overflow-hidden animate-slide-up z-[60]">
                        <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-surface-800 dark:to-surface-800/50">
                          <p className="text-xs text-brand-500 dark:text-brand-400 font-medium">Signed in as</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.email}</p>
                        </div>
                        <div className="py-1.5 px-2">
                          <NavLink to="/profile" onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-surface-800 hover:text-brand-700 dark:hover:text-brand-400 rounded-xl transition-colors">
                            <Settings className="h-4 w-4" /> Profile Settings
                          </NavLink>
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors">
                            <LogOut className="h-4 w-4" /> Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Explicit Desktop Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="hidden md:flex items-center space-x-2 text-slate-500 hover:text-rose-600 px-3 py-2 rounded-lg font-medium transition-colors border border-transparent hover:border-rose-100 hover:bg-rose-50"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm">Log Out</span>
                  </button>
                </>
              ) : (
                <NavLink to="/login" className="btn-primary text-sm">Log In</NavLink>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-surface-800 hover:text-brand-600 dark:hover:text-brand-400 transition-all"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-surface-800 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-lg animate-slide-up">
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map(({ name, path, icon: Icon }) => (
                <NavLink
                  key={name}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {name}
                </NavLink>
              ))}
              {user && (
                <>
                  <NavLink to="/profile" onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-brand-50 hover:text-brand-700 transition-all">
                    <Settings className="h-4 w-4" /> Profile Settings
                  </NavLink>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left px-4 py-2.5 mt-1 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all">
                    Log Out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Notifications Slide Panel */}
      <NotificationsPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};

export default Navbar;
