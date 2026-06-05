import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Loader2, Image as ImagePlaceholder, History, Trash2, CloudOff, X as XIcon,
  ShieldCheck, Bell, SlidersHorizontal, FileText, Cloud, Lock, IdCard, GraduationCap,
  SquareActivity, Building2, Home, Layers, ArrowRight, ShieldAlert, LockKeyhole, Plus, FolderPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import MediaCard from '../components/MediaCard';
import DocumentListCard from '../components/DocumentListCard';
import axios from 'axios';
import MediaUploadFAB from '../components/MediaUploadFAB';
import MediaViewer from '../modals/MediaViewer';
import RenameModal from '../modals/RenameModal';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import CreateFolderModal from '../modals/CreateFolderModal';
import { UploadStatus } from '../components/UploadProgressCard';
import UploadActivityCenter from '../components/UploadActivityCenter';
import Loader from '../components/Loader';
import { FolderActionsSheet } from '../components/FolderActionsSheet';
import { useLongPress } from '../hooks/useLongPress';
import RenameFolderModal from '../modals/RenameFolderModal';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { apiService } from '../services/apiService';

const FolderCard = ({ cf, docCount, onClick, onLongPress }: { cf: any, docCount: number, onClick: () => void, onLongPress: () => void }) => {
  const longPressProps = useLongPress(
    (e) => {
      onLongPress();
    },
    onClick,
    { delay: 500, shouldPreventDefault: true }
  );

  return (
    <div 
      {...longPressProps}
      className="bg-white dark:bg-neutral-800 rounded-xl sm:rounded-3xl p-2.5 sm:p-5 border border-neutral-100 dark:border-neutral-700 flex flex-row sm:flex-col items-center sm:justify-center text-left sm:text-center cursor-pointer hover:shadow-sm transition-all active:scale-95 gap-3 sm:gap-0"
    >
      <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0 sm:mb-3 ${cf.colorClass || 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>
        <FolderPlus className="w-4 h-4 sm:w-6 sm:h-6" />
      </div>
      <div className="flex flex-col flex-1 min-w-0 w-full overflow-hidden">
        <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white mb-0 sm:mb-1 truncate max-w-full">{cf.name}</h3>
        <p className="text-[10px] sm:text-xs text-neutral-400 truncate max-w-full">{docCount || 0} docs</p>
      </div>
    </div>
  );
};


const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Gallery() {
  const navigate = useNavigate();
  const { token, googleAccessToken, signOut, clearGoogleToken } = useAuth();
  const { themeColor } = usePreferences();
  
  const themeMap = {
    yellow: {
      bg: 'from-[#FFE8B6] to-[#FFD682] dark:from-amber-900/40 dark:to-amber-800/40 border-amber-200/50 dark:border-amber-700/50',
      iconBg: 'bg-white/80 dark:bg-black/30 border-amber-300/30 text-amber-600 dark:text-amber-400',
      iconWatermark: 'text-amber-500/20 dark:text-amber-500/10',
      textMain: 'text-amber-900 dark:text-amber-200',
      textSub: 'text-amber-700 dark:text-amber-400',
      btn: 'text-amber-900 dark:text-amber-100 bg-white/80 dark:bg-white/10 hover:bg-white',
      topIconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-500 border-amber-200/50',
      notifDot: 'bg-amber-500',
    },
    blue: {
      bg: 'from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 border-blue-200/50 dark:border-blue-700/50',
      iconBg: 'bg-white/80 dark:bg-black/30 border-blue-300/30 text-blue-600 dark:text-blue-400',
      iconWatermark: 'text-blue-500/20 dark:text-blue-500/10',
      textMain: 'text-blue-900 dark:text-blue-200',
      textSub: 'text-blue-700 dark:text-blue-400',
      btn: 'text-blue-900 dark:text-blue-100 bg-white/80 dark:bg-white/10 hover:bg-white',
      topIconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-500 border-blue-200/50',
      notifDot: 'bg-blue-500',
    },
    green: {
      bg: 'from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 border-emerald-200/50 dark:border-emerald-700/50',
      iconBg: 'bg-white/80 dark:bg-black/30 border-emerald-300/30 text-emerald-600 dark:text-emerald-400',
      iconWatermark: 'text-emerald-500/20 dark:text-emerald-500/10',
      textMain: 'text-emerald-900 dark:text-emerald-200',
      textSub: 'text-emerald-700 dark:text-emerald-400',
      btn: 'text-emerald-900 dark:text-emerald-100 bg-white/80 dark:bg-white/10 hover:bg-white',
      topIconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 border-emerald-200/50',
      notifDot: 'bg-emerald-500',
    },
    purple: {
      bg: 'from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 border-purple-200/50 dark:border-purple-700/50',
      iconBg: 'bg-white/80 dark:bg-black/30 border-purple-300/30 text-purple-600 dark:text-purple-400',
      iconWatermark: 'text-purple-500/20 dark:text-purple-500/10',
      textMain: 'text-purple-900 dark:text-purple-200',
      textSub: 'text-purple-700 dark:text-purple-400',
      btn: 'text-purple-900 dark:text-purple-100 bg-white/80 dark:bg-white/10 hover:bg-white',
      topIconBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-500 border-purple-200/50',
      notifDot: 'bg-purple-500',
    },
    rose: {
      bg: 'from-rose-100 to-rose-200 dark:from-rose-900/40 dark:to-rose-800/40 border-rose-200/50 dark:border-rose-700/50',
      iconBg: 'bg-white/80 dark:bg-black/30 border-rose-300/30 text-rose-600 dark:text-rose-400',
      iconWatermark: 'text-rose-500/20 dark:text-rose-500/10',
      textMain: 'text-rose-900 dark:text-rose-200',
      textSub: 'text-rose-700 dark:text-rose-400',
      btn: 'text-rose-900 dark:text-rose-100 bg-white/80 dark:bg-white/10 hover:bg-white',
      topIconBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-500 border-rose-200/50',
      notifDot: 'bg-rose-500',
    },
    orange: {
      bg: 'from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 border-orange-200/50 dark:border-orange-700/50',
      iconBg: 'bg-white/80 dark:bg-black/30 border-orange-300/30 text-orange-600 dark:text-orange-400',
      iconWatermark: 'text-orange-500/20 dark:text-orange-500/10',
      textMain: 'text-orange-900 dark:text-orange-200',
      textSub: 'text-orange-700 dark:text-orange-400',
      btn: 'text-orange-900 dark:text-orange-100 bg-white/80 dark:bg-white/10 hover:bg-white',
      topIconBg: 'bg-orange-100 dark:bg-orange-900/40 text-orange-500 border-orange-200/50',
      notifDot: 'bg-orange-500',
    }
  };
  const activeTheme = themeMap[themeColor] || themeMap.yellow;

  const [media, setMedia] = useState<any[]>([]);
  const [storage, setStorage] = useState<{ totalSize: string, totalFiles: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadQueue, setUploadQueue] = useState<any[]>([]);
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'trash'>('all');
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [imageCount, setImageCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [trashCount, setTrashCount] = useState(0);
  const [noGoogleDrive, setNoGoogleDrive] = useState(false);
  const isGoogleConnected = !!(googleAccessToken && googleAccessToken !== 'undefined' && googleAccessToken !== 'null');

  // Batch Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // Document Counts
  const [docCounts, setDocCounts] = useState<Record<string, number>>({});
  
  // Rename Modal State
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [mediaToRename, setMediaToRename] = useState<{ id: string, name: string } | null>(null);

  // Custom Folders State
  const [customFolders, setCustomFolders] = useState<any[]>([]);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);

  // Confirm Delete Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{ 
    title: string, 
    message: string, 
    onConfirm: () => Promise<void>,
    isBulk: boolean 
  } | null>(null);

  // Folder Actions State
  const [selectedFolder, setSelectedFolder] = useState<any | null>(null);
  const [isFolderSheetOpen, setIsFolderSheetOpen] = useState(false);
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);

  const handleRenameFolder = async (folderId: string, newName: string) => {
    if (!token) return;
    try {
      await apiService.request(`/folders/${folderId}`, 'PATCH', { name: newName });
      await db.folders.update(folderId, { name: newName, syncStatus: 'pending', updatedAt: new Date().toISOString() });
      fetchCustomFolders();
    } catch (err) {
      console.error('Failed to rename folder:', err);
    }
  };

  const handleDeleteFolder = async (folder: any) => {
    if (!token) return;
    try {
      await apiService.request(`/folders/${folder._id}`, 'DELETE');
      await db.folders.update(folder._id, { syncStatus: 'deleted', updatedAt: new Date().toISOString() });
      fetchCustomFolders();
    } catch (err) {
      console.error('Failed to delete folder:', err);
    }
  };

  const handleAuthError = (err: any) => {
    const status = err.status || err.response?.status;
    const message = err.response?.data?.error || err.response?.data?.message || err.message || '';
    const isGoogleExpired = status === 401 || status === 403 ||
      (typeof message === 'string' && (message.includes('401') || message.includes('403') || message.includes('invalid_grant') || message.includes('Token has been expired') || message.includes('insufficient')));
    
    if (isGoogleExpired) {
      console.warn('[Gallery] Google token expired — clearing token, user stays logged in.');
      localStorage.removeItem('googleToken');
      // Only clear Google token, don't sign out the whole app
      clearGoogleToken();
      setNoGoogleDrive(true);
      return true;
    }
    return false;
  };

  const fetchStorage = async () => {
    if (!token) return;
    if (!googleAccessToken || googleAccessToken === 'undefined' || googleAccessToken === 'null') {
      // Silently skip if no Google connection, rather than warning
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/gallery/storage`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'google-access-token': googleAccessToken || ''
        }
      });
      
      if (res.status === 401 || res.status === 403) {
        handleAuthError({ status: res.status });
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setStorage(data);
      }
    } catch (err) {
      console.error('Gallery storage fetch error:', err);
    }
  };

  const fetchMedia = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/gallery`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        handleAuthError({ status: 401 });
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch gallery');
      const data = await res.json();
      setMedia(data);
      setActiveCount(data.length);
      setImageCount(data.filter((m: any) => m.fileType.startsWith('image/')).length);
      setVideoCount(data.filter((m: any) => m.fileType.startsWith('video/')).length);
      fetchStorage(); // Refresh storage after fetching media
    } catch (err: any) {
      console.error(err);
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trash count on initial load so tab shows correct count
  const fetchTrashCount = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/gallery/trash`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTrashCount(data.length);
      }
    } catch {
      // silently ignore
    }
  };

  const fetchDocCounts = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/documents/metrics/counts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocCounts(data);
      }
    } catch (err) {
      console.error('Failed to fetch doc counts:', err);
    }
  };

  const liveCustomFolders = useLiveQuery(() => db.folders.filter(f => f.syncStatus !== 'deleted' && !f.isSystem).toArray(), []) || [];

  useEffect(() => {
    if (liveCustomFolders.length > 0 || !navigator.onLine) {
      setCustomFolders(liveCustomFolders.map(f => ({...f, id: f._id})));
    }
  }, [liveCustomFolders]);

  const fetchCustomFolders = async () => {
    if (!token || !navigator.onLine) return;
    try {
      const data = await apiService.request('/folders');
      if (data && Array.isArray(data)) {
        await db.folders.bulkPut(data.map((f: any) => ({ ...f, syncStatus: 'synced', _id: f._id })));
        setCustomFolders(data.filter((f: any) => !f.isSystem));
      }
    } catch (err) {
      console.error('Failed to fetch custom folders:', err);
    }
  };

  const handleCreateFolder = async (name: string, colorClass: string) => {
    if (!token) return;
    try {
      const folderData = { name, colorClass };
      const res = await apiService.request('/folders', 'POST', folderData);
      const folderIdStr = res._id || res.id;
      await db.folders.put({ ...res, ...folderData, syncStatus: navigator.onLine ? 'synced' : 'pending', updatedAt: new Date().toISOString(), _id: folderIdStr });
      setCustomFolders(prev => [{ ...res, ...folderData, _id: folderIdStr }, ...prev]);
    } catch (err) {
      console.error('Failed to create folder:', err);
    }
  };

  useEffect(() => {
    if (filterType === 'trash') {
      fetchTrash();
    } else {
      fetchMedia();
      fetchTrashCount(); // keep trash count fresh when browsing active media
      fetchDocCounts();
      fetchCustomFolders();
    }
  }, [token, filterType]);

  const fetchTrash = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/gallery/trash`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleAuthError({ status: 401 });
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch trash');
      const data = await res.json();
      setMedia(data);
      setTrashCount(data.length);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (!token) return;
    
    // We only require Google connection for online immediate uploads
    if (navigator.onLine && !isGoogleConnected) {
      setNoGoogleDrive(true);
      return;
    }
    setNoGoogleDrive(false);

    const uploadId = Math.random().toString(36).substring(7);
    
    if (!navigator.onLine) {
      // Offline Flow
      const newUpload = { id: uploadId, name: file.name, progress: 100, status: 'completed' as UploadStatus };
      setUploadQueue(prev => [...prev, newUpload]);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const docIdStr = uploadId;
        const newDoc = {
          _id: docIdStr,
          title: file.name,
          mimeType: file.type,
          size: file.size,
          category: 'Other', // default fallback
          updatedAt: new Date().toISOString(),
          syncStatus: 'pending' as const,
          fileData: arrayBuffer
        };

        // Save to DB and Queue
        await db.documents.put(newDoc);
        await db.syncQueue.add({
          action: 'create',
          entityType: 'document',
          entityId: docIdStr,
          payload: { fileName: file.name, fileType: file.type }, // We rely on fileData in the db
          timestamp: new Date().toISOString(),
          retryCount: 0
        });

        // Add to history
        setUploadHistory(prev => [{
          id: uploadId,
          name: file.name,
          status: 'completed' as UploadStatus,
          progress: 100,
          timestamp: new Date()
        }, ...prev]);

        // Optimistically add to media state
        setMedia(prev => [newDoc, ...prev]);

        setTimeout(() => {
          setUploadQueue(prev => prev.filter(item => item.id !== uploadId));
        }, 3000);

      } catch (err) {
        console.error('Failed to queue offline upload', err);
      }
      return;
    }

    // Online Flow
    const newUpload = { id: uploadId, name: file.name, progress: 0, status: 'uploading' as UploadStatus };
    setUploadQueue(prev => [...prev, newUpload]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('googleAccessToken', googleAccessToken!);

    try {
      const { data } = await axios.post(`${API_BASE}/gallery/upload`, formData, {
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

      // Add to history
      setUploadHistory(prev => [{
        id: uploadId,
        name: file.name,
        status: 'completed' as UploadStatus,
        progress: 100,
        timestamp: new Date()
      }, ...prev]);

      // Update media list and counts
      const uploaded = data.media;
      setMedia(prev => [uploaded, ...prev]);
      setActiveCount(prev => prev + 1);
      if (uploaded.fileType?.startsWith('image/')) setImageCount(prev => prev + 1);
      else if (uploaded.fileType?.startsWith('video/')) setVideoCount(prev => prev + 1);
      fetchStorage();


      setTimeout(() => {
        setUploadQueue(prev => prev.filter(item => item.id !== uploadId));
      }, 3000);

    } catch (err: any) {
      console.error('Parallel Upload error:', err);
      if (handleAuthError(err)) return;
      
      const msg = err.response?.data?.message || err.message || 'Failed to upload media';
      
      setUploadQueue(prev => prev.map(item => 
        item.id === uploadId ? { ...item, status: 'failed' as UploadStatus } : item
      ));

      // Add failed attempt to history
      setUploadHistory(prev => [{
        id: uploadId,
        name: file.name,
        status: 'failed' as UploadStatus,
        progress: 0,
        timestamp: new Date()
      }, ...prev]);

      console.error('Upload error for', file.name, msg);
      
      setTimeout(() => {
        setUploadQueue(prev => prev.filter(item => item.id !== uploadId));
      }, 6000);
    }
  };

  const handleFilesSelect = (files: File[]) => {
    files.forEach(file => uploadFile(file));
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/gallery/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Delete failed');
      const deletedItem = media.find(m => m._id === id);
      setMedia(prev => prev.filter(m => m._id !== id));
      setActiveCount(prev => prev - 1);
      if (deletedItem?.fileType.startsWith('image/')) setImageCount(prev => prev - 1);
      else if (deletedItem?.fileType.startsWith('video/')) setVideoCount(prev => prev - 1);
      setTrashCount(prev => prev + 1);
      fetchStorage();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/gallery/${id}/restore`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Restore failed');
      const restoredItem = media.find(m => m._id === id);
      setMedia(prev => prev.filter(m => m._id !== id));
      setTrashCount(prev => prev - 1);
      setActiveCount(prev => prev + 1);
      if (restoredItem?.fileType.startsWith('image/')) setImageCount(prev => prev + 1);
      else if (restoredItem?.fileType.startsWith('video/')) setVideoCount(prev => prev + 1);
      fetchStorage();
    } catch (err) {
      console.error('Restore failed', err);
    }
  };

  const handlePermanentDelete = async (id: string | string[], isBulkAction = false) => {
    // Only allow if in trash mode
    if (filterType !== 'trash' && !isBulkAction) return;
    
    const idsToDelete = Array.isArray(id) ? id : [id];
    
    const performDelete = async () => {
      try {
        await Promise.all(idsToDelete.map(itemId => 
          fetch(`${API_BASE}/gallery/${itemId}/permanent`, {
            method: 'DELETE',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'google-access-token': googleAccessToken || ''
            }
          })
        ));
        
        setMedia(prev => prev.filter(m => !idsToDelete.includes(m._id)));
        setTrashCount(prev => prev - idsToDelete.length);
        fetchStorage();
      } catch (err) {
        console.error('Permanent delete failed', err);
        throw err;
      }
    };

    setConfirmConfig({
      title: isBulkAction ? 'Empty Recycle Bin?' : 'Delete Forever?',
      message: isBulkAction 
        ? `You are about to permanently destroy ${idsToDelete.length} items from your Google Drive. This cannot be undone.`
        : 'This will permanently remove the file from your Google Drive storage.',
      onConfirm: performDelete,
      isBulk: isBulkAction
    });
    setIsConfirmModalOpen(true);
  };

  // Batch Selection Handlers
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      
      if (next.size === 0) setIsSelectionMode(false);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    const count = selectedIds.size;
    const idsToMove = Array.from(selectedIds);
    
    try {
      // Parallel soft-delete
      await Promise.all(idsToMove.map(id => 
        fetch(`${API_BASE}/gallery/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ));

      setMedia(prev => prev.filter(m => !selectedIds.has(m._id)));
      setActiveCount(prev => prev - idsToMove.length);
      setTrashCount(prev => prev + idsToMove.length);
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      fetchStorage();
    } catch (err) {
      console.error('Bulk delete failed', err);
    }
  };

  const handleRename = (id: string, currentName: string) => {
    setMediaToRename({ id, name: currentName });
    setIsRenameModalOpen(true);
  };

  const performRename = async (newName: string) => {
    if (!mediaToRename || !token) return;

    try {
      const res = await fetch(`${API_BASE}/gallery/${mediaToRename.id}/rename`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'google-access-token': googleAccessToken || ''
        },
        body: JSON.stringify({ newName })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Rename failed on server');
      }
      
      setMedia(prev => prev.map(m => m._id === mediaToRename.id ? { ...m, fileName: newName } : m));
    } catch (err: any) {
      console.error('[Rename Frontend Error]', err);
      throw err; // Propagate to modal to handle loading state
    }
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // In trash mode, we show everything that's trashed (no sub-filtering for simplicity, or we can add it)
    if (filterType === 'trash') return matchesSearch;

    const matchesType = filterType === 'all' || 
                       (filterType === 'image' && item.fileType.startsWith('image/')) ||
                       (filterType === 'video' && item.fileType.startsWith('video/'));
    return matchesSearch && matchesType;
  });

  // Navigation handlers for MediaViewer
  const handleViewNext = () => {
    if (selectedMediaIndex === null) return;
    setSelectedMediaIndex((selectedMediaIndex + 1) % filteredMedia.length);
  };

  const handleViewPrev = () => {
    if (selectedMediaIndex === null) return;
    setSelectedMediaIndex((selectedMediaIndex - 1 + filteredMedia.length) % filteredMedia.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedMediaIndex === null) return;
      if (e.key === 'ArrowRight') handleViewNext();
      if (e.key === 'ArrowLeft') handleViewPrev();
      if (e.key === 'Escape') setSelectedMediaIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMediaIndex]);

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col relative z-10 bg-white dark:bg-neutral-900 px-4 sm:px-5 md:px-6 pb-32 sm:pb-32 md:pb-12 min-h-full">

      {/* No Google Drive Connection Banner */}
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

      {/* ── Header ───────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl pt-4 sm:pt-5 md:pt-6 pb-4 sm:pb-6 -mx-4 px-4 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 flex flex-col mb-4 sm:mb-6 mt-0">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white leading-tight tracking-tight">Documents</h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-0.5 sm:mt-1">Store and manage your important documents</p>
          </div>
          <div className="flex items-center gap-3">
            <UploadActivityCenter 
              isOpen={isActivityOpen} 
              onClose={() => setIsActivityOpen(false)} 
              queue={uploadQueue}
              history={uploadHistory}
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 sm:gap-3 mt-2">
          <div className="flex-1 min-w-0">
            <StyledWrapper>
              <div className="container-input">
                <input 
                  type="text" 
                  placeholder="Search" 
                  name="text" 
                  className="input" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg fill="currentColor" className="text-neutral-400 dark:text-neutral-500" width="16px" height="16px" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
                  <path d="M790.588 1468.235c-373.722 0-677.647-303.924-677.647-677.647 0-373.722 303.925-677.647 677.647-677.647 373.723 0 677.647 303.925 677.647 677.647 0 373.723-303.924 677.647-677.647 677.647Zm596.781-160.715c120.396-138.692 193.807-319.285 193.807-516.932C1581.176 354.748 1226.428 0 790.588 0S0 354.748 0 790.588s354.748 790.588 790.588 790.588c197.647 0 378.24-73.411 516.932-193.807l516.028 516.142 79.963-79.963-516.142-516.028Z" fillRule="evenodd" />
                </svg>
              </div>
            </StyledWrapper>
          </div>
          <button 
            onClick={() => setIsCreateFolderModalOpen(true)}
            className="h-9 sm:h-10 px-3 sm:px-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl flex items-center justify-center border border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 active:scale-95 transition-all shrink-0 gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <FolderPlus size={16} />
            <span className="text-xs sm:text-sm font-semibold hidden md:inline">Add Folder</span>
          </button>
          <button className="w-9 h-9 sm:w-10 sm:h-10 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl flex items-center justify-center border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 active:scale-95 transition-all shrink-0">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>


      {/* ── Categories Grid ──────────────────────── */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mb-3 sm:mb-4">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {[
            { icon: IdCard, color: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400', name: 'Government ID', count: docCounts['Government ID'] || 0, path: '/documents/government-id' },
            { icon: Building2, color: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400', name: 'Bank & Finance', count: docCounts['Bank & Finance'] || 0, path: '/documents/bank-finance' },
            { icon: ShieldCheck, color: 'bg-purple-50 text-purple-500 dark:bg-purple-500/10 dark:text-purple-400', name: 'Insurance', count: docCounts['Insurance'] || 0, path: '/documents/insurance' },
            { icon: GraduationCap, color: 'bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400', name: 'Education', count: docCounts['Education'] || 0, path: '/documents/education' },
            { icon: SquareActivity, color: 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400', name: 'Health', count: docCounts['Health'] || 0, path: '/documents/health' },
            { icon: Layers, color: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400', name: 'Other', count: docCounts['Other'] || 0, path: '/documents/other' },
          ].map((cat, i) => (
            <div 
              key={i} 
              onClick={() => navigate(cat.path)}
              className="bg-white dark:bg-neutral-800 rounded-xl sm:rounded-3xl p-2.5 sm:p-5 border border-neutral-100 dark:border-neutral-700 flex flex-row sm:flex-col items-center sm:justify-center text-left sm:text-center cursor-pointer hover:shadow-sm transition-all active:scale-95 gap-3 sm:gap-0"
            >
              <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0 sm:mb-3 ${cat.color}`}>
                <cat.icon className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white mb-0 sm:mb-1 truncate">{cat.name}</h3>
                <p className="text-[10px] sm:text-xs text-neutral-400 truncate">{cat.count} docs</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── My Files Grid ──────────────────────── */}
      {customFolders.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white mb-3 sm:mb-4">My Files</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {customFolders.map((cf, i) => (
              <FolderCard 
                key={cf._id || i}
                cf={cf}
                docCount={docCounts[cf.name] || 0}
                onClick={() => navigate(cf.path || `/vault/${cf.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
                onLongPress={() => {
                  setSelectedFolder(cf);
                  setIsFolderSheetOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      )}


      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 animate-pulse">
          <Loader2 size={32} className="text-amber-500 animate-spin mb-4" />
          <p className="text-neutral-500 text-sm font-medium">Syncing vault...</p>
        </div>
      ) : filteredMedia.length > 0 ? (
        <>
          {/* ── Recent Documents ───────────────────────── */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Recent Documents</h2>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">See all</button>
          </div>
          <div className="flex flex-col gap-3 mb-8">
          <AnimatePresence mode="popLayout">
            {filteredMedia.map((item, index) => (
              <DocumentListCard 
                key={item._id} 
                media={item} 
                onDelete={handleDelete} 
                onRename={handleRename}
                onSelect={() => {
                  if (isSelectionMode) toggleSelection(item._id);
                  else setSelectedMediaIndex(index);
                }}
                isSelected={selectedIds.has(item._id)}
                isSelectionMode={isSelectionMode}
                onToggleSelect={() => toggleSelection(item._id)}
                onLongPress={() => {
                  if (!isSelectionMode) {
                    setIsSelectionMode(true);
                    toggleSelection(item._id);
                  }
                }}
              />
            ))}
          </AnimatePresence>
          </div>
        </>
      ) : searchQuery ? (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="py-16 flex flex-col items-center justify-center text-center px-4 bg-white dark:bg-neutral-800 rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-700 mb-8"
        >
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-4">
            <ImagePlaceholder size={24} className="text-neutral-400" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
            No matches found
          </h2>
          <p className="text-sm text-neutral-500">
            Try searching for something else.
          </p>
        </motion.div>
      ) : null}



      {/* Animated Upload FAB */}
      <MediaUploadFAB 
        onFilesSelect={handleFilesSelect} 
      />

      {/* Professional Rename Modal */}
      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        onRename={performRename}
        currentName={mediaToRename?.name || ''}
      />

      {/* Media Viewer Modal */}
      <AnimatePresence>
        {selectedMediaIndex !== null && filteredMedia[selectedMediaIndex] && (
          <MediaViewer
            media={filteredMedia[selectedMediaIndex]}
            onClose={() => setSelectedMediaIndex(null)}
            onNext={handleViewNext}
            onPrev={handleViewPrev}
            onRename={handleRename}
          />
        )}
      </AnimatePresence>

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onCreate={handleCreateFolder}
      />

      <FolderActionsSheet
        isOpen={isFolderSheetOpen}
        onClose={() => setIsFolderSheetOpen(false)}
        folder={selectedFolder}
        onOpenFolder={(f) => navigate(f.path || `/vault/${f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
        onRename={() => {
          setIsRenameFolderModalOpen(true);
        }}
        onDelete={handleDeleteFolder}
      />

      <RenameFolderModal
        isOpen={isRenameFolderModalOpen}
        onClose={() => setIsRenameFolderModalOpen(false)}
        folder={selectedFolder}
        onRename={handleRenameFolder}
      />

      {/* Delete Confirmation Modal */}
      {confirmConfig && (
        <ConfirmDeleteModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
          isBulk={confirmConfig.isBulk}
        />
      )}

      {/* Selection Action Bar (Floating) */}
      <AnimatePresence>
        {isSelectionMode && selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 100, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 100, x: '-50%', opacity: 0 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] min-w-[320px] max-w-[90vw] glass-panel rounded-3xl border border-white/20 shadow-2xl p-4 flex items-center justify-between gap-6"
          >
            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 bg-primary/20 text-primary rounded-2xl flex items-center justify-center font-bold">
                {selectedIds.size}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-on-surface">Items Selected</span>
                <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Batch Actions</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedIds(new Set());
                  setIsSelectionMode(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-6 py-2 bg-error text-white rounded-xl text-xs font-bold shadow-lg shadow-error/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <Trash2 size={14} />
                Move to Trash
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const StyledWrapper = styled.div`
  flex: 1;

  .container-input {
    position: relative;
  }

  .input {
    width: 100%;
    max-width: 150px;
    padding: 6px 10px 6px 36px;
    font-size: 14px;
    font-weight: 300;
    border-radius: 9999px;
    border: solid 1px var(--tw-border-neutral-300, #d4d4d8);
    transition: all .2s ease-in-out;
    outline: none;
    opacity: 0.8;
    background-color: transparent;
    color: inherit;
  }

  .container-input svg {
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translate(0, -50%);
  }

  .input:focus {
    opacity: 1;
    max-width: 250px;
  }

  @media (prefers-color-scheme: dark) {
    .input {
      border-color: #525252;
    }
  }
`;
