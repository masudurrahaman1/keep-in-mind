import { db } from '../db/database';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface RequestOptions extends RequestInit {
  skipQueue?: boolean;
}

export const apiService = {
  async request(endpoint: string, method: string = 'GET', body: any = null, options: RequestOptions = {}) {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const isOffline = !navigator.onLine;

    // Handle offline mutations
    if (isOffline && method !== 'GET' && !options.skipQueue) {
      console.log(`[Offline] Queuing ${method} request to ${endpoint}`);
      
      let entityType = '';
      if (endpoint.includes('/notes')) entityType = 'note';
      else if (endpoint.includes('/folders')) entityType = 'folder';
      else if (endpoint.includes('/documents')) entityType = 'document';
      else if (endpoint.includes('/reminders')) entityType = 'reminder';

      let action: 'create' | 'update' | 'delete' = 'create';
      if (method === 'PATCH' || method === 'PUT') action = 'update';
      if (method === 'DELETE') action = 'delete';

      // Simple extraction of entityId from endpoint
      const parts = endpoint.split('/');
      const entityId = parts.length > 2 ? parts[parts.length - 1] : body?._id || `local_${Date.now()}`;

      await db.syncQueue.add({
        action,
        entityType: entityType as any,
        entityId,
        payload: body,
        timestamp: new Date().toISOString(),
        retryCount: 0
      });

      // Return a mock successful response to keep UI optimistic
      return { _id: entityId, ...body, syncStatus: 'pending' };
    }

    // Perform actual network request
    const config: RequestInit = {
      method,
      headers,
      ...options
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (!navigator.onLine && method === 'GET') {
        throw new Error('Offline and no cached response available');
      }
      throw error;
    }
  }
};
