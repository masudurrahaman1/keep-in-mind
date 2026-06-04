import { useState, useEffect, useMemo, useRef } from 'react';
import { formatDistanceToNow, parseISO, format, isToday, isYesterday } from 'date-fns';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Plus, CheckSquare, Settings2, MoreHorizontal, MoreVertical, Search, FileText, PenLine, Pin, Tag, Mic, Star, Menu, ChevronDown, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import SpeedDial from '../components/SpeedDial';
import NoteContextMenu from '../components/NoteContextMenu';

const initialNotes = [
  {
    id: 1,
    title: 'Daily Goals',
    content: JSON.stringify([
      { id: 1, text: 'Drink water', checked: true },
      { id: 2, text: '30 mins workout', checked: true },
      { id: 3, text: 'Read 10 pages', checked: false }
    ]),
    color: 'bg-white',
    textColor: 'text-[#FFC107]',
    date: new Date(Date.now() - 3600000).toISOString(),
    type: 'list',
    category: 'Personal',
    pinned: true
  },
  {
    id: 2,
    title: 'Project Ideas',
    content: 'Design a new onboarding flow for KeepInMind app.',
    color: 'bg-white',
    textColor: 'text-[#FFC107]',
    date: new Date(Date.now() - 86400000).toISOString(),
    type: 'text',
    category: 'Work',
    pinned: false
  },
  {
    id: 3,
    title: 'Thoughts',
    content: 'Discipline is the bridge between goals and accomplishment.',
    color: 'bg-white',
    textColor: 'text-[#FFC107]',
    date: new Date(Date.now() - 172800000).toISOString(),
    type: 'text',
    category: 'Ideas',
    pinned: false
  },
  {
    id: 4,
    title: 'Shopping List',
    content: JSON.stringify([
      { id: 1, text: 'Milk, Eggs, Bread', checked: false },
      { id: 2, text: 'Butter, Fruits, Honey', checked: false }
    ]),
    color: 'bg-white',
    textColor: 'text-[#FFC107]',
    date: new Date(Date.now() - 604800000).toISOString(),
    type: 'list',
    category: 'Personal',
    pinned: false
  }
];

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Notes() {
  const { user, token, googleAccessToken } = useAuth();
  const { themeColor } = usePreferences();
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState<{ note: any; x: number; y: number } | null>(null);
  
  const themeMap = {
    yellow: {
      headerBg: 'bg-[#FEF7D6] dark:from-[#2C2415] dark:to-[#42361C]',
      textDark: 'dark:text-amber-100',
      textDarkSub: 'dark:text-amber-200/80',
      glow: 'bg-yellow-300'
    },
    blue: {
      headerBg: 'bg-[#E5F1FF] dark:from-[#112440] dark:to-[#173055]',
      textDark: 'dark:text-blue-100',
      textDarkSub: 'dark:text-blue-200/80',
      glow: 'bg-blue-300'
    },
    green: {
      headerBg: 'bg-[#E6F8ED] dark:from-[#133020] dark:to-[#1A402A]',
      textDark: 'dark:text-emerald-100',
      textDarkSub: 'dark:text-emerald-200/80',
      glow: 'bg-emerald-300'
    },
    purple: {
      headerBg: 'bg-[#F4EBFF] dark:from-[#2D1B42] dark:to-[#3C2458]',
      textDark: 'dark:text-purple-100',
      textDarkSub: 'dark:text-purple-200/80',
      glow: 'bg-purple-300'
    },
    rose: {
      headerBg: 'bg-[#FFE5E9] dark:from-[#40121D] dark:to-[#5A1A2A]',
      textDark: 'dark:text-rose-100',
      textDarkSub: 'dark:text-rose-200/80',
      glow: 'bg-rose-300'
    },
    orange: {
      headerBg: 'bg-[#FFF0D4] dark:from-[#4A2012] dark:to-[#6B2F1A]',
      textDark: 'dark:text-orange-100',
      textDarkSub: 'dark:text-orange-200/80',
      glow: 'bg-orange-300'
    }
  };
  const activeTheme = themeMap[themeColor] || themeMap.yellow;
  
  const storageKey = user ? `keep-in-mind-notes-${user._id}` : 'keep-in-mind-notes-guest';

  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskCount, setTaskCount] = useState(0);
  const [reminderCount, setReminderCount] = useState(0);

  // Load notes
  useEffect(() => {
    const loadNotes = async () => {
      if (token) {
        setLoading(true);
        try {
          const res = await fetch(`${API_BASE}/notes`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setNotes(data);
            // Cache for BackgroundSync/Editor
            localStorage.setItem(storageKey, JSON.stringify(data));
          }
        } catch (error) {
          console.error('Error fetching notes:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Guest mode fallback
        const saved = localStorage.getItem(storageKey);
        setNotes(saved ? JSON.parse(saved) : initialNotes);
      }
    };
    loadNotes();
  }, [token, storageKey]);

  // Fetch Tasks and Reminders counts
  useEffect(() => {
    const fetchCounts = async () => {
      if (token) {
        try {
          const [tasksRes, remRes] = await Promise.all([
            fetch(`${API_BASE}/tasks`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${API_BASE}/reminders`, { headers: { Authorization: `Bearer ${token}` } })
          ]);
          if (tasksRes.ok) {
            const tasks = await tasksRes.json();
            setTaskCount(tasks.length);
          }
          if (remRes.ok) {
            const rems = await remRes.json();
            setReminderCount(rems.length);
          }
        } catch (err) {
          console.error('Error fetching counts:', err);
        }
      } else {
        const savedTasks = localStorage.getItem(`keep-in-mind-tasks-guest`);
        if (savedTasks) setTaskCount(JSON.parse(savedTasks).length);
        const savedReminders = localStorage.getItem(`keep-in-mind-reminders-guest`);
        if (savedReminders) setReminderCount(JSON.parse(savedReminders).length);
      }
    };
    fetchCounts();
  }, [token]);

  // Sync to localStorage only in guest mode or as cache
  useEffect(() => {
    if (!token) {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    }
  }, [notes, token, storageKey]);



  const [filterActive, setFilterActive] = useState('All');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  const filters = ['All', ...(() => {
    const saved = localStorage.getItem('keep-in-mind-labels');
    return saved ? JSON.parse(saved) : ['Personal', 'Work', 'Ideas', 'Urgent'];
  })()];

  // Separate pinned and unpinned notes
  const { pinnedNotes, allNotes } = useMemo(() => {
    const result = notes.filter(note => {
      if (note.archived || note.trashed) return false;
      const matchesSearch = !searchQuery || 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterActive === 'All' || note.category === filterActive;
      return matchesSearch && matchesFilter;
    });

    return {
      pinnedNotes: result.filter(n => n.pinned),
      allNotes: result.filter(n => !n.pinned).sort((a, b) => {
        const timeA = a.date ? new Date(a.date).getTime() : a.id;
        const timeB = b.date ? new Date(b.date).getTime() : b.id;
        return sortOrder === 'recent' ? timeB - timeA : timeA - timeB;
      })
    };
  }, [notes, searchQuery, filterActive, sortOrder]);

  const handleSaveNote = (savedNote: any) => {
    // Legacy support for Editor, not strictly needed as Editor handles saves directly now
    if (savedNote.isNew || !savedNote.id) {
      setNotes([{
        ...savedNote,
        id: Date.now(),
        isNew: false,
        date: new Date().toISOString(),
        type: savedNote.type || 'text'
      }, ...notes]);
    } else {
      setNotes(notes.map(n => n.id === savedNote.id ? savedNote : n));
    }
  };

  const handleDeleteNote = async (noteId: number | string) => {
    if (token) {
      try {
        await fetch(`${API_BASE}/notes/${noteId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ trashed: true, pinned: false })
        });
      } catch (err) { console.error('Error deleting note:', err); }
    }
    setNotes(notes.map(n => (n._id || n.id) === noteId ? { ...n, trashed: true, pinned: false } : n));
    setContextMenu(null);
  };

  const handleDuplicate = async (note: any) => {
    const copy = { ...note, title: `${note.title} (copy)`, date: new Date().toISOString() };
    delete copy._id; // Remove MongoDB ID so it creates a new one
    copy.id = Date.now();
    
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(copy)
        });
        if (res.ok) {
          const newNote = await res.json();
          setNotes(prev => [newNote, ...prev]);
        }
      } catch (err) { console.error('Error duplicating note:', err); }
    } else {
      setNotes(prev => [copy, ...prev]);
    }
    setContextMenu(null);
  };

  const handlePin = async (note: any) => {
    const updated = { ...note, pinned: !note.pinned };
    if (token) {
      try {
        await fetch(`${API_BASE}/notes/${note._id || note.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ pinned: updated.pinned })
        });
      } catch (err) { console.error('Error pinning note:', err); }
    }
    setNotes(prev => prev.map(n => (n._id || n.id) === (note._id || note.id) ? updated : n));
    setContextMenu(null);
  };

  const handleAddLabel = async (note: any, label: string) => {
    const updated = { ...note, category: label };
    if (token) {
      try {
        await fetch(`${API_BASE}/notes/${note._id || note.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ category: label })
        });
      } catch (err) { console.error('Error adding label:', err); }
    }
    setNotes(prev => prev.map(n => (n._id || n.id) === (note._id || note.id) ? updated : n));
  };

  const handleArchive = async (note: any) => {
    const nowArchived = !note.archived;
    if (token) {
      try {
        await fetch(`${API_BASE}/notes/${note._id || note.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ archived: nowArchived })
        });
      } catch (err) { console.error('Error archiving note:', err); }
    }
    setNotes(prev => prev.map(n => (n._id || n.id) === (note._id || note.id) ? { ...n, archived: nowArchived } : n));
    setContextMenu(null);
  };

  const base64ToFile = async (base64Data: string, filename: string) => {
    try {
      const res = await fetch(base64Data);
      const blob = await res.blob();
      return new File([blob], filename, { type: 'image/png' });
    } catch (e) {
      return null;
    }
  };

  const handleShare = async (note: any) => {
    setContextMenu(null);
    const categoryText = note.category ? `[${note.category}] ` : '';
    const shareText = `${categoryText}${note.title}\n\n${note.content || ''}`;
    
    try {
      if (!note.type || note.type === 'text' || note.type === 'list') {
        await navigator.clipboard.writeText(shareText);
      }

      const shareData: any = { title: note.title, text: shareText, url: window.location.href };

      if (note.type === 'drawing' && note.content?.startsWith('data:')) {
        const file = await base64ToFile(note.content, `${note.title || 'drawing'}.png`);
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
          shareData.text = note.title ? `${categoryText}${note.title}` : 'Shared drawing';
        }
      }

      if (navigator.share) {
        await navigator.share(shareData);
      }
    } catch (err) { 
      console.log('Share interaction completed'); 
    }
  };

  const openNoteForEdit = (note: any) => {
    setContextMenu(null);
    const noteId = note._id || note.id;
    if (note.type === 'drawing') navigate(`/drawing/${noteId}`);
    else navigate(`/note/${noteId}`);
  };

  // Icon mapping helper based on note title and category
  const getNote3DIcon = (note: any) => {
    const title = note.title.toLowerCase();
    if (title.includes('shop') || title.includes('grocery') || title.includes('list')) {
      return '/shopping-3d.png';
    }
    if (title.includes('thought') || title.includes('idea')) {
      return '/thoughts-3d.png';
    }
    return '/lightbulb-3d.png';
  };

  const getNoteIconBg = (note: any) => {
    const title = note.title.toLowerCase();
    if (title.includes('shop') || title.includes('grocery') || title.includes('list')) {
      return 'bg-[#FFF0EB] dark:bg-orange-950/20'; // light orange
    }
    if (title.includes('thought') || title.includes('idea')) {
      return 'bg-[#FFF9EA] dark:bg-yellow-950/20'; // light yellow
    }
    return 'bg-[#FFF9EA] dark:bg-yellow-950/20';
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggered = useRef(false);

  const startPress = (e: any, note: any) => {
    isLongPressTriggered.current = false;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const spawnX = rect.left;
    const spawnY = Math.min(rect.bottom + 4, window.innerHeight - 200);
    
    timerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      setContextMenu({ note, x: spawnX, y: spawnY });
      timerRef.current = null;
    }, 500);
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleNoteClick = (e: any, note: any) => {
    if (isLongPressTriggered.current) {
      e.preventDefault();
      isLongPressTriggered.current = false;
      return;
    }
    openNoteForEdit(note);
  };

  const { greeting, imageSrc } = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { greeting: 'Good Morning', imageSrc: '/morning-3d.png' };
    if (hour >= 12 && hour < 17) return { greeting: 'Good Afternoon', imageSrc: '/afternoon-3d.png' };
    if (hour >= 17 && hour < 21) return { greeting: 'Good Evening', imageSrc: '/evening-3d.png' };
    return { greeting: 'Good Night', imageSrc: '/night-3d.png' };
  }, []);

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col min-h-full relative z-10 px-4 pb-28 pt-2">
      
      {/* 1. GREETING BANNER CARD */}
      <div className="w-full relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-yellow-900/40 p-4 sm:p-6 shadow-lg mb-6 sm:mb-8 shrink-0">

        {/* Background Glow */}
        <div className="absolute right-10 top-10 h-32 w-32 sm:h-64 sm:w-64 rounded-full bg-white/30 dark:bg-white/5 blur-3xl"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center relative z-10">
          
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/70 dark:bg-black/20 px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-md text-[10px] sm:text-xs">
              <span className="text-xs sm:text-sm">{greeting.includes('Morning') ? '☀️' : greeting.includes('Night') ? '🌙' : '🌤️'}</span>
              <span className="font-semibold text-purple-600 dark:text-purple-300">
                {greeting.toUpperCase()}
              </span>
            </div>

            <h1 className="mt-3 sm:mt-5 text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Hello there! 👋
            </h1>

            <p className="mt-1.5 sm:mt-3 text-sm sm:text-xl text-slate-500 dark:text-slate-300">
              What are your thoughts today?
            </p>

            {/* Stats */}
            <div className="mt-5 sm:mt-8 flex flex-wrap gap-2 sm:gap-4">
              
              <div className="rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-black/20 px-4 py-2.5 sm:px-6 sm:py-4 backdrop-blur-md flex-1 min-w-[80px]">
                <div className="text-xl sm:text-3xl font-bold text-purple-600 dark:text-purple-300 leading-none mb-0.5 sm:mb-1">{notes.length}</div>
                <div className="text-[10px] sm:text-base font-medium text-gray-600 dark:text-gray-300 uppercase sm:capitalize tracking-wider sm:tracking-normal">Notes</div>
              </div>

              <div className="rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-black/20 px-4 py-2.5 sm:px-6 sm:py-4 backdrop-blur-md flex-1 min-w-[80px]">
                <div className="text-xl sm:text-3xl font-bold text-yellow-500 dark:text-yellow-400 leading-none mb-0.5 sm:mb-1">
                  {taskCount}
                </div>
                <div className="text-[10px] sm:text-base font-medium text-gray-600 dark:text-gray-300 uppercase sm:capitalize tracking-wider sm:tracking-normal">Tasks</div>
              </div>

              <div className="rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-black/20 px-4 py-2.5 sm:px-6 sm:py-4 backdrop-blur-md flex-1 min-w-[80px]">
                <div className="text-xl sm:text-3xl font-bold text-violet-500 dark:text-violet-300 leading-none mb-0.5 sm:mb-1">{reminderCount}</div>
                <div className="text-[10px] sm:text-base font-medium text-gray-600 dark:text-gray-300 uppercase sm:capitalize tracking-wider sm:tracking-normal">Reminders</div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="relative hidden md:flex justify-center">
            <div className="absolute h-80 w-80 rounded-full border border-white/40 dark:border-white/10"></div>

            <img
              src={imageSrc}
              alt="Greeting"
              className="relative z-10 w-64 object-contain"
            />

            <div className="absolute left-10 bottom-24 text-5xl opacity-80">
              ☁️
            </div>

            <div className="absolute right-6 bottom-8 text-5xl opacity-80">
              ☁️
            </div>
          </div>
        </div>
      </div>

      {/* 2. PINNED NOTES SECTION */}
      {pinnedNotes.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 px-1">
            <div className="flex items-center gap-2">
              <Pin size={14} className="text-[#FBBF24]" fill="#FBBF24" />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Pinned Notes</h3>
            </div>
            <button className="text-xs font-medium text-[#FBBF24] hover:text-[#F5B000] transition-colors">
              View all
            </button>
          </div>

          <div className="columns-2 gap-3 sm:columns-3 md:columns-4 w-full">
            {pinnedNotes.map((note) => {
              const isList = note.type === 'list';
              let listItems: any[] = [];
              if (isList && note.content) {
                try {
                  listItems = JSON.parse(note.content);
                } catch {
                  listItems = note.content.split('\n').filter(Boolean).map((t, i) => ({ id: i, text: t.replace(/^-\s*/, ''), checked: false }));
                }
              }
              const isDrawing = note.type === 'drawing';

              return (
                <div
                  key={note._id || note.id}
                  onClick={(e) => handleNoteClick(e, note)}
                  onMouseDown={(e) => startPress(e, note)}
                  onMouseUp={cancelPress}
                  onMouseLeave={cancelPress}
                  onTouchStart={(e) => startPress(e, note)}
                  onTouchEnd={cancelPress}
                  onTouchMove={cancelPress}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!isLongPressTriggered.current) {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setContextMenu({ note, x: rect.left, y: Math.min(rect.bottom + 4, window.innerHeight - 200) });
                      isLongPressTriggered.current = true;
                    }
                  }}
                  className="break-inside-avoid mb-3 inline-block w-full bg-[#FFF9EA] dark:bg-yellow-950/20 rounded-[20px] shadow-sm border border-black/5 dark:border-white/5 hover:shadow-md transition-all duration-300 relative cursor-pointer group overflow-hidden flex flex-col"
                >
                  {isDrawing && note.content && note.content.startsWith('data:image') && (
                    <div className="w-full h-32 bg-gray-100 dark:bg-black/20 shrink-0">
                      <img src={note.content} alt="Drawing" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 leading-snug">
                        {note.title}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePin(note);
                        }}
                        className="p-1 -mt-1 -mr-1 text-[#FFC107] rounded-full transition-colors shrink-0"
                      >
                        <Pin size={16} className="fill-[#FFC107]" />
                      </button>
                    </div>

                    {isList ? (
                      <div className="space-y-1.5 mb-3">
                        {listItems.slice(0, 3).map((item: any) => (
                          <div key={item.id} className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300 font-semibold">
                            <div className={cn(
                              "w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center transition-all",
                              item.checked ? "border-[#FFC107] bg-[#FFC107]" : "border-gray-300 dark:border-white/30"
                            )}>
                              {item.checked && (
                                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </div>
                            <span className={cn("truncate", item.checked && "line-through opacity-50")}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      !isDrawing && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold line-clamp-3 mb-3 whitespace-pre-wrap">
                          {note.content ? note.content.replace(/<[^>]*>?/gm, '') : ''}
                        </p>
                      )
                    )}

                    <div className="mt-auto pt-2 flex flex-col gap-2">
                      {note.category && (
                        <span className="self-start px-2.5 py-1 bg-black/5 dark:bg-white/5 rounded-lg text-[10px] font-bold text-gray-700 dark:text-gray-300">
                          {note.category}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">
                        {(() => {
                          try {
                            const date = parseISO(note.date);
                            if (isNaN(date.getTime())) return note.date;
                            if (isToday(date)) return format(date, 'h:mm a');
                            if (isYesterday(date)) return 'Yesterday';
                            return format(date, 'MMM d, yyyy');
                          } catch { return note.date; }
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ALL NOTES SECTION */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">All Notes</h3>
          </div>
          <button 
            onClick={() => setSortOrder(prev => prev === 'recent' ? 'oldest' : 'recent')}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            {sortOrder === 'recent' ? 'Recent' : 'Oldest'} <ChevronDown size={12} strokeWidth={2.5} className={`transition-transform ${sortOrder === 'oldest' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {allNotes.length > 0 && (
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4 w-full">
            <AnimatePresence>
              {allNotes.map((note) => {
                const isList = note.type === 'list';
                let listItems: any[] = [];
                if (isList && note.content) {
                  try {
                    listItems = JSON.parse(note.content);
                  } catch {
                    listItems = note.content.split('\n').filter(Boolean).map((t, i) => ({ id: i, text: t.replace(/^-\s*/, ''), checked: false }));
                  }
                }
                const isDrawing = note.type === 'drawing';

                return (
                  <motion.div
                    layoutId={`note-${note._id || note.id}`}
                    key={note._id || note.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => handleNoteClick(e, note)}
                    onMouseDown={(e) => startPress(e, note)}
                    onMouseUp={cancelPress}
                    onMouseLeave={cancelPress}
                    onTouchStart={(e) => startPress(e, note)}
                    onTouchEnd={cancelPress}
                    onTouchMove={cancelPress}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (!isLongPressTriggered.current) {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setContextMenu({ note, x: rect.left, y: Math.min(rect.bottom + 4, window.innerHeight - 200) });
                        isLongPressTriggered.current = true;
                      }
                    }}
                    className="break-inside-avoid mb-3 inline-block w-full bg-white dark:bg-[#1A1C20] rounded-[20px] shadow-sm border border-black/5 dark:border-white/5 hover:shadow-md transition-all duration-300 relative cursor-pointer group overflow-hidden flex flex-col"
                  >
                    {isDrawing && note.content && note.content.startsWith('data:image') && (
                      <div className="w-full h-32 bg-gray-100 dark:bg-black/20 shrink-0">
                        <img src={note.content} alt="Drawing" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 leading-snug">
                          {note.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setContextMenu({ note, x: rect.left, y: Math.min(rect.bottom + 4, window.innerHeight - 200) });
                          }}
                          className="p-1 -mt-1 -mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-colors shrink-0"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>

                      {isList ? (
                        <div className="space-y-1.5 mb-3">
                          {listItems.slice(0, 3).map((item: any) => (
                            <div key={item.id} className="flex items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300 font-semibold">
                              <div className={cn(
                                "w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center transition-all",
                                item.checked ? "border-[#FFC107] bg-[#FFC107]" : "border-gray-300 dark:border-white/30"
                              )}>
                                {item.checked && (
                                  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                )}
                              </div>
                              <span className={cn("truncate", item.checked && "line-through opacity-50")}>
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        !isDrawing && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold line-clamp-3 mb-3 whitespace-pre-wrap">
                            {note.content ? note.content.replace(/<[^>]*>?/gm, '') : ''}
                          </p>
                        )
                      )}

                      <div className="mt-auto pt-2 flex flex-col gap-2">
                        {note.category && (
                          <span className="self-start px-2.5 py-1 bg-black/5 dark:bg-white/5 rounded-lg text-[10px] font-bold text-gray-700 dark:text-gray-300">
                            {note.category}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">
                          {(() => {
                            try {
                              const date = parseISO(note.date);
                              if (isNaN(date.getTime())) return note.date;
                              if (isToday(date)) return format(date, 'h:mm a');
                              if (isYesterday(date)) return 'Yesterday';
                              return format(date, 'MMM d, yyyy');
                            } catch { return note.date; }
                          })()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {allNotes.length === 0 && PinnedNotesCount(pinnedNotes) === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center w-full">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-5 text-on-surface-variant">
              <FileText size={30} />
            </div>
            <h4 className="text-xl font-bold text-on-surface mb-2 tracking-tight">It's empty here</h4>
            <p className="text-sm text-on-surface-variant max-w-[260px] leading-relaxed">
              Create your first note by clicking the button below.
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) matching the mockup */}
      <button
        onClick={() => navigate('/editor')}
        className="fixed bottom-24 right-5 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-on-primary flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-all z-40"
        title="Add Note"
      >
        <Plus size={26} strokeWidth={3} />
      </button>

      {/* Note Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <NoteContextMenu
            note={contextMenu.note}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            labels={filters.filter(f => f !== 'All')}
            onClose={() => setContextMenu(null)}
            onEdit={() => openNoteForEdit(contextMenu.note)}
            onDelete={() => handleDeleteNote(contextMenu.note._id || contextMenu.note.id)}
            onDuplicate={() => handleDuplicate(contextMenu.note)}
            onArchive={() => handleArchive(contextMenu.note)}
            onPin={() => handlePin(contextMenu.note)}
            onAddLabel={(label) => handleAddLabel(contextMenu.note, label)}
            onShare={() => handleShare(contextMenu.note)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to count pinned notes safely
function PinnedNotesCount(arr: any[]) {
  return arr.length;
}
