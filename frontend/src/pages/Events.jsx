import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, MapPin, Clock, Search, Filter, Plus, X, CheckCircle } from 'lucide-react';

const INITIAL_EVENTS = [
  { id: 1, title: 'Annual Hackathon', description: '24-hour university-wide hackathon focusing on AI.', date: '2026-05-10', time: '09:00', venue: 'Main Auditorium', category: 'Technology', organizer: 'Coding Club' },
  { id: 2, title: 'Robo Wars', description: 'Build and fight robots in the arena.', date: '2026-05-15', time: '14:00', venue: 'Robotics Lab', category: 'Technology', organizer: 'Robotics Club' },
  { id: 3, title: 'Literature Fest', description: 'Poetry reading and book discussions.', date: '2026-05-20', time: '16:00', venue: 'Library Seminar Hall', category: 'Cultural', organizer: 'Lit Club' },
  { id: 4, title: 'Startup Pitch', description: 'Pitch your ideas to real investors.', date: '2026-06-01', time: '10:00', venue: 'Business Block', category: 'Business', organizer: 'E-Cell' },
];

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ message, onDone }) => {
  React.useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl">
      <CheckCircle size={18} /> {message}
    </div>
  );
};

// ── Create Event Modal ────────────────────────────────────────────────────────
const CreateEventModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ title: '', description: '', date: '', time: '', venue: '', category: 'Technology', organizer: '' });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue) return;
    onCreate({ ...form, id: Date.now() });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Create New Event</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
            <input required type="text" placeholder="e.g. Annual Hackathon" value={form.title} onChange={set('title')}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} placeholder="Describe the event..." value={form.description} onChange={set('description')}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input required type="date" value={form.date} onChange={set('date')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input type="time" value={form.time} onChange={set('time')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
            <input required type="text" placeholder="e.g. Main Auditorium" value={form.venue} onChange={set('venue')}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={set('category')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors bg-white">
                {['Technology', 'Cultural', 'Business', 'Sports'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
              <input type="text" placeholder="e.g. Coding Club" value={form.organizer} onChange={set('organizer')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Event Detail Modal ────────────────────────────────────────────────────────
const EventDetailModal = ({ event, registered, onRegister, onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="h-40 bg-gradient-to-br from-brand-100 to-brand-50 rounded-t-2xl relative p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="bg-white/80 backdrop-blur-sm text-brand-700 text-xs font-bold px-3 py-1 rounded-full">{event.category}</span>
          <button onClick={onClose} className="p-1.5 bg-white/80 hover:bg-white rounded-lg transition-colors">
            <X size={16} className="text-gray-600" />
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-gray-50 rounded-lg"><CalendarIcon size={16} className="text-gray-700" /></div>
            <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-gray-50 rounded-lg"><Clock size={16} className="text-gray-700" /></div>
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-2 bg-gray-50 rounded-lg"><MapPin size={16} className="text-gray-700" /></div>
            <span>{event.venue}</span>
          </div>
        </div>
        <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
          By <span className="font-semibold text-gray-800">{event.organizer}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Close
          </button>
          <button
            onClick={() => { onRegister(event.id); onClose(); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              registered
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                : 'bg-brand-600 text-white hover:bg-brand-700'
            }`}>
            {registered ? 'Cancel Registration' : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [registeredIds, setRegisteredIds] = useState(new Set([1])); // event 1 pre-registered
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [toast, setToast] = useState(null);

  const canCreate = user?.role === 'Administrator' || user?.role === 'Club Member';
  const categories = ['All', 'Technology', 'Cultural', 'Business'];

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleRegister = (eventId) => {
    const event = events.find(e => e.id === eventId);
    setRegisteredIds(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
        setToast(`Unregistered from "${event?.title}"`);
      } else {
        next.add(eventId);
        setToast(`Registered for "${event?.title}"!`);
      }
      return next;
    });
  };

  const handleCreate = (newEvent) => {
    setEvents(prev => [...prev, newEvent]);
    setToast(`Event "${newEvent.title}" created!`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Events</h1>
          <p className="text-gray-500 mt-1">Discover and register for activities happening around you.</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-brand-500/20">
            <Plus size={20} /> Create Event
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input type="text" placeholder="Search events..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="h-5 w-5 text-gray-400 mr-1 hidden md:block" />
          {categories.map(cat => (
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

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => {
          const registered = registeredIds.has(event.id);
          return (
            <div key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group cursor-pointer">
              <div className="h-32 bg-gradient-to-br from-brand-100 to-brand-50 relative p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="bg-white/80 backdrop-blur-sm text-brand-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {event.category}
                  </span>
                  {registered && (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      ✓ Registered
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-brand-600 transition-colors">{event.title}</h3>
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="p-2 rounded-lg bg-gray-50"><CalendarIcon size={16} className="text-gray-700" /></div>
                    <span className="font-medium text-gray-900">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="p-2 rounded-lg bg-gray-50"><Clock size={16} className="text-gray-700" /></div>
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="p-2 rounded-lg bg-gray-50"><MapPin size={16} className="text-gray-700" /></div>
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    By <span className="font-medium text-gray-900">{event.organizer}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRegister(event.id); }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      registered
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                        : 'bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white'
                    }`}>
                    {registered ? 'Unregister' : 'Register'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No events found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {showCreateModal && (
        <CreateEventModal onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
      )}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          registered={registeredIds.has(selectedEvent.id)}
          onRegister={handleRegister}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default Events;
