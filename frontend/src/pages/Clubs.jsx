import React, { useState } from 'react';
import { Users, Search, ChevronRight, UserPlus } from 'lucide-react';

const mockClubs = [
  { id: 1, name: 'Robotics Club', description: 'A club for robotics enthusiasts to build and learn. Join us for weekly hands-on sessions.', members: 45, category: 'Tech' },
  { id: 2, name: 'Coding Club', description: 'Weekly coding challenges, hackathons, and tech talks from industry experts.', members: 120, category: 'Tech' },
  { id: 3, name: 'Lit Club', description: 'Exploring literature, poetry slams, and book discussions. For the creative minds.', members: 30, category: 'Arts' },
  { id: 4, name: 'E-Cell', description: 'Fostering entrepreneurship and innovation on campus. Build your startup with us.', members: 60, category: 'Business' },
];

const Clubs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredClubs = mockClubs.filter(club => 
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    club.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Clubs</h1>
          <p className="text-gray-500 mt-1">Connect with like-minded peers and explore your interests.</p>
        </div>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClubs.map(club => (
          <div key={club.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-brand-200 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-50 to-transparent rounded-bl-full opacity-50 -z-10 group-hover:scale-110 transition-transform"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xl shadow-inner">
                {club.name.charAt(0)}
              </div>
              <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                {club.category}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">{club.name}</h3>
            <p className="text-gray-600 text-sm mb-6 flex-grow">{club.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Users size={16} className="text-brand-500" />
                <span className="font-medium text-gray-900">{club.members}</span> Members
              </div>
              
              <div className="flex gap-2">
                <button className="text-brand-600 bg-brand-50 hover:bg-brand-100 p-2 rounded-lg transition-colors" title="Join Club">
                  <UserPlus size={18} />
                </button>
                <button className="text-gray-500 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors flex items-center" title="View Details">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Clubs;
