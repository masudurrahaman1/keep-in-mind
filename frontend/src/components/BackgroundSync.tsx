import { useEffect, useState } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import { useSync } from '../hooks/useSync';
import { syncService } from '../services/syncService';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export default function BackgroundSync() {
  useSync();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const pendingCount = useLiveQuery(() => db.syncQueue.count(), []) || 0;

  useEffect(() => {
    syncService.init();

    const handleOnline = () => {
      setIsOnline(true);
      syncService.syncAll();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-md border ${
        !isOnline 
          ? 'bg-neutral-900/90 border-neutral-700 text-neutral-200' 
          : 'bg-amber-500/90 border-amber-400 text-white'
      }`}>
        {!isOnline ? (
          <>
            <CloudOff size={16} />
            <span className="text-xs font-medium">Offline Mode</span>
            {pendingCount > 0 && (
              <span className="text-[10px] ml-1 opacity-70">({pendingCount} pending)</span>
            )}
          </>
        ) : (
          <>
            <RefreshCw size={16} className="animate-spin" />
            <span className="text-xs font-medium">Syncing...</span>
          </>
        )}
      </div>
    </div>
  );
}
