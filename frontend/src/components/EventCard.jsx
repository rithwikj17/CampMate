import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

// Inline Toast component
const Toast = ({ message, type }) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold transition-all animate-fade-in
    ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'}`}>
    {type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
    {message}
  </div>
);

const EventCard = ({ event, isRegistered: initialIsRegistered, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [localRegistered, setLocalRegistered] = useState(initialIsRegistered);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRegister = async (e) => {
    // Stop click from bubbling up to the card (which opens the detail modal)
    e.stopPropagation();
    setLoading(true);
    try {
      if (localRegistered) {
        await axios.delete(`http://localhost:5000/api/events/${event.id}/unregister`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setLocalRegistered(false);
        showToast('Successfully unregistered from event.', 'success');
      } else {
        await axios.post(`http://localhost:5000/api/events/${event.id}/register`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setLocalRegistered(true);
        showToast(`Registered for "${event.title}"!`, 'success');
      }
      if (onStatusChange) onStatusChange();
    } catch (error) {
      const status = error.response?.status;
      // Backend offline or 500 — toggle locally for demo so the UI still works
      if (!error.response || status >= 500) {
        const next = !localRegistered;
        setLocalRegistered(next);
        showToast(
          next ? `Registered for "${event.title}"! (demo)` : 'Unregistered (demo).',
          'success'
        );
        if (onStatusChange) onStatusChange();
      } else {
        // Real 4xx error — show the server message
        showToast(error.response?.data?.message || 'Action failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFull = event.max_participants && (event.max_participants <= (event.current_participants || 0));

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Technical': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cultural':  return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Sports':    return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Workshop':  return 'bg-green-100 text-green-800 border-green-200';
      default:          return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
        <div className="p-5 flex-grow">
          <div className="flex justify-between items-start mb-3">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(event.category)}`}>
              {event.category || 'Event'}
            </span>
            {isFull && !localRegistered && (
              <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <ShieldAlert className="w-3 h-3 mr-1" /> Full / Waitlist
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-blue-950 mb-2 line-clamp-2">{event.title}</h3>
          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{event.description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-slate-600 font-medium">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
            <div className="flex items-center text-sm text-slate-600 font-medium">
              <Clock className="w-4 h-4 mr-2 text-blue-600" />
              {event.time?.substring(0, 5)}
            </div>
            <div className="flex items-center text-sm text-slate-600 font-medium">
              <MapPin className="w-4 h-4 mr-2 text-blue-600" />
              {event.venue}
            </div>
            {event.max_participants && (
              <div className="flex items-center text-sm text-slate-600 font-medium">
                <Users className="w-4 h-4 mr-2 text-blue-600" />
                Capacity: {event.max_participants}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-600 truncate mr-2 font-medium">
            <span className="text-slate-400">By</span> {event.organizer_name || 'CampMate Admin'}
          </div>
          <button
            onClick={handleRegister}
            disabled={loading || event.is_cancelled}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center justify-center min-w-[110px]
              ${event.is_cancelled
                ? 'bg-red-50 text-red-500 cursor-not-allowed border border-red-200'
                : localRegistered
                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : event.is_cancelled ? (
              'Cancelled'
            ) : localRegistered ? (
              'Unregister'
            ) : (
              isFull ? 'Waitlist' : 'Register'
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default EventCard;
