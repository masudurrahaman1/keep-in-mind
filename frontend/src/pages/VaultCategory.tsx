import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Loader2, Image as ImagePlaceholder, ArrowLeft, Search, FileText, 
  Trash2, SlidersHorizontal, Bell, CloudOff, X as XIcon, Upload, RefreshCw, CheckSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DocumentListCard from '../components/DocumentListCard';
import axios from 'axios';
import MediaUploadFAB from '../components/MediaUploadFAB';
import MediaViewer from '../modals/MediaViewer';
import RenameModal from '../modals/RenameModal';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import { UploadStatus } from '../components/UploadProgressCard';
import UploadActivityCenter from '../components/UploadActivityCenter';
import Loader from '../components/Loader';
import MoveDocumentModal from '../modals/MoveDocumentModal';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function VaultCategory() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { token, googleAccessToken, clearGoogleToken } = useAuth();
  
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [accurateCategoryName, setAccurateCategoryName] = useState<string>('');
  
  const [uploadQueue, setUploadQueue] = useState<any[]>([]);
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  
  const [noGoogleDrive, setNoGoogleDrive] = useState(false);
  const isGoogleConnected = !!(googleAccessToken && googleAccessToken !== 'undefined' && googleAccessToken !== 'null');

  // Modal States
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [mediaToRename, setMediaToRename] = useState<{ id: string, name: string } | null>(null);
  
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [documentToMove, setDocumentToMove] = useState<string | null>(null);
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{ 
    title: string, 
    message: string, 
    onConfirm: () => Promise<void>
  } | null>(null);

  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const isSelectionMode = selectedFileIds.size > 0;

  const formattedCategory = (categoryId || '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace('Ids', 'IDs');

  const getCategorySubtext = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'government ids': return 'Store SSN, Passports, and Licenses securely.';
      case 'education': return 'Store degrees, transcripts, and certificates securely.';
      case 'medical': return 'Store prescriptions, test reports, and medical records securely.';
      case 'banking': return 'Store bank statements, tax returns, and financial documents securely.';
      case 'property': return 'Store deeds, agreements, and property records securely.';
      default: return 'Store your important documents safely in the cloud.';
    }
  };

  const handleAuthError = (err: any) => {
    const status = err.status || err.response?.status;
    if (status === 401 || status === 403) {
      clearGoogleToken();
      setNoGoogleDrive(true);
      return true;
    }
    return false;
  };

  const fetchDocuments = async () => {
    if (!token || !categoryId) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/documents/${categoryId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        handleAuthError({ status: 401 });
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch documents');
      
      const data = await res.json();
      // Map document schema keys to media card expectations if necessary
      const mappedData = data.map((doc: any) => ({
        ...doc,
        _id: doc._id,
        fileName: doc.title,
        fileType: doc.mimeType,
        fileId: doc.driveFileId,
        size: doc.size,
        thumbnailUrl: doc.thumbnailUrl,
        uploadedAt: doc.createdAt
      }));
      setDocuments(mappedData);

      // Fetch folder info to get the exact exact category name
      const folderRes = await fetch(`${API_BASE}/folders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (folderRes.ok) {
        const folders = await folderRes.json();
        const currentFolder = folders.find((f: any) => f.path === `/documents/${categoryId}` || f.path === `/vault/${categoryId}`);
        if (currentFolder) {
          setAccurateCategoryName(currentFolder.name);
        } else {
          setAccurateCategoryName(formattedCategory);
        }
      } else {
        setAccurateCategoryName(formattedCategory);
      }
    } catch (err: any) {
      console.error(err);
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const syncWithDrive = async () => {
    if (!token || !categoryId || !isGoogleConnected) return;
    try {
      setIsSyncing(true);
      const res = await fetch(`${API_BASE}/documents/sync/${categoryId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleAuthError({ status: 401 });
        return;
      }
      if (!res.ok) throw new Error('Sync failed');
      // After sync, refetch documents to get the updated list
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to sync with Google Drive:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [token, categoryId]);

  const uploadFile = async (file: File) => {
    if (!token) return;
    if (!isGoogleConnected) {
      setNoGoogleDrive(true);
      return;
    }
    setNoGoogleDrive(false);

    const uploadId = Math.random().toString(36).substring(7);
    const newUpload = { id: uploadId, name: file.name, progress: 0, status: 'uploading' as UploadStatus };
    
    setUploadQueue(prev => [...prev, newUpload]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', accurateCategoryName || formattedCategory);
    formData.append('title', file.name);

    try {
      const { data } = await axios.post(`${API_BASE}/documents/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadQueue(prev => prev.map(item => 
              item.id === uploadId ? { ...item, progress: percent } : item
            ));
          }
        }
      });

      setUploadQueue(prev => prev.map(item => 
        item.id === uploadId ? { ...item, progress: 100, status: 'completed' as UploadStatus } : item
      ));

      setUploadHistory(prev => [{
        id: uploadId,
        name: file.name,
        status: 'completed' as UploadStatus,
        progress: 100,
        timestamp: new Date()
      }, ...prev]);

      const doc = data.document;
      const mappedDoc = {
        ...doc,
        _id: doc._id,
        fileName: doc.title,
        fileType: doc.mimeType,
        fileId: doc.driveFileId,
        size: doc.size,
        thumbnailUrl: doc.thumbnailUrl || (data.driveData?.thumbnailLink),
        fileUrl: data.driveData?.webViewLink,
        uploadedAt: doc.createdAt
      };

      setDocuments(prev => [mappedDoc, ...prev]);

      setTimeout(() => {
        setUploadQueue(prev => prev.filter(item => item.id !== uploadId));
      }, 3000);

    } catch (err: any) {
      console.error('Upload error:', err);
      if (handleAuthError(err)) return;
      
      setUploadQueue(prev => prev.map(item => 
        item.id === uploadId ? { ...item, status: 'failed' as UploadStatus } : item
      ));

      setUploadHistory(prev => [{
        id: uploadId,
        name: file.name,
        status: 'failed' as UploadStatus,
        progress: 0,
        timestamp: new Date()
      }, ...prev]);

      setTimeout(() => {
        setUploadQueue(prev => prev.filter(item => item.id !== uploadId));
      }, 6000);
    }
  };

  const handleFilesSelect = (files: File[]) => {
    files.forEach(file => uploadFile(file));
  };

  const handleDelete = (id: string) => {
    setConfirmConfig({
      title: 'Delete Document',
      message: 'Are you sure you want to delete this document from your Vault and Google Drive? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE}/documents/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Delete failed');
          setDocuments(prev => prev.filter(m => m._id !== id));
        } catch (err) {
          console.error('Delete failed', err);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleRename = (id: string, currentName: string) => {
    setMediaToRename({ id, name: currentName });
    setIsRenameModalOpen(true);
  };

  const performRename = async (newName: string) => {
    if (!mediaToRename || !token) return;
    try {
      const res = await fetch(`${API_BASE}/documents/${mediaToRename.id}/rename`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newName })
      });
      if (!res.ok) throw new Error('Rename failed');
      setDocuments(prev => prev.map(m => m._id === mediaToRename.id ? { ...m, fileName: newName, title: newName } : m));
    } catch (err: any) {
      console.error('Rename Error', err);
      throw err;
    }
  };

  const handleMove = (id: string) => {
    setDocumentToMove(id);
    setIsMoveModalOpen(true);
  };

  const handleMoveSuccess = (id: string, newCategory: string) => {
    // Remove it from the current view
    setDocuments(prev => prev.filter(m => m._id !== id));
  };

  const handleBulkDelete = () => {
    setConfirmConfig({
      title: `Delete ${selectedFileIds.size} Document${selectedFileIds.size > 1 ? 's' : ''}`,
      message: `Are you sure you want to delete ${selectedFileIds.size} document${selectedFileIds.size > 1 ? 's' : ''} from your Vault and Google Drive? This action cannot be undone.`,
      onConfirm: async () => {
        const idsToDelete = Array.from(selectedFileIds);
        
        // Optimistic UI Update - immediately remove from view
        setDocuments(prev => prev.filter(m => !idsToDelete.includes(m._id)));
        setSelectedFileIds(new Set());
        
        // Run network requests in background so the UI doesn't freeze
        (async () => {
          for (const id of idsToDelete) {
            try {
              await fetch(`${API_BASE}/documents/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
            } catch (err) {
              console.error(`Background deletion failed for ${id}:`, err);
            }
          }
        })();
      }
    });
    setIsConfirmModalOpen(true);
  };

  const filteredMedia = documents.filter(item => 
    item.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col relative z-10 bg-white dark:bg-neutral-900 px-1.5 py-4 sm:p-5 md:p-6 pb-32 min-h-full">
      <AnimatePresence>
        {noGoogleDrive && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-700 dark:text-amber-400">
              <CloudOff size={20} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-sm">Google Drive Not Connected</p>
                <p className="text-xs mt-0.5 opacity-80">Uploads require a connected Google account. Go to <strong>Profile → Manage Backup</strong> to connect your Drive.</p>
              </div>
              <button onClick={() => setNoGoogleDrive(false)} className="shrink-0 p-1 hover:bg-amber-500/20 rounded-full transition-all">
                <XIcon size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl pt-2 pb-4 -mx-1.5 px-4 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 flex flex-col mb-6">
        {isSelectionMode ? (
          <div className="flex items-center justify-between mb-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl px-4 py-3 border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedFileIds(new Set())}
                className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <XIcon size={24} className="text-neutral-700 dark:text-neutral-300" />
              </button>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">
                {selectedFileIds.size} Selected
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (selectedFileIds.size === documents.length) {
                    setSelectedFileIds(new Set());
                  } else {
                    setSelectedFileIds(new Set(documents.map(d => d._id)));
                  }
                }}
                className={`p-2 rounded-full transition-colors ${
                  selectedFileIds.size === documents.length 
                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' 
                    : 'hover:bg-indigo-100 text-indigo-500/70 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:text-indigo-400/70 dark:hover:text-indigo-400'
                }`}
                title={selectedFileIds.size === documents.length ? "Deselect All" : "Select All"}
              >
                <CheckSquare size={20} />
              </button>
              <button 
                onClick={handleBulkDelete}
                className="p-2 rounded-full hover:bg-error/10 text-error transition-colors"
                title="Delete Selected"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <ArrowLeft size={24} className="text-neutral-700 dark:text-neutral-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white leading-tight">
                  {accurateCategoryName || formattedCategory}
                </h1>
                <p className="text-sm font-medium text-neutral-500 mt-1">
                  {getCategorySubtext(accurateCategoryName || formattedCategory)}
                </p>
              </div>
              {isGoogleConnected && (
                <button 
                  onClick={syncWithDrive}
                  disabled={isSyncing}
                  className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
                  title="Sync with Google Drive"
                >
                  <RefreshCw size={18} className={isSyncing ? "animate-spin text-indigo-500" : ""} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[10px] font-medium text-neutral-400 flex items-center gap-1">
                 <FileText size={10} /> {documents.length} Files
              </div>
              <UploadActivityCenter 
                isOpen={isActivityOpen} 
                onClose={() => setIsActivityOpen(false)} 
                queue={uploadQueue}
                history={uploadHistory}
              />
            </div>
          </div>
        )}



        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 bg-white dark:bg-neutral-800 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm border border-neutral-100 dark:border-neutral-700 focus-within:border-amber-400 transition-colors">
            <Search size={18} className="text-neutral-400 shrink-0" />
            <input 
              type="text" 
              placeholder={`Search ${accurateCategoryName || formattedCategory}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400"
            />
          </div>
          <button className="w-12 h-12 bg-white dark:bg-neutral-800 rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 active:scale-95 transition-all">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader />
        </div>
      ) : filteredMedia.length > 0 || uploadQueue.length > 0 ? (
        <div className="flex flex-col gap-2 mb-8">
          <AnimatePresence mode="popLayout">
            {/* Show Uploading Items first */}
            {uploadQueue.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative flex items-center gap-4 p-3 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden"
              >
                {/* Progress bar background */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-amber-500/5 dark:bg-amber-500/10 transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
                
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 relative z-10">
                  {item.status === 'completed' ? (
                    <FileText size={20} />
                  ) : item.status === 'failed' ? (
                    <XIcon size={20} className="text-error" />
                  ) : (
                    <Loader2 size={20} className="animate-spin" />
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center relative z-10">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate mb-0.5">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    <span className="text-amber-600 dark:text-amber-400">
                      {item.status === 'uploading' ? `Uploading ${item.progress}%` : 
                       item.status === 'completed' ? 'Processing...' : 'Failed'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Show Actual Documents */}
            {filteredMedia.map((item, index) => (
              <DocumentListCard 
                key={item._id} 
                media={item} 
                onDelete={handleDelete} 
                onRename={handleRename}
                onMove={handleMove}
                onSelect={() => setSelectedMediaIndex(index)}
                streamEndpoint="/documents/stream"
                isSelected={selectedFileIds.has(item._id)}
                isSelectionMode={isSelectionMode}
                onToggleSelect={() => {
                  setSelectedFileIds(prev => {
                    const next = new Set(prev);
                    if (next.has(item._id)) next.delete(item._id);
                    else next.add(item._id);
                    return next;
                  });
                }}
                onLongPress={() => {
                  if (!isSelectionMode) {
                    setSelectedFileIds(new Set([item._id]));
                    if (navigator.vibrate) navigator.vibrate(50);
                  }
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="py-16 flex flex-col items-center justify-center text-center px-4 mb-8"
        >
          {searchQuery ? (
            <>
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-4">
                <FileText size={24} className="text-neutral-400" />
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                No matches found
              </h2>
              <p className="text-sm text-neutral-500">
                Try searching for something else.
              </p>
            </>
          ) : (
            <>
              <div className="relative mb-6 mt-4">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Sparkles */}
                  <path d="M20 25 L22 30 L27 32 L22 34 L20 39 L18 34 L13 32 L18 30 Z" fill="#A7F3D0" />
                  <path d="M80 30 L81 33 L84 34 L81 35 L80 38 L79 35 L76 34 L79 33 Z" fill="#A7F3D0" />
                  <path d="M35 15 L36 17 L38 18 L36 19 L35 21 L34 19 L32 18 L34 17 Z" fill="#A7F3D0" />
                  <path d="M60 10 L61.5 14 L65.5 15.5 L61.5 17 L60 21 L58.5 17 L54.5 15.5 L58.5 14 Z" fill="#A7F3D0" />
                  {/* Document */}
                  <rect x="30" y="25" width="40" height="50" rx="4" fill="#E5E7EB" />
                  <rect x="38" y="35" width="24" height="3" rx="1.5" fill="#D1D5DB" />
                  <rect x="38" y="43" width="24" height="3" rx="1.5" fill="#D1D5DB" />
                  <rect x="38" y="51" width="16" height="3" rx="1.5" fill="#D1D5DB" />
                  {/* Folder Back */}
                  <path d="M20 40 L35 40 L40 45 L80 45 C82.7614 45 85 47.2386 85 50 L85 75 C85 77.7614 82.7614 80 80 80 L20 80 C17.2386 80 15 77.7614 15 75 L15 45 C15 42.2386 17.2386 40 20 40 Z" fill="#A7F3D0" opacity="0.6" />
                  {/* Folder Front */}
                  <path d="M15 55 L85 55 L85 75 C85 77.7614 82.7614 80 80 80 L20 80 C17.2386 80 15 77.7614 15 75 L15 55 Z" fill="#D1FAE5" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                Keep your {formattedCategory} organized
              </h2>
              <p className="text-sm text-neutral-500 mb-6 max-w-[250px]">
                Add more documents to keep everything in one place.
              </p>
              
              <button 
                onClick={() => {
                  const input = document.getElementById('empty-state-upload') as HTMLInputElement;
                  if (input) input.click();
                }}
                className="flex items-center gap-2 bg-[#5B3DF5] hover:bg-[#4828E0] text-white px-6 py-3 rounded-xl font-semibold shadow-md active:scale-95 transition-all"
              >
                <Upload size={18} />
                Upload Document
              </button>
              <input 
                type="file" 
                id="empty-state-upload" 
                className="hidden" 
                multiple 
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    handleFilesSelect(files);
                    e.target.value = '';
                  }
                }} 
              />
            </>
          )}
        </motion.div>
      )}

      <MediaUploadFAB onFilesSelect={handleFilesSelect} />

      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={performRename}
        currentName={mediaToRename?.name || ''}
      />

      {documentToMove && (
        <MoveDocumentModal
          isOpen={isMoveModalOpen}
          onClose={() => setIsMoveModalOpen(false)}
          documentId={documentToMove}
          currentCategory={formattedCategory}
          onMoveSuccess={handleMoveSuccess}
        />
      )}

      {confirmConfig && (
        <ConfirmDeleteModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
        />
      )}

      <AnimatePresence>
        {selectedMediaIndex !== null && filteredMedia[selectedMediaIndex] && (
          <MediaViewer
            media={filteredMedia[selectedMediaIndex]}
            onClose={() => setSelectedMediaIndex(null)}
            onNext={() => setSelectedMediaIndex((selectedMediaIndex + 1) % filteredMedia.length)}
            onPrev={() => setSelectedMediaIndex((selectedMediaIndex - 1 + filteredMedia.length) % filteredMedia.length)}
            onRename={handleRename}
            streamEndpoint="/documents/stream"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
