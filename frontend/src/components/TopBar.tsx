import { Search, Bell, Settings, User, Menu, X, ArrowLeft, FileText, Plus, PanelLeft, List, LayoutGrid, Rows } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import NotificationPanel from './NotificationPanel';
import { Notification } from './NotificationItem';
import { clsx } from 'clsx';

interface TopBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleSidebar?: () => void;
  onOpenMobileMenu?: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function TopBar({ searchQuery, setSearchQuery, onToggleSidebar, onOpenMobileMenu }: TopBarProps) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const { viewMode, setViewMode } = usePreferences();

  // Define sub-pages that need a back button and specific title
  const PAGE_TITLES: Record<string, string> = {
    '/settings': 'Settings',
    '/account': 'Profile',
    '/drawing': 'Sketch',
    '/gallery': 'Media Gallery',
    '/explore': 'Explore',
    '/labels': 'Labels',
    '/recent': 'Recent',
    '/archive': 'Archive'
  };

  const currentPath = location.pathname;
  const pageTitle = PAGE_TITLES[currentPath] || Object.keys(PAGE_TITLES).find(p => currentPath.startsWith(p) && p !== '/') ? PAGE_TITLES[Object.keys(PAGE_TITLES).find(p => currentPath.startsWith(p) && p !== '/')!] : '';
  const isSettingsOrAccount = currentPath === '/settings' || currentPath === '/account';
  const canGoBack = currentPath === '/settings' || (currentPath.startsWith('/drawing') && currentPath !== '/drawing');

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Fetch Notifications Error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleRead = async (id: string) => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleReadAll = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Hide TopBar entirely on settings pages
  if (currentPath.startsWith('/settings')) {
    return null;
  }

  // Mobile Search Overlay
  if (isMobileSearchOpen) {
    return (
      <header className="h-16 flex items-center gap-3 px-3 glass z-10 sticky top-0">
        <button
          onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(''); }}
          className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-on-surface-variant">
            <Search size={18} />
          </div>
          <input
            type="text"
            autoFocus
            className="block w-full pl-10 pr-3 py-2.5 rounded-full bg-surface-container-high text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
            placeholder="Search notes, labels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X size={18} />
          </button>
        )}
      </header>
    );
  }

  return (
    <header className="h-[72px] flex items-center justify-between px-4 sm:px-4 md:px-6 z-50 sticky top-0 gap-2 pt-3">
      <div className="absolute inset-0 z-[-1] pointer-events-none bg-white/60 dark:bg-[#111318]/60 backdrop-blur-lg [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]" />
      {/* Left: Hamburger (mobile) / Back Button / Logo (Desktop) */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0 w-12 sm:w-48 lg:w-64">
        {canGoBack ? (
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white dark:bg-[#2C2C2C] shadow-sm text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Go Back"
          >
            <ArrowLeft size={22} />
          </button>
        ) : (
          <>
            {/* Mobile hamburger */}
            <button
              onClick={onOpenMobileMenu}
              className="p-2 bg-white dark:bg-[#2C2C2C] shadow-sm rounded-full transition-all md:hidden min-w-[48px] min-h-[48px] flex items-center justify-center text-neutral-800 dark:text-neutral-200"
              title="Open Menu"
            >
              <PanelLeft size={24} strokeWidth={2} />
            </button>
            {/* Desktop sidebar toggle */}
            <button
              onClick={onToggleSidebar}
              className="p-2 text-on-surface hover:bg-surface-container-high rounded-full transition-all hover:rotate-90 hidden md:flex items-center justify-center min-w-[44px] min-h-[44px]"
              title="Toggle Sidebar"
            >
              <Menu size={22} />
            </button>
          </>
        )}

      </div>

      {/* Center: Title (mobile) or Search bar (tablet+) */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        {pageTitle && (currentPath === '/settings' || currentPath.startsWith('/drawing')) ? (
           <span className="md:hidden text-lg font-heading font-bold text-on-surface truncate px-2">{pageTitle}</span>
        ) : (currentPath === '/notes' || currentPath === '/' || currentPath === '/explore' || currentPath === '/recent') ? (
           <div className="flex items-center bg-white dark:bg-[#2C2C2C] rounded-full p-[5px] shadow-sm mx-auto">
             <button className="px-5 py-[6px] rounded-full bg-[#F3F4F6] dark:bg-[#1C1D21] text-blue-600 dark:text-blue-400 font-bold text-[15px] transition-colors shadow-sm">
               Notes
             </button>
             <button className="px-5 py-[6px] rounded-full text-neutral-600 dark:text-neutral-400 font-medium text-[15px] transition-colors hover:bg-neutral-50 dark:hover:bg-[#32363F]">
               Tasks
             </button>
           </div>
        ) : (
           <span className="text-lg font-black tracking-tighter text-[#1A1F2C] dark:text-[#FFFDF5]">
             KeepIn<span className="text-[#FFC107]">Mind</span>
           </span>
        )}

      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-1 sm:gap-2 shrink-0 w-12 sm:w-48 lg:w-64">
        {/* View Toggle Menu */}
        {!canGoBack && (
          <div className="relative">
            <button
              onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
              className="p-2 bg-white dark:bg-[#2C2C2C] shadow-sm rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center text-neutral-800 dark:text-neutral-200"
            >
              <List size={24} strokeWidth={2} />
            </button>
            
            {/* Dropdown Menu */}
            {isViewMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsViewMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#2A2D35] rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-800 py-2 z-50 animate-in fade-in zoom-in duration-200">
                  <button 
                    onClick={() => { setViewMode('list'); setIsViewMenuOpen(false); }}
                    className={clsx(
                      "w-full px-4 py-3 flex items-center gap-3 text-[15px] transition-colors hover:bg-neutral-50 dark:hover:bg-[#32363F]",
                      viewMode === 'list' ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-neutral-700 dark:text-neutral-300 font-medium"
                    )}
                  >
                    <List size={20} strokeWidth={viewMode === 'list' ? 2.5 : 2} />
                    List View
                  </button>
                  <button 
                    onClick={() => { setViewMode('card'); setIsViewMenuOpen(false); }}
                    className={clsx(
                      "w-full px-4 py-3 flex items-center gap-3 text-[15px] transition-colors hover:bg-neutral-50 dark:hover:bg-[#32363F]",
                      viewMode === 'card' ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-neutral-700 dark:text-neutral-300 font-medium"
                    )}
                  >
                    <Rows size={20} strokeWidth={viewMode === 'card' ? 2.5 : 2} />
                    Card View
                  </button>
                  <button 
                    onClick={() => { setViewMode('grid'); setIsViewMenuOpen(false); }}
                    className={clsx(
                      "w-full px-4 py-3 flex items-center gap-3 text-[15px] transition-colors hover:bg-neutral-50 dark:hover:bg-[#32363F]",
                      viewMode === 'grid' ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-neutral-700 dark:text-neutral-300 font-medium"
                    )}
                  >
                    <LayoutGrid size={20} strokeWidth={viewMode === 'grid' ? 2.5 : 2} />
                    Grid View
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Notifications */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className={clsx(
              "p-2 rounded-full transition-all relative group min-w-[40px] min-h-[40px] flex items-center justify-center",
              isNotificationOpen ? "bg-primary/20 text-primary" : "text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            <Bell size={22} className={clsx(unreadCount > 0 && "animate-wiggle")} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full block border-2 border-surface animate-pulse" />
            )}
          </button>
          <NotificationPanel
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            notifications={notifications}
            onRead={handleRead}
            onReadAll={handleReadAll}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
            loading={loading}
          />
        </div>

        {/* Settings (hidden on mobile) */}
        {!isSettingsOrAccount && (
          <button
            onClick={() => navigate('/settings')}
            className="hidden sm:flex p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors min-w-[44px] min-h-[44px] items-center justify-center"
          >
            <Settings size={22} />
          </button>
        )}

        {/* Avatar */}
        <button
          onClick={() => navigate('/account')}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold overflow-hidden border-2 border-surface shadow-sm shrink-0 hover:ring-2 hover:ring-primary/40 transition-all hidden sm:flex"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name ?? 'Profile'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User size={18} />
          )}
        </button>
      </div>
    </header>
  );
}
