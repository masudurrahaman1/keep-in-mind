import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Activity, Search, Target, CheckSquare, MoreHorizontal, Pin, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NoteModal from '../modals/NoteModal';
import { cn } from '../components/Sidebar';
import NoteContextMenu from '../components/NoteContextMenu';
import { useAuth } from '../context/AuthContext';

const initialNotes = [
  {
    id: 11,
    title: 'Weekly Workout Plan',
    content: '- Monday: Chest & Triceps\n- Wednesday: Back & Biceps\n- Friday: Legs & Core',
    color: 'bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/50 text-on-surface',
    textColor: 'text-cyan-500',
    date: 'Oct 12',
    type: 'list'
  },
  {
    id: 12,
    title: 'Protein Intake Goals',
    content: 'Need to hit at least 150g daily. Chicken, Greek yogurt, and whey shakes.',
    color: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50 text-on-surface',
    textColor: 'text-blue-500',
    date: 'Oct 10',
    type: 'text'
  }
];

export default function Archive() {
  const { user } = useAuth();
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  
  const storageKey = user ? `keep-in-mind-notes-${user._id}` : 'keep-in-mind-notes-guest';

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : initialNotes;
  });
  const [contextMenu, setContextMenu] = useState<{ note: any; x: number; y: number } | null>(null);
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  // Persist changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  }, [notes, storageKey]);

  const filteredNotes = useMemo(() => {
    const result = notes.filter(note => {
      // Show ONLY archived notes here
      if (!note.archived) return false;
      
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query);
    });
    return result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.id - a.id;
    });
  }, [notes, searchQuery]);

  const handleSaveNote = (savedNote: any) => {
    if (savedNote.isNew) {
      setNotes([{
        ...savedNote,
        id: Date.now(),
        isNew: false,
        date: 'Just now',
        type: 'text'
      }, ...notes]);
    } else {
      setNotes(notes.map(n => n.id === savedNote.id ? savedNote : n));
    }
  };

  const handleDeleteNote = (noteId: number) => {
    setNotes(notes.filter(n => n.id !== noteId));
    setSelectedNote(null);
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
    const cat = note.category ? `[${note.category}] ` : '';
    const shareText = `${cat}${note.title}\n\n${note.content || ''}`;
    try {
      if (navigator.clipboard && (!note.type || note.type !== 'drawing')) {
        await navigator.clipboard.writeText(shareText);
      }

      const shareData: any = { title: note.title, text: shareText, url: window.location.href };

      if (note.type === 'drawing' && note.content?.startsWith('data:')) {
        const file = await base64ToFile(note.content, `${note.title || 'drawing'}.png`);
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
          shareData.text = note.title ? `${cat}${note.title}` : 'Shared drawing';
        }
      }

      if (navigator.share) {
        await navigator.share(shareData);
      }
    } catch (err) { console.log('Share complete'); }
  };

  const handleHide = (note: any) => {
    setNotes(prev => prev.filter(n => n.id !== note.id));
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col h-full relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 transition-transform hover:scale-105">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-on-surface tracking-tight">
            Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Space</span>
          </h1>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-max">
        <AnimatePresence>
          {filteredNotes.map((note) => (
            <motion.div
              layoutId={`note-${note.id}`}
              key={note.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => setSelectedNote(note)}
              className={cn(
                "group cursor-pointer rounded-[2rem] p-6 border backdrop-blur-xl transition-all relative break-inside-avoid shadow-sm overflow-hidden",
                note.color
              )}
            >
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="font-heading font-bold text-xl leading-snug line-clamp-2 pr-8 text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                  {note.pinned && <Pin size={16} className="text-primary fill-primary" />}
                  {note.title}
                </h3>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setContextMenu({ note, x: rect.left, y: rect.bottom + 4 });
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-on-surface/10 rounded-full transition-all absolute -top-1 -right-1 text-on-surface-variant group-hover:text-on-surface"
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>
              <p className="text-sm text-on-surface-variant/90 line-clamp-5 whitespace-pre-wrap leading-relaxed relative z-10 font-medium">
                {note.content}
              </p>
              
              <div className="mt-6 flex items-center justify-between opacity-60 text-on-surface-variant relative z-10">
                <span className="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                  <Target size={12} strokeWidth={2.5} /> {note.date}
                </span>
                <div className="flex items-center gap-3">
                  {note.category && (
                    <div className="flex items-center gap-1 text-[10px] bg-on-surface/5 px-2 py-0.5 rounded-full border border-on-surface/5 font-bold uppercase tracking-tight opacity-60">
                      <Tag size={10} /> {note.category}
                    </div>
                  )}
                  <div className={cn("flex items-center gap-2", note.textColor)}>
                    {note.type === 'list' && <CheckSquare size={16} strokeWidth={2.5} />}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredNotes.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="col-span-full py-24 flex flex-col items-center justify-center text-center px-4"
          >
            <div className="w-24 h-24 glass-panel rounded-full flex items-center justify-center mb-8 shadow-lg shadow-cyan-500/5">
              {searchQuery ? <Search size={40} className="text-cyan-500/50" /> : <Activity size={40} className="text-cyan-500/50" />}
            </div>
            <h2 className="text-3xl font-heading font-bold text-on-surface mb-4">
              {searchQuery ? "No results found" : "No health notes"}
            </h2>
            <p className="max-w-md mx-auto text-base text-on-surface-variant mb-10 leading-relaxed">
              Capture your well-being, diets, and routines here safely.
            </p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {contextMenu && (
          <NoteContextMenu
            note={contextMenu.note}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            labels={['Personal', 'Work', 'Ideas', 'Urgent']}
            onClose={() => setContextMenu(null)}
            onEdit={() => { setSelectedNote(contextMenu.note); setContextMenu(null); }}
            onDelete={() => handleDeleteNote(contextMenu.note.id)}
            onDuplicate={() => {
              const copy = { ...contextMenu.note, id: Date.now(), title: `${contextMenu.note.title} (copy)`, date: 'Just now' };
              setNotes(prev => [copy, ...prev]);
              setContextMenu(null);
            }}
            onArchive={() => {
              const nowArchived = !contextMenu.note.archived;
              setNotes(prev => prev.map(n => n.id === contextMenu.note.id ? { ...n, archived: nowArchived } : n));
              setContextMenu(null);
            }}
            onPin={() => {
              const nowPinned = !contextMenu.note.pinned;
              setNotes(prev => prev.map(n => n.id === contextMenu.note.id ? { ...n, pinned: nowPinned } : n));
              setContextMenu(null);
            }}
            onAddLabel={(label) => {
              setNotes(prev => prev.map(n => n.id === contextMenu.note.id ? { ...n, category: label } : n));
              setContextMenu(null);
            }}
            onShare={() => handleShare(contextMenu.note)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
