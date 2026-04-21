import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Clock, CheckSquare, Search, FileText, MoreHorizontal, Pin, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NoteModal from '../modals/NoteModal';
import { cn } from '../components/Sidebar';
import NoteContextMenu from '../components/NoteContextMenu';
import { useAuth } from '../context/AuthContext';

const initialNotes = [
  {
    id: 1,
    title: 'Grocery List',
    content: '- Milk\n- Bread\n- Eggs\n- Avocados',
    color: 'bg-primary/10 border-primary/20 hover:border-primary/50 text-on-surface',
    textColor: 'text-primary',
    date: '2 hours ago',
    type: 'list'
  },
  {
    id: 5,
    title: 'Quick thought: AI Assistants',
    content: 'We should probably integrate an assistant directly in the note interface.',
    color: 'bg-error/10 border-error/20 hover:border-error/50 text-on-surface',
    textColor: 'text-error',
    date: '5 hours ago',
    type: 'text'
  },
  {
    id: 2,
    title: 'Project Ideas',
    content: '1. AI powered note taking app\n2. Real-time collaboration\n3. Markdown support out of the box.',
    color: 'bg-tertiary/10 border-tertiary/20 hover:border-tertiary/50 text-on-surface',
    textColor: 'text-tertiary',
    date: 'Yesterday',
    type: 'text'
  }
];

export default function Recent() {
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


  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col h-full relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-secondary to-primary/80 flex items-center justify-center text-white shadow-lg shadow-secondary/30 transition-transform hover:scale-105">
            <Clock size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-on-surface tracking-tight">
            Recently <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary/80">Opened</span>
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
                  <Clock size={12} strokeWidth={2.5} /> {note.date}
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
            <div className="w-24 h-24 glass-panel rounded-full flex items-center justify-center mb-8 shadow-lg shadow-primary/5">
              {searchQuery ? <Search size={40} className="text-secondary/50" /> : <Clock size={40} className="text-secondary/50" />}
            </div>
            <h2 className="text-3xl font-heading font-bold text-on-surface mb-4">
              {searchQuery ? "No results found" : "No recent notes"}
            </h2>
            <p className="max-w-md mx-auto text-base text-on-surface-variant mb-10 leading-relaxed">
              {searchQuery 
                ? `We couldn't find any recent notes matching "${searchQuery}".`
                : "You haven't opened any notes recently. They'll show up here automatically."}
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
