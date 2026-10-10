// Native IndexedDB Service for ASHA-Saathi Offline Operation

const DB_NAME = 'asha_saathi_offline_db';
const DB_VERSION = 1;

export interface OfflineVisitDraft {
  id: string;
  personId: string;
  personName: string;
  transcript: string;
  symptoms: string[];
  condition: string;
  notes: string;
  timestamp: string;
  isSynced: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: 'VISIT' | 'REFERRAL';
  data: any;
  createdAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('draft_visits')) {
        db.createObjectStore('draft_visits', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const offlineStorage = {
  async saveDraftVisit(draft: OfflineVisitDraft): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('draft_visits', 'readwrite');
      tx.objectStore('draft_visits').put(draft);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getDraftVisits(): Promise<OfflineVisitDraft[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('draft_visits', 'readonly');
      const req = tx.objectStore('draft_visits').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async deleteDraftVisit(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('draft_visits', 'readwrite');
      tx.objectStore('draft_visits').delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async enqueueSync(item: SyncQueueItem): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      tx.objectStore('sync_queue').put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readonly');
      const req = tx.objectStore('sync_queue').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async clearSyncQueue(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('sync_queue', 'readwrite');
      tx.objectStore('sync_queue').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getEstimatedStorage(): Promise<{ draftsCount: number; queueCount: number; sizeFormatted: string }> {
    try {
      const drafts = await this.getDraftVisits();
      const queue = await this.getSyncQueue();
      // Estimate in KB/MB
      const roughBytes = JSON.stringify(drafts).length + JSON.stringify(queue).length + 12000000; // base app assets
      const sizeMb = (roughBytes / (1024 * 1024)).toFixed(1);
      return {
        draftsCount: drafts.length,
        queueCount: queue.length,
        sizeFormatted: `${sizeMb} MB`,
      };
    } catch {
      return { draftsCount: 0, queueCount: 0, sizeFormatted: '12.0 MB' };
    }
  },
};
