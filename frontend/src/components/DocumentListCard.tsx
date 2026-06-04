import React from 'react';
import { motion } from 'motion/react';
import { FileText, MoreVertical, Trash2, Pencil, Share2, Download, Image as ImageIcon, Video } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface DocumentListCardProps {
  media: any;
  onSelect: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, currentName: string) => void;
  streamEndpoint?: string;
}

export default function DocumentListCard({ media, onSelect, onDelete, onRename, streamEndpoint }: DocumentListCardProps) {
  const { token } = useAuth();
  const isVideo = media.fileType?.startsWith('video/') || media.fileName?.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/);
  const isPdf = media.fileType?.includes('pdf') || media.fileName?.toLowerCase().endsWith('.pdf');
  const isImage = media.fileType?.startsWith('image/') || media.fileName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: media.fileName,
        url: media.fileUrl
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(media.fileUrl);
      alert('Link copied to clipboard!');
    }
  };

  const getIcon = () => {
    if (isPdf) return <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"><span className="text-xs font-black tracking-tighter uppercase">PDF</span></div>;
    if (isVideo) return <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"><Video size={24} /></div>;
    if (isImage) return <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><ImageIcon size={24} /></div>;
    return <div className="w-12 h-12 rounded-xl bg-neutral-500/10 text-neutral-500 flex items-center justify-center"><FileText size={24} /></div>;
  };

  const isValidToken = !!(token && token !== 'undefined' && token !== 'null');
  const imgUrl = media.thumbnailUrl || (streamEndpoint && isValidToken ? `${API_BASE}${streamEndpoint}/${media.fileId || media._id}?token=${token}` : null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onSelect}
      className="group relative flex flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-800 cursor-pointer hover:shadow-md transition-all duration-200 w-full mb-3 sm:mb-4"
    >
      {/* Thumbnail Side */}
      <div className="w-28 sm:w-48 md:w-64 aspect-square sm:aspect-[3/2] shrink-0 rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700 flex items-center justify-center relative">
        {(isImage || isPdf || isVideo) && imgUrl ? (
          <img 
            src={imgUrl} 
            alt={media.fileName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to icon if image fails to load
              (e.target as HTMLElement).style.display = 'none';
              const nextSibling = (e.target as HTMLElement).nextElementSibling as HTMLElement;
              if (nextSibling) nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        <div className="w-full h-full flex flex-col items-center justify-center absolute inset-0 bg-neutral-50 dark:bg-neutral-800/50" style={{ display: (isImage || isPdf || isVideo) && imgUrl ? 'none' : 'flex' }}>
          {getIcon()}
        </div>
      </div>

      {/* Details Side */}
      <div className="flex-1 min-w-0 flex flex-col py-0 sm:py-1">
        <div className="flex justify-between items-start mb-1.5 sm:mb-2">
          <h4 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate pr-2 sm:pr-4">
            {media.fileName.split('.').slice(0, -1).join('.') || media.fileName}
          </h4>
          
          <div className="flex items-center">
            {/* Actions (Hover) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-2">
              <button
                onClick={handleShare}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors"
                title="Share"
              >
                <Share2 size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRename(media._id, media.fileName); }}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-neutral-500 dark:text-neutral-400 transition-colors"
                title="Rename"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(media._id); }}
                className="p-1.5 hover:bg-error/10 rounded-full text-error transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors p-1 sm:-mr-2">
              <MoreVertical size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        
        {/* Type badge */}
        <div className="mb-auto">
          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] sm:text-xs font-semibold rounded-md sm:rounded-lg inline-block">
            {isImage ? 'Image' : isPdf ? 'PDF' : isVideo ? 'Video' : 'Document'}
          </span>
        </div>

        {/* Metadata */}
        <div className="flex flex-col gap-1 sm:gap-1.5 text-[11px] sm:text-[13px] font-medium text-neutral-500 dark:text-neutral-400 mt-2 sm:mt-4">
          <span>{formatSize(media.size)}</span>
          <span className="hidden sm:inline">Modified {format(new Date(media.uploadedAt), 'h:mm a')}</span>
          <span className="sm:hidden">{format(new Date(media.uploadedAt), 'd MMM yyyy, h:mm a')}</span>
          <span className="hidden sm:inline">{format(new Date(media.uploadedAt), 'dd MMM yyyy')}</span>
        </div>
      </div>
    </motion.div>
  );
}
