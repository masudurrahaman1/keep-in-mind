import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Share, MoreHorizontal, Trash2, CheckSquare, Camera, Edit } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Node, mergeAttributes } from '@tiptap/core';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { format } from 'date-fns';

import { cn } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Audio = Node.create({
  name: 'audio',
  group: 'block',
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
      class: { default: 'w-full my-4 rounded-xl bg-surface-container' },
    };
  },

  parseHTML() {
    return [{ tag: 'audio' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['audio', mergeAttributes(HTMLAttributes)];
  },
});

export default function ViewNote() {
  const { id: currentId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const storageKey = user ? `keep-in-mind-notes-${user._id}` : 'keep-in-mind-notes-guest';

  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [colorValue, setColorValue] = useState('bg-surface');

  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Audio,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none max-w-none text-on-surface/90 min-h-[300px] [&_ul[data-type="taskList"]]:list-none [&_ul[data-type="taskList"]]:p-0 [&_li[data-checked="true"]]:line-through [&_li[data-checked="true"]]:opacity-50',
      },
    },
  });

  const API_BASE = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    const loadNote = async () => {
      if (currentId) {
        if (token) {
          try {
            const res = await fetch(`${API_BASE}/notes/${currentId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const existingNote = await res.json();
              setTitle(existingNote.title || '');
              setDate(new Date(existingNote.date || existingNote.updatedAt || Date.now()));
              if (editor) {
                editor.commands.setContent(existingNote.content || '');
              }
              setColorValue(existingNote.color || 'bg-surface');
            } else {
              navigate('/notes');
            }
          } catch (error) {
            console.error('Error fetching note:', error);
            navigate('/notes');
          }
        } else {
          const savedNotes = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const existingNote = savedNotes.find((n: any) => n.id === parseInt(currentId as string) || n.id === currentId);
          if (existingNote) {
            setTitle(existingNote.title || '');
            setDate(new Date(existingNote.date || existingNote.updatedAt || Date.now()));
            if (editor) {
              editor.commands.setContent(existingNote.content || '');
            }
            setColorValue(existingNote.color || 'bg-surface');
          } else {
            navigate('/notes');
          }
        }
      }
    };
    
    if (editor && currentId) {
      loadNote();
    }
  }, [currentId, storageKey, navigate, editor, token, API_BASE]);

  const handleDelete = async () => {
    if (confirm('Move this note to trash?')) {
      if (token && currentId) {
        await fetch(`${API_BASE}/notes/${currentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ inTrash: true, trashedAt: new Date().toISOString() }) // Assuming we move to trash
        });
      } else {
        const savedNotes = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const updatedNotes = savedNotes.map((n: any) => 
          (n.id === parseInt(currentId as string) || n.id === currentId)
            ? { ...n, inTrash: true, trashedAt: new Date().toISOString() }
            : n
        );
        localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
      }
      navigate('/notes');
    }
  };

  return (
    <div className={cn("min-h-[100dvh] pb-24 flex flex-col transition-colors duration-500 ease-in-out relative", colorValue)}>
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 backdrop-blur-xl bg-surface/50 border-b border-on-surface/5">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-primary hover:opacity-80 transition-opacity font-semibold"
        >
          <ChevronLeft size={24} />
          <span>All Notes</span>
        </button>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: title || 'Keep In Mind Note',
                  text: editor?.getText() || '',
                }).catch(() => {});
              }
            }}
            className="p-2 text-primary hover:bg-primary/10 rounded-full transition-all"
          >
            <Share size={22} />
          </button>
          
          <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-all">
            <MoreHorizontal size={22} />
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-6 py-8 md:py-12">
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-on-surface mb-2 leading-tight">
          {title || 'Untitled Note'}
        </h1>
        {date && (
          <p className="text-on-surface/40 text-sm mb-8 font-medium">
            {format(date, "MMMM d, yyyy 'at' h:mm a")}
          </p>
        )}
        
        <div className="flex-1">
          <EditorContent editor={editor} />
        </div>
      </main>

      {/* ── Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-xl border-t border-on-surface/5 py-2 flex items-center justify-between px-6 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <button onClick={handleDelete} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-all">
          <Trash2 size={24} />
        </button>
        <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-all">
          <CheckSquare size={24} />
        </button>
        <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-all">
          <Camera size={24} />
        </button>
        <button 
          onClick={() => navigate(`/editor/${currentId}`)}
          className="p-2 text-primary hover:bg-primary/10 rounded-full transition-all"
        >
          <Edit size={24} />
        </button>
      </div>
    </div>
  );
}
