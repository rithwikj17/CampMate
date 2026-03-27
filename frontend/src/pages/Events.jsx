import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, MapPin, Clock, Search, Filter, Plus } from 'lucide-react';

const mockEvents = [
  { id: 1, title: 'Annual Hackathon', description: '24-hour university-wide hackathon focusing on AI.', date: '2026-05-10', time: '09:00', venue: 'Main Auditorium', category: 'Technology', organizer: 'Coding Club', registered: true },
  { id: 2, title: 'Robo Wars', description: 'Build and fight robots in the arena.', date: '2026-05-15', time: '14:00', venue: 'Robotics Lab', category: 'Technology', organizer: 'Robotics Club', registered: false },
  { id: 3, title: 'Literature Fest', description: 'Poetry reading and book discussions.', date: '2026-05-20', time: '16:00', venue: 'Library Seminar Hall', category: 'Cultural', organizer: 'Lit Club', registered: false },
  { id: 4, title: 'Startup Pitch', description: 'Pitch your ideas to real investors.', date: '2026-06-01', time: '10:00', venue: 'Business Block', category: 'Business', organizer: 'E-Cell', registered: false },
];

const Events = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [CategoryFilter, setCategoryFilter] = useState('All');
  
  const canCreate = user?.role === 'Administrator' || user?.role === 'Club Member';

  const categories = ['All', 'Technology', 'Cultural', 'Business'];

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = CategoryFilter === 'All' || event.category === CategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Events</h1>
          <p className="text-gray-500 mt-1">Discover and register for activities happening around you.</p>
        </div>
        {canCreate && (
          <button className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-brand-500/20">
            <Plus size={20} /> Create Event
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="glass p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="h-5 w-5 text-gray-400 mr-1 hidden md:block" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                CategoryFilter === cat 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
            <div className="h-32 bg-gradient-to-br from-brand-100 to-brand-50 relative p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="bg-white/80 backdrop-blur-sm text-brand-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {event.category}
                </span>
                {event.registered && (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Registered
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
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    event.registered 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                    : 'bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white'
                  }`}
                  disabled={event.registered}
                >
                  {event.registered ? 'Attending' : 'Register'}
                </button>
              </div>
            </div>
          </div>
        ))}
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
    </div>
  );
};

export default Events;
