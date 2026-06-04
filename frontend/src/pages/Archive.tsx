import { useState, useEffect, useMemo, useRef } from 'react';
import { formatDistanceToNow, parseISO, format, isToday, isYesterday } from 'date-fns';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FileText, Pin, Star, Archive as ArchiveIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import NoteContextMenu from '../components/NoteContextMenu';

export default function Archive() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState<{ note: any; x: number; y: number } | null>(null);
  
  const storageKey = user ? `keep-in-mind-notes-${user._id}` : 'keep-in-mind-notes-guest';

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  // Persist notes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  }, [notes, storageKey]);

  const filters = ['All', ...(() => {
    const saved = localStorage.getItem('keep-in-mind-labels');
    return saved ? JSON.parse(saved) : ['Personal', 'Work', 'Ideas', 'Urgent'];
  })()];

  // Filter archived notes
  const archivedNotes = useMemo(() => {
    const result = notes.filter((note: any) => {
      if (!note.archived || note.trashed) return false;
      const matchesSearch = !searchQuery || 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
    return result.sort((a: any, b: any) => b.id - a.id);
  }, [notes, searchQuery]);

  const handleDeleteNote = (noteId: number) => {
    setNotes(notes.map((n: any) => n.id === noteId ? { ...n, trashed: true, pinned: false } : n));
    setContextMenu(null);
  };

  const handleDuplicate = (note: any) => {
    const copy = { ...note, id: Date.now(), title: `${note.title} (copy)`, date: new Date().toISOString() };
    setNotes((prev: any[]) => [copy, ...prev]);
    setContextMenu(null);
  };

  const handlePin = (note: any) => {
    const updated = { ...note, pinned: !note.pinned };
    setNotes((prev: any[]) => prev.map(n => n.id === note.id ? updated : n));
    setContextMenu(null);
  };

  const handleAddLabel = (note: any, label: string) => {
    const updated = { ...note, category: label };
    setNotes((prev: any[]) => prev.map(n => n.id === note.id ? updated : n));
  };

  const handleArchive = (note: any) => {
    const nowArchived = !note.archived;
    setNotes((prev: any[]) => prev.map(n => n.id === note.id ? { ...n, archived: nowArchived } : n));
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
    } catch (err) { }
  };

  const openNoteForEdit = (note: any) => {
    setContextMenu(null);
    if (note.type === 'drawing') navigate(`/drawing/${note.id}`);
    else navigate(`/note/${note.id}`);
  };

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
      return 'bg-[#FFF0EB] dark:bg-orange-950/20';
    }
    if (title.includes('thought') || title.includes('idea')) {
      return 'bg-[#FFF9EA] dark:bg-yellow-950/20';
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

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col min-h-full relative z-10 px-4 pb-28 pt-2">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ArchiveIcon className="text-gray-500" /> Archived Notes
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {archivedNotes.map((note: any) => {
            const isList = note.type === 'list';
            let previewText = note.content || '';
            if (isList && note.content) {
              try {
                const parsed = JSON.parse(note.content);
                previewText = parsed.map((p: any) => p.text).join(', ');
              } catch {
                previewText = note.content.replace(/^-\s*/gm, '').replace(/\n/g, ', ');
              }
            }

            return (
              <motion.div
                layoutId={`note-${note.id}`}
                key={note.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                onClick={(e: any) => handleNoteClick(e, note)}
                onMouseDown={(e: any) => startPress(e, note)}
                onMouseUp={cancelPress}
                onMouseLeave={cancelPress}
                onTouchStart={(e: any) => startPress(e, note)}
                onTouchEnd={cancelPress}
                onTouchMove={cancelPress}
                onContextMenu={(e: any) => {
                  e.preventDefault();
                  if (!isLongPressTriggered.current) {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    setContextMenu({ note, x: rect.left, y: Math.min(rect.bottom + 4, window.innerHeight - 200) });
                    isLongPressTriggered.current = true;
                  }
                }}
                className="bg-white dark:bg-[#1A1C20] rounded-[22px] p-4 shadow-sm border border-black/5 dark:border-white/5 hover:shadow-md transition-all duration-300 flex items-center gap-4 cursor-pointer relative group"
              >
                <div className={cn("w-[50px] h-[50px] rounded-[18px] flex items-center justify-center shrink-0 overflow-hidden", getNoteIconBg(note))}>
                  <img src={getNote3DIcon(note)} alt="Icon" className="w-[36px] h-[36px] object-contain mix-blend-multiply dark:mix-blend-normal" />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 truncate pr-4 mb-1">
                    {note.title}
                  </h4>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 line-clamp-2 pr-6">
                    {previewText ? previewText.replace(/<[^>]*>?/gm, '') : ''}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0 justify-center">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight whitespace-nowrap">
                    {(() => {
                      try {
                        const date = parseISO(note.date);
                        if (isNaN(date.getTime())) return note.date;
                        if (isToday(date)) return format(date, 'h:mm a');
                        if (isYesterday(date)) return 'Yesterday';
                        return format(date, 'MMM d');
                      } catch {
                        return note.date;
                      }
                    })()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {archivedNotes.length === 0 && (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <ArchiveIcon size={30} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">No archived notes</h4>
            <p className="text-xs text-gray-500 max-w-[240px] leading-relaxed">
              Notes you archive will appear here.
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {contextMenu && (
          <NoteContextMenu
            note={contextMenu.note}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            labels={filters.filter((f: string) => f !== 'All')}
            onClose={() => setContextMenu(null)}
            onEdit={() => openNoteForEdit(contextMenu.note)}
            onDelete={() => handleDeleteNote(contextMenu.note.id)}
            onDuplicate={() => handleDuplicate(contextMenu.note)}
            onArchive={() => handleArchive(contextMenu.note)}
            onPin={() => handlePin(contextMenu.note)}
            onAddLabel={(label: string) => handleAddLabel(contextMenu.note, label)}
            onShare={() => handleShare(contextMenu.note)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
