import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, CheckCircle2, AlertCircle, Loader2, X, History, Clock } from 'lucide-react';
import { UploadStatus } from './UploadProgressCard';

interface UploadHistoryItem {
  id: string;
  name: string;
  progress: number;
  status: UploadStatus;
  timestamp: Date;
}

interface UploadActivityCenterProps {
  isOpen: boolean;
  onClose: () => void;
  queue: any[];
  history: UploadHistoryItem[];
}

export default function UploadActivityCenter({ isOpen, onClose, queue, history }: UploadActivityCenterProps) {
  const activeCount = queue.length;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile/closing */}
          <div className="fixed inset-0 z-[60]" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-4 w-[350px] bg-surface-container-high/90 backdrop-blur-2xl border border-outline-variant/30 rounded-[2rem] shadow-2xl z-[70] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <History size={20} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-on-surface">Upload Activity</h3>
                  <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">
                    {activeCount > 0 ? `${activeCount} files syncing...` : 'All caught up'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-on-surface/10 rounded-full transition-all text-on-surface-variant">
                <X size={18} />
              </button>
            </div>

            {/* Content Scroll Area */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
              
              {/* Active Section */}
              {queue.length > 0 && (
                <div className="mb-4">
                  <div className="px-4 py-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">In Progress</span>
                  </div>
                  <div className="space-y-1">
                    {queue.map(item => (
                      <ActivityRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* History Section */}
              <div>
                <div className="px-4 py-2 flex items-center gap-2">
                  <Clock size={12} className="text-on-surface-variant" />
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Recent Session</span>
                </div>
                <div className="space-y-1">
                  {history.length > 0 ? (
                    history.slice(0, 10).map(item => (
                      <ActivityRow key={item.id} item={item} />
                    ))
                  ) : queue.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                      <Cloud size={40} className="mb-3" />
                      <p className="text-xs font-medium">No recent uploads</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-on-surface/5 text-center">
              <p className="text-[10px] text-on-surface-variant font-medium">
                Uploads are synced with your Google Drive
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ActivityRow({ item }: { item: any }) {
  const isSyncing = item.status === 'uploading';
  const isDone = item.status === 'completed';
  const isFailed = item.status === 'failed';

  return (
    <div className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-on-surface/5 transition-all">
      {/* Icon */}
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all
        ${isSyncing ? 'bg-primary/10 text-primary' : isDone ? 'bg-green-500/10 text-green-500' : 'bg-error/10 text-error'}
      `}>
        {isSyncing ? <Loader2 size={18} className="animate-spin" /> : isDone ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-on-surface truncate pr-2">{item.name}</h4>
        <div className="flex items-center justify-between mt-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider
            ${isSyncing ? 'text-primary' : isDone ? 'text-green-500' : 'text-error'}
          `}>
            {isSyncing ? `${item.progress}%` : item.status}
          </span>
          {item.timestamp && (
            <span className="text-[10px] text-on-surface-variant/60 font-medium">
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        
        {/* Compact Progress Bar */}
        {isSyncing && (
          <div className="h-1 w-full bg-on-surface/10 rounded-full mt-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              className="h-full bg-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
}
