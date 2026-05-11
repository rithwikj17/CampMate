import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Shield, Camera, Save, CheckCircle, Eye, EyeOff, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Chemical Engineering', 'Biotechnology', 'MBA', 'Other'
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG / Research'];

const Toast = ({ message, onDone }) => {
  React.useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl animate-slide-up">
      <CheckCircle size={16} /> {message}
    </div>
  );
};

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    rollNumber: '',
    year: '',
    department: '',
    bio: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [pwErrors, setPwErrors] = useState({});

  const setProfile = (k) => (e) => setProfileForm(f => ({ ...f, [k]: e.target.value }));
  const setPassword = (k) => (e) => setPasswordForm(f => ({ ...f, [k]: e.target.value }));

  const handleProfileSave = (e) => {
    e.preventDefault();
    // In production: call API to update profile
    setToast('Profile updated successfully!');
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length > 0) { setPwErrors(errors); return; }
    setPwErrors({});
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setToast('Password changed successfully!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const inputClass = (err) =>
    `w-full border ${err ? 'border-rose-300 dark:border-rose-500/50 ring-2 ring-rose-100 dark:ring-rose-900/30' : 'border-gray-200 dark:border-white/10'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-400 transition-all`;

  const TABS = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16 pt-4">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Profile Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-xl p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-display font-bold text-3xl shadow-glow">
              {user?.profile_picture_url
                ? <img src={user.profile_picture_url} alt="avatar" className="w-full h-full object-cover rounded-3xl" />
                : initials
              }
            </div>
            <button className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Name & Role */}
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">{user?.name || 'User'}</h1>
            <p className="text-gray-500 dark:text-white/50 text-sm mt-1">{user?.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                <Shield size={11} /> {user?.role || 'Student'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/20 hover:border-rose-300 dark:hover:border-rose-500/40 rounded-xl text-sm font-medium transition-all"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-2xl p-1.5 shadow-sm">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === id
                ? 'bg-brand-600 text-white shadow-glow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-white/40 dark:hover:text-white/70 dark:hover:bg-white/5'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-3xl p-8 shadow-xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <User size={18} className="text-brand-400" /> Personal Information
          </h2>
          <form onSubmit={handleProfileSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/60 mb-1.5">Full Name</label>
                <input type="text" value={profileForm.name} onChange={setProfile('name')}
                  className={inputClass(null)} placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/60 mb-1.5">Email Address</label>
                <input type="email" value={profileForm.email} onChange={setProfile('email')}
                  className={inputClass(null)} placeholder="you@university.edu" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/60 mb-1.5">Phone Number</label>
                <input type="tel" value={profileForm.phone} onChange={setProfile('phone')}
                  className={inputClass(null)} placeholder="10-digit mobile number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/60 mb-1.5">Roll Number</label>
                <input type="text" value={profileForm.rollNumber} onChange={setProfile('rollNumber')}
                  className={inputClass(null)} placeholder="e.g. 22B81A0501" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/60 mb-1.5">Year of Study</label>
                <select value={profileForm.year} onChange={setProfile('year')}
                  className={`${inputClass(null)}`}>
                  <option value="">Select Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/60 mb-1.5">Department</label>
                <select value={profileForm.department} onChange={setProfile('department')}
                  className={`${inputClass(null)}`}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/60 mb-1.5">Bio</label>
              <textarea rows={3} value={profileForm.bio} onChange={setProfile('bio')}
                placeholder="Tell others about yourself..."
                className={`${inputClass(null)} resize-none`} />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit"
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-glow-sm hover:shadow-glow">
                <Save size={16} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 rounded-3xl p-8 shadow-xl">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Lock size={18} className="text-brand-400" /> Change Password
          </h2>
          <form onSubmit={handlePasswordSave} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/60 mb-1.5">Current Password</label>
              <div className="relative">
                <input type={showCurrentPw ? 'text' : 'password'}
                  value={passwordForm.currentPassword} onChange={setPassword('currentPassword')}
                  className={`${inputClass(pwErrors.currentPassword)} pr-11`}
                  placeholder="Enter current password" />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwErrors.currentPassword && <p className="text-xs text-rose-500 mt-1">{pwErrors.currentPassword}</p>}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/60 mb-1.5">New Password</label>
              <div className="relative">
                <input type={showNewPw ? 'text' : 'password'}
                  value={passwordForm.newPassword} onChange={setPassword('newPassword')}
                  className={`${inputClass(pwErrors.newPassword)} pr-11`}
                  placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwErrors.newPassword && <p className="text-xs text-rose-500 mt-1">{pwErrors.newPassword}</p>}
              {/* Password strength indicator */}
              {passwordForm.newPassword && (
                <div className="mt-2 flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordForm.newPassword.length >= i * 3
                        ? i <= 2 ? 'bg-rose-400' : i === 3 ? 'bg-amber-400' : 'bg-green-400'
                        : 'bg-white/10'
                    }`} />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/60 mb-1.5">Confirm New Password</label>
              <input type="password"
                value={passwordForm.confirmPassword} onChange={setPassword('confirmPassword')}
                className={inputClass(pwErrors.confirmPassword)}
                placeholder="Re-enter new password" />
              {pwErrors.confirmPassword && <p className="text-xs text-rose-500 mt-1">{pwErrors.confirmPassword}</p>}
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit"
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-glow-sm hover:shadow-glow">
                <Save size={16} /> Update Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
