import { useState, useEffect, useMemo, useRef } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Grid, List as ListIcon, Filter, 
  Trash2, Archive, Pin, MoreVertical, Star, Clock, 
  Tag, Palette, CheckCircle2, X, Mic, Play, Square, Pause, ChevronDown, 
  FileText, PenLine, MoreHorizontal, Settings2, CheckSquare 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { syncNotesToGoogleDrive } from '../services/driveService';
import SpeedDial from '../components/SpeedDial';
import NoteContextMenu from '../components/NoteContextMenu';

const initialNotes = [
  {
    id: 1,
    title: 'Grocery List',
    content: '- Milk\n- Bread\n- Eggs\n- Avocados',
    color: 'bg-primary/10 border-primary/20 hover:border-primary/50 text-on-surface',
    textColor: 'text-primary',
    date: new Date(Date.now() - 7200000).toISOString(),
    type: 'list',
    category: 'Personal'
  },
  {
    id: 2,
    title: 'Project Ideas',
    content: '1. AI powered note taking app\n2. Real-time collaboration\n3. Markdown support out of the box.',
    color: 'bg-tertiary/10 border-tertiary/20 hover:border-tertiary/50 text-on-surface',
    textColor: 'text-tertiary',
    date: new Date(Date.now() - 86400000).toISOString(),
    type: 'text',
    category: 'Work'
  }
];

export default function Notes() {
  const { user, token, googleAccessToken } = useAuth();
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState<{ note: any; x: number; y: number } | null>(null);
  
  // Voice Recording States
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Storage key is unique to the user if signed in
  const storageKey = user ? `keep-in-mind-notes-${user._id}` : 'keep-in-mind-notes-guest';

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : initialNotes;
  });

  // Auto-Sync to Google Drive
  useEffect(() => {
    const isAutoSyncEnabled = localStorage.getItem('keep-in-mind-auto-sync') === 'true';
    if (!isAutoSyncEnabled || !user || !token || !googleAccessToken) return;

    const syncTimeout = setTimeout(async () => {
      try {
        const syncableNotes = notes;
        if (syncableNotes.length === 0) return;
        console.log('🔄 Auto-syncing to Google Drive...');
        await syncNotesToGoogleDrive(syncableNotes, googleAccessToken, token);
        
        const now = new Date().toLocaleString();
        localStorage.setItem(`keep-in-mind-last-sync-${user._id}`, now);
      } catch (err) {
        console.error('Auto-sync failed:', err);
      }
    }, 3000); // 3-second debounce

    return () => clearTimeout(syncTimeout);
  }, [notes, user, token, googleAccessToken]);

  const [viewMode] = useState<'grid' | 'list'>('grid');
  const [filterActive, setFilterActive] = useState('All');
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => (prev < 300 ? prev + 1 : prev));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSaveNote = (noteData: any) => {
    const savedNotes = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedNotes = [noteData, ...savedNotes];
    localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
    setFilteredNotes(updatedNotes);
  };

  // Persist notes whenever they change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  }, [notes, storageKey]);

  const filters = ['All', ...(() => {
    const saved = localStorage.getItem('keep-in-mind-labels');
    return saved ? JSON.parse(saved) : ['Personal', 'Work', 'Ideas', 'Urgent'];
  })()];

  const filteredNotes = useMemo(() => {
    const result = notes.filter(note => {
      // Exclude archived notes from main view
      if (note.archived) return false;

      const matchesSearch = !searchQuery || 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterActive === 'All' || note.category === filterActive;
      return matchesSearch && matchesFilter;
    });

    return result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.id - a.id;
    });
  }, [notes, searchQuery, filterActive]);
  const handleSaveNote = (savedNote: any) => {
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

  const handleDeleteNote = (noteId: number) => {
    setNotes(notes.filter(n => n.id !== noteId));
    setContextMenu(null);
  };

  const handleDuplicate = (note: any) => {
    const copy = { ...note, id: Date.now(), title: `${note.title} (copy)`, date: new Date().toISOString() };
    setNotes(prev => [copy, ...prev]);
    setContextMenu(null);
  };

  const handlePin = (note: any) => {
    const updated = { ...note, pinned: !note.pinned };
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
    setContextMenu(null);
  };

  const handleAddLabel = (note: any, label: string) => {
    const updated = { ...note, category: label };
    setNotes(prev => prev.map(n => n.id === note.id ? updated : n));
  };

  const handleArchive = (note: any) => {
    const nowArchived = !note.archived;
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, archived: nowArchived } : n));
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
      // 1. Always copy text to clipboard as baseline
      if (!note.type || note.type === 'text' || note.type === 'list') {
        await navigator.clipboard.writeText(shareText);
      }

      // 2. Prepare sharing data
      const shareData: any = { title: note.title, text: shareText, url: window.location.href };

      // 3. Handle Drawing/Image Sharing
      if (note.type === 'drawing' && note.content?.startsWith('data:')) {
        const file = await base64ToFile(note.content, `${note.title || 'drawing'}.png`);
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
          // For drawings, the text content is secondary (it's often just empty or meta)
          shareData.text = note.title ? `${categoryText}${note.title}` : 'Shared drawing';
        }
      }

      // 4. Trigger Native Share
      if (navigator.share) {
        await navigator.share(shareData);
      }
    } catch (err) { 
      console.log('Share interaction completed'); 
    }
  };

  const handleHide = (note: any) => {
    setNotes(prev => prev.filter(n => n.id !== note.id)); // Temporary hide for this session
    setContextMenu(null);
  };

  const openNoteForEdit = (note: any) => {
    setContextMenu(null);
    if (note.type === 'drawing') navigate(`/drawing/${note.id}`);
    else navigate(`/editor/${note.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col h-full relative z-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-on-surface tracking-tight">
          My <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Notes</span>
        </h1>
        
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 backdrop-blur-md bg-on-surface/5 p-1.5 rounded-full border border-on-surface/5 shadow-sm transition-colors shrink-0">
          {filters.map(filter => (
            <motion.button
              whileTap={{ scale: 0.95 }}
              key={filter}
              onClick={() => setFilterActive(filter)}
              className={cn(
                "px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 min-h-[36px]",
                filterActive === filter
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-on-surface hover:bg-surface-container-high/50"
              )}
            >
              {filter}
            </motion.button>
          ))}
          <div className="w-px h-6 bg-outline-variant/30 mx-2 hidden sm:block"></div>
          <button 
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high/50 rounded-full transition-colors ml-1"
            title="Filter options"
          >
            <Settings2 size={20} />
          </button>
        </div>
      </div>

      <div className={cn(
        "grid gap-4 md:gap-6",
        viewMode === 'grid'
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-max"
          : "grid-cols-1 max-w-3xl"
      )}>
        <AnimatePresence>
          {filteredNotes.map((note) => {
            const isDrawing = note.type === 'drawing';
            const isList = note.type === 'list';
            let listItems: any[] = [];
            if (isList && note.content) {
              try {
                const parsed = JSON.parse(note.content);
                if (Array.isArray(parsed)) listItems = parsed;
              } catch {
                // Old plain-text format: "- Milk\n- Bread\n..."
                listItems = note.content.split('\n')
                  .filter((l: string) => l.trim())
                  .map((line: string, i: number) => ({
                    id: i,
                    text: line.replace(/^-\s*/, '').trim(),
                    checked: false,
                  }));
              }
            }

            return (
              <motion.div
                layoutId={`note-${note.id}`}
                key={note.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={() => {
                  if (isDrawing) navigate(`/drawing/${note.id}`);
                  else navigate(`/editor/${note.id}`);
                }}
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
                    className="p-1.5 bg-on-surface/5 hover:bg-on-surface/10 rounded-full transition-all absolute top-0 right-0 text-on-surface-variant hover:text-primary shadow-sm"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                {/* Drawing Thumbnail */}
                {isDrawing && note.content && note.content.startsWith('data:') ? (
                  <img
                    src={note.content}
                    alt="Drawing"
                    className="w-full rounded-xl object-contain max-h-40 bg-white/50"
                  />
                ) : isList ? (
                  /* List Preview */
                  <div className="space-y-1.5 relative z-10">
                    {listItems.slice(0, 4).map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <div className={cn(
                          "w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center",
                          item.checked ? "border-primary bg-primary/20" : "border-on-surface/30"
                        )}>
                          {item.checked && <CheckSquare size={10} className="text-primary" />}
                        </div>
                        <span className={cn("truncate", item.checked && "line-through opacity-50")}>{item.text || '—'}</span>
                      </div>
                    ))}
                    {listItems.length > 4 && (
                      <p className="text-xs text-on-surface-variant/50 pl-6">+{listItems.length - 4} more</p>
                    )}
                  </div>
                ) : (
                  <div className="relative z-10">
                    {note.content?.includes('<audio') && (
                      <div className="flex items-center gap-2 mb-2 p-3 bg-primary/5 rounded-xl border border-primary/10 text-primary">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                          <Mic size={14} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider">Voice Note</span>
                      </div>
                    )}
                    <p className="text-sm text-on-surface-variant/90 line-clamp-5 whitespace-pre-wrap leading-relaxed font-medium">
                      {note.content?.replace(/<[^>]*>/g, '')}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between opacity-60 text-on-surface-variant relative z-10">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    {(() => {
                      try {
                        const date = parseISO(note.date);
                        if (isNaN(date.getTime())) return note.date; // Fallback for old string dates
                        return formatDistanceToNow(date, { addSuffix: true });
                      } catch {
                        return note.date;
                      }
                    })()}
                  </span>
                  <div className="flex items-center gap-3">
                    {note.category && (
                      <div className="flex items-center gap-1 text-[10px] bg-on-surface/5 px-2 py-0.5 rounded-full border border-on-surface/5 font-bold uppercase tracking-tight">
                        <Tag size={10} /> {note.category}
                      </div>
                    )}
                    <div className={cn("flex items-center gap-2", note.textColor)}>
                      {isList && <CheckSquare size={16} strokeWidth={2.5} />}
                      {isDrawing && <PenLine size={16} strokeWidth={2.5} />}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredNotes.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="col-span-full py-12 flex flex-col items-center text-center px-4"
          >
            <div className="w-16 h-16 glass-panel rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/5">
              {searchQuery ? <Search size={32} className="text-primary/50" /> : <FileText size={32} className="text-primary/50" />}
            </div>
            <h2 className="text-2xl font-heading font-bold text-on-surface mb-2">
              {searchQuery ? "No results found" : "It's empty here"}
            </h2>
            <p className="max-w-xs mx-auto text-sm text-on-surface-variant mb-6 leading-relaxed">
              {searchQuery 
                ? `We couldn't find any notes matching "${searchQuery}".`
                : "Capture your ideas, lists, and thoughts by creating your first note."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/editor')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-xl shadow-primary/20 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              <span className="text-base">Create Note</span>
            </motion.button>
          </motion.div>
        )}

      </div>

      {/* Speed Dial FAB */}
      <SpeedDial onAdd={(type) => {
        if (type === 'audio') {
          setShowVoicePanel(true);
          return;
        }
        if (type === 'image') {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (re) => {
                const newNote = {
                  id: Date.now(),
                  title: '',
                  content: `<p><img src="${re.target?.result}" /></p>`,
                  color: 'bg-surface',
                  category: 'Personal',
                  pinned: false,
                  archived: false,
                  date: new Date().toISOString(),
                  type: 'text'
                };
                handleSaveNote(newNote);
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
          return;
        }
        if (type === 'drawing') {
          navigate('/drawing');
        } else {
          navigate('/editor');
        }
      }} />

      {/* ── Voice Panel (Copied from Editor for consistency) ── */}
      <AnimatePresence>
        {showVoicePanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (isRecording) {
                  mediaRecorder.current?.stop();
                  setIsRecording(false);
                }
                setShowVoicePanel(false);
              }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[80]"
            />
            <motion.div
              initial={{ translateY: '100%' }}
              animate={{ translateY: 0 }}
              exit={{ translateY: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[90] bg-surface rounded-t-[2.5rem] shadow-2xl p-8 pb-12 md:max-w-md md:mx-auto border-t border-outline-variant/10 text-center"
            >
              <div className="flex items-center justify-between mb-12">
                <button className="flex items-center gap-1 text-on-surface/40 hover:text-on-surface transition-all font-black uppercase tracking-tighter text-xs">
                  Voice Note <Mic size={14} className="ml-1" />
                </button>
                <button 
                  onClick={() => setShowVoicePanel(false)}
                  className="p-2 hover:bg-on-surface/5 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-black tracking-tighter text-on-surface">
                  {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:
                  {(recordingTime % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-on-surface/20 text-5xl font-black tracking-tighter"> / 05:00</span>
              </div>

              {/* Waveform Animation */}
              <div className="h-24 flex items-center justify-center gap-0.5 mb-12 overflow-hidden px-4">
                {Array.from({ length: 40 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={isRecording ? {
                      height: [10, Math.random() * 60 + 10, 10],
                    } : { height: 10 }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                    className="w-1 bg-primary/20 rounded-full"
                    style={{ 
                      opacity: Math.abs(i - 20) / 20 > 0.5 ? 0.3 : 1,
                      backgroundColor: i === 20 ? '#3b82f6' : 'currentColor'
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-8">
                <button 
                  onClick={async () => {
                    if (!isRecording) {
                      try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        mediaRecorder.current = new MediaRecorder(stream);
                        audioChunks.current = [];
                        
                        mediaRecorder.current.ondataavailable = (e) => {
                          if (e.data.size > 0) audioChunks.current.push(e.data);
                        };
                        
                        mediaRecorder.current.start();
                        setIsRecording(true);
                        setRecordingTime(0);
                      } catch (err) {
                        console.error("Microphone access denied", err);
                        alert("Please allow microphone access to record audio.");
                      }
                    } else {
                      mediaRecorder.current?.pause();
                      setIsRecording(false);
                    }
                  }}
                  className="w-16 h-16 rounded-full bg-on-surface/5 flex items-center justify-center hover:bg-on-surface/10 transition-all text-primary"
                >
                  {isRecording ? <Pause size={24} className="fill-current" /> : <Mic size={24} className="fill-current" />}
                </button>

                <button 
                  onClick={() => {
                    if (!mediaRecorder.current) return;
                    
                    mediaRecorder.current.onstop = () => {
                      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64Audio = reader.result as string;
                        const newNote = {
                          id: Date.now(),
                          title: '',
                          content: `<p><audio controls src="${base64Audio}"></audio></p>`,
                          color: 'bg-surface',
                          category: 'Personal',
                          pinned: false,
                          archived: false,
                          date: new Date().toISOString(),
                          type: 'text'
                        };
                        handleSaveNote(newNote);
                      };
                      reader.readAsDataURL(audioBlob);
                      mediaRecorder.current?.stream.getTracks().forEach(track => track.stop());
                    };
                    
                    mediaRecorder.current.stop();
                    setIsRecording(false);
                    setShowVoicePanel(false);
                    setRecordingTime(0);
                  }}
                  className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-110 active:scale-95 transition-all"
                >
                  <Square size={28} className="fill-current" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Note Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <NoteContextMenu
            note={contextMenu.note}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            labels={filters.filter(f => f !== 'All')}
            onClose={() => setContextMenu(null)}
            onEdit={() => openNoteForEdit(contextMenu.note)}
            onDelete={() => handleDeleteNote(contextMenu.note.id)}
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
