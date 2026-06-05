import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Folder, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface MoveDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  currentCategory: string;
  onMoveSuccess: (documentId: string, newCategory: string) => void;
}

export default function MoveDocumentModal({ isOpen, onClose, documentId, currentCategory, onMoveSuccess }: MoveDocumentModalProps) {
  const { token } = useAuth();
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      fetchFolders();
      setSelectedCategory(null);
    }
  }, [isOpen, token]);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/folders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFolders(data);
      }
    } catch (err) {
      console.error('Failed to fetch folders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async () => {
    if (!selectedCategory || selectedCategory === currentCategory) return;
    
    setIsMoving(true);
    try {
      const res = await fetch(`${API_BASE}/documents/${documentId}/move`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newCategory: selectedCategory })
      });
      if (res.ok) {
        onMoveSuccess(documentId, selectedCategory);
        onClose();
      } else {
        throw new Error('Failed to move document');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to move document');
    } finally {
      setIsMoving(false);
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Folder size={20} className="text-amber-500" />
                Move to Folder
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X size={20} className="text-neutral-500" />
              </button>
            </div>
            
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-amber-500" /></div>
              ) : (
                <div className="space-y-2">
                  {folders.map(folder => (
                    <button
                      key={folder._id}
                      onClick={() => setSelectedCategory(folder.name)}
                      disabled={folder.name === currentCategory}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${folder.name === currentCategory ? 'opacity-50 cursor-not-allowed bg-neutral-50 dark:bg-neutral-800/50' : selectedCategory === folder.name ? 'bg-amber-50 dark:bg-amber-500/10 ring-2 ring-amber-500' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${folder.colorClass}`}>
                        <Folder size={16} />
                      </div>
                      <span className="flex-1 text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {folder.name}
                        {folder.name === currentCategory && <span className="ml-2 text-xs text-neutral-500">(Current)</span>}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMove}
                disabled={!selectedCategory || selectedCategory === currentCategory || isMoving}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-200 disabled:dark:bg-neutral-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isMoving ? <Loader2 size={16} className="animate-spin" /> : 'Move'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
