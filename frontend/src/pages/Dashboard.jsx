import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Bell, Sparkles, MapPin, ChevronRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  const metrics = [
    { label: 'Upcoming Events', value: '12', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'My Registered', value: '3', icon: Activity, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'New Announcements', value: '5', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const recommendedEvents = [
    { id: 1, title: 'AI Ethics Seminar', date: 'May 12, 2026', time: '10:00 AM', venue: 'Main Auditorium', category: 'Technology' },
    { id: 2, title: 'Spring Music Fest', date: 'May 15, 2026', time: '05:00 PM', venue: 'Open Ground', category: 'Cultural' },
  ];

  const recentAnnouncements = [
    { id: 1, club: 'Robotics Club', message: 'Meeting postponed to Friday 5 PM.', time: '2h ago' },
    { id: 2, club: 'Cultural Society', message: 'Auditions for the annual play are open!', time: '1d ago' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">{user?.name}</span> 👋
          </h1>
          <p className="text-gray-500 mt-2">Here's what is happening around campus today.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, i) => (
          <div key={i} className="glass rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{metric.value}</p>
              </div>
              <div className={`p-4 rounded-full ${metric.bg}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recommended Events */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="text-brand-500 h-5 w-5" /> Recommended for You
            </h2>
            <Link to="/events" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center">
              View all <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedEvents.map(event => (
              <div key={event.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-600 rounded-full">
                    {event.category}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-gray-900 mb-2">{event.title}</h3>
                
                <div className="space-y-2 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{event.date} • {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{event.venue}</span>
                  </div>
                </div>
                
                <button className="w-full py-2 bg-gray-50 hover:bg-brand-50 hover:text-brand-600 text-gray-700 text-sm font-medium rounded-xl transition-colors">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements feed */}
        <div className="space-y-4 lg:col-span-1">
           <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="text-amber-500 h-5 w-5" /> Announcements
           </h2>
           
           <div className="glass rounded-2xl p-1">
             {recentAnnouncements.map((ann, i) => (
               <div key={ann.id} className={`p-4 ${i !== recentAnnouncements.length - 1 ? 'border-b border-gray-100' : ''}`}>
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-sm font-semibold text-gray-900">{ann.club}</span>
                   <span className="text-xs text-gray-400">{ann.time}</span>
                 </div>
                 <p className="text-sm text-gray-600 leading-relaxed">{ann.message}</p>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
