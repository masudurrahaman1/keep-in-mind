import React, { useState, useEffect, useMemo } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, LogOut, Trash2, Activity, Settings, ChevronRight, CheckSquare, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../components/profile/ProfileCard';
import EditProfileModal from '../components/profile/EditProfileModal';
import { SectionCard, SettingRow, Toggle, Button } from '../components/settings/SettingsUI';
import { useAuth } from '../context/AuthContext';
import DriveStorageCard from '../components/DriveStorageCard';
import TwoFactorModal from '../components/profile/TwoFactorModal';

export default function Account() {
  const navigate = useNavigate();
  const { user, token, signOut } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL || '/api';

  // Storage key unique to user
  const profileKey = user ? `keep-in-mind-profile-${user._id}` : 'keep-in-mind-profile-guest';

  const [localOverrides, setLocalOverrides] = useState(() => {
    const saved = localStorage.getItem(profileKey);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    // Safety check: remove broken blob URLs that cannot be loaded after a page refresh
    if (parsed.avatar && typeof parsed.avatar === 'string' && parsed.avatar.startsWith('blob:')) {
      delete parsed.avatar;
    }
    return parsed;
  });

  // Re-fetch overrides if user changes (e.g. login/switch account)
  useEffect(() => {
    const saved = localStorage.getItem(profileKey);
    setLocalOverrides(saved ? JSON.parse(saved) : {});
  }, [profileKey]);

  // Build a profile object merging live backend user and local overrides
  const profile = {
    name:   localOverrides.name   || user?.name  || 'Guest User',
    email:  user?.email           || 'Not signed in', // Emails are strict to auth
    phone:  localOverrides.phone  || '',
    bio:    localOverrides.bio    || '',
    avatar: localOverrides.avatar || user?.avatar     || null,
    isGoogle: user?.authProvider === 'google',
  };

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
  });
  const [twoFactorModal, setTwoFactorModal] = useState(null); // 'setup' | 'disable' | null

  // Load real 2FA status from backend
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/auth/2fa/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setSecurity(prev => ({ ...prev, twoFactor: data.twoFactorEnabled ?? false })))
      .catch(() => {});
  }, [token]);

  const handle2FAToggle = () => {
    if (security.twoFactor) {
      setTwoFactorModal('disable');
    } else {
      setTwoFactorModal('setup');
    }
  };

  const on2FASuccess = (enabled) => {
    setSecurity(prev => ({ ...prev, twoFactor: enabled }));
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load real notes for activity stats
  const notes = useMemo(() => {
    const saved = localStorage.getItem(`keep-in-mind-notes-${user?._id || 'guest'}`);
    return saved ? JSON.parse(saved) : [];
  }, [user]);
  
  const stats = {
    total: notes.length,
    activeToday: notes.filter(n => {
      try {
        const d = parseISO(n.date);
        return d.toDateString() === new Date().toDateString();
      } catch { return false; }
    }).length
  };
  
  const recentActivity = notes
    .sort((a, b) => {
      try {
        return parseISO(b.date).getTime() - parseISO(a.date).getTime();
      } catch { return 0; }
    })
    .slice(0, 3)
    .map(n => ({
      id: n.id,
      title: n.title,
      time: (() => {
        try {
          const d = parseISO(n.date);
          if (isNaN(d.getTime())) return n.date;
          return formatDistanceToNow(d, { addSuffix: true });
        } catch { return n.date; }
      })(),
      color: n.textColor || 'text-primary'
    }));

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8 min-h-full relative z-10 pb-24">
      
      <div className="shrink-0">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-heading font-extrabold text-on-surface tracking-tight">
          Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Profile</span>
        </h1>
      </div>

      <ProfileCard profile={profile} onEditClick={() => setIsEditModalOpen(true)} />

      <DriveStorageCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mt-6 md:mt-8">
        
        {/* Left Column */}
        <div className="space-y-8">
          <SectionCard title="Security" description="Protect your account from unauthorized access." icon={Shield}>
             <div className="mb-4 pb-4 border-b border-white/5">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Auth Provider</span>
                <span className="text-sm text-on-surface flex items-center gap-2 font-medium">
                  <div className={`w-2 h-2 rounded-full ${user?.authProvider === 'google' ? 'bg-tertiary' : 'bg-primary'}`}></div>
                  {user?.authProvider === 'google' ? 'Google Account' : 'Email & Password'}
                </span>
             </div>
             <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security">
               <Toggle checked={security.twoFactor} onChange={handle2FAToggle} />
             </SettingRow>
             <SettingRow label="Login Alerts" description="Get notified of new logins">
               <Toggle checked={security.loginAlerts} onChange={(v) => setSecurity({...security, loginAlerts: v})} />
             </SettingRow>
          </SectionCard>

          <SectionCard title="Account Actions" description="Sensitive administrative actions." icon={Key}>
            <SettingRow label="Change Password" description={user?.authProvider === 'google' ? "Not applicable for Google sign-in" : "Ensure your account security"}>
               <Button variant="secondary" onClick={() => {}} disabled={user?.authProvider === 'google'}>
                 {user?.authProvider === 'google' ? 'Google Account' : 'Change Password'}
               </Button>
            </SettingRow>
            <div className="pt-4 mt-2">
               <div className="flex gap-4">
                 <Button variant="secondary" icon={LogOut} onClick={handleLogout}>Sign Out</Button>
                 <Button variant="danger" icon={Trash2} onClick={() => {}}>Delete Account</Button>
               </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <SectionCard title="Activity" description="Your recent interactions within Keep In Mind." icon={Activity}>
             <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/20 shadow-sm text-center">
                  <span className="block text-3xl font-heading font-bold text-primary mb-1">{stats.total}</span>
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Notes</span>
               </div>
               <div className="bg-surface-container rounded-2xl p-4 border border-outline-variant/20 shadow-sm text-center">
                  <span className="block text-3xl font-heading font-bold text-secondary mb-1">{stats.activeToday}</span>
                  <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Created Today</span>
               </div>
             </div>

             <div>
               <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Recently Edited</h4>
               <div className="space-y-3">
                 {recentActivity.map(act => (
                   <div key={act.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent hover:border-outline-variant/30 group">
                      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center shrink-0 shadow-sm group-hover:shadow group-hover:scale-105 transition-all">
                        <CheckSquare size={16} className={act.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-on-surface truncate">{act.title}</h5>
                        <span className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5"><Clock size={10} /> {act.time}</span>
                      </div>
                   </div>
                 ))}
               </div>
             </div>
          </SectionCard>

          <div 
            onClick={() => navigate('/settings')}
            className="glass-panel p-6 rounded-3xl flex items-center justify-between cursor-pointer group hover:bg-surface-container hover:shadow-lg transition-all border border-transparent hover:border-primary/20"
          >
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Settings size={24} />
               </div>
               <div>
                  <h3 className="font-heading font-bold text-lg text-on-surface group-hover:text-primary transition-colors">Preferences</h3>
                  <p className="text-sm text-on-surface-variant">Manage theme, sorting, and defaults</p>
               </div>
             </div>
             <ChevronRight size={24} className="text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditModalOpen && (
          <EditProfileModal 
            profile={profile} 
            onClose={() => setIsEditModalOpen(false)} 
            onSave={(p) => { 
              const newOverrides = { name: p.name, phone: p.phone, bio: p.bio, avatar: p.avatar };
              setLocalOverrides(newOverrides);
              localStorage.setItem(profileKey, JSON.stringify(newOverrides));
              setIsEditModalOpen(false); 
            }} 
          />
        )}
        {twoFactorModal && (
          <TwoFactorModal
            mode={twoFactorModal}
            onClose={() => setTwoFactorModal(null)}
            onSuccess={on2FASuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
