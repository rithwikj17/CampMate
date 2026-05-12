import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, User, Mail, Phone, GraduationCap, Building2, Calendar, MapPin, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Chemical Engineering', 'Biotechnology', 'MBA', 'Other'
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG / Research'];

const EventRegistrationModal = ({ event, onClose, onSubmit }) => {
  const { user } = useAuth();
  const overlayRef = useRef(null);

  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    year: '',
    department: '',
    rollNumber: '',
    teamName: '',
    additionalInfo: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) newErrors.phone = 'Enter a valid 10-digit number';
    if (!form.year) newErrors.year = 'Please select your year';
    if (!form.department) newErrors.department = 'Please select your department';
    if (!form.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!form.agreeTerms) newErrors.agreeTerms = 'You must agree to proceed';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));

    setSubmitting(false);
    setSuccess(true);

    // After showing success animation, call onSubmit and close
    setTimeout(() => {
      onSubmit(event.id, form);
      onClose();
    }, 1800);
  };

  const inputClass = (field) =>
    `w-full border ${errors[field] ? 'border-rose-300 dark:border-rose-500/50 ring-2 ring-rose-100 dark:ring-rose-900/30' : 'border-gray-200 dark:border-surface-800'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white dark:bg-surface-dark dark:text-white placeholder-gray-400 dark:placeholder-gray-500`;

  // Success state
  if (success) {
    return createPortal(
      <div ref={overlayRef} onClick={handleOverlayClick}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-2xl w-full max-w-md p-10 text-center animate-scale-in">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Registration Successful!</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            You've been registered for <span className="font-semibold text-gray-800 dark:text-gray-200">{event.title}</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">A confirmation email will be sent to {form.email}</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-full px-4 py-2 mx-auto w-fit">
            <Sparkles className="w-3 h-3" /> Registration ID: REG-{Date.now().toString(36).toUpperCase()}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4"
    >
      <style>{`
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.16,1,0.3,1); }
      `}</style>

      <div className="animate-scale-in bg-white dark:bg-surface-dark rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header with event info */}
        <div className="relative bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-600 p-6 pb-8 shrink-0">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />

          <button onClick={onClose}
            className="absolute top-3 right-3 p-3 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl text-white/70 hover:text-white transition-all z-10 cursor-pointer shadow-sm">
            <X size={20} />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
                {event.category}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">{event.title}</h2>
            <div className="flex flex-wrap gap-4 text-white/70 text-xs">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} /> {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} /> {event.time}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} /> {event.venue}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4">
          <div className="text-center mb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Event Registration Form</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Fill in your details to register for this event</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <User size={14} className="text-brand-500" /> Full Name <span className="text-rose-500">*</span>
            </label>
            <input type="text" placeholder="Enter your full name" value={form.fullName} onChange={set('fullName')}
              className={inputClass('fullName')} />
            {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Mail size={14} className="text-brand-500" /> Email Address <span className="text-rose-500">*</span>
            </label>
            <input type="email" placeholder="you@university.edu" value={form.email} onChange={set('email')}
              className={inputClass('email')} />
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Phone size={14} className="text-brand-500" /> Phone Number <span className="text-rose-500">*</span>
            </label>
            <input type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={set('phone')}
              className={inputClass('phone')} />
            {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Year & Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <GraduationCap size={14} className="text-brand-500" /> Year <span className="text-rose-500">*</span>
              </label>
              <select value={form.year} onChange={set('year')}
                className={`${inputClass('year')} bg-white dark:bg-surface-dark dark:text-white appearance-auto`}>
                <option value="">Select Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {errors.year && <p className="text-xs text-rose-500 mt-1">{errors.year}</p>}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <Building2 size={14} className="text-brand-500" /> Department <span className="text-rose-500">*</span>
              </label>
              <select value={form.department} onChange={set('department')}
                className={`${inputClass('department')} bg-white dark:bg-surface-dark dark:text-white appearance-auto`}>
                <option value="">Select Dept</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="text-xs text-rose-500 mt-1">{errors.department}</p>}
            </div>
          </div>

          {/* Roll Number */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Roll Number <span className="text-rose-500">*</span>
            </label>
            <input type="text" placeholder="e.g. 22B81A0501" value={form.rollNumber} onChange={set('rollNumber')}
              className={inputClass('rollNumber')} />
            {errors.rollNumber && <p className="text-xs text-rose-500 mt-1">{errors.rollNumber}</p>}
          </div>

          {/* Team Name (optional) */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Team Name <span className="text-gray-400 dark:text-gray-500 text-xs">(optional, for team events)</span>
            </label>
            <input type="text" placeholder="Enter team name if applicable" value={form.teamName} onChange={set('teamName')}
              className={inputClass('teamName')} />
          </div>

          {/* Additional Info */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              Additional Information <span className="text-gray-400 dark:text-gray-500 text-xs">(optional)</span>
            </label>
            <textarea rows={2} placeholder="Any dietary needs, accessibility requirements, etc."
              value={form.additionalInfo} onChange={set('additionalInfo')}
              className={`${inputClass('additionalInfo')} resize-none`} />
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <input type="checkbox" id="agreeTerms" checked={form.agreeTerms} onChange={set('agreeTerms')}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-surface-800 bg-white dark:bg-surface-dark text-brand-600 focus:ring-brand-500" />
            <label htmlFor="agreeTerms" className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              I agree to the event's code of conduct and consent to share my details with the organizers.
              {errors.agreeTerms && <span className="text-rose-500 block mt-0.5">{errors.agreeTerms}</span>}
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 pb-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 dark:border-surface-800 text-gray-600 dark:text-gray-300 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-surface-800 active:scale-[0.98] transition-all cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle size={16} /> Confirm Registration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EventRegistrationModal;
