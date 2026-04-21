import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Loader2, Upload } from 'lucide-react';

export type UploadStatus = 'uploading' | 'completed' | 'failed';

interface UploadProgressCardProps {
  fileName: string;
  progress: number;
  status: UploadStatus;
}

export default function UploadProgressCard({ fileName, progress, status }: UploadProgressCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-4 bg-surface-container/40 backdrop-blur-md border border-outline-variant/30 rounded-2xl px-4 py-2 shadow-lg min-w-[240px] max-w-[320px]"
    >
      {/* Icon Area */}
      <div className="shrink-0">
        {status === 'uploading' && (
          <div className="relative">
            <Upload size={18} className="text-primary animate-bounce" />
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full -z-10" />
          </div>
        )}
        {status === 'completed' && <CheckCircle2 size={20} className="text-green-500" />}
        {status === 'failed' && <AlertCircle size={20} className="text-red-500" />}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-on-surface truncate pr-2">
            {status === 'uploading' ? `Uploading: ${fileName}` : status === 'completed' ? 'Uploaded ✅' : 'Failed ❌'}
          </span>
          <span className="text-[10px] font-mono font-bold text-on-surface-variant shrink-0">
            {status === 'uploading' ? `${progress}%` : ''}
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="h-1.5 w-full bg-on-surface/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: status === 'failed' ? '100%' : `${progress}%`,
              backgroundColor: status === 'completed' ? '#22c55e' : status === 'failed' ? '#ef4444' : '#6750A4'
            }}
            transition={{ duration: 0.3 }}
            className="h-full rounded-full bg-primary"
          />
        </div>
      </div>

      {/* Completion Spinner/Icon */}
      {status === 'uploading' && progress === 100 && (
        <Loader2 size={14} className="animate-spin text-on-surface-variant shrink-0" />
      )}
    </motion.div>
  );
}
