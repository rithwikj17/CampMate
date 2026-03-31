import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Tent, Bell, Menu, X, User, LogOut, Calendar, Settings } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/notifications', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          const fetchedNotifs = res.data.data || [];
          setNotifications(fetchedNotifs);
          setUnreadCount(fetchedNotifs.filter(n => !n.is_read).length);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };
      fetchNotifications();
    }

    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [user]);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Clubs', path: '/clubs' },
    { name: 'Map', path: '/map' }
  ];

  if (user?.role === 'Administrator') {
    navLinks.push({ name: 'Admin Dashboard', path: '/admin' });
  }

  return (
    <nav className="bg-white shadow-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left: Logo */}
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0 flex items-center space-x-2 text-blue-900 group">
              <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:bg-blue-700 transition">
                <Tent className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">CampMate</span>
            </NavLink>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
               <NavLink 
                 key={link.name}
                 to={link.path}
                 className={({ isActive }) => 
                   `text-sm font-semibold transition-colors duration-200 border-b-2 py-[1.125rem] ${isActive ? 'text-blue-600 border-blue-600' : 'text-slate-600 border-transparent hover:text-blue-800'}`
                 }
               >
                 {link.name}
               </NavLink>
            ))}
          </div>

          {/* Right: Notifications & Avatar / Login */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition relative group border border-transparent hover:border-blue-100">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 hover:bg-blue-50 p-1.5 pr-3 rounded-full transition border border-transparent hover:border-blue-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 object-cover overflow-hidden">
                       {user.profile_picture_url ? (
                           <img src={user.profile_picture_url} alt="Avatar" className="w-full h-full object-cover" />
                       ) : (
                           user.name?.charAt(0).toUpperCase() || 'U'
                       )}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 hidden sm:block">{user.name?.split(' ')[0]}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 bg-slate-50">
                        <p className="text-sm text-slate-500">Signed in as</p>
                        <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <NavLink to="/my-events" className="group flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600">
                          <Calendar className="mr-3 h-4 w-4 text-slate-400 group-hover:text-blue-500" />
                          My Events
                        </NavLink>
                        <NavLink to="/profile" className="group flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600">
                          <Settings className="mr-3 h-4 w-4 text-slate-400 group-hover:text-blue-500" />
                          Profile Settings
                        </NavLink>
                      </div>
                      <div className="py-1">
                        <button 
                          onClick={handleLogout}
                          className="group flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <LogOut className="mr-3 h-4 w-4 text-slate-400 group-hover:text-rose-500" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <NavLink 
                to="/login"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
              >
                Log In
              </NavLink>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-500 hover:text-blue-600 focus:outline-none p-2 rounded-md hover:bg-blue-50 border border-transparent hover:border-blue-100"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => 
                  `block px-3 py-2 rounded-lg text-base font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
