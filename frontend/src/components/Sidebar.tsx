import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Compass, Clock, Image as ImageIcon, Users, Activity, Settings, User, X, LogOut, ChevronRight, Power, PanelLeft, Folder, LayoutList, Lock, Trash2, Cloud, Headset } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ isCollapsed, isMobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      signOut();
      onMobileClose?.();
      navigate('/auth');
    }, 1200);
  };

  const folderLinks = [
    { path: '/notes', label: 'All', icon: Folder, count: 3 },
    { path: '/documents', label: 'Uncategorized', icon: LayoutList, count: 3 },
    { path: '/gallery', label: 'Locked', icon: Lock, count: 0 },
    { path: '/archive', label: 'Recently Deleted', icon: Trash2, count: 0 },
  ];

  const moreLinks = [
    { path: '/labels', label: 'Notes Widgets', hasDot: true },
    { path: '/cloud-sync', label: 'Local Backups', hasDot: false },
  ];

  const renderGroup = (items: any[]) => (
    <div className="bg-white dark:bg-[#2A2D35] rounded-[24px] overflow-hidden shadow-sm">
      {items.map((item, idx) => {
        const active = location.pathname.startsWith(item.path);
        const Icon = item.icon;
        return (
          <div key={item.path} className="relative">
            <Link
              to={item.path}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-4 px-5 py-[10px] transition-all hover:bg-neutral-50 dark:hover:bg-[#32363F] group",
                active ? "bg-neutral-50 dark:bg-[#32363F]" : ""
              )}
            >
              {Icon && <div className={cn("w-6 h-6 flex items-center justify-center shrink-0", active ? "text-primary" : "text-neutral-500 dark:text-neutral-400")}><Icon size={20} strokeWidth={2.5} /></div>}
              <span className={cn("flex-1 text-[15px] font-semibold tracking-tight", active ? "text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-200")}>{item.label}</span>
              <div className="flex items-center gap-2 text-neutral-400">
                {item.count !== undefined && <span className="text-xs font-semibold">{item.count}</span>}
                {item.hasDot && <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" />}
                <ChevronRight size={16} strokeWidth={3} className="text-neutral-300 dark:text-neutral-600" />
              </div>
            </Link>
            {idx < items.length - 1 && <div className="absolute bottom-0 left-[52px] right-0 h-px bg-neutral-100 dark:bg-white/5" />}
          </div>
        );
      })}
    </div>
  );

  const DrawerContent = () => (
    <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] dark:bg-[#1C1D21] w-full rounded-r-[32px] overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <button onClick={onMobileClose} className="p-2 -ml-2 text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
          <PanelLeft size={24} strokeWidth={2} className="rotate-180" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6">
        {/* Folders Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">Folders</h3>
            <button className="text-[13px] font-medium text-blue-500 hover:text-blue-600">New</button>
          </div>
          {renderGroup(folderLinks)}
        </div>

        {/* More Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">More</h3>
          </div>
          {renderGroup(moreLinks)}
        </div>
      </div>

      {/* Bottom Action Row */}
      <div className="px-6 pb-8 pt-4">
        <div className="flex items-center justify-between px-4">
          <button className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-[#2A2D35] flex items-center justify-center text-neutral-600 dark:text-neutral-300 shadow-sm group-hover:bg-neutral-50 transition-colors">
              <Users size={20} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Fan Group</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 group relative">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-[#2A2D35] flex items-center justify-center text-neutral-600 dark:text-neutral-300 shadow-sm group-hover:bg-neutral-50 transition-colors">
              <Headset size={20} strokeWidth={2} />
            </div>
            <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-[#F3F4F6] dark:border-[#1C1D21]" />
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">User Feedback</span>
          </button>

          <button onClick={() => { onMobileClose?.(); navigate('/settings'); }} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-[#2A2D35] flex items-center justify-center text-neutral-600 dark:text-neutral-300 shadow-sm group-hover:bg-neutral-50 transition-colors">
              <Settings size={20} strokeWidth={2} />
            </div>
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* --- Desktop Sidebar (md+) --- */}
      <aside className={cn(
        "hidden md:flex flex-col h-full z-20 transition-all duration-300 ease-in-out shrink-0 bg-transparent py-4 pl-4 pr-2",
        isCollapsed ? "w-[100px]" : "w-[300px]"
      )}>
        <DrawerContent />
      </aside>

      {/* --- Mobile Drawer (< md) --- */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-[60] w-[320px] max-w-[85vw] flex flex-col overflow-hidden transition-transform duration-300 ease-in-out md:hidden",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <DrawerContent />
      </div>

      {/* Full Screen Logout Animation */}
      <AnimatePresence>
        {isLoggingOut && (
          <motion.div
            initial={{ opacity: 0, rotateX: -90, z: -1000 }}
            animate={{ opacity: 1, rotateX: 0, z: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center flex-col"
            style={{ perspective: 1000 }}
          >
            <motion.div
              animate={{ rotateY: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="text-error mb-4"
            >
              <Power size={80} />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white text-3xl font-black tracking-widest uppercase"
            >
              Logging out...
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
