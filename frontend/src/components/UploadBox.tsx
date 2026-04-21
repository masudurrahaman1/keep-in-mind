import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface UploadBoxProps {
  onFilesSelect: (files: File[]) => void;
  token: string;
  googleAccessToken: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function UploadBox({ onFilesSelect, token, googleAccessToken }: UploadBoxProps) {
  const { signOut } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleAuthError = useCallback((status: number) => {
    if (status === 401) {
      console.error('[UploadBox Auth Error] Google session expired.');
      localStorage.removeItem('googleToken');
      signOut();
      return true;
    }
    return false;
  }, [signOut]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    onFilesSelect(acceptedFiles);
  }, [onFilesSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg', '.mov']
    },
    multiple: true,
    maxFiles: 50,
    disabled: isUploading
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`group relative overflow-hidden rounded-[2.5rem] border-2 border-dashed p-10 transition-all duration-300
          ${isDragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-outline-variant/50 hover:border-primary/50 hover:bg-surface-container/30'}
          ${isUploading ? 'pointer-events-none opacity-80' : 'cursor-pointer'}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="relative">
            <div className={`flex h-20 w-20 items-center justify-center rounded-3xl transition-all duration-500
              ${isUploading ? 'bg-primary/20 text-primary animate-pulse' : 'bg-surface-container-high/50 text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary group-hover:rotate-12'}
            `}>
              {isUploading ? <Loader2 size={40} className="animate-spin" /> : <Upload size={40} />}
            </div>
            
            <AnimatePresence>
              {!isUploading && !error && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white shadow-lg"
                >
                  <FileText size={16} strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-heading font-bold text-on-surface">
              {isUploading ? 'Uploading to Cloud...' : isDragActive ? 'Drop it here!' : 'Add to Your Gallery'}
            </h3>
            <p className="text-sm text-on-surface-variant font-medium">
              Images up to 10MB, Videos up to 50MB
            </p>
          </div>

          {!isUploading && !error && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-xl shadow-primary/20"
            >
              Select File
            </motion.button>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 rounded-2xl bg-error/10 px-4 py-2 text-sm font-semibold text-error"
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </div>

        {/* Uploading progress bar simulation */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              className="absolute bottom-0 left-0 h-1.5 bg-primary/20"
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '90%' }}
                transition={{ duration: 10 }}
                className="h-full bg-primary"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
