import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Pencil, Check, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => Promise<void>;
  currentName: string;
}

export default function RenameModal({ isOpen, onClose, onRename, currentName }: RenameModalProps) {
  const [newName, setNewName] = useState(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      // Small timeout to ensure the modal animation has started
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName === currentName) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await onRename(newName.trim());
      onClose();
    } catch (err) {
      console.error('Rename error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white dark:bg-surface-container-high rounded-3xl overflow-hidden border border-on-surface/5 shadow-2xl transition-colors"
          >
            {/* Header */}
            <div className="p-6 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <Pencil size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-extrabold text-on-surface">Rename File</h3>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Cloud Storage</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-on-surface/5 rounded-full text-on-surface-variant hover:text-on-surface transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 pt-3">
              <div className="mb-6">
                <label className="block text-[10px] font-bold text-on-surface-variant mb-2 px-1 uppercase tracking-widest">
                  New File Name
                </label>
                <div className="relative group">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter new name..."
                    className="w-full bg-on-surface/[0.03] border border-on-surface/5 rounded-xl px-4 py-3 text-on-surface font-medium focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-base"
                  />
                  {!isSubmitting && newName !== currentName && (
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              </div>

              {/* Actions */}
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
                  disabled={isSubmitting || !newName.trim() || newName === currentName}
                  className="flex-[2] py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Update Name</span>
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
