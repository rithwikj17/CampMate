import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, ChevronRight, Sparkles, X } from 'lucide-react';
import axios from 'axios';
import ClubDetailModal from '../components/ClubDetailModal';

// Assign a color + emoji per club name for visual variety
const CLUB_THEMES = {
  'Coding Club':            { color: 'from-blue-500 to-cyan-500',    emoji: '💻', light: 'bg-blue-50 text-blue-700' },
  'CCB':                    { color: 'from-rose-500 to-pink-500',    emoji: '🎭', light: 'bg-rose-50 text-rose-700' },
  'CCB Dance Crew':         { color: 'from-purple-500 to-fuchsia-500', emoji: '💃', light: 'bg-purple-50 text-purple-700' },
  'Natyanandhana':          { color: 'from-orange-400 to-amber-500', emoji: '🪷', light: 'bg-orange-50 text-orange-700' },
  'Musically BVRIT':        { color: 'from-green-400 to-emerald-500', emoji: '🎵', light: 'bg-green-50 text-green-700' },
  'Garuda':                 { color: 'from-red-500 to-rose-600',     emoji: '🦅', light: 'bg-red-50 text-red-700' },
  'E-Cell':                 { color: 'from-amber-400 to-orange-500', emoji: '🚀', light: 'bg-amber-50 text-amber-700' },
  'MHC (Mental Health Club)': { color: 'from-teal-400 to-cyan-500', emoji: '🌱', light: 'bg-teal-50 text-teal-700' },
  'Chalana Chitram BVRIT':  { color: 'from-indigo-500 to-blue-500', emoji: '🎬', light: 'bg-indigo-50 text-indigo-700' },
  'Sports Club':            { color: 'from-lime-500 to-green-500',   emoji: '⚽', light: 'bg-lime-50 text-lime-700' },
};

const DEFAULT_THEME = { color: 'from-brand-500 to-brand-700', emoji: '🏛️', light: 'bg-brand-50 text-brand-700' };

const getTheme = (name) => CLUB_THEMES[name] || DEFAULT_THEME;

const Clubs = () => {
  const [searchTerm, setSearchTerm]     = useState('');
  const [clubs, setClubs]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubEvents, setClubEvents]     = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/clubs')
      .then(res => res.data?.data && setClubs(res.data.data))
      .catch(err => console.error('Failed to fetch clubs:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleClubClick = async (club) => {
    setSelectedClub(club);
    setClubEvents([]);
    setEventsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/clubs/${club.id}/events`);
      setClubEvents(res.data.data || []);
    } catch {
      setClubEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const filtered = clubs.filter(c =>
    (c.club_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="space-y-8 animate-fade-in pb-16">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-50 rounded-full px-3 py-1 mb-3 border border-brand-100">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span className="text-brand-600 text-xs font-semibold">BVRIT Campus</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Campus Clubs</h1>
            <p className="text-gray-500 mt-1.5 text-base">Discover communities, find your tribe, and make memories.</p>
          </div>
          <div className="text-sm text-gray-400 font-medium bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
            {clubs.length} clubs available
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search clubs by name or interest..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-11 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 shadow-sm transition-all duration-200"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Club Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                <div className="flex gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
                    <div className="h-3 bg-gray-50 rounded-lg w-1/3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-50 rounded-lg" />
                  <div className="h-3 bg-gray-50 rounded-lg w-5/6" />
                  <div className="h-3 bg-gray-50 rounded-lg w-4/6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((club, idx) => {
                const theme = getTheme(club.club_name);
                return (
                  <div
                    key={club.id}
                    onClick={() => handleClubClick(club)}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    className="group relative bg-white rounded-2xl border border-gray-100 hover:border-brand-200 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden animate-slide-up flex flex-col"
                  >
                    {/* Top gradient bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${theme.color}`} />

                    {/* Card body */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Header row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                          {theme.emoji}
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${theme.light}`}>
                          {club.member_count || 0} members
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-700 transition-colors leading-tight">
                        {club.club_name}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-grow">
                        {club.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <Users className="w-3.5 h-3.5" />
                          {club.member_count || 0} Members
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={e => e.stopPropagation()}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r ${theme.color} text-white opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 shadow-sm`}
                          >
                            <UserPlus className="w-3.5 h-3.5" /> Join
                          </button>
                          <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-brand-50 flex items-center justify-center text-gray-400 group-hover:text-brand-600 transition-all duration-300">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center text-3xl">🔍</div>
                <div>
                  <p className="text-lg font-bold text-gray-700">No clubs found</p>
                  <p className="text-sm text-gray-400 mt-1">Try a different keyword</p>
                </div>
                <button onClick={() => setSearchTerm('')}
                  className="text-sm font-semibold text-brand-600 hover:underline">Clear search</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Club Detail Modal */}
      {selectedClub && (
        <ClubDetailModal
          club={selectedClub}
          events={clubEvents}
          loading={eventsLoading}
          onClose={() => { setSelectedClub(null); setClubEvents([]); }}
        />
      )}
    </>
  );
};

export default Clubs;
