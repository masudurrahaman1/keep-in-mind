import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { formatDistanceToNow, parseISO, format, isToday, isYesterday } from 'date-fns';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Plus, CheckSquare, Settings2, MoreHorizontal, MoreVertical, Search, FileText, PenLine, Pin, Tag, Mic, Star, Menu, ChevronDown, Lock, Folder, ArrowLeft, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePreferences } from '../context/PreferencesContext';
import { cn } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
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
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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


  // Sync to localStorage only in guest mode or as cache
  useEffect(() => {
    if (!token) {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    }
  }, [notes, token, storageKey]);



  const [filterActive, setFilterActive] = useState('All');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
  const { searchQuery, onUpdateNotes } = useOutletContext<{ searchQuery: string, onUpdateNotes: (notes: any[]) => void }>();
  const { viewMode } = usePreferences();

  const getContainerClass = () => {
    if (viewMode === 'list') return "flex flex-col gap-3 w-full";
    if (viewMode === 'card') return "columns-1 sm:columns-2 gap-3 md:columns-3 w-full";
    // default grid
    return "columns-2 gap-3 sm:columns-3 md:columns-4 w-full";
  };

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
    setNotes(notes.map(n => (n._id || n.id) === noteId ? { ...n, trashed: true, pinned: false } : n));
    setContextMenu(null);
    if (token) {
      try {
        await fetch(`${API_BASE}/notes/${noteId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ trashed: true, pinned: false })
        });
      } catch (err) { console.error('Error deleting note:', err); }
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedNotes);
    setNotes(prev => prev.map(n => ids.includes(n._id || n.id) ? { ...n, trashed: true, pinned: false } : n));
    
    if (token) {
      Promise.all(ids.map(id => 
        fetch(`${API_BASE}/notes/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ trashed: true, pinned: false })
        }).catch(err => console.error(err))
      ));
    }
    
    setSelectedNotes(new Set());
    setIsSelectionMode(false);
    setShowDeleteConfirm(false);
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
    setNotes(prev => prev.map(n => (n._id || n.id) === (note._id || note.id) ? updated : n));
    setContextMenu(null);
    if (token) {
      try {
        await fetch(`${API_BASE}/notes/${note._id || note.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ pinned: updated.pinned })
        });
      } catch (err) { console.error('Error pinning note:', err); }
    }
  };

  const handleAddLabel = async (note: any, label: string) => {
    const updated = { ...note, category: label };
    setNotes(prev => prev.map(n => (n._id || n.id) === (note._id || note.id) ? updated : n));
    if (token) {
      try {
        await fetch(`${API_BASE}/notes/${note._id || note.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ category: label })
        });
      } catch (err) { console.error('Error adding label:', err); }
    }
  };

  const handleArchive = async (note: any) => {
    const nowArchived = !note.archived;
    setNotes(prev => prev.map(n => (n._id || n.id) === (note._id || note.id) ? { ...n, archived: nowArchived } : n));
    setContextMenu(null);
    if (token) {
      try {
        await fetch(`${API_BASE}/notes/${note._id || note.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ archived: nowArchived })
        });
      } catch (err) { console.error('Error archiving note:', err); }
    }
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
    
    timerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      if (!isSelectionMode) {
        setIsSelectionMode(true);
        setSelectedNotes(new Set([note._id || note.id]));
      }
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
    
    if (isSelectionMode) {
      const id = note._id || note.id;
      const newSet = new Set(selectedNotes);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setSelectedNotes(newSet);
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      }
      return;
    }
    
    openNoteForEdit(note);
  };

  const renderNoteCard = (note: any, isPinned: boolean = false) => {
    const isList = note.type === 'list';
    let listItems: any[] = [];
    if (isList && note.content) {
      try {
        listItems = JSON.parse(note.content);
      } catch {
        listItems = note.content.split('\n').filter(Boolean).map((t: any, i: number) => ({ id: i, text: t.replace(/^-\s*/, ''), checked: false }));
      }
    }
    const isDrawing = note.type === 'drawing';
    const hasImage = isDrawing && note.content && note.content.startsWith('data:image');
    
    // Format date
    let formattedDate = note.date;
    try {
      const date = parseISO(note.date);
      if (!isNaN(date.getTime())) {
        if (isToday(date)) formattedDate = format(date, 'h:mm a').toLowerCase();
        else if (isYesterday(date)) formattedDate = 'Yesterday';
        else formattedDate = format(date, 'MMM d, yyyy');
      }
    } catch {}

    const textContent = note.content ? note.content.replace(/<[^>]*>?/gm, '') : '';
    const displayTitle = note.title || textContent.slice(0, 50) || 'New Note';

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
          if (!isLongPressTriggered.current && !isSelectionMode) {
            setIsSelectionMode(true);
            setSelectedNotes(new Set([note._id || note.id]));
            isLongPressTriggered.current = true;
          }
        }}
        className={`break-inside-avoid mb-3 inline-flex w-full ${isPinned ? 'bg-[#FFF9EA] dark:bg-yellow-950/20' : 'bg-white dark:bg-[#1A1C20]'} rounded-[24px] shadow-sm border ${isSelectionMode && selectedNotes.has(note._id || note.id) ? 'border-blue-500' : 'border-black/5 dark:border-white/5'} hover:shadow-md transition-all duration-300 relative cursor-pointer group overflow-hidden flex-row items-center`}
      >
        <div className="flex-1 p-5 flex flex-col justify-start min-w-0">
          <span className="text-[12px] font-semibold text-black dark:text-gray-200 mb-1">
            {formattedDate}
          </span>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-black dark:text-gray-300 mb-3">
            <Folder size={14} strokeWidth={2} />
            <span className="truncate">{note.category || 'Uncategorized'}</span>
          </div>
          <div className="text-base font-bold text-black dark:text-white line-clamp-2 pr-2">
            {displayTitle}
          </div>
        </div>
        
        {hasImage && (
          <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 m-4 ml-0 rounded-[12px] overflow-hidden bg-white dark:bg-black/20">
            <img src={note.content} alt="Drawing" className="w-full h-full object-cover" />
          </div>
        )}

        {isSelectionMode && (
          <div className="pr-4 flex items-center justify-center shrink-0">
            <div className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors ${selectedNotes.has(note._id || note.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
              {selectedNotes.has(note._id || note.id) && <Check size={14} className="text-white" strokeWidth={3} />}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col min-h-full relative px-4 pb-28 pt-2">
      
      {/* SELECTION MODE TOP BAR OVERLAY */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 h-[72px] bg-gray-50 dark:bg-[#111318] z-[100] flex items-center justify-between px-4 sm:px-6 border-b border-black/5 dark:border-white/5"
          >
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setIsSelectionMode(false); setSelectedNotes(new Set()); }}
                className="w-11 h-11 rounded-full bg-white dark:bg-[#2C2C2C] shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/5 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
              >
                <ArrowLeft size={22} strokeWidth={1.5} className="text-gray-900 dark:text-gray-100" />
              </button>
              <h2 className="text-[19px] font-bold text-black dark:text-white tracking-tight ml-1">
                {selectedNotes.size} Item{selectedNotes.size !== 1 ? 's' : ''} Selected
              </h2>
            </div>
            
            <button 
              onClick={() => {
                if (selectedNotes.size === allNotes.length + pinnedNotes.length) {
                  setSelectedNotes(new Set());
                  setIsSelectionMode(false);
                } else {
                  const allIds = [...allNotes, ...pinnedNotes].map(n => n._id || n.id);
                  setSelectedNotes(new Set(allIds));
                }
              }}
              className="w-11 h-11 rounded-full bg-white dark:bg-[#2C2C2C] shadow-[0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-none border border-black/5 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
            >
              <div className={`w-[20px] h-[20px] rounded-[6px] border flex items-center justify-center transition-colors ${selectedNotes.size === allNotes.length + pinnedNotes.length && selectedNotes.size > 0 ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-500'}`}>
                {selectedNotes.size === allNotes.length + pinnedNotes.length && selectedNotes.size > 0 && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-4 px-1">
        <h1 className="text-4xl font-black text-black dark:text-white tracking-tight">All</h1>
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

          <div className={getContainerClass()}>
            {pinnedNotes.map((note) => renderNoteCard(note, true))}
          </div>
        </div>
      )}

      {/* 3. ALL NOTES SECTION */}
      <div>
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-xl font-bold text-black dark:text-white">Today</h2>
        </div>

        {allNotes.length > 0 && (
          <div className={getContainerClass()}>
            <AnimatePresence>
              {allNotes.map((note) => renderNoteCard(note, false))}
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
        {!isSelectionMode && contextMenu && (
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

      {/* SELECTION MODE BOTTOM ACTION BAR */}
      <AnimatePresence>
        {isSelectionMode && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 h-[60px] bg-white dark:bg-[#1A1C20] z-[100] flex items-center justify-around px-2 border-t border-gray-100 dark:border-white/5 pb-1"
          >
            <button className="flex flex-col items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors p-1">
              <Pin size={20} strokeWidth={1.5} />
              <span className="text-[10px] font-semibold tracking-wide">Pin</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors p-1">
              <Lock size={20} strokeWidth={1.5} />
              <span className="text-[10px] font-semibold tracking-wide">Lock</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors p-1">
              <Folder size={20} strokeWidth={1.5} />
              <span className="text-[10px] font-semibold tracking-wide">Move</span>
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="flex flex-col items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors p-1"
            >
              <Trash2 size={20} strokeWidth={1.5} />
              <span className="text-[10px] font-semibold tracking-wide">Delete</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center p-4 bg-black/40">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="bg-white dark:bg-[#1A1C20] w-full max-w-[340px] rounded-[32px] p-6 text-center shadow-2xl mb-4 sm:mb-0"
            >
              <h3 className="text-xl font-bold text-black dark:text-white mb-3 tracking-tight">
                Delete Note{selectedNotes.size !== 1 ? 's' : ''}
              </h3>
              <p className="text-[15px] leading-snug text-gray-600 dark:text-gray-400 mb-8 px-2 font-medium">
                {selectedNotes.size === 1 ? 'This file' : 'These files'} will be moved to Recently Deleted and kept there for 30 days.
              </p>
              <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/10 pt-4 px-2">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 text-[17px] font-semibold text-black dark:text-white active:opacity-70 transition-opacity py-1"
                >
                  Cancel
                </button>
                <div className="w-[1px] h-6 bg-gray-200 dark:bg-white/10 mx-2" />
                <button 
                  onClick={handleBulkDelete}
                  className="flex-1 text-[17px] font-semibold text-[#FF3B30] active:opacity-70 transition-opacity py-1"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Helper to count pinned notes safely
function PinnedNotesCount(arr: any[]) {
  return arr.length;
}
