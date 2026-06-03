import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Trash2, CheckCircle2, ListTodo, ChevronDown, Calendar, MoreVertical, Circle, Clock, FileText, Briefcase, BookOpen, Dumbbell, Smile, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../components/Sidebar';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface TaskType {
  id?: number | string;
  _id?: string;
  text: string;
  completed: boolean;
  category?: string;
  priority?: string;
}

type FilterTab = 'All' | 'To Do' | 'Completed' | 'Past Task';

export default function Tasks() {
  const { user, token } = useAuth();
  const storageKey = user ? `keep-in-mind-tasks-${user._id}` : 'keep-in-mind-tasks-guest';

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'To Do') return !t.completed;
    if (activeTab === 'Completed') return t.completed;
    if (activeTab === 'Past Task') return t.completed; // Placeholder logic for Past Tasks
    return true;
  });

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
    // Optimistic update for instant UI feedback
    setTasks(prevTasks => prevTasks.map(t => ((t._id || t.id) === id ? { ...t, completed: !currentCompleted } : t)));

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
        if (!res.ok) {
          // Revert on failure
          setTasks(prevTasks => prevTasks.map(t => ((t._id || t.id) === id ? { ...t, completed: currentCompleted } : t)));
        }
      } catch (error) {
        console.error('Error toggling task:', error);
        // Revert on failure
        setTasks(prevTasks => prevTasks.map(t => ((t._id || t.id) === id ? { ...t, completed: currentCompleted } : t)));
      }
    }
  };

  const deleteTask = async (id: string | number) => {
    const taskToDelete = tasks.find(t => (t._id || t.id) === id);
    
    // Optimistic delete
    setTasks(prevTasks => prevTasks.filter(t => (t._id || t.id) !== id));

    if (token) {
      try {
        const res = await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok && taskToDelete) {
          // Revert on failure
          setTasks(prevTasks => [...prevTasks, taskToDelete]);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        if (taskToDelete) setTasks(prevTasks => [...prevTasks, taskToDelete]);
      }
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

      {/* FILTER TABS */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 mb-6 px-1">
        {(['All', 'To Do', 'Completed', 'Past Task'] as FilterTab[]).map(tab => (
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

      {/* TASKS LIST */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="py-12 text-center text-on-surface-variant">Loading tasks...</div>
        ) : (
          <AnimatePresence>
            {filteredTasks.map(task => {
              const taskId = task._id || task.id;
              if (!taskId) return null;
              
              const categoryMap: Record<string, any> = {
                'Design': { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50 border-indigo-100' },
                'Work': { icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100' },
                'Personal': { icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-100' },
                'Health': { icon: Dumbbell, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100' },
                'Mindfulness': { icon: Smile, color: 'text-green-500', bg: 'bg-green-50 border-green-100' },
                'Other': { icon: MoreHorizontal, color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' },
              };
              const catData = categoryMap[task.category || 'Other'] || { icon: ListTodo, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' };
              const Icon = catData.icon;


              return (
                <motion.div
                  key={taskId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-surface rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between gap-3 group hover:shadow-md transition-all"
                >
                  {/* Checkbox */}
                  <button 
                    onClick={() => toggleTask(taskId, task.completed)}
                    className="w-6 h-6 flex items-center justify-center shrink-0 text-outline-variant hover:text-primary transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={24} className="fill-primary text-on-primary" />
                    ) : (
                      <Circle size={24} strokeWidth={2} />
                    )}
                  </button>

                  {/* Icon & Details */}
                  <div 
                    className="flex items-center gap-4 flex-1 overflow-hidden pr-2 cursor-pointer"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${catData.bg} dark:bg-opacity-10 dark:border-gray-700`}>
                      <Icon size={20} className={catData.color} />
                    </div>
                    
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <h4 className={cn(
                        "text-[15px] font-bold leading-tight line-clamp-4",
                        task.completed ? "text-on-surface-variant line-through opacity-70" : "text-on-surface"
                      )}>
                        {task.text}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md tracking-wider bg-surface-container text-on-surface-variant uppercase">
                          {task.category || 'General'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(taskId);
                      }}
                      className="w-8 h-8 flex items-center justify-center text-outline hover:text-error hover:bg-error/10 rounded-full transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-outline hover:bg-surface-container rounded-full transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!loading && filteredTasks.length === 0 && (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4 text-outline">
              <CheckCircle2 size={30} />
            </div>
            <h4 className="text-lg font-bold text-on-surface mb-1">
              {activeTab === 'Completed' ? 'No completed tasks' : activeTab === 'To Do' ? 'All caught up!' : 'No tasks yet'}
            </h4>
            <p className="text-xs text-on-surface-variant">
              {activeTab === 'Completed' ? 'Check off some tasks to see them here.' : 'Add a new task to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedTask(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-surface dark:bg-[#1e1e1e] rounded-3xl p-6 shadow-xl border border-outline-variant/20 z-10 overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-start mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-bold rounded-lg bg-primary/10 text-primary uppercase tracking-wider">
                    {selectedTask.category || 'General'}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-outline-variant/20 transition-colors text-outline"
                >
                  ✕
                </button>
              </div>
              
              <div className="overflow-y-auto custom-scrollbar flex-1 -mx-2 px-2">
                <h3 className="text-xl font-bold text-on-surface mb-6 leading-relaxed whitespace-pre-wrap">
                  {selectedTask.text}
                </h3>
                
                {selectedTask.notes && (
                  <div className="bg-surface-container/50 rounded-2xl p-4 border border-outline-variant/10">
                    <h4 className="text-sm font-bold text-on-surface-variant mb-2 flex items-center gap-2">
                      <FileText size={16} /> Notes
                    </h4>
                    <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">
                      {selectedTask.notes}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
