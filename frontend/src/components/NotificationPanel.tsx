import React from 'react';
import { Bell, CheckCircle2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NotificationItem, { Notification } from './NotificationItem';
import { createPortal } from 'react-dom';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onRead: (id: string) => void;
  onReadAll: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  loading?: boolean;
}

export default function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onRead,
  onReadAll,
  onDelete,
  onClearAll,
  loading
}: NotificationPanelProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Global Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-[990] bg-black/40 backdrop-blur-sm sm:hidden"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed right-4 left-4 top-[72px] sm:left-auto sm:right-6 w-auto sm:w-[400px] z-[1000] bg-white dark:bg-surface-container-high border border-on-surface/10 shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[85vh] transition-colors"
          >
            {/* Header */}
            <div className="p-5 border-b border-on-surface/5 flex items-center justify-between bg-on-surface/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-primary/10 text-primary">
                  <Bell size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-on-surface">Notifications</h3>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                    {unreadCount > 0 ? `${unreadCount} unread messages` : 'All caught up!'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-on-surface/5 text-on-surface-variant transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-b border-on-surface/5 flex items-center justify-between bg-on-surface/[0.01]">
                <button
                  onClick={onReadAll}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all uppercase tracking-widest"
                >
                  <CheckCircle2 size={12} />
                  Mark all as read
                </button>
                <button
                  onClick={onClearAll}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold text-on-surface-variant hover:text-error hover:bg-error/5 transition-all uppercase tracking-widest"
                >
                  <Trash2 size={12} />
                  Clear all
                </button>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-[220px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                  <p className="text-xs text-on-surface-variant font-medium animate-pulse">Loading notifications...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onRead={onRead}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-surface-container flex items-center justify-center mb-4 text-on-surface-variant/20">
                    <Bell size={32} />
                  </div>
                  <h4 className="text-base font-bold text-on-surface mb-1">No notifications yet</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed max-w-[200px]">
                    We'll notify you when something important happens!
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-on-surface/5 bg-on-surface/[0.02] text-center">
              <button 
                className="text-[10px] font-black text-primary hover:text-secondary transition-colors uppercase tracking-[0.2em]"
                onClick={onClose}
              >
                Close Panel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
