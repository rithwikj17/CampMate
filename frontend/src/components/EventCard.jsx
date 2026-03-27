import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, ShieldAlert } from 'lucide-react';
import axios from 'axios';

const EventCard = ({ event, isRegistered, onStatusChange }) => {
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      if (isRegistered) {
        // Unregister
        await axios.delete(`http://localhost:5000/api/events/${event.id}/unregister`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        // Register
        await axios.post(`http://localhost:5000/api/events/${event.id}/register`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error('Action failed:', error);
      alert(error.response?.data?.message || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  const isFull = event.max_participants && (event.max_participants <= (event.current_participants || 0)); // Assuming current_participants could be passed, or handled via waitlist badge

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Technical': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cultural': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Sports': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Workshop': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(event.category)}`}>
            {event.category || 'Event'}
          </span>
          <div className="flex flex-col items-end">
             {isFull && !isRegistered && (
               <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <ShieldAlert className="w-3 h-3 mr-1" /> Full / Waitlist
               </span>
             )}
          </div>
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
            {event.time.substring(0, 5)}
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
          <span className="text-slate-400">By</span> {event.organizer_name || 'Campmate Admin'}
        </div>
        <button 
          onClick={handleRegister}
          disabled={loading || event.is_cancelled}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center justify-center min-w-[110px]
            ${event.is_cancelled ? 'bg-red-50 text-red-500 cursor-not-allowed border border-red-200' :
              isRegistered 
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            }
          `}
        >
          {loading ? (
             <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : event.is_cancelled ? (
             'Cancelled'
          ) : isRegistered ? (
            'Unregister'
          ) : (
            isFull ? 'Waitlist' : 'Register'
          )}
        </button>
      </div>
    </div>
  );
};

export default EventCard;
