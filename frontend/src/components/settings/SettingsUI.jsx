import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, Save, RefreshCw } from 'lucide-react';
import { cn } from '../Sidebar';

// Reusable Section Card
export function SectionCard({ title, description, children, icon: Icon }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 sm:p-5 lg:p-6 rounded-[1.5rem] sm:rounded-[2rem] mb-4 sm:mb-6"
    >
      <div className="flex items-center gap-4 mb-6 relative">
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <Icon size={24} />
          </div>
        )}
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-on-surface">{title}</h2>
          {description && <p className="text-on-surface-variant text-xs sm:text-sm mt-1">{description}</p>}
        </div>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </motion.div>
  );
}

// Reusable Setting Row
export function SettingRow({ label, description, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="flex-1">
        <h3 className="font-semibold text-on-surface text-base">{label}</h3>
        {description && <p className="text-on-surface-variant text-sm pr-4 mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0 flex items-center">
        {children}
      </div>
    </div>
  );
}

// Toggle Switch
export function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        checked ? "bg-primary shadow-lg shadow-primary/30" : "bg-surface-container-highest"
      )}
      onClick={() => onChange(!checked)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-7" : "translate-x-0"
        )}
      />
    </button>
  );
}

// Select Dropdown
export function Select({ value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full sm:w-48">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-surface/50 border border-outline-variant/30 rounded-xl px-4 py-2 text-sm font-medium text-on-surface shadow-sm hover:bg-surface-container-high/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <span className="truncate">{options.find(o => o.value === value)?.label || 'Select'}</span>
        <ChevronDown size={18} className="text-on-surface-variant" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute z-20 mt-2 w-full glass-panel rounded-xl shadow-xl overflow-hidden py-1 border border-white/10"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-primary/10 transition-colors"
                >
                  <span className={cn(value === option.value ? "text-primary font-bold" : "text-on-surface")}>
                    {option.label}
                  </span>
                  {value === option.value && <Check size={16} className="text-primary" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Toast Notification
export function Toast({ message, visible, onClose }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-on-surface text-surface px-6 py-3.5 rounded-full shadow-2xl"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-semibold text-sm tracking-wide">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Action Button
export function Button({ variant = 'primary', icon: Icon, children, onClick }) {
  const baseClasses = "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 text-sm";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20",
    secondary: "bg-surface-container hover:bg-surface-container-high text-on-surface",
    danger: "bg-error/10 text-error hover:bg-error hover:text-white border border-error/20",
  };

  return (
    <button onClick={onClick} className={cn(baseClasses, variants[variant], "w-full sm:w-auto overflow-hidden text-ellipsis whitespace-nowrap")}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
}
