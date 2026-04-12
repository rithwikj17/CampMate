import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Users, Search, ChevronRight, UserPlus, UserMinus,
  X, CheckCircle, Plus, Filter, BookOpen, Code2,
  Briefcase, Music, Trophy, Microscope
} from 'lucide-react';
import ClubDetailModal from '../components/ClubDetailModal';

// ── Mock Categories & Styles ────────────────────────────────────────────────
const CATEGORIES = ['All', 'Tech', 'Arts', 'Business', 'Sports'];

const CATEGORY_ICONS = {
  Tech: Code2,
  Arts: Music,
  Business: Briefcase,
  Sports: Trophy,
  Science: Microscope,
  Other: BookOpen,
};

const CATEGORY_COLORS = {
  Tech:     { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200'   },
  Arts:     { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  Business: { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200'  },
  Sports:   { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200'  },
  Science:  { bg: 'bg-cyan-100',   text: 'text-cyan-700',   border: 'border-cyan-200'   },
  Other:    { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200'   },
};

const getCategoryStyle = (cat) => CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;

const CARD_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-brand-400 to-brand-600',
  'from-purple-500 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-600',
  'from-rose-400 to-pink-600',
];
const cardGradient = (name) => CARD_GRADIENTS[(name || '').length % CARD_GRADIENTS.length];

// ── Toast ───────────────────────────────────────────────────────────────────
const Toast = ({ message, onDone }) => {
  React.useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl">
      <CheckCircle size={18} /> {message}
    </div>
  );
};

// ── Create Club Modal ───────────────────────────────────────────────────────
const CreateClubModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ name: '', description: '', category: 'Tech' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onCreate({ ...form, id: Date.now(), members: 1 });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create New Club</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Club Name *</label>
            <input required type="text" placeholder="e.g. Astronomy Club"
              value={form.name} onChange={set('name')}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={4} placeholder="What is this club about?"
              value={form.description} onChange={set('description')}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={set('category')}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors bg-white">
              {['Tech', 'Arts', 'Business', 'Sports', 'Science', 'Other'].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
              Create Club
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────────────────────
const Clubs = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [memberIds, setMemberIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubEvents, setClubEvents]     = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  
  const [toast, setToast] = useState(null);

  const canCreate = user?.role === 'Administrator' || user?.role === 'Club Member';

  // Fetch from backend
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/clubs');
        if (response.data && response.data.data) {
          const mapped = response.data.data.map(c => ({
            ...c,
            id: c.id,
            name: c.club_name || 'Unnamed Club',
            club_name: c.club_name || 'Unnamed Club', // for upstream modal compatibility
            description: c.description || '',
            members: c.member_count || 0,
            member_count: c.member_count || 0,       // for upstream modal compatibility
            category: c.category || 'Other'
          }));
          setClubs(mapped);
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
    } catch {
      setClubEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedClub(null);
    setClubEvents([]);
  };

  // Filter
  const filteredClubs = clubs.filter(club => {
    const matchesSearch =
      (club.name && club.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || club.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Join / Leave
  const handleToggle = (e, clubId) => {
    e.stopPropagation(); // prevent modal from opening
    const club = clubs.find(c => c.id === clubId);
    const isJoining = !memberIds.has(clubId);

    setMemberIds(prev => {
      const next = new Set(prev);
      isJoining ? next.add(clubId) : next.delete(clubId);
      return next;
    });

    setClubs(prev =>
      prev.map(c =>
        c.id === clubId
          ? { ...c, members: c.members + (isJoining ? 1 : -1), member_count: c.member_count + (isJoining ? 1 : -1) }
          : c
      )
    );

    setToast(isJoining ? `Joined "${club?.name}"!` : `Left "${club?.name}"`);
  };

  // Create new club (Mock handler for now, updates UI state only)
  const handleCreate = (newClub) => {
    const clubToAdd = {
      ...newClub,
      club_name: newClub.name,
      member_count: newClub.members
    };
    setClubs(prev => [...prev, clubToAdd]);
    setMemberIds(prev => new Set([...prev, clubToAdd.id]));
    setToast(`Club "${newClub.name}" created!`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Clubs</h1>
          <p className="text-gray-500 mt-1">Connect with like-minded peers and explore your interests.</p>
        </div>
        <div className="flex items-center gap-3">
          {memberIds.size > 0 && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl text-sm font-medium">
              <Users size={15} />
              In {memberIds.size} club{memberIds.size > 1 ? 's' : ''}
            </div>
          )}
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-brand-500/20">
              <Plus size={18} /> Create Club
            </button>
          )}
        </div>
      </div>

      {/* Search + Category Filter */}
      <div className="glass p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input type="text" placeholder="Search clubs or keywords..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors text-sm" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="h-4 w-4 text-gray-400 mr-1 shrink-0 hidden md:block" />
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="font-medium text-gray-900">{filteredClubs.length}</span>
        club{filteredClubs.length !== 1 ? 's' : ''} found
        {categoryFilter !== 'All' && (
          <span className="flex items-center gap-1">
            in <span className="font-semibold text-gray-800">{categoryFilter}</span>
            <button onClick={() => setCategoryFilter('All')}
              className="ml-1 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={14} />
            </button>
          </span>
        )}
      </div>

      {/* Clubs Grid / Loading Sequence */}
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
      ) : filteredClubs.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No clubs found</h3>
          <p className="text-gray-500 mt-1">Try a different search term or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClubs.map(club => {
            const isMember = memberIds.has(club.id);
            const style = getCategoryStyle(club.category);
            const CatIcon = CATEGORY_ICONS[club.category] || BookOpen;

            return (
              <div key={club.id}
                onClick={() => handleClubClick(club)}
                className="bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:border-brand-200 transition-all duration-300 group flex flex-col h-full relative overflow-hidden cursor-pointer">

                {/* Coloured top strip */}
                <div className={`h-2 w-full bg-gradient-to-r ${cardGradient(club.name)}`} />

                <div className="p-6 flex flex-col flex-grow">
                  {/* Top row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xl shadow-inner">
                      {(club.name && club.name.length > 0) ? club.name.charAt(0) : 'C'}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {isMember && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          ✓ Joined
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1 ${style.bg} ${style.text} ${style.border}`}>
                        <CatIcon size={11} /> {club.category}
                      </span>
                    </div>
                  </div>

                  {/* Name & Description */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {club.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">
                    {club.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    {/* Live member count */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users size={15} className="text-brand-500" />
                      <span className="font-bold text-gray-900">{club.members}</span>
                      <span>Members</span>
                    </div>

                    <div className="flex gap-2">
                      {/* Join / Leave */}
                      <button
                        onClick={(e) => handleToggle(e, club.id)}
                        title={isMember ? 'Leave Club' : 'Join Club'}
                        className={`p-2 rounded-lg transition-colors ${
                          isMember
                            ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
                            : 'text-brand-600 bg-brand-50 hover:bg-brand-100'
                        }`}>
                        {isMember ? <UserMinus size={18} /> : <UserPlus size={18} />}
                      </button>

                      {/* View Details */}
                      <button
                        className="text-gray-500 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors group-hover:bg-brand-50 group-hover:text-brand-600">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateClubModal onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
      )}
      
      {/* Upstream ClubDetailModal */}
      {selectedClub && (
        <ClubDetailModal
          club={clubs.find(c => c.id === selectedClub.id) || selectedClub}
          events={clubEvents}
          loading={eventsLoading}
          onClose={() => { setSelectedClub(null); setClubEvents([]); }}
        />
      )}
    </div>
  );
};

export default Clubs;
