import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, CreditCard, Landmark, ShieldCheck, GraduationCap, Activity, Plus, Search, MoreVertical, LayoutGrid, List
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import CreateFolderModal from '../modals/CreateFolderModal';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { apiService } from '../services/apiService';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Documents() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [documentCounts, setDocumentCounts] = useState<Record<string, number>>({});

  const iconMap: Record<string, any> = {
    'CreditCard': CreditCard,
    'Landmark': Landmark,
    'ShieldCheck': ShieldCheck,
    'GraduationCap': GraduationCap,
    'Activity': Activity,
    'Folder': Folder
  };

  const liveFolders = useLiveQuery(() => db.folders.filter(f => f.syncStatus !== 'deleted').toArray(), []) || [];

  useEffect(() => {
    if (liveFolders.length > 0 || !navigator.onLine) {
      setFolders(liveFolders.map(f => ({...f, id: f._id})));
      setLoading(false);
    }
  }, [liveFolders]);

  useEffect(() => {
    fetchFolders();
    fetchCounts();
  }, [token]);

  const fetchFolders = async () => {
    if (!token || !navigator.onLine) return;
    try {
      const data = await apiService.request('/folders');
      if (data && Array.isArray(data)) {
        await db.folders.bulkPut(data.map((f: any) => ({ ...f, syncStatus: 'synced', _id: f._id })));
        setFolders(data);
      }
    } catch (err) {
      console.error('Failed to fetch folders', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/documents/metrics/counts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocumentCounts(data);
      }
    } catch (err) {
      console.error('Failed to fetch document counts', err);
    }
  };

  const handleCreateFolder = async (name: string, colorClass: string) => {
    try {
      const folderData = { name, colorClass, iconName: 'Folder' };
      const res = await apiService.request('/folders', 'POST', folderData);
      const folderIdStr = res._id || res.id;
      await db.folders.put({ ...res, ...folderData, syncStatus: navigator.onLine ? 'synced' : 'pending', updatedAt: new Date().toISOString(), _id: folderIdStr });
      setFolders(prev => [{ ...res, ...folderData, _id: folderIdStr }, ...prev]);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create folder', err);
    }
  };

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const systemFolders = filteredFolders.filter(f => f.isSystem);
  const customFolders = filteredFolders.filter(f => !f.isSystem);

  const renderFolderCard = (folder: any) => {
    const Icon = iconMap[folder.iconName] || Folder;
    const count = documentCounts[folder.name] || 0;
    
    return (
      <motion.div
        key={folder._id}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(folder.path)}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-xl transition-all duration-300 ${viewMode === 'list' ? 'flex items-center p-3 gap-4' : 'flex flex-col p-5'}`}
      >
        <div className={`shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl ${folder.colorClass || 'bg-blue-50 text-blue-500'} ${viewMode === 'list' ? 'w-12 h-12' : 'w-14 h-14 mb-4'}`}>
          <Icon size={viewMode === 'list' ? 20 : 24} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 truncate text-sm sm:text-base">
            {folder.name}
          </h3>
          <p className="text-[11px] sm:text-xs text-neutral-500 font-medium mt-0.5 flex items-center gap-1.5">
            {count} {count === 1 ? 'item' : 'items'}
            {folder.isSystem && <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[9px] uppercase tracking-wider">Default</span>}
          </p>
        </div>

        {viewMode === 'list' && (
          <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full">
            <MoreVertical size={16} className="text-neutral-500" />
          </button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col relative z-10 px-4 py-6 sm:p-6 pb-32 min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-neutral-50/90 dark:bg-black/90 backdrop-blur-xl pt-2 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 flex flex-col mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Documents</h1>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Folder</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-neutral-200 dark:border-neutral-800 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
            <Search size={18} className="text-neutral-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium w-full text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400"
            />
          </div>
          <div className="flex bg-white dark:bg-neutral-900 rounded-2xl p-1 shadow-sm border border-neutral-200 dark:border-neutral-800 shrink-0 self-end sm:self-auto">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader /></div>
      ) : (
        <div className="space-y-8">
          {systemFolders.length > 0 && (
            <section>
              <h2 className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4 px-2">System Folders</h2>
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4' : 'flex flex-col gap-3'}>
                {systemFolders.map(renderFolderCard)}
              </div>
            </section>
          )}

          {customFolders.length > 0 && (
            <section>
              <h2 className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-4 px-2 mt-4">Your Folders</h2>
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4' : 'flex flex-col gap-3'}>
                {customFolders.map(renderFolderCard)}
              </div>
            </section>
          )}

          {filteredFolders.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Folder size={24} className="text-neutral-400" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">No folders found</h3>
              <p className="text-neutral-500 text-sm mt-1">Try adjusting your search query.</p>
            </div>
          )}
        </div>
      )}

      <CreateFolderModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateFolder} />
    </div>
  );
}
