import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CloudCog, RefreshCw, Database, HardDrive, Trash2, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { linkGoogleAccount } from '../services/authService';
import { AlertCircle, LogIn } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

interface StorageData {
  totalBytes: number;
  usedBytes: number;
  driveBytes: number;
  trashBytes: number;
  appUsedBytes: number;
  appFileCount: number;
  freeBytes: number;
  isUnlimited?: boolean;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getPercent(used: number, total: number): number {
  if (!total) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

interface SegmentProps {
  label: string;
  bytes: number;
  total: number;
  color: string;
}

function StorageSegment({ label, bytes, total, color }: SegmentProps) {
  const pct = getPercent(bytes, total);
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full shrink-0 ${color}`} />
      <div className="flex-1">
        <div className="flex justify-between text-xs text-on-surface-variant mb-1">
          <span className="font-semibold">{label}</span>
          <span>{formatBytes(bytes)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-on-surface/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${color}`}
          />
        </div>
      </div>
    </div>
  );
}

export default function DriveStorageCard() {
  const { token, googleAccessToken, updateGoogleToken, clearGoogleToken } = useAuth();
  const [storage, setStorage] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  const fetchStorage = async () => {
    if (!googleAccessToken || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/drive/storage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ googleAccessToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401 || (data.message && data.message.includes('401'))) {
          setError('AUTH_EXPIRED');
          return;
        }
        const msg = data?.error || data?.message || 'Server error';
        if (msg.includes('403') || msg.includes('insufficient')) setError('ACCESS_DENIED');
        else setError(`Could not load storage info: ${msg}`);
        return;
      }
      setStorage(data);
    } catch (e: any) {
      setError('NETWORK_ERROR');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (googleAccessToken) fetchStorage();
    else {
      setStorage(null);
      setError('');
    }
  }, [googleAccessToken, token]);

  const handleReconnect = async () => {
    setIsRefreshingToken(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const googleToken = credential?.accessToken;
      if (!googleToken) throw new Error('Failed to obtain Google access token.');
      const idToken = await result.user.getIdToken();
      const data = await linkGoogleAccount(idToken, token!);
      updateGoogleToken(googleToken, data.user);
    } catch (err: any) {
      setError(`Connection failed: ${err.message}`);
    } finally {
      setIsRefreshingToken(false);
    }
  };

  const isConnected = !!googleAccessToken && !error;
  const usedPct = storage ? getPercent(storage.usedBytes, storage.totalBytes) : 0;
  const appPct  = storage ? getPercent(storage.appUsedBytes, storage.totalBytes) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl group"
    >
      {/* Background Blobs for consistency with other profile cards */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3" />

      <div className="p-4 sm:p-5 lg:p-6 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isConnected ? 'bg-primary/20 text-primary shadow-primary/10' : 'bg-on-surface/5 text-on-surface-variant'}`}>
              <CloudCog size={26} className={loading ? 'animate-spin' : ''} />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-on-surface text-lg sm:text-xl tracking-tight">
                {isConnected ? 'Google Drive Storage' : 'Connect Google Drive'}
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant font-medium">Keep In Mind cloud backup</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isConnected && (
              <>
                <button
                  onClick={fetchStorage}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-on-surface-variant disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={clearGoogleToken}
                  className="px-4 py-2 rounded-xl bg-error/10 hover:bg-error/20 text-error text-xs font-bold transition-all border border-error/10"
                >
                  Disconnect
                </button>
              </>
            )}
          </div>
        </div>

        {/* State Content */}
        {!isConnected ? (
          <div className="py-6 sm:py-8 text-center flex flex-col items-center">
             <div className="mb-6 p-4 rounded-3xl bg-white/5 border border-white/5 max-w-sm">
                <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                  Securely sync your professional workspace, archived notes, and profile data to your personal Google Drive.
                </p>
             </div>
             <button
                onClick={handleReconnect}
                disabled={isRefreshingToken}
                className="group relative flex items-center gap-3 px-8 py-3.5 bg-primary text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 overflow-hidden"
             >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <LogIn size={20} />
                <span>{isRefreshingToken ? 'Connecting...' : 'Connect Drive Now'}</span>
             </button>
          </div>
        ) : error && error !== 'AUTH_EXPIRED' ? (
          <div className="bg-error/10 rounded-2xl p-4 border border-error/20 mb-2">
            <div className="flex gap-3 text-sm text-error font-medium">
               <AlertCircle size={18} className="shrink-0" />
               <p>{error === 'ACCESS_DENIED' ? 'Insufficient Drive permissions.' : error}</p>
            </div>
          </div>
        ) : error === 'AUTH_EXPIRED' ? (
           <div className="py-6 text-center">
              <AlertCircle size={40} className="text-primary mx-auto mb-4 opacity-50" />
              <h4 className="text-lg font-bold text-on-surface mb-2">Session Expired</h4>
              <p className="text-sm text-on-surface-variant mb-6 mx-auto max-w-xs">Your connection to Google Drive needs to be refreshed.</p>
              <button
                onClick={handleReconnect}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl mx-auto font-bold shadow-lg shadow-primary/20"
              >
                <RefreshCw size={16} /> Reconnect Now
              </button>
           </div>
        ) : storage ? (
          <div className="space-y-6">
            {/* Overall Progress */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <div className="space-y-0.5">
                  <span className="text-2xl font-heading font-black text-on-surface">{formatBytes(storage.usedBytes)}</span>
                  <span className="text-xs text-on-surface-variant font-bold ml-2">USED</span>
                </div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  {storage.isUnlimited ? 'Unlimited Capacity' : `${formatBytes(storage.totalBytes)} Total`}
                </span>
              </div>
              <div className="h-4 rounded-full bg-white/5 p-1 border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${usedPct}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-tertiary shadow-lg shadow-primary/20"
                />
              </div>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/card">
                 <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-primary">
                       <FileText size={16} />
                       <span className="text-xs font-bold uppercase tracking-wider">Storage Used</span>
                    </div>
                    <span className="text-sm font-black text-on-surface">{formatBytes(storage.appUsedBytes)}</span>
                 </div>
                 <div className="h-1 w-full bg-on-surface/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${appPct}%` }} />
                 </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-secondary">
                       <Database size={16} />
                       <span className="text-xs font-bold uppercase tracking-wider">Backup Size</span>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black text-on-surface">{storage.appFileCount} Files</p>
                       <p className="text-[10px] text-on-surface-variant font-medium">Archived in Cloud</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 flex justify-center">
             <div className="flex items-center gap-3 text-on-surface-variant font-bold animate-pulse">
                <RefreshCw size={20} className="animate-spin" />
                <span>Synchronizing...</span>
             </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
