import React, { useState } from 'react';
import { Users, UserPlus, UserMinus, Info } from 'lucide-react';
import axios from 'axios';

const ClubCard = ({ club, isMember, onStatusChange }) => {
  const [loading, setLoading] = useState(false);

  const handleMembership = async () => {
    setLoading(true);
    try {
      if (isMember) {
        await axios.delete(`http://localhost:5000/api/clubs/${club.id}/leave`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post(`http://localhost:5000/api/clubs/${club.id}/join`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error('Action failed:', error);
      alert(error.response?.data?.message || 'Membership action failed.');
    } finally {
      setLoading(false);
    }
  };

  // Generate a smooth gradient fallback based on club name length
  const fallbackGradients = [
    'from-blue-600 to-indigo-700',
    'from-blue-500 to-cyan-600',
    'from-indigo-600 to-purple-700',
    'from-slate-700 to-blue-900',
  ];
  const gradient = fallbackGradients[club.club_name.length % fallbackGradients.length];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full group">
      {/* Banner Area */}
      <div 
        className={`h-32 w-full bg-gradient-to-r ${gradient} relative flex items-center justify-center text-white/20`}
        style={club.banner_image_url ? { backgroundImage: `url(${club.banner_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {!club.banner_image_url && <Users className="w-16 h-16 opacity-50" />}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="p-5 flex-grow relative -mt-6">
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm inline-flex items-center border border-slate-100 mb-3 absolute -top-4 right-5">
           <Users className="w-4 h-4 text-blue-600 mr-1.5" />
           <span className="text-sm font-bold text-slate-700">{club.member_count}</span>
        </div>

        <h3 className="text-xl font-bold text-blue-950 mb-2 mt-2">{club.club_name}</h3>
        <p className="text-sm text-slate-600 mb-4 line-clamp-3">{club.description || 'No description provided.'}</p>
      </div>

      <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <button className="text-slate-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-slate-200">
           <Info className="w-5 h-5" />
        </button>
        <button 
          onClick={handleMembership}
          disabled={loading}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center min-w-[120px] shadow-sm
            ${isMember 
              ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-rose-600' 
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow'
            }
          `}
        >
          {loading ? (
             <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : isMember ? (
            <>
              <UserMinus className="w-4 h-4 mr-2" />
              Leave Club
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Join Club
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ClubCard;
