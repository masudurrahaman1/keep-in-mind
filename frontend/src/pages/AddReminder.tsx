import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Calendar, Clock, 
  RotateCw, Bell, Edit3, ChevronRight,
  Stethoscope, BookOpen, Briefcase, User, MoreHorizontal 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import CustomDatePicker from '../components/CustomDatePicker';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function AddReminder() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [repeat, setRepeat] = useState('Does not repeat');
  const [priority, setPriority] = useState('Normal'); // Kept for backend compatibility
  const [category, setCategory] = useState('Health');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = [
    { name: 'Health', icon: Stethoscope },
    { name: 'Personal', icon: BookOpen },
    { name: 'Work', icon: Briefcase },
    { name: 'Mindfulness', icon: User },
    { name: 'Other', icon: MoreHorizontal }
  ];

  const handleAddReminder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newReminderText.trim() || !newReminderTime) return;

    setSaving(true);

    if (token) {
      try {
        const res = await fetch(`${API_BASE}/reminders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            text: newReminderText.trim(),
            time: new Date(newReminderTime).toISOString(),
            category: category === 'Mindfulness' ? 'Other' : category, // Map for backend compatibility
            priority,
            repeat,
            notes
          })
        });
        if (res.ok) {
          navigate('/reminders');
        }
      } catch (error) {
        console.error('Error adding reminder:', error);
      } finally {
        setSaving(false);
      }
    } else {
      // Guest mode fallback
      const storageKey = user ? `keep-in-mind-reminders-v2-${user._id}` : 'keep-in-mind-reminders-v2-guest';
      const saved = localStorage.getItem(storageKey);
      const reminders = saved ? JSON.parse(saved) : [];
      
      reminders.push({
        id: Date.now(),
        text: newReminderText.trim(),
        time: new Date(newReminderTime).toISOString(),
        category: category === 'Mindfulness' ? 'Other' : category,
        priority,
        repeat,
        completed: false,
        notes
      });
      reminders.sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());
      localStorage.setItem(storageKey, JSON.stringify(reminders));
      navigate('/reminders');
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col min-h-screen bg-background relative z-10">
      
      {/* Header */}
      <div className="flex items-center justify-between py-2 px-4 sticky top-0 z-20 bg-background/80 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-on-surface hover:bg-surface-container rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-[17px] font-bold text-on-surface absolute left-1/2 -translate-x-1/2">
          Add Reminder
        </h1>
        <div className="w-10 h-10" /> {/* Spacer for centering */}
      </div>

      <div className="px-4 pb-28 pt-2 space-y-4">
        
        {/* Title Section */}
        <div className="bg-surface rounded-3xl p-4 shadow-sm border border-outline-variant/20">
          <label className="block text-sm font-bold text-on-surface mb-3 ml-1">Title</label>
          <div className="flex items-center gap-3 bg-surface-container-lowest rounded-2xl p-3.5 border border-outline-variant/30">
            <FileText size={20} className="text-outline shrink-0" />
            <input 
              type="text"
              value={newReminderText}
              onChange={(e) => setNewReminderText(e.target.value)}
              placeholder="e.g., Drink water"
              className="w-full bg-transparent border-none text-base text-on-surface placeholder:text-outline focus:ring-0 p-0 outline-none"
            />
          </div>
        </div>

        {/* Category Section */}
        <div className="bg-surface rounded-3xl p-5 shadow-sm border border-outline-variant/20">
          <label className="block text-sm font-bold text-on-surface mb-4 ml-1">Category</label>
          <div className="flex justify-between items-center gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.name;
              return (
                <div key={cat.name} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setCategory(cat.name)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-primary text-on-primary shadow-md scale-105' 
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <Icon size={24} />
                  </button>
                  <span className={`text-[11px] font-bold ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date & Time Section */}
        <div className="bg-surface rounded-3xl p-2 shadow-sm border border-outline-variant/20 flex flex-col">
          <h3 className="text-sm font-bold text-on-surface px-4 pt-3 pb-1">Date & Time</h3>
          
          <button 
            onClick={() => setShowDatePicker(true)}
            className="flex items-center justify-between p-4 hover:bg-surface-container/50 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-primary" />
              <span className="text-sm font-bold text-on-surface">Date</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-on-surface-variant">
                {newReminderTime ? format(parseISO(newReminderTime), 'MMM d, yyyy') : 'Select date'}
              </span>
              <ChevronRight size={18} className="text-outline" />
            </div>
          </button>
          
          <div className="h-[1px] bg-outline-variant/20 mx-4" />
          
          <button 
            onClick={() => setShowDatePicker(true)}
            className="flex items-center justify-between p-4 hover:bg-surface-container/50 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-primary" />
              <span className="text-sm font-bold text-on-surface">Time</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-on-surface-variant">
                {newReminderTime ? format(parseISO(newReminderTime), 'h:mm a') : 'Select time'}
              </span>
              <ChevronRight size={18} className="text-outline" />
            </div>
          </button>
        </div>

        {/* Repeat Section */}
        <div className="bg-surface rounded-3xl p-2 shadow-sm border border-outline-variant/20 flex flex-col">
          <h3 className="text-sm font-bold text-on-surface px-4 pt-3 pb-1">Repeat</h3>
          <button 
            onClick={() => {
              const options = ['Does not repeat', 'Daily', 'Weekly', 'Monthly'];
              const currentIndex = options.indexOf(repeat);
              setRepeat(options[(currentIndex + 1) % options.length]);
            }}
            className="flex items-center justify-between p-4 hover:bg-surface-container/50 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <RotateCw size={20} className="text-primary" />
              <span className="text-sm font-bold text-on-surface">Repeat</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-on-surface-variant">
                {repeat === 'Does not repeat' ? 'Never' : repeat}
              </span>
              <ChevronRight size={18} className="text-outline" />
            </div>
          </button>
        </div>

        {/* Remind Me Section */}
        <div className="bg-surface rounded-3xl p-2 shadow-sm border border-outline-variant/20 flex flex-col">
          <h3 className="text-sm font-bold text-on-surface px-4 pt-3 pb-1">Remind Me</h3>
          <button className="flex items-center justify-between p-4 hover:bg-surface-container/50 rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-primary" />
              <span className="text-sm font-bold text-on-surface">Remind Me</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-on-surface-variant">
                At time
              </span>
              <ChevronRight size={18} className="text-outline" />
            </div>
          </button>
        </div>

        {/* Notes Section */}
        <div className="bg-surface rounded-3xl p-4 shadow-sm border border-outline-variant/20">
          <label className="block text-sm font-bold text-on-surface mb-3 ml-1">Notes <span className="font-normal text-on-surface-variant">(Optional)</span></label>
          <div className="flex items-start gap-3 bg-surface-container-lowest rounded-2xl p-3.5 border border-outline-variant/30">
            <Edit3 size={20} className="text-outline shrink-0 mt-0.5" />
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="w-full bg-transparent border-none text-base text-on-surface placeholder:text-outline focus:ring-0 p-0 outline-none resize-none"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button 
            onClick={handleAddReminder}
            disabled={!newReminderText.trim() || !newReminderTime || saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-on-primary rounded-[20px] font-bold text-[17px] hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-[0.98]"
          >
            {saving ? 'Saving...' : 'Save Reminder'}
          </button>
        </div>

      </div>

      {showDatePicker && (
        <CustomDatePicker 
          value={newReminderTime} 
          onChange={setNewReminderTime} 
          onClose={() => setShowDatePicker(false)} 
        />
      )}
    </div>
  );
}
