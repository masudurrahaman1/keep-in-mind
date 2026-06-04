import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FolderPlus, Check, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, colorClass: string) => Promise<void>;
}

const colors = [
  { name: 'Blue', class: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400' },
  { name: 'Emerald', class: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400' },
  { name: 'Purple', class: 'bg-purple-50 text-purple-500 dark:bg-purple-500/10 dark:text-purple-400' },
  { name: 'Orange', class: 'bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400' },
  { name: 'Rose', class: 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400' },
  { name: 'Neutral', class: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400' },
];

export default function CreateFolderModal({ isOpen, onClose, onCreate }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colors[0].class);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setSelectedColor(colors[0].class);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(folderName.trim(), selectedColor);
      onClose();
    } catch (err) {
      console.error('Create folder error:', err);
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
                  <FolderPlus size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-extrabold text-on-surface">New Folder</h3>
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
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-on-surface-variant mb-2 px-1 uppercase tracking-widest">
                  Folder Name
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

              <div className="mb-6">
                <label className="block text-[10px] font-bold text-on-surface-variant mb-2 px-1 uppercase tracking-widest">
                  Color Theme
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.class)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c.class ? 'border-primary scale-110' : 'border-transparent hover:scale-105'} ${c.class.split(' ')[0]}`}
                    />
                  ))}
                </div>
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
                  disabled={isSubmitting || !folderName.trim()}
                  className="flex-[2] py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Create</span>
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
