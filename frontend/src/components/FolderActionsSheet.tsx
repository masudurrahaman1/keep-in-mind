import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FolderOpen, Edit2, Image as ImageIcon, Palette,
  Pin, Lock, Share2, Info, Trash2, X, Check
} from 'lucide-react';
import { ConfirmationDialog } from './ConfirmationDialog';

export interface Folder {
  _id: string;
  name: string;
  iconName?: string;
  colorClass?: string;
  path?: string;
  isPinned?: boolean;
  isLocked?: boolean;
  isShared?: boolean;
}

interface FolderActionsSheetProps {
  folder: Folder | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFolder: (folder: Folder) => void;
  onRename: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
  // Others to be implemented as UI placeholders for now
  onTogglePin?: (folder: Folder) => void;
  onToggleLock?: (folder: Folder) => void;
  onShare?: (folder: Folder) => void;
  onInfo?: (folder: Folder) => void;
}

export const FolderActionsSheet: React.FC<FolderActionsSheetProps> = ({
  folder,
  isOpen,
  onClose,
  onOpenFolder,
  onRename,
  onDelete,
  onTogglePin,
  onToggleLock,
  onShare,
  onInfo
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const nav = document.getElementById('bottom-nav');
    if (isOpen) {
      if (nav) nav.style.display = 'none';
    } else {
      if (nav) nav.style.display = '';
    }
    return () => {
      if (nav) nav.style.display = '';
    };
  }, [isOpen]);

  if (!folder) return null;

  const handleAction = (action: () => void) => {
    action();
    if (action !== handleDeleteClick) {
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(folder);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neutral-900/40 dark:bg-neutral-900/60 backdrop-blur-sm z-[100]"
              onClick={onClose}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[110] bg-white dark:bg-neutral-900 rounded-t-[32px] shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md pt-4 pb-2 px-6 flex flex-col items-center z-10 border-b border-neutral-100 dark:border-neutral-800">
                <div className="w-12 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full mb-4" />
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${folder.colorClass || 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                      <FolderOpen size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-neutral-900 dark:text-white truncate">{folder.name}</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Folder Options</p>
                    </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-1">
                <ActionItem icon={<FolderOpen />} label="Open Folder" onClick={() => handleAction(() => onOpenFolder(folder))} />
                <ActionItem icon={<Edit2 />} label="Rename Folder" onClick={() => handleAction(() => onRename(folder))} />
                {/* Visual placeholders for future functionality */}
                <ActionItem icon={<Pin />} label={folder.isPinned ? "Unpin Folder" : "Pin Folder"} onClick={() => handleAction(() => onTogglePin?.(folder))} />
                <ActionItem icon={<Lock />} label={folder.isLocked ? "Unlock Folder" : "Lock Folder"} onClick={() => handleAction(() => onToggleLock?.(folder))} />
                <ActionItem icon={<Share2 />} label="Share Folder" onClick={() => handleAction(() => onShare?.(folder))} />
                <ActionItem icon={<Info />} label="Folder Information" onClick={() => handleAction(() => onInfo?.(folder))} />
                
                <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-2 mx-4" />
                
                <ActionItem 
                  icon={<Trash2 />} 
                  label="Delete Folder" 
                  onClick={handleDeleteClick} 
                  destructive 
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Folder?"
        message="This will permanently delete the folder and all files inside it from both KeepInMind and Google Drive. This action cannot be undone."
        confirmText="Delete"
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

interface ActionItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

const ActionItem: React.FC<ActionItemProps> = ({ icon, label, onClick, destructive }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all active:scale-95 ${
        destructive 
          ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10' 
          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        destructive
          ? 'bg-red-100 dark:bg-red-500/20'
          : 'bg-neutral-100 dark:bg-neutral-800'
      }`}>
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <span className="font-semibold text-sm sm:text-base">{label}</span>
    </button>
  );
};
