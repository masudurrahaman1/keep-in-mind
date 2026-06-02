import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Trash2, CheckCircle2, ListTodo, ChevronDown, Calendar, MoreVertical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../components/Sidebar';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface TaskType {
  id?: number | string;
  _id?: string;
  text: string;
  completed: boolean;
}

export default function Tasks() {
  const { user, token } = useAuth();
  const storageKey = user ? `keep-in-mind-tasks-${user._id}` : 'keep-in-mind-tasks-guest';

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(false);

  // Load initial tasks
  useEffect(() => {
    const loadTasks = async () => {
      if (token) {
        setLoading(true);
        try {
          const res = await fetch(`${API_BASE}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setTasks(data);
          } else {
            console.error('Failed to fetch tasks from server');
          }
        } catch (error) {
          console.error('Error fetching tasks:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Guest mode fallback
        const saved = localStorage.getItem(storageKey);
        setTasks(
          saved
            ? JSON.parse(saved)
            : [
                { id: 1, text: 'Design the new onboarding flow', completed: true },
                { id: 2, text: 'Review pull requests', completed: false },
                { id: 3, text: 'Update dependencies', completed: false },
              ]
        );
      }
    };

    loadTasks();
  }, [token, storageKey]);

  // Sync to local storage only in guest mode
  useEffect(() => {
    if (!token) {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    }
  }, [tasks, token, storageKey]);

  const toggleTask = async (id: string | number, currentCompleted: boolean) => {
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ completed: !currentCompleted })
        });
        if (res.ok) {
          const updatedTask = await res.json();
          setTasks(tasks.map(t => ((t._id || t.id) === id ? updatedTask : t)));
        }
      } catch (error) {
        console.error('Error toggling task:', error);
      }
    } else {
      // Guest mode
      setTasks(tasks.map(t => ((t.id || t._id) === id ? { ...t, completed: !t.completed } : t)));
    }
  };

  const deleteTask = async (id: string | number) => {
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setTasks(tasks.filter(t => (t._id || t.id) !== id));
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    } else {
      // Guest mode
      setTasks(tasks.filter(t => (t.id || t._id) !== id));
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col min-h-full relative z-10 px-4 pb-32 pt-2">
      {/* HEADER BANNER */}
      <div className="w-full bg-gradient-to-br from-primary/10 to-primary/5 rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden shadow-sm border border-primary/10 shrink-0 flex items-center justify-between">
        <div className="relative z-10 flex flex-col items-start max-w-[60%]">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center mb-2 sm:mb-4 text-xl sm:text-2xl shadow-inner border border-primary/10">
            📝
          </div>
          <h2 className="text-2xl sm:text-[32px] font-black text-on-surface leading-tight mb-1 sm:mb-2">
            Your Tasks
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium mb-3 sm:mb-5">
            {progress === 100 && tasks.length > 0 
              ? "Let's keep going! You're all set. 🚀" 
              : "Stay on top of your daily goals. ✨"}
          </p>
          <div className="bg-surface/80 backdrop-blur-md rounded-full px-3 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 border border-primary/10 shadow-sm">
            <CheckCircle2 size={14} className="text-primary sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-bold text-primary">
              {completedCount} of {tasks.length} completed
            </span>
          </div>
        </div>
        
        {/* Progress Circle */}
        <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 shrink-0 flex flex-col items-center justify-center bg-surface/50 backdrop-blur-md rounded-full shadow-sm border border-white/40 dark:border-white/5 mr-0 sm:mr-2">
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none drop-shadow-md" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} className="fill-none stroke-primary/20" strokeWidth="8" />
            <circle 
              cx="50" cy="50" r={radius} 
              className="fill-none stroke-primary transition-all duration-1000 ease-out drop-shadow-sm" 
              strokeWidth="8" 
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="flex flex-col items-center justify-center text-center z-10">
            <span className="text-xl sm:text-3xl font-black text-on-surface leading-none mb-0.5 sm:mb-1">{progress}%</span>
            <span className="text-[8px] sm:text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Completed</span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-[-20%] bottom-[-20%] w-48 h-48 sm:w-64 sm:h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-[-10%] top-[-10%] w-32 h-32 sm:w-40 sm:h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* LIST HEADER */}
      {tasks.length > 0 && (
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2 text-on-surface font-bold">
            <ListTodo size={20} className="text-primary" />
            <span>All Tasks</span>
          </div>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-surface-container rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <span>Recent</span>
            <ChevronDown size={14} />
          </button>
        </div>
      )}

      {/* TASKS LIST */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="py-12 text-center text-on-surface-variant">Loading tasks...</div>
        ) : (
          <AnimatePresence>
            {tasks.map(task => {
              const taskId = task._id || task.id;
              if (!taskId) return null;

              return (
                <motion.div
                  key={taskId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-surface rounded-[24px] p-4 sm:p-5 shadow-sm border border-outline-variant/20 flex items-center justify-between group select-none touch-none hover:shadow-md transition-all cursor-pointer"
                  onClick={() => toggleTask(taskId, task.completed)}
                >
                  <div className="flex items-center gap-4 flex-1 overflow-hidden pr-4">
                    <button
                      className={cn(
                        'w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 duration-300',
                        task.completed
                          ? 'bg-primary text-on-primary shadow-md shadow-primary/30 scale-105'
                          : 'border-2 border-outline-variant/40 group-hover:border-primary text-transparent scale-100'
                      )}
                    >
                      <Check size={16} strokeWidth={4} />
                    </button>
                    <span
                      className={cn(
                        'text-[15px] font-bold transition-all truncate',
                        task.completed
                          ? 'text-on-surface-variant line-through opacity-60'
                          : 'text-on-surface'
                      )}
                    >
                      {task.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                     <div className="hidden sm:flex px-3 py-1 bg-primary/10 text-primary rounded-full items-center gap-1.5 border border-primary/10">
                       <Calendar size={12} />
                       <span className="text-xs font-bold whitespace-nowrap">May 20</span>
                     </div>
                     
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         deleteTask(taskId);
                       }}
                       className="w-8 h-8 flex items-center justify-center text-outline hover:text-error hover:bg-error/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                     >
                       <Trash2 size={16} />
                     </button>
                     <button className="w-8 h-8 flex items-center justify-center text-outline hover:bg-surface-container rounded-full transition-colors sm:hidden group-hover:hidden">
                       <MoreVertical size={16} />
                     </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!loading && tasks.length === 0 && (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
              <Check size={30} className="text-outline" />
            </div>
            <h4 className="text-lg font-bold text-on-surface mb-1">All done!</h4>
            <p className="text-xs text-on-surface-variant">You have no pending tasks.</p>
          </div>
        )}
      </div>
    </div>
  );
}
