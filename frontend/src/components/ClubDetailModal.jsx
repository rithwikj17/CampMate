import React, { useEffect, useRef } from 'react';
import { X, Calendar, MapPin, Users, Trophy, Clock, ImageOff } from 'lucide-react';

const CATEGORY_STYLES = {
  Cultural:  { bg: 'bg-purple-100 dark:bg-purple-900/30',  text: 'text-purple-700 dark:text-purple-400',  dot: 'bg-purple-500'  },
  Technical: { bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-700 dark:text-blue-400',    dot: 'bg-blue-500'    },
  Sports:    { bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-700 dark:text-green-400',   dot: 'bg-green-500'   },
  Workshop:  { bg: 'bg-amber-100 dark:bg-amber-900/30',   text: 'text-amber-700 dark:text-amber-400',   dot: 'bg-amber-500'   },
  Other:     { bg: 'bg-gray-100 dark:bg-surface-800',    text: 'text-gray-600 dark:text-gray-400',    dot: 'bg-gray-400'    },
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

const isPast = (dateStr) => new Date(dateStr) < new Date();

const EventCard = ({ event }) => {
  const past = isPast(event.date);
  const catStyle = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.Other;

  return (
    <div className={`rounded-2xl overflow-hidden border transition-all duration-300 group hover:shadow-lg dark:shadow-none ${past ? 'border-gray-200 dark:border-surface-800 bg-white dark:bg-surface-dark' : 'border-brand-100 dark:border-brand-500/30 bg-brand-50/40 dark:bg-brand-900/30'}`}>
      {/* Poster Image */}
      {event.poster_url ? (
        <div className="relative h-52 w-full overflow-hidden">
          <img
            src={event.poster_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="hidden absolute inset-0 bg-gray-100 dark:bg-surface-800 items-center justify-center">
            <ImageOff className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          {past && (
            <div className="absolute top-3 left-3">
              <span className="bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                Past Event
              </span>
            </div>
          )}
          <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${catStyle.bg} ${catStyle.text} backdrop-blur-sm`}>
            <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`}></span>
            {event.category}
          </div>
        </div>
      ) : (
        <div className={`h-2 w-full ${catStyle.dot}`}></div>
      )}

      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{event.title}</h4>
          {!event.poster_url && (
            <span className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${catStyle.bg} ${catStyle.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`}></span>
              {event.category}
            </span>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{event.description}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-brand-500" />
            {formatDate(event.date)}
          </span>
          {event.time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-500" />
              {formatTime(event.time)}
            </span>
          )}
          {event.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              {event.venue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ClubDetailModal = ({ club, events, loading, onClose, onJoin, isMember }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const pastEvents   = events.filter(ev => isPast(ev.date));
  const futureEvents = events.filter(ev => !isPast(ev.date));

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 bg-base/80 backdrop-blur-xl animate-fade-in"
      style={{ animation: 'fadeIn 0.3s ease' }}
    >
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        .modal-slide { animation: slideUp 0.4s cubic-bezier(0.16,1,0.3,1); }
        @media (min-width: 768px) {
          @keyframes slideUp { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        }
      `}</style>

      <div className="modal-slide bg-surface-dark border border-white/10 w-full md:max-w-4xl max-h-[92vh] md:max-h-[90vh] rounded-t-[40px] md:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(37,99,235,0.1)] flex flex-col overflow-hidden relative">
        
        {/* Massive Hero Banner */}
        <div className="relative shrink-0 h-48 md:h-64 bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-900 overflow-hidden">
          {/* Aesthetic overlays */}
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/20 rounded-full blur-[100px]"></div>
          
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/50 bg-black/20 hover:text-white hover:bg-black/40 rounded-full p-2.5 backdrop-blur-md transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Avatar & Actions */}
        <div className="px-8 md:px-12 relative flex justify-between items-end pb-6 border-b border-white/10 shrink-0">
          <div className="flex items-end gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-surface-dark border-4 border-surface-dark shadow-xl -mt-12 md:-mt-16 relative z-10 flex items-center justify-center text-brand-500 font-display font-bold text-4xl md:text-6xl overflow-hidden group">
              <div className="absolute inset-0 bg-brand-500/10 group-hover:bg-brand-500/20 transition-colors"></div>
              {club.club_name?.charAt(0)}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => onJoin && onJoin(club.id)}
              className={`px-8 py-3.5 rounded-2xl font-semibold shadow-glow transition-all -translate-y-2 ${
                isMember
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30'
                  : 'bg-brand-600 hover:bg-brand-500 text-white'
              }`}>
              {isMember ? '✓ Joined · Leave' : 'Join Club'}
            </button>
          </div>
        </div>

        {/* Club Meta Info */}
        <div className="px-8 md:px-12 pt-8 pb-4 shrink-0 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-3">
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white tracking-tight">{club.club_name}</h2>
            <p className="text-base text-white/60 leading-relaxed font-light">{club.description}</p>
          </div>
          <div className="flex flex-col justify-center space-y-4 bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-500/20 rounded-2xl text-brand-400">
                <Users size={24} />
              </div>
              <div>
                <div className="text-2xl font-mono font-bold text-white tracking-tight">{(club.member_count !== undefined && club.member_count > 0) ? club.member_count + 120 : 120}</div>
                <div className="text-xs font-mono uppercase tracking-widest text-white/40">Active Members</div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Feed */}
        <div className="flex-1 overflow-y-auto px-8 md:px-12 py-8 bg-base">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-white/10 border-t-brand-500 rounded-full animate-spin"></div>
              <p className="text-sm font-mono uppercase tracking-widest text-white/30">Syncing Feed…</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white/20" />
              </div>
              <div>
                <p className="text-white/60 font-medium">No recent activity</p>
                <p className="text-white/30 text-sm mt-1">This club hasn't posted any events yet.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
              {futureEvents.length > 0 && (
                <section className="space-y-6">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-brand-400 border-b border-brand-500/20 pb-4">
                    Upcoming Missions
                  </h3>
                  <div className="space-y-4">
                    {futureEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
                  </div>
                </section>
              )}

              {pastEvents.length > 0 && (
                <section className="space-y-6">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white/30 border-b border-white/10 pb-4">
                    Mission Archives
                  </h3>
                  <div className="space-y-4">
                    {pastEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubDetailModal;
