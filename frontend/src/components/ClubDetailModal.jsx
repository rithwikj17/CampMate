import React, { useEffect, useRef } from 'react';
import { X, Calendar, MapPin, Users, Trophy, Clock, ImageOff } from 'lucide-react';

const CATEGORY_STYLES = {
  Cultural:  { bg: 'bg-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-500'  },
  Technical: { bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
  Sports:    { bg: 'bg-green-100',   text: 'text-green-700',   dot: 'bg-green-500'   },
  Workshop:  { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  Other:     { bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400'    },
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
    <div className={`rounded-2xl overflow-hidden border transition-all duration-300 group hover:shadow-lg ${past ? 'border-gray-200 bg-white' : 'border-brand-100 bg-brand-50/40'}`}>
      {/* Poster Image */}
      {event.poster_url ? (
        <div className="relative h-52 w-full overflow-hidden">
          <img
            src={event.poster_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <div className="hidden absolute inset-0 bg-gray-100 items-center justify-center">
            <ImageOff className="w-10 h-10 text-gray-400" />
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
          <h4 className="text-base font-bold text-gray-900 leading-snug">{event.title}</h4>
          {!event.poster_url && (
            <span className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${catStyle.bg} ${catStyle.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`}></span>
              {event.category}
            </span>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
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

const ClubDetailModal = ({ club, events, loading, onClose }) => {
  const overlayRef = useRef(null);

  // Close on Escape key
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
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/50 backdrop-blur-sm animate-fade-in"
      style={{ animation: 'fadeIn 0.2s ease' }}
    >
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        .modal-slide { animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        @media (min-width: 768px) {
          @keyframes slideUp { from { transform: translateY(30px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        }
      `}</style>

      <div
        className="modal-slide bg-white w-full md:max-w-2xl max-h-[92vh] md:max-h-[85vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="relative shrink-0">
          {/* Gradient banner */}
          <div className="h-24 bg-gradient-to-br from-brand-500 via-brand-600 to-indigo-700 flex items-end px-6 pb-4">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23fff\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'2\'/%3E%3C/g%3E%3C/svg%3E")' }}
            ></div>
          </div>

          {/* Club avatar */}
          <div className="absolute left-6 -bottom-6 w-14 h-14 rounded-2xl bg-white shadow-lg border-2 border-white flex items-center justify-center text-brand-600 font-extrabold text-2xl">
            {club.club_name?.charAt(0)}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Club Info */}
        <div className="px-6 pt-8 pb-4 shrink-0 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{club.club_name}</h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{club.description}</p>
          {club.member_count !== undefined && (
            <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
              <Users className="w-4 h-4 text-brand-500" />
              <span className="font-semibold text-gray-700">{club.member_count}</span> members
            </div>
          )}
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400">Loading events…</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm">No events recorded yet for this club.</p>
            </div>
          ) : (
            <>
              {futureEvents.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-3">
                    Upcoming Events
                  </h3>
                  <div className="space-y-4">
                    {futureEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
                  </div>
                </section>
              )}

              {pastEvents.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                    Past Events &amp; Competitions
                  </h3>
                  <div className="space-y-4">
                    {pastEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClubDetailModal;
