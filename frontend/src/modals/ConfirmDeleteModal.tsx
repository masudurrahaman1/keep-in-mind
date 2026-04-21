import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  isBulk?: boolean;
}

export default function ConfirmDeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  isBulk = false 
}: ConfirmDeleteModalProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Deletion error:', err);
    } finally {
      setIsDeleting(false);
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
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-[340px] bg-white dark:bg-surface-container-high rounded-3xl overflow-hidden border border-on-surface/5 shadow-2xl transition-colors"
          >
            {/* Header / Warning Icon */}
            <div className="pt-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center text-error relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-error/5 rounded-full"
                />
                <Trash2 size={28} className="relative z-10" />
              </div>
              
              <div className="mt-4 px-6 text-center">
                <h3 className="text-xl font-heading font-extrabold text-on-surface leading-tight">
                  {title}
                </h3>
                <p className="mt-2 text-xs text-on-surface-variant font-medium leading-relaxed px-2">
                  {message}
                </p>
              </div>
            </div>

            {/* Warning Box */}
            <div className="mx-6 mt-5 p-3 rounded-xl bg-error/5 border border-error/10 flex items-start gap-3">
              <div className="p-1.5 bg-error/10 rounded-lg text-error shrink-0">
                <AlertTriangle size={14} />
              </div>
              <p className="text-[10px] font-bold text-error uppercase tracking-wider leading-tight">
                This action is permanent and will remove storage from your Google Drive.
              </p>
            </div>

            {/* Actions */}
            <div className="p-6 flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 py-3 bg-on-surface/5 hover:bg-on-surface/10 text-on-surface-variant font-bold text-sm rounded-xl transition-all disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={isDeleting}
                className="flex-[1.8] py-3 bg-error hover:bg-error/90 disabled:bg-error/50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-error/20 transition-all flex items-center justify-center gap-2 group"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Destroying...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>{isBulk ? 'Empty Trash' : 'Delete'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Top Close Button */}
            <button 
              onClick={onClose}
              disabled={isDeleting}
              className="absolute top-3 right-3 p-1.5 hover:bg-on-surface/5 rounded-full text-on-surface-variant hover:text-on-surface transition-all disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
