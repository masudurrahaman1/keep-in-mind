import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Briefcase, BookOpen, Dumbbell, 
  Smile, MoreHorizontal, Calendar, Clock, Pencil, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const CATEGORIES = [
  { name: 'Design', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50 border border-indigo-100' },
  { name: 'Work', icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-50 border border-orange-100' },
  { name: 'Personal', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50 border border-purple-100' },
  { name: 'Health', icon: Dumbbell, color: 'text-blue-500', bg: 'bg-blue-50 border border-blue-100' },
  { name: 'Mindfulness', icon: Smile, color: 'text-green-500', bg: 'bg-green-50 border border-green-100' },
  { name: 'Other', icon: MoreHorizontal, color: 'text-gray-500', bg: 'bg-gray-50 border border-gray-200' },
];

export default function AddTask() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [taskText, setTaskText] = useState('');
  const [category, setCategory] = useState('Design');
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!taskText.trim()) return;

    setSaving(true);

    const taskData = { 
      text: taskText.trim(),
      category,
      notes
    };

    if (token) {
      try {
        const res = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(taskData)
        });
        if (res.ok) {
          navigate('/tasks');
        }
      } catch (error) {
        console.error('Error adding task:', error);
      } finally {
        setSaving(false);
      }
    } else {
      // Guest mode
      const storageKey = user ? `keep-in-mind-tasks-${user._id}` : 'keep-in-mind-tasks-guest';
      const saved = localStorage.getItem(storageKey);
      const tasks = saved ? JSON.parse(saved) : [];
      tasks.unshift({
        id: Date.now(),
        text: taskText.trim(),
        completed: false,
        ...taskData
      });
      localStorage.setItem(storageKey, JSON.stringify(tasks));
      navigate('/tasks');
    }
  };

  return (
    <div className="bg-[#F8F9FB] dark:bg-[#121212] min-h-screen text-gray-900 dark:text-gray-100 font-sans pb-28">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-[#F8F9FB] dark:bg-[#121212] sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft size={24} className="text-gray-800 dark:text-gray-200" />
        </button>
        <h1 className="text-[20px] font-bold text-gray-900 dark:text-white">Add Task</h1>
        <div className="w-10"></div>
      </div>

      <div className="px-5 space-y-4 max-w-lg mx-auto">
        
        {/* Task Title */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-5 shadow-sm">
          <label className="block text-[15px] font-bold mb-3 text-gray-800 dark:text-gray-200">Task Title</label>
          <div className="flex items-start gap-3 bg-white dark:bg-[#252525] rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <FileText size={16} className="text-gray-400 mt-0.5 shrink-0" />
            <textarea 
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="e.g., Finish UI Design"
              rows={4}
              className="bg-transparent border-none outline-none flex-1 text-[15px] placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-800 dark:text-white resize-none"
            />
          </div>
        </div>

        {/* Category */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] p-5 shadow-sm">
          <label className="block text-[15px] font-bold mb-4 text-[#10121d] dark:text-gray-200">Category</label>
          <div className="flex items-center overflow-x-auto gap-[18px] pb-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                className="flex flex-col items-center gap-2 min-w-fit snap-start pt-1.5 px-1"
              >
                <div className={`w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all ${category === cat.name ? 'ring-[2px] ring-offset-[2px] ring-indigo-500 dark:ring-offset-[#1e1e1e]' : ''} ${cat.bg} dark:bg-opacity-10 dark:border-gray-700`}>
                  <cat.icon size={18} className={cat.color} strokeWidth={2} />
                </div>
                <span className={`text-[12px] ${category === cat.name ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'font-semibold text-gray-500 dark:text-gray-400'}`}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>


        {/* Due Date & Time */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-2 shadow-sm">
          <label className="block text-[15px] font-bold pt-3 px-3 mb-2 text-gray-800 dark:text-gray-200">Due Date & Time</label>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-t-xl">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-indigo-500" />
                <span className="text-[14px] font-bold text-gray-800 dark:text-gray-200">Date</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
                May 20, 2024 <ChevronRight size={14} className="text-gray-400" />
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-b-xl">
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-indigo-500" />
                <span className="text-[14px] font-bold text-gray-800 dark:text-gray-200">Time</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
                10:00 AM <ChevronRight size={14} className="text-gray-400" />
              </div>
            </button>
          </div>
        </div>


        {/* Notes */}
        <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-5 shadow-sm">
          <label className="block text-[15px] font-bold mb-3 text-gray-800 dark:text-gray-200">Notes <span className="text-gray-400 font-medium text-[13px]">(Optional)</span></label>
          <div className="flex items-center gap-3 bg-white dark:bg-[#252525] rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <Pencil size={16} className="text-gray-400" />
            <input 
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note..."
              className="bg-transparent border-none outline-none flex-1 text-[14px] placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-800 dark:text-white"
            />
          </div>
        </div>


      </div>

      <div className="px-5 pb-8 max-w-lg mx-auto mt-6">
        <button 
          onClick={handleSave}
          disabled={!taskText.trim() || saving}
          className="w-full block py-4 bg-[#6c5dd3] hover:bg-[#5b4eb8] text-white rounded-[20px] font-bold text-[16px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#6c5dd3]/20"
        >
          {saving ? 'Saving...' : 'Save Task'}
        </button>
      </div>

    </div>
  );
}
