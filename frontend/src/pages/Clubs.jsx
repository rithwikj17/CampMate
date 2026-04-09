import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, ChevronRight } from 'lucide-react';
import axios from 'axios';
import ClubDetailModal from '../components/ClubDetailModal';

const Clubs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubEvents, setClubEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/clubs');
        if (response.data && response.data.data) {
          setClubs(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch clubs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const handleClubClick = async (club) => {
    setSelectedClub(club);
    setClubEvents([]);
    setEventsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/clubs/${club.id}/events`);
      setClubEvents(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch club events:', err);
      setClubEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedClub(null);
    setClubEvents([]);
  };

  const filteredClubs = clubs.filter(club =>
    (club.club_name && club.club_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campus Clubs</h1>
            <p className="text-gray-500 mt-1">Connect with like-minded peers and explore your interests.</p>
          </div>
        </div>

        {/* Search */}
        <div className="glass p-4 rounded-2xl">
          <div className="relative w-full max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for clubs or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        {/* Club Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredClubs.map(club => (
              <div
                key={club.id}
                onClick={() => handleClubClick(club)}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-brand-200 transition-all duration-300 group flex flex-col h-full relative overflow-hidden cursor-pointer"
              >
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-50 to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform" />

                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xl shadow-inner">
                    {club.club_name ? club.club_name.charAt(0) : 'C'}
                  </div>
                  <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                    General
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                  {club.club_name}
                </h3>
                <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">{club.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users size={16} className="text-brand-500" />
                    <span className="font-medium text-gray-900">{club.member_count || 0}</span> Members
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="text-brand-600 bg-brand-50 hover:bg-brand-100 p-2 rounded-lg transition-colors"
                      title="Join Club"
                    >
                      <UserPlus size={18} />
                    </button>
                    <button
                      className="text-gray-500 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors flex items-center group-hover:bg-brand-50 group-hover:text-brand-600"
                      title="View Events"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredClubs.length === 0 && (
              <div className="col-span-2 text-center py-16 text-gray-400">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">No clubs match your search.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Club Detail Modal */}
      {selectedClub && (
        <ClubDetailModal
          club={selectedClub}
          events={clubEvents}
          loading={eventsLoading}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default Clubs;
