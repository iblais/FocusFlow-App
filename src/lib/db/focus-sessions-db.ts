/**
 * IndexedDB storage for offline focus sessions
 * Stores session data locally for sync when online
 */

export interface FocusSessionRecord {
  id?: number;
  userId?: string;
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  mode: 'focus' | 'short-break' | 'long-break';
  distractionCount: number;
  breathingRate?: number;
  stressLevel?: 'low' | 'medium' | 'high';
  xpEarned: number;
  powerUpsUsed: string[];
  bossBattleWon?: boolean;
  synced: boolean;
  createdAt: number;
}

const DB_NAME = 'focusflow-db';
const DB_VERSION = 1;
const STORE_NAME = 'focus-sessions';

class FocusSessionsDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: true,
          });

          // Create indexes
          objectStore.createIndex('userId', 'userId', { unique: false });
          objectStore.createIndex('startTime', 'startTime', { unique: false });
          objectStore.createIndex('synced', 'synced', { unique: false });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async addSession(session: Omit<FocusSessionRecord, 'id'>): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(session);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getSession(id: number): Promise<FocusSessionRecord | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllSessions(): Promise<FocusSessionRecord[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedSessions(): Promise<FocusSessionRecord[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('synced');
      const results: FocusSessionRecord[] = [];

      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          if (cursor.value.synced === false) {
            results.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async updateSession(id: number, updates: Partial<FocusSessionRecord>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const session = getRequest.result;
        if (!session) {
          reject(new Error('Session not found'));
          return;
        }

        const updatedSession = { ...session, ...updates };
        const updateRequest = store.put(updatedSession);

        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async markAsSynced(id: number): Promise<void> {
    return this.updateSession(id, { synced: true });
  }

  async deleteSession(id: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSessionsByDateRange(startDate: Date, endDate: Date): Promise<FocusSessionRecord[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('startTime');
      const range = IDBKeyRange.bound(startDate.getTime(), endDate.getTime());
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getTotalFocusTime(): Promise<number> {
    const sessions = await this.getAllSessions();
    return sessions
      .filter((s) => s.mode === 'focus')
      .reduce((total, session) => total + session.duration, 0);
  }

  async getStats() {
    const sessions = await this.getAllSessions();
    const focusSessions = sessions.filter((s) => s.mode === 'focus');

    return {
      totalSessions: focusSessions.length,
      totalFocusTime: focusSessions.reduce((sum, s) => sum + s.duration, 0),
      totalXP: sessions.reduce((sum, s) => sum + s.xpEarned, 0),
      averageDistractions:
        focusSessions.reduce((sum, s) => sum + s.distractionCount, 0) / focusSessions.length || 0,
      bossBattlesWon: sessions.filter((s) => s.bossBattleWon).length,
      unsyncedCount: sessions.filter((s) => !s.synced).length,
    };
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
export const focusSessionsDB = new FocusSessionsDB();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  focusSessionsDB.init().catch(console.error);
}
