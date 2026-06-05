import { db } from '../db/database';
import { apiService } from './apiService';

export class SyncService {
  private isSyncing = false;

  async init() {
    window.addEventListener('online', () => this.syncAll());
    // Try to sync initially if online
    if (navigator.onLine) {
      this.syncAll();
    }
  }

  async syncAll() {
    if (this.isSyncing || !navigator.onLine) return;
    this.isSyncing = true;
    console.log('[SyncService] Starting background sync...');

    try {
      const pendingItems = await db.syncQueue.orderBy('timestamp').toArray();
      
      for (const item of pendingItems) {
        try {
          await this.processItem(item);
          // If successful, remove from queue
          if (item.id) {
            await db.syncQueue.delete(item.id);
          }
        } catch (error) {
          console.error(`[SyncService] Error processing item ${item.id}:`, error);
          // Update retry count
          if (item.id) {
            await db.syncQueue.update(item.id, {
              retryCount: (item.retryCount || 0) + 1
            });
          }
          // Break the loop on network failure to avoid cascading errors,
          // but continue on validation errors (e.g. 400 Bad Request)
          if (error instanceof TypeError || error.message.includes('Network')) {
             break; 
          }
        }
      }
    } catch (error) {
      console.error('[SyncService] Sync failed:', error);
    } finally {
      this.isSyncing = false;
      console.log('[SyncService] Background sync finished.');
    }
  }

  private async processItem(item: any) {
    const { action, entityType, entityId, payload } = item;

    if (entityType === 'document' && action === 'create') {
      // Offline document upload handling
      const doc = await db.documents.get(entityId);
      if (doc && doc.fileData) {
        const file = new File([doc.fileData], doc.title, { type: doc.mimeType });
        const formData = new FormData();
        formData.append('file', file);
        const googleToken = localStorage.getItem('googleToken');
        if (googleToken) {
           formData.append('googleAccessToken', googleToken);
        }

        const API_BASE = import.meta.env.VITE_API_URL || '/api';
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE}/gallery/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to upload document');
        }

        // Clean up raw binary data from IndexedDB to save space
        await db.documents.update(entityId, { fileData: undefined, syncStatus: 'synced' });
      }
      return;
    }

    let endpoint = '';
    
    // Map entity types to endpoints
    switch (entityType) {
      case 'note': endpoint = '/notes'; break;
      case 'folder': endpoint = '/folders'; break;
      case 'document': endpoint = '/documents'; break;
      case 'reminder': endpoint = '/reminders'; break;
      default: throw new Error(`Unknown entity type: ${entityType}`);
    }

    if (action === 'create') {
      // Omit _id if it's a locally generated uuid to let backend assign one, 
      // OR send it so backend uses it.
      await apiService.request(endpoint, 'POST', payload, { skipQueue: true });
    } else if (action === 'update') {
      await apiService.request(`${endpoint}/${entityId}`, 'PATCH', payload, { skipQueue: true });
    } else if (action === 'delete') {
      await apiService.request(`${endpoint}/${entityId}`, 'DELETE', null, { skipQueue: true });
    }

    // Mark local entity as synced
    const table = (db as any)[`${entityType}s`];
    if (table) {
      await table.update(entityId, { syncStatus: 'synced' });
    }
  }
}

export const syncService = new SyncService();
