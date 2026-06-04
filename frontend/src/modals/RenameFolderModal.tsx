import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit2, Check, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface RenameFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: any;
  onRename: (folderId: string, newName: string) => Promise<void>;
}

export default function RenameFolderModal({ isOpen, onClose, folder, onRename }: RenameFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && folder) {
      setFolderName(folder.name);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, folder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim() || !folder || folderName.trim() === folder.name) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await onRename(folder._id, folderName.trim());
      onClose();
    } catch (err) {
      console.error('Rename folder error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white dark:bg-surface-container-high rounded-3xl overflow-hidden border border-on-surface/5 shadow-2xl transition-colors"
          >
            <div className="p-6 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-extrabold text-on-surface">Rename Folder</h3>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Categories</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-on-surface/5 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 pt-3">
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-on-surface-variant mb-2 px-1 uppercase tracking-widest">
                  New Folder Name
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g. Travel Docs"
                  className="w-full bg-on-surface/[0.03] border border-on-surface/5 rounded-xl px-4 py-3 text-on-surface font-medium focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-base"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-on-surface/5 hover:bg-on-surface/10 text-on-surface-variant font-bold text-sm rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !folderName.trim() || folderName.trim() === folder?.name}
                  className="flex-[2] py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
