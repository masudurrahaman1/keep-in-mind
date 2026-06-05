import Dexie, { Table } from 'dexie';

export type SyncStatus = 'synced' | 'pending' | 'deleted' | 'error';

export interface Note {
  _id: string; 
  title: string;
  content: string;
  type?: string;
  category?: string;
  pinned?: boolean;
  archived?: boolean;
  trashed?: boolean;
  color?: string;
  textColor?: string;
  date?: string;
  tags?: string[];
  colorClass?: string;
  isPinned?: boolean;
  folderId?: string | null;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export interface Folder {
  _id: string;
  name: string;
  colorClass?: string;
  iconName?: string;
  isSystem?: boolean;
  path?: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export interface Document {
  _id: string;
  title: string;
  mimeType: string;
  size: number;
  category: string;
  thumbnailUrl?: string;
  fileData?: ArrayBuffer; 
  updatedAt: string;
  syncStatus: SyncStatus;
}

export interface Reminder {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  completed?: boolean;
  relatedDocumentId?: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export interface SyncQueueItem {
  id?: number; 
  action: 'create' | 'update' | 'delete';
  entityType: 'note' | 'folder' | 'document' | 'reminder';
  entityId: string;
  payload?: any;
  timestamp: string;
  retryCount: number;
}

export class KeepInMindDB extends Dexie {
  notes!: Table<Note, string>;
  folders!: Table<Folder, string>;
  documents!: Table<Document, string>;
  reminders!: Table<Reminder, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('KeepInMindDB_v2');
    this.version(1).stores({
      notes: '_id, updatedAt, syncStatus, folderId',
      folders: '_id, name, isSystem, updatedAt, syncStatus',
      documents: '_id, category, updatedAt, syncStatus',
      reminders: '_id, dueDate, completed, updatedAt, syncStatus',
      syncQueue: '++id, action, entityType, entityId, timestamp'
    });
  }
}

export const db = new KeepInMindDB();
