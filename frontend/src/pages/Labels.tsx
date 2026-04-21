import { useState, useEffect } from 'react';
import { Users, Plus, Tag, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../components/Sidebar';

export default function Labels() {
  const [labels, setLabels] = useState<string[]>(() => {
    const saved = localStorage.getItem('keep-in-mind-labels');
    return saved ? JSON.parse(saved) : ['Personal', 'Work', 'Ideas', 'Urgent'];
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => {
    localStorage.setItem('keep-in-mind-labels', JSON.stringify(labels));
  }, [labels]);

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
      setIsAdding(false);
    }
  };

  const deleteLabel = (labelToDelete: string) => {
    setLabels(labels.filter(l => l !== labelToDelete));
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-2 md:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-heading font-extrabold text-on-surface tracking-tight">
          My <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Labels</span>
        </h1>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Add Label</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel p-6 rounded-[2rem] mb-8 flex flex-col sm:flex-row gap-4 items-center"
          >
            <div className="relative flex-1 w-full">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={20} />
              <input 
                autoFocus
                type="text"
                placeholder="Enter label name..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                className="w-full pl-12 pr-4 py-3 bg-surface-container rounded-xl border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-on-surface"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setIsAdding(false)}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold hover:bg-surface-container transition-colors text-on-surface-variant"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddLabel}
                disabled={!newLabel.trim()}
                className="flex-1 sm:flex-none px-6 py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Check size={20} strokeWidth={3} />
                Create
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {labels.map((label) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={label}
            className="glass-panel p-5 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Tag size={20} />
              </div>
              <span className="font-bold text-on-surface">{label}</span>
            </div>
            <button 
              onClick={() => deleteLabel(label)}
              className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        ))}

        {labels.length === 0 && !isAdding && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center px-4">
            <div className="w-24 h-24 bg-surface-container-high/50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner border border-white/5">
              <Users size={48} className="text-primary opacity-40" />
            </div>
            <h2 className="text-3xl font-heading font-extrabold text-on-surface mb-3 tracking-tight">No labels found</h2>
            <p className="max-w-xs text-center text-on-surface-variant mb-10 leading-relaxed font-medium">
              You haven't created any labels yet. Create one to start organizing your notes.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAdding(true)}
              className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all"
            >
              Create Your First Label
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
