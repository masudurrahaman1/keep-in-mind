import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Mic, Image as ImageIcon, PenTool, CheckSquare, Type } from 'lucide-react';
import { cn } from './Sidebar';

interface SpeedDialProps {
  onAdd: (type: 'text' | 'list' | 'audio' | 'image' | 'drawing') => void;
}

export default function SpeedDial({ onAdd }: SpeedDialProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'audio',   label: 'Audio',   icon: Mic,         color: 'text-blue-600' },
    { id: 'image',   label: 'Image',   icon: ImageIcon,   color: 'text-blue-600' },
    { id: 'drawing', label: 'Drawing', icon: PenTool,     color: 'text-blue-600' },
    { id: 'list',    label: 'List',    icon: CheckSquare, color: 'text-blue-600' },
    { id: 'text',    label: 'Text',    icon: Type,        color: 'text-blue-600' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Backdrop — High z-index but behind buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
            className="fixed inset-0 bg-on-surface/10 backdrop-blur-md z-[60]"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 flex flex-col items-end z-[70]">
        {/* Menu Options */}
        <div className="flex flex-col gap-3 mb-4 items-end relative">
          <AnimatePresence>
            {isOpen && actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: (actions.length - index - 1) * 0.05 }}
                onClick={() => {
                  onAdd(action.id as any);
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 group relative z-10"
              >
                {/* Label */}
                <span className="bg-white dark:bg-surface-container-highest px-3 py-1 rounded-full shadow-xl text-blue-600 dark:text-blue-400 font-bold text-xs tracking-wide group-hover:scale-105 transition-all">
                  {action.label}
                </span>
                {/* Icon Circle */}
                <div className="w-10 h-10 bg-white dark:bg-surface-container-highest rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all border border-on-surface/5">
                  <action.icon size={20} className={cn(action.color, "dark:text-blue-400")} />
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Main Toggle Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleMenu}
          className={cn(
            "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative z-10",
            isOpen 
              ? "bg-primary text-white rotate-0" 
              : "bg-blue-600 dark:bg-blue-500 text-white"
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
              >
                <X size={28} />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
              >
                <Plus size={28} strokeWidth={2.5} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}
