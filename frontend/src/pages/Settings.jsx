import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Palette, Sliders, Bell, Lock, Database, Info, LogOut, Save, RefreshCw, Trash2, Download, Upload, Cloud } from 'lucide-react';
import { SectionCard, SettingRow, Toggle, Select, Button } from '../components/settings/SettingsUI';
import { cn } from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { syncNotesToGoogleDrive, fetchNotesFromGoogleDrive } from '../services/driveService';

import { auth } from '../config/firebase';
import PasswordModal from '../modals/PasswordModal';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Account');
  const { theme, setTheme } = useTheme();
  const { user, token, googleAccessToken, signOut } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const hasPassword = auth.currentUser?.providerData?.some(p => p.providerId === 'password');

  // Storage keys unique to user
  const notesKey = user ? `keep-in-mind-notes-${user._id}` : 'keep-in-mind-notes-guest';
  const syncTimeKey = user ? `keep-in-mind-last-sync-${user._id}` : 'keep-in-mind-last-sync-guest';

  const [lastSynced, setLastSynced] = useState(() => {
    return localStorage.getItem(syncTimeKey) || null;
  });

  const [autoSync, setAutoSync] = useState(() => {
    return localStorage.getItem('keep-in-mind-auto-sync') === 'true';
  });

  const handleDriveSync = async (silent = false) => {
    if (!user || !token || !googleAccessToken) {
      return;
    }

    if (!silent) setIsSyncing(true);
    try {
      const savedNotes = localStorage.getItem(notesKey);
      const notes = savedNotes ? JSON.parse(savedNotes) : [];

      await syncNotesToGoogleDrive(notes, googleAccessToken, token);
      
      const now = new Date().toLocaleString();
      setLastSynced(now);
      localStorage.setItem(syncTimeKey, now);
      
      if (!silent) setIsSyncing(true);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  const handleToggleAutoSync = (val) => {
    setAutoSync(val);
    localStorage.setItem('keep-in-mind-auto-sync', val ? 'true' : 'false');
  };

  const handleDriveRestore = async () => {
    if (!user || !token || !googleAccessToken) {
      return;
    }

    const confirm = window.confirm(
      'Are you sure? This will replace all your current local notes with the backup from Google Drive.'
    );
    if (!confirm) return;

    setIsFetching(true);
    try {
      const data = await fetchNotesFromGoogleDrive(googleAccessToken, token);
      
      if (data && data.notes) {
        localStorage.setItem(notesKey, JSON.stringify(data.notes));
        
        const syncTime = data.lastSynced ? new Date(data.lastSynced).toLocaleString() : new Date().toLocaleString();
        setLastSynced(syncTime);
        localStorage.setItem(syncTimeKey, syncTime);
        
        // Optional: reload or trigger a state refresh in other components
      } else {
        throw new Error('Backup data is empty or invalid.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  const [profile, setProfile] = useState({
    name: user?.name || 'User',
    email: user?.email || 'user@example.com'
  });

  const [appearance, setAppearance] = useState({ theme: 'dark', fontSize: 'medium' });
  const [prefs, setPrefs] = useState({ view: 'grid', autoSave: true, sortBy: 'date', markdown: true });
  const [notifs, setNotifs] = useState({ all: true, reminders: true, email: false });
  const [security, setSecurity] = useState({ passwordLock: false, biometric: false, autoLock: '5' });

  const handleSaveAll = () => {
  };

  const handleReset = () => {
    setAppearance({ theme: 'dark', fontSize: 'medium' });
    setPrefs({ view: 'grid', autoSave: true, sortBy: 'date', markdown: true });
    setNotifs({ all: true, reminders: true, email: false });
    setSecurity({ passwordLock: false, biometric: false, autoLock: '5' });
  };

  const TABS = [
    { id: 'Account', icon: User },
    { id: 'Appearance', icon: Palette },
    { id: 'Preferences', icon: Sliders },
    { id: 'Notifications', icon: Bell },
    { id: 'Security', icon: Lock },
    { id: 'Storage', icon: Database },
    { id: 'About', icon: Info },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Account':
        return (
          <SectionCard title="Account Settings" description="Manage your profile information and account security." icon={User}>
            <SettingRow label="Profile Name" description="Your display name">
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full sm:w-64 bg-surface/50 border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </SettingRow>

            <SettingRow label="Email Address" description="Used for login and recovery">
              <span className="w-full sm:w-auto text-sm font-medium text-on-surface-variant bg-surface-container-high/50 px-4 py-2.5 rounded-xl break-all">
                {profile.email}
              </span>
            </SettingRow>

            <SettingRow label="Password" description={hasPassword ? "Ensure your account is using a long, random password" : "Create a password to login with your email"}>
              <Button variant="secondary" onClick={() => setIsPasswordModalOpen(true)}>
                {hasPassword ? 'Change' : 'Setup'}
              </Button>
            </SettingRow>
            
            <PasswordModal 
              isOpen={isPasswordModalOpen} 
              onClose={() => setIsPasswordModalOpen(false)} 
              hasPassword={hasPassword} 
            />

          </SectionCard>
        );

      case 'Appearance':
        return (
          <SectionCard title="Appearance" description="Customize how Keep in Mind looks on your device." icon={Palette}>
            <SettingRow label="Theme" description="Select your preferred color scheme">
              <Select
                value={theme}
                onChange={(v) => { setTheme(v); }}
                options={[
                  { label: 'System Theme', value: 'system' },
                  { label: 'Light Mode', value: 'light' },
                  { label: 'Dark Mode', value: 'dark' },
                  { label: 'AMOLED Mode', value: 'amoled' }
                ]}
              />
            </SettingRow>

            <SettingRow label="Font Size" description="Adjust the UI text size">
              <Select
                value={appearance.fontSize}
                onChange={(v) => setAppearance({ ...appearance, fontSize: v })}
                options={[
                  { label: 'Small', value: 'small' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Large', value: 'large' }
                ]}
              />
            </SettingRow>
          </SectionCard>
        );

      case 'Preferences':
        return (
          <SectionCard title="Notes Preferences" description="Configure your default note-taking experience." icon={Sliders}>
            <SettingRow label="Default View">
              <Select
                value={prefs.view}
                onChange={(v) => setPrefs({ ...prefs, view: v })}
                options={[
                  { label: 'Grid', value: 'grid' },
                  { label: 'List', value: 'list' }
                ]}
              />
            </SettingRow>

            <SettingRow label="Sort Order">
              <Select
                value={prefs.sortBy}
                onChange={(v) => setPrefs({ ...prefs, sortBy: v })}
                options={[
                  { label: 'Last Edited', value: 'date' },
                  { label: 'Title (A-Z)', value: 'title' }
                ]}
              />
            </SettingRow>

            <SettingRow label="Auto-Save">
              <Toggle checked={prefs.autoSave} onChange={(v) => setPrefs({ ...prefs, autoSave: v })} />
            </SettingRow>

            <SettingRow label="Markdown Support">
              <Toggle checked={prefs.markdown} onChange={(v) => setPrefs({ ...prefs, markdown: v })} />
            </SettingRow>
          </SectionCard>
        );

      case 'Notifications':
        return (
          <SectionCard title="Notifications" icon={Bell}>
            <SettingRow label="Enable Notifications">
              <Toggle checked={notifs.all} onChange={(v) => setNotifs({ ...notifs, all: v })} />
            </SettingRow>

            <SettingRow label="Reminder Alerts">
              <Toggle checked={notifs.reminders} onChange={(v) => setNotifs({ ...notifs, reminders: v })} />
            </SettingRow>

            <SettingRow label="Email Notifications">
              <Toggle checked={notifs.email} onChange={(v) => setNotifs({ ...notifs, email: v })} />
            </SettingRow>
          </SectionCard>
        );

      case 'Security':
        return (
          <SectionCard title="Privacy & Security" icon={Lock}>
            <SettingRow label="Password Lock">
              <Toggle checked={security.passwordLock} onChange={(v) => setSecurity({ ...security, passwordLock: v })} />
            </SettingRow>

            <SettingRow label="Biometric Lock">
              <Toggle checked={security.biometric} onChange={(v) => setSecurity({ ...security, biometric: v })} />
            </SettingRow>

            <SettingRow label="Auto-lock Timer">
              <Select
                value={security.autoLock}
                onChange={(v) => setSecurity({ ...security, autoLock: v })}
                options={[
                  { label: '1 minute', value: '1' },
                  { label: '5 minutes', value: '5' },
                  { label: '10 minutes', value: '10' }
                ]}
              />
            </SettingRow>
          </SectionCard>
        );

      case 'Storage':
        return (
          <SectionCard title="Storage & Data" icon={Database}>
            <SettingRow label="Enable Auto-Sync" description="Automatically back up notes to Drive after every change">
              <Toggle checked={autoSync} onChange={handleToggleAutoSync} />
            </SettingRow>

            <SettingRow 
              label="Sync to Google Drive" 
              description={lastSynced ? `Last synced: ${lastSynced}` : "Back up your notes to your personal workspace"}
            >
              <Button 
                onClick={handleDriveSync} 
                icon={isSyncing ? RefreshCw : Cloud} 
                disabled={isSyncing || isFetching}
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </SettingRow>

            <SettingRow 
              label="Restore from Drive" 
              description="Download your last backup from Google Drive"
            >
              <Button 
                variant="secondary"
                onClick={handleDriveRestore} 
                icon={isFetching ? RefreshCw : Download} 
                disabled={isSyncing || isFetching}
              >
                {isFetching ? 'Restoring...' : 'Restore Now'}
              </Button>
            </SettingRow>

            <SettingRow label="Export Notes">
              <Button onClick={() => {}}>Export</Button>
            </SettingRow>

            <SettingRow label="Import Notes">
              <Button onClick={() => {}}>Import</Button>
            </SettingRow>

            <SettingRow label="Clear All Notes">
              <Button variant="danger" onClick={() => {}}>
                Clear Data
              </Button>
            </SettingRow>
          </SectionCard>
        );

      case 'About':
        return (
          <SectionCard title="About" icon={Info}>
            <div className="text-center py-6">
              <h2 className="text-2xl font-bold">Keep in Mind</h2>
              <p className="text-sm">Version 2.4.0</p>
            </div>
          </SectionCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col py-6 sm:py-10 space-y-6 sm:space-y-8 min-h-full pb-24">
      <div className="shrink-0">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-heading font-extrabold text-on-surface tracking-tight">Settings</h1>
        <p className="text-sm sm:text-base text-on-surface-variant mt-2 max-w-2xl">Manage your workspace preferences, security settings, and personal account information.</p>
      </div>

      {/* Mobile/Tablet: horizontal scrollable tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:hidden shrink-0">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all min-h-[44px] shrink-0 border",
                activeTab === tab.id
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                  : "bg-surface-container/30 text-on-surface-variant border-white/5 hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <Icon size={16} />
              {tab.id}
            </button>
          );
        })}
      </div>

      {/* Desktop: sidebar + content */}
      <div className="flex gap-6">
        <div className="hidden md:block w-52 lg:w-60 shrink-0">
          <div className="space-y-1.5 sticky top-24">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-2xl text-sm font-bold transition-all min-h-[48px] group",
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-xl shadow-primary/20"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  )}
                >
                  <Icon size={18} className={cn(activeTab === tab.id ? "text-white" : "text-primary/60 group-hover:text-primary transition-colors")} />
                  {tab.id}
                </button>
              );
            })}
            
            <div className="pt-6 mt-6 border-t border-white/5">
              <button
                onClick={() => { signOut(); }}
                className="flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-2xl text-sm font-bold text-error hover:bg-error/10 transition-all min-h-[48px]"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}