import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight,
  Sun, Clock, Moon, Sparkles, Volume2,
  Cloud, ArchiveRestore, Download,
  Bell, Lock, Type, ALargeSmall, Search
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { syncNotesToGoogleDrive, fetchNotesFromGoogleDrive } from '../services/driveService';
import { motion } from 'motion/react';

/* ─── Toggle ─────────────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  const { themeColor } = usePreferences();

  const themeMap = {
    yellow: {
      track: 'bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800',
      thumb: 'linear-gradient(135deg, #FDE047, #F59E0B)',
      shadow: 'rgba(245, 158, 11, 0.4)'
    },
    blue: {
      track: 'bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800',
      thumb: 'linear-gradient(135deg, #60A5FA, #2563EB)',
      shadow: 'rgba(37, 99, 235, 0.4)'
    },
    green: {
      track: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800',
      thumb: 'linear-gradient(135deg, #34D399, #059669)',
      shadow: 'rgba(5, 150, 105, 0.4)'
    },
    purple: {
      track: 'bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800',
      thumb: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
      shadow: 'rgba(124, 58, 237, 0.4)'
    }
  };

  const currentTheme = themeMap[themeColor] || themeMap.yellow;

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-[44px] h-[26px] rounded-full flex items-center p-1 cursor-pointer transition-colors duration-500 ease-in-out overflow-hidden ${
        checked ? currentTheme.track : 'bg-neutral-200 dark:bg-neutral-700 border border-transparent'
      }`}
      style={{
        boxShadow: "inset 0px 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(255,255,255,0.3)"
      }}
    >
      <motion.div
        layout
        initial={false}
        animate={{
          x: checked ? 18 : 0,
        }}
        whileTap={{
          width: 24,
          x: checked ? 10 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
        className="h-[18px] w-[18px] rounded-full shadow-md z-10"
        style={{
          background: checked 
            ? currentTheme.thumb
            : "linear-gradient(135deg, #ffffff, #f0f0f0)",
          boxShadow: checked 
            ? `0 2px 5px ${currentTheme.shadow}, inset 0 -1px 2px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.6)`
            : "0 2px 4px rgba(0,0,0,0.2), inset 0 -1px 2px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.8)"
        }}
      />
    </button>
  );
}

/* ─── Section Label ───────────────────────────────────────────────── */
function SectionLabel({ children }) {
  const { themeColor } = usePreferences();
  const colorMap = { yellow: '#FBC02D', blue: '#007AFF', green: '#34C759', purple: '#AF52DE' };
  return (
    <h2 style={{ color: colorMap[themeColor] || '#FBC02D' }} className="font-semibold text-sm mb-3 ml-1">{children}</h2>
  );
}

/* ─── Card Wrapper ────────────────────────────────────────────────── */
function Card({ children }) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-[20px] px-4 py-1 shadow-sm overflow-hidden">
      {children}
    </div>
  );
}

/* ─── Divider ─────────────────────────────────────────────────────── */
function Divider() {
  return <div className="h-px bg-neutral-100 dark:bg-neutral-700" />;
}

/* ─── Standard Row (chevron right) ──────────────────────────────── */
function LinkRow({ icon: Icon, label, value }) {
  const { themeColor } = usePreferences();
  const colorMap = { yellow: '#FBC02D', blue: '#007AFF', green: '#34C759', purple: '#AF52DE' };
  return (
    <div className="flex items-center justify-between py-4 cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
      <div className="flex items-center gap-4">
        <div style={{ color: colorMap[themeColor] || '#FBC02D' }}>
          <Icon size={22} strokeWidth={2} />
        </div>
        <span className="font-medium text-neutral-900 dark:text-neutral-100 text-[15px]">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500 text-sm">
        {value && <span>{value}</span>}
        <ChevronRight size={16} strokeWidth={2} />
      </div>
    </div>
  );
}

/* ─── Toggle Row ──────────────────────────────────────────────────── */
function ToggleRow({ icon: Icon, label, checked, onChange, darkIcon = false }) {
  const { themeColor } = usePreferences();
  const colorMap = { yellow: '#FBC02D', blue: '#007AFF', green: '#34C759', purple: '#AF52DE' };
  const iconColor = colorMap[themeColor] || '#FBC02D';
  
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div className={darkIcon ? 'text-neutral-500 dark:text-neutral-400' : ''} style={darkIcon ? {} : { color: iconColor }}>
          <Icon size={22} strokeWidth={2} />
        </div>
        <span className="font-medium text-neutral-900 dark:text-neutral-100 text-[15px]">{label}</span>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/* ─── Theme Color dot ─────────────────────────────────────────────── */
function ThemeColorDot({ color }) {
  const colorMap = {
    yellow: '#FBC02D',
    blue: '#007AFF',
    green: '#34C759',
    purple: '#AF52DE',
  };
  return (
    <div className="flex items-center gap-2 text-neutral-400 text-sm">
      <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: colorMap[color] || '#FBC02D' }} />
      <ChevronRight size={16} strokeWidth={2} />
    </div>
  );
}

/* ─── FontAT icon ─────────────────────────────────────────────────── */
function FontATIcon({ size = 22, color = 'currentColor' }) {
  return (
    <span style={{ color, fontWeight: 700, fontSize: size * 0.8, letterSpacing: '-1px', lineHeight: 1 }}>
      AT
    </span>
  );
}

/* ─── TextSize icon ──────────────────────────────────────────────── */
function TextSizeIcon({ color = 'currentColor' }) {
  return (
    <span style={{ color, fontWeight: 600, lineHeight: 1 }}>
      <span style={{ fontSize: 12 }}>a</span>
      <span style={{ fontSize: 18 }}>A</span>
    </span>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, token, googleAccessToken } = useAuth();
  const { 
    themeColor, setThemeColor, 
    fontStyle, setFontStyle, 
    textSize, setTextSize,
    hapticFeedback, setHapticFeedback,
    triggerHaptic 
  } = usePreferences();

  const colorMap = { yellow: '#FBC02D', blue: '#007AFF', green: '#34C759', purple: '#AF52DE' };

  const [darkMode, setDarkMode]         = useState(theme === 'dark');
  const [animations, setAnimations]     = useState(true);
  const [lockPasscode, setLockPasscode] = useState(false);
  const [isSyncing, setIsSyncing]       = useState(false);
  const [isFetching, setIsFetching]     = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const notesKey    = user ? `keep-in-mind-notes-${user._id}` : 'keep-in-mind-notes-guest';
  const syncTimeKey = user ? `keep-in-mind-last-sync-${user._id}` : 'keep-in-mind-last-sync-guest';
  const [lastSynced, setLastSynced] = useState(() => localStorage.getItem(syncTimeKey) || null);

  const handleDarkMode = (val) => {
    setDarkMode(val);
    setTheme(val ? 'dark' : 'light');
    triggerHaptic();
  };

  const cycleFontStyle = () => {
    const fonts = ['inter', 'outfit', 'roboto', 'opensans'];
    setFontStyle(fonts[(fonts.indexOf(fontStyle) + 1) % fonts.length]);
    triggerHaptic();
  };

  const cycleTextSize = () => {
    const sizes = ['small', 'medium', 'large'];
    setTextSize(sizes[(sizes.indexOf(textSize) + 1) % sizes.length]);
    triggerHaptic();
  };

  const handleDriveSync = async () => {
    if (!user || !token || !googleAccessToken) return;
    setIsSyncing(true);
    try {
      const notes = JSON.parse(localStorage.getItem(notesKey) || '[]');
      await syncNotesToGoogleDrive(notes, googleAccessToken, token);
      const now = new Date().toLocaleString();
      setLastSynced(now);
      localStorage.setItem(syncTimeKey, now);
    } catch (err) { console.error(err); }
    finally { setIsSyncing(false); }
  };

  const handleDriveRestore = async () => {
    if (!user || !token || !googleAccessToken) return;
    if (!window.confirm('This will replace all local notes with the Drive backup. Continue?')) return;
    setIsFetching(true);
    try {
      const { fetchNotesFromGoogleDrive } = await import('../services/driveService');
      const data = await fetchNotesFromGoogleDrive(googleAccessToken, token);
      if (data?.notes) {
        localStorage.setItem(notesKey, JSON.stringify(data.notes));
        const t = data.lastSynced ? new Date(data.lastSynced).toLocaleString() : new Date().toLocaleString();
        setLastSynced(t);
        localStorage.setItem(syncTimeKey, t);
      }
    } catch (err) { console.error(err); }
    finally { setIsFetching(false); }
  };

  return (
    <div className="min-h-full bg-white dark:bg-neutral-900 pb-28 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between p-5 sticky top-0 z-10 glass border-b border-outline-variant/20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-neutral-800 shadow-sm border border-outline-variant/20 text-on-surface hover:bg-surface-container active:scale-95 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-on-surface tracking-tight">Settings</h1>
        </div>
        
        {/* Placeholder Search Button - allows for future implementation */}
        <button
          onClick={() => { /* Future feature: search settings */ }}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-neutral-800 shadow-sm border border-outline-variant/20 text-on-surface hover:bg-surface-container active:scale-95 transition-all"
        >
          <Search size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-12 space-y-8">

        {/* ── Preferences ──────────────────────────────────────────── */}
        <section>
          <SectionLabel>Preferences</SectionLabel>

          {/* Group 1: chevron rows */}
          <Card>
            <div onClick={() => navigate('/settings/theme')} className="cursor-pointer">
              <LinkRow icon={Sun} label="Appearance" value={theme.charAt(0).toUpperCase() + theme.slice(1)} />
            </div>
            <Divider />
            <div onClick={() => navigate('/settings/theme-color')} className="flex items-center justify-between py-4 cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-4">
                <div style={{ color: colorMap[themeColor] || '#FBC02D' }}><Clock size={22} strokeWidth={2} /></div>
                <span className="font-medium text-neutral-900 dark:text-neutral-100 text-[15px]">Theme Color</span>
              </div>
              <ThemeColorDot color={themeColor} />
            </div>
            <Divider />
            <div onClick={cycleFontStyle} className="flex items-center justify-between py-4 cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-4">
                <div style={{ color: colorMap[themeColor] || '#FBC02D' }}><FontATIcon /></div>
                <span className="font-medium text-neutral-900 dark:text-neutral-100 text-[15px]">Font Style</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400 text-sm">
                <span className="capitalize">{fontStyle}</span>
                <ChevronRight size={16} strokeWidth={2} />
              </div>
            </div>
            <Divider />
            <div onClick={cycleTextSize} className="flex items-center justify-between py-4 cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-4">
                <div style={{ color: colorMap[themeColor] || '#FBC02D' }}><TextSizeIcon /></div>
                <span className="font-medium text-neutral-900 dark:text-neutral-100 text-[15px]">Text Size</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400 text-sm">
                <span className="capitalize">{textSize}</span>
                <ChevronRight size={16} strokeWidth={2} />
              </div>
            </div>
          </Card>

          {/* Group 2: toggle rows */}
          <div className="mt-4">
            <Card>
              <ToggleRow icon={Moon}     label="Enable Dark Mode"   checked={theme === 'dark'}    onChange={handleDarkMode}   darkIcon />
              <Divider />
              <ToggleRow icon={Sparkles} label="Enable Animations"  checked={animations}  onChange={setAnimations} />
              <Divider />
              <ToggleRow icon={Volume2}  label="Haptic Feedback"    checked={hapticFeedback}      onChange={(v) => { setHapticFeedback(v); triggerHaptic(); }} />
            </Card>
          </div>
        </section>

        {/* ── Data & Sync ───────────────────────────────────────────── */}
        <section>
          <SectionLabel>Data &amp; Sync</SectionLabel>
          <Card>
            <div onClick={() => navigate('/cloud-sync')} className="cursor-pointer">
              <LinkRow icon={Cloud}          label="Cloud Sync"        value={lastSynced ? 'On' : 'Off'} />
            </div>
            <Divider />
            <div onClick={() => navigate('/cloud-sync')} className="cursor-pointer">
              <LinkRow icon={ArchiveRestore} label="Backup & Restore" />
            </div>
            <Divider />
            <LinkRow icon={Download} label="Export Notes" />
          </Card>
        </section>

        {/* ── General ──────────────────────────────────────────────── */}
        <section>
          <SectionLabel>General</SectionLabel>
          <Card>
            <LinkRow icon={Bell} label="Notifications" />
            <Divider />
            <ToggleRow icon={Lock} label="Lock with Passcode" checked={lockPasscode} onChange={setLockPasscode} />
          </Card>
        </section>

      </div>

    </div>
  );
}