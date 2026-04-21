import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Pencil, Trash2, Tag, Copy, Archive, Pin, PinOff,
  Share2, Palette, Bell, EyeOff
} from 'lucide-react';
import { cn } from './Sidebar';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  color?: string;
  divider?: boolean;
}

interface NoteContextMenuProps {
  note: any;
  position: { x: number; y: number };
  labels: string[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onPin: () => void;
  onAddLabel: (label: string) => void;
  onShare: () => void;
}

export default function NoteContextMenu({
  note, position, labels, onClose,
  onEdit, onDelete, onDuplicate, onArchive, onPin, onAddLabel,
  onShare
}: NoteContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position so the menu never goes off-screen
  const adjustedX = Math.min(position.x, window.innerWidth - 220);
  const adjustedY = Math.min(position.y, window.innerHeight - 340);

  const isPinned = note?.pinned;

  const menuItems: MenuItem[] = [
    { id: 'edit',      label: 'Edit',        icon: Pencil    },
    { id: 'duplicate', label: 'Duplicate',   icon: Copy      },
    { id: 'pin',       label: isPinned ? 'Unpin' : 'Pin to top', icon: isPinned ? PinOff : Pin },
    { id: 'label',     label: 'Add Label',   icon: Tag,      divider: true },
    { id: 'archive',   label: 'Archive',     icon: Archive   },
    { id: 'share',     label: 'Share',       icon: Share2,   divider: true },
    { id: 'delete',    label: 'Delete',      icon: Trash2,   color: 'text-red-500' },
  ];

  const handleAction = (id: string) => {
    switch (id) {
      case 'edit':      onEdit();      break;
      case 'duplicate': onDuplicate(); break;
      case 'pin':       onPin();       break;
      case 'archive':   onArchive();   break;
      case 'share':     onShare();     break;
      default: break;
    }
    if (id === 'delete') { onDelete(); return; }
    if (id !== 'label') onClose();
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.9, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -8 }}
      transition={{ duration: 0.15 }}
      className="fixed z-[200] w-44 bg-surface-container-lowest rounded-xl shadow-2xl border border-on-surface/10 transition-colors"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {menuItems.map((item) => (
        <div key={item.id}>
          {item.divider && <div className="h-px bg-on-surface/8 mx-3 my-1" />}

          {item.id === 'label' ? (
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSubmenu(activeSubmenu === 'label' ? null : 'label');
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-1.5 transition-colors text-left",
                  activeSubmenu === 'label' ? "bg-primary/10 text-primary" : "hover:bg-on-surface/5 text-on-surface"
                )}
              >
                <item.icon size={14} className={activeSubmenu === 'label' ? "text-primary" : "text-on-surface-variant shrink-0"} />
                <span className="text-xs font-semibold">{item.label}</span>
                <span className={cn(
                  "ml-auto text-[10px] transition-transform duration-200",
                  activeSubmenu === 'label' ? "rotate-90 text-primary" : "text-on-surface-variant"
                )}>›</span>
              </button>
              
              {/* Submenu */}
              <AnimatePresence>
                {activeSubmenu === 'label' && (
                  <motion.div 
                    initial={{ opacity: 0, x: adjustedX + 180 + 176 > window.innerWidth ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: adjustedX + 180 + 176 > window.innerWidth ? -10 : 10 }}
                    className={cn(
                      "absolute top-0 w-44 glass-panel rounded-xl shadow-2xl z-[210] overflow-hidden",
                      adjustedX + 180 + 176 > window.innerWidth ? "right-full mr-1" : "left-full ml-1"
                    )}
                  >
                    <p className="px-3 py-1.5 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-on-surface/5">
                      Select Label
                    </p>
                    <div className="max-h-48 overflow-y-auto no-scrollbar">
                      {labels.length > 0 ? labels.map(label => (
                        <button
                          key={label}
                          onClick={() => { onAddLabel(label); onClose(); }}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-1.5 hover:bg-on-surface/5 transition-colors text-xs font-medium text-left",
                            note?.category === label ? "text-primary" : "text-on-surface"
                          )}
                        >
                          <Tag size={12} className={note?.category === label ? "text-primary" : "text-on-surface-variant"} />
                          {label}
                          {note?.category === label && <span className="ml-auto text-primary text-[10px]">✓</span>}
                        </button>
                      )) : (
                        <p className="px-3 py-2 text-[10px] text-on-surface-variant italic">No labels created yet</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => handleAction(item.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-on-surface/5 transition-colors text-left",
                item.color || "text-on-surface"
              )}
            >
              <item.icon size={14} className={item.color || "text-on-surface-variant"} />
              <span className="text-xs font-semibold">{item.label}</span>
            </button>
          )}
        </div>
      ))}
    </motion.div>
  );
}
