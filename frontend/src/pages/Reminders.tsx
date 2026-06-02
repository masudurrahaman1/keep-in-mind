import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Bell, Clock, Calendar, Stethoscope, Phone, 
  BookOpen, MoreVertical, RotateCw, ListFilter, 
  Moon, CheckCircle2, Circle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../components/Sidebar';
import { format, isPast, isToday, isTomorrow, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export type ReminderCategory = 'Health' | 'Personal' | 'Education' | 'Work' | 'Other';
export type ReminderPriority = 'Normal' | 'High Priority';
export type ReminderRepeat = 'Does not repeat' | 'Daily' | 'Weekly' | 'Monthly';
export type FilterTab = 'All' | 'Today' | 'Upcoming' | 'Completed';

export interface Reminder {
  id?: number | string;
  _id?: string;
  text: string;
  time: string;
  category: ReminderCategory;
  priority: ReminderPriority;
  repeat: ReminderRepeat;
  completed: boolean;
  snoozedUntil?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getCategoryIcon = (category: ReminderCategory) => {
  switch (category) {
    case 'Health': return <Stethoscope size={24} className="text-blue-500" />;
    case 'Personal': return <BookOpen size={24} className="text-purple-600" />;
    case 'Education': return <BookOpen size={24} className="text-blue-400" />;
    case 'Work': return <Calendar size={24} className="text-indigo-500" />;
    default: return <Phone size={24} className="text-green-600" />; // Default icon for mindfulness/other
  }
};

const getCategoryColor = (category: ReminderCategory) => {
  switch (category) {
    case 'Health': return 'bg-blue-100 dark:bg-blue-900/30';
    case 'Personal': return 'bg-purple-100 dark:bg-purple-900/30';
    case 'Education': return 'bg-blue-50 dark:bg-blue-900/20';
    case 'Work': return 'bg-indigo-100 dark:bg-indigo-900/30';
    default: return 'bg-green-100 dark:bg-green-900/30';
  }
};

const getCategoryTagColor = (category: ReminderCategory) => {
  switch (category) {
    case 'Health': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'Personal': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    case 'Work': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
    default: return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'; // Mindfulness
  }
};

export default function Reminders() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const storageKey = user ? `keep-in-mind-reminders-v2-${user._id}` : 'keep-in-mind-reminders-v2-guest';

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  // Load reminders
  useEffect(() => {
    const loadReminders = async () => {
      if (token) {
        setLoading(true);
        try {
          const res = await fetch(`${API_BASE}/reminders`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setReminders(data);
          }
        } catch (error) {
          console.error('Error fetching reminders:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Guest mode fallback
        const saved = localStorage.getItem(storageKey);
        setReminders(saved ? JSON.parse(saved) : []);
      }
    };

    loadReminders();
  }, [token, storageKey]);

  // Sync to localStorage only in guest mode
  useEffect(() => {
    if (!token) {
      localStorage.setItem(storageKey, JSON.stringify(reminders));
    }
  }, [reminders, token, storageKey]);

  const toggleComplete = async (id: string | number) => {
    const reminder = reminders.find(r => (r._id || r.id) === id);
    if (!reminder) return;

    const currentCompleted = reminder.completed;
    
    // Optimistic update for instant UI feedback
    setReminders(prev => prev.map(r => ((r._id || r.id) === id ? { ...r, completed: !currentCompleted } : r)));

    if (token) {
      try {
        const res = await fetch(`${API_BASE}/reminders/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ completed: !currentCompleted })
        });
        if (!res.ok) {
          // Revert on failure
          setReminders(prev => prev.map(r => ((r._id || r.id) === id ? { ...r, completed: currentCompleted } : r)));
        }
      } catch (error) {
        console.error('Error toggling reminder:', error);
        // Revert on failure
        setReminders(prev => prev.map(r => ((r._id || r.id) === id ? { ...r, completed: currentCompleted } : r)));
      }
    }
  };

  // Filtering
  const filteredReminders = reminders.filter(r => {
    if (activeTab === 'Completed') return r.completed;
    if (activeTab === 'Today') return isToday(parseISO(r.time)) && !r.completed;
    if (activeTab === 'Upcoming') return !isToday(parseISO(r.time)) && !isPast(parseISO(r.time)) && !r.completed;
    return true; // All
  }).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const formatTimeText = (isoString: string) => {
    const date = parseISO(isoString);
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow, ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col min-h-full relative z-10 px-4 pb-28 pt-4">

      {/* Header Text */}
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold text-on-surface mb-2 tracking-tight">Reminders</h1>
        <p className="text-on-surface-variant font-medium text-sm flex items-center gap-1">
          Stay on track, one reminder at a time. <span className="text-primary">💜</span>
        </p>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 mb-6">
        {(['All', 'Today', 'Upcoming', 'Completed'] as FilterTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2 rounded-[20px] text-sm font-semibold transition-all whitespace-nowrap border",
              activeTab === tab 
                ? "bg-primary-container text-primary border-primary/20" 
                : "bg-surface text-on-surface-variant border-outline-variant/30 hover:bg-surface-container"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* REMINDERS LIST */}
      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {filteredReminders.map(reminder => (
            <motion.div
              key={reminder._id || reminder.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between gap-3 group"
            >
              {/* Checkbox */}
              <button 
                onClick={() => toggleComplete(reminder._id || reminder.id!)}
                className="w-6 h-6 flex items-center justify-center shrink-0 text-outline-variant hover:text-primary transition-colors"
              >
                {reminder.completed ? (
                  <CheckCircle2 size={24} className="fill-primary text-on-primary" />
                ) : (
                  <Circle size={24} strokeWidth={2} />
                )}
              </button>

              {/* Icon & Details */}
              <div className="flex items-center gap-4 flex-1">
                <div className={cn("w-14 h-14 rounded-full flex items-center justify-center shrink-0", getCategoryColor(reminder.category))}>
                  {getCategoryIcon(reminder.category)}
                </div>
                
                <div className="flex flex-col gap-1">
                  <h4 className={cn(
                    "text-[15px] font-bold leading-tight",
                    reminder.completed ? "text-on-surface-variant line-through" : "text-on-surface"
                  )}>
                    {reminder.text}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-bold rounded-md tracking-wider",
                      getCategoryTagColor(reminder.category === 'Other' ? 'Work' : reminder.category) // Map 'Other' to a default tag color for visual
                    )}>
                      {reminder.category === 'Other' ? 'Mindfulness' : reminder.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time & Action */}
              <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
                <Clock size={14} className="opacity-50" />
                <span className="min-w-[70px] text-right">{formatTimeText(reminder.time)}</span>
                
                {reminder.completed ? (
                  <CheckCircle2 size={18} className="text-green-500 ml-1" />
                ) : (
                  <Bell size={18} className="text-primary ml-1" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredReminders.length === 0 && (
          <div className="py-12 flex flex-col items-center text-center">
            <p className="text-on-surface-variant">No Reminders yet.</p>
          </div>
        )}
      </div>

      {/* Decorative Bottom Area */}
      <div className="mt-12 mb-8 flex flex-col items-center justify-center text-center">
        <div className="text-5xl mb-4 relative">
          🪴
          <div className="absolute -top-1 -right-2 text-xl">✨</div>
          <div className="absolute top-2 -left-2 text-sm">✨</div>
        </div>
        <h4 className="text-[15px] font-bold text-on-surface mb-1">Small steps every day</h4>
        <p className="text-xs text-on-surface-variant">
          lead to big changes. <span className="text-primary">💜</span>
        </p>
      </div>

    </div>
  );
}
