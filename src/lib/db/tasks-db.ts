/**
 * IndexedDB for ADHD-Optimized Task Management
 * Offline-first task storage with sync capabilities
 */

import {
  TaskOfflineRecord,
  QuickCaptureOfflineRecord,
  KanbanCard,
  QuickCapture,
} from '@/types/adhd-task-system';

const DB_NAME = 'focusflow-tasks-db';
const DB_VERSION = 1;

// Store names
const STORES = {
  TASKS: 'tasks',
  QUICK_CAPTURES: 'quick-captures',
  TASK_TEMPLATES: 'task-templates',
  ENERGY_PATTERNS: 'energy-patterns',
} as const;

class TasksDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initPromise = this.init();
    }
  }

  private async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open TasksDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('TasksDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Tasks store
        if (!db.objectStoreNames.contains(STORES.TASKS)) {
          const tasksStore = db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
          tasksStore.createIndex('userId', 'data.userId', { unique: false });
          tasksStore.createIndex('boardColumn', 'data.boardColumn', { unique: false });
          tasksStore.createIndex('synced', 'synced', { unique: false });
          tasksStore.createIndex('lastModified', 'lastModified', { unique: false });
          tasksStore.createIndex('dueDate', 'data.dueDate', { unique: false });
          tasksStore.createIndex('priority', 'data.priority', { unique: false });
          tasksStore.createIndex('energyLevel', 'data.energyLevel', { unique: false });
        }

        // Quick captures store
        if (!db.objectStoreNames.contains(STORES.QUICK_CAPTURES)) {
          const capturesStore = db.createObjectStore(STORES.QUICK_CAPTURES, { keyPath: 'id' });
          capturesStore.createIndex('userId', 'data.userId', { unique: false });
          capturesStore.createIndex('synced', 'synced', { unique: false });
          capturesStore.createIndex('captureMethod', 'data.captureMethod', { unique: false });
          capturesStore.createIndex('capturedAt', 'data.capturedAt', { unique: false });
          capturesStore.createIndex('processed', 'data.processed', { unique: false });
        }

        // Task templates store
        if (!db.objectStoreNames.contains(STORES.TASK_TEMPLATES)) {
          const templatesStore = db.createObjectStore(STORES.TASK_TEMPLATES, { keyPath: 'id' });
          templatesStore.createIndex('userId', 'userId', { unique: false });
          templatesStore.createIndex('useCount', 'useCount', { unique: false });
          templatesStore.createIndex('lastUsed', 'lastUsed', { unique: false });
        }

        // Energy patterns store
        if (!db.objectStoreNames.contains(STORES.ENERGY_PATTERNS)) {
          const energyStore = db.createObjectStore(STORES.ENERGY_PATTERNS, { keyPath: 'id' });
          energyStore.createIndex('userId', 'userId', { unique: false });
          energyStore.createIndex('hourOfDay', 'hourOfDay', { unique: false });
          energyStore.createIndex('dayOfWeek', 'dayOfWeek', { unique: false });
          energyStore.createIndex('recordedAt', 'recordedAt', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (this.initPromise) {
      await this.initPromise;
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  // ===== TASK OPERATIONS =====

  async addTask(task: KanbanCard, userId: string): Promise<string> {
    const db = await this.ensureDB();
    const record: TaskOfflineRecord = {
      id: task.id,
      data: task,
      synced: false,
      lastModified: new Date(),
      changeLog: [{
        field: 'created',
        oldValue: null,
        newValue: task,
        timestamp: new Date(),
      }],
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.TASKS], 'readwrite');
      const store = transaction.objectStore(STORES.TASKS);
      const request = store.add(record);

      request.onsuccess = () => resolve(record.id);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTask(taskId: string, updates: Partial<KanbanCard>): Promise<void> {
    const db = await this.ensureDB();
    const existing = await this.getTask(taskId);

    if (!existing) {
      throw new Error(`Task ${taskId} not found`);
    }

    const updatedData = { ...existing.data, ...updates };
    const changeLogEntry = {
      field: 'multiple',
      oldValue: existing.data,
      newValue: updatedData,
      timestamp: new Date(),
    };

    const updatedRecord: TaskOfflineRecord = {
      ...existing,
      data: updatedData,
      synced: false,
      lastModified: new Date(),
      changeLog: [...existing.changeLog, changeLogEntry],
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.TASKS], 'readwrite');
      const store = transaction.objectStore(STORES.TASKS);
      const request = store.put(updatedRecord);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTask(taskId: string): Promise<TaskOfflineRecord | null> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.TASKS], 'readonly');
      const store = transaction.objectStore(STORES.TASKS);
      const request = store.get(taskId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTasks(userId: string): Promise<TaskOfflineRecord[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.TASKS], 'readonly');
      const store = transaction.objectStore(STORES.TASKS);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getTasksByColumn(userId: string, column: string): Promise<TaskOfflineRecord[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.TASKS], 'readonly');
      const store = transaction.objectStore(STORES.TASKS);
      const index = store.index('boardColumn');
      const request = index.getAll(column);

      request.onsuccess = () => {
        const tasks = (request.result || []).filter(
          (task) => task.data.userId === userId
        );
        resolve(tasks);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedTasks(): Promise<TaskOfflineRecord[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.TASKS], 'readonly');
      const store = transaction.objectStore(STORES.TASKS);
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async markTaskSynced(taskId: string): Promise<void> {
    const db = await this.ensureDB();
    const existing = await this.getTask(taskId);

    if (!existing) return;

    const updatedRecord: TaskOfflineRecord = {
      ...existing,
      synced: true,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.TASKS], 'readwrite');
      const store = transaction.objectStore(STORES.TASKS);
      const request = store.put(updatedRecord);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.TASKS], 'readwrite');
      const store = transaction.objectStore(STORES.TASKS);
      const request = store.delete(taskId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ===== QUICK CAPTURE OPERATIONS =====

  async addQuickCapture(capture: QuickCapture): Promise<string> {
    const db = await this.ensureDB();
    const record: QuickCaptureOfflineRecord = {
      id: capture.id,
      data: capture,
      synced: false,
      retryCount: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.QUICK_CAPTURES], 'readwrite');
      const store = transaction.objectStore(STORES.QUICK_CAPTURES);
      const request = store.add(record);

      request.onsuccess = () => resolve(record.id);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnprocessedCaptures(userId: string): Promise<QuickCaptureOfflineRecord[]> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.QUICK_CAPTURES], 'readonly');
      const store = transaction.objectStore(STORES.QUICK_CAPTURES);
      const index = store.index('processed');
      const request = index.getAll(false);

      request.onsuccess = () => {
        const captures = (request.result || []).filter(
          (capture) => capture.data.userId === userId
        );
        resolve(captures);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async markCaptureProcessed(captureId: string, taskId?: string): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.QUICK_CAPTURES], 'readwrite');
      const store = transaction.objectStore(STORES.QUICK_CAPTURES);
      const getRequest = store.get(captureId);

      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (!record) {
          reject(new Error('Capture not found'));
          return;
        }

        record.data.processed = true;
        record.data.processedAt = new Date();
        if (taskId) {
          record.data.convertedToTask = true;
          record.data.taskId = taskId;
        }
        record.synced = false;

        const putRequest = store.put(record);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // ===== BULK OPERATIONS =====

  async bulkUpdateTasks(updates: Array<{ id: string; data: Partial<KanbanCard> }>): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.TASKS], 'readwrite');
      const store = transaction.objectStore(STORES.TASKS);

      let completed = 0;
      const total = updates.length;

      updates.forEach(({ id, data }) => {
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
          const existing = getRequest.result;
          if (!existing) {
            completed++;
            if (completed === total) resolve();
            return;
          }

          const updatedRecord: TaskOfflineRecord = {
            ...existing,
            data: { ...existing.data, ...data },
            synced: false,
            lastModified: new Date(),
            changeLog: [...existing.changeLog, {
              field: 'bulk_update',
              oldValue: existing.data,
              newValue: { ...existing.data, ...data },
              timestamp: new Date(),
            }],
          };

          const putRequest = store.put(updatedRecord);
          putRequest.onsuccess = () => {
            completed++;
            if (completed === total) resolve();
          };
          putRequest.onerror = () => reject(putRequest.error);
        };

        getRequest.onerror = () => reject(getRequest.error);
      });
    });
  }

  async clearAllData(): Promise<void> {
    const db = await this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [STORES.TASKS, STORES.QUICK_CAPTURES, STORES.TASK_TEMPLATES, STORES.ENERGY_PATTERNS],
        'readwrite'
      );

      let completed = 0;
      const total = 4;

      const clearStore = (storeName: string) => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };
        request.onerror = () => reject(request.error);
      };

      clearStore(STORES.TASKS);
      clearStore(STORES.QUICK_CAPTURES);
      clearStore(STORES.TASK_TEMPLATES);
      clearStore(STORES.ENERGY_PATTERNS);
    });
  }

  // ===== STATS & ANALYTICS =====

  async getTaskStats(userId: string): Promise<{
    total: number;
    byColumn: Record<string, number>;
    byEnergy: Record<string, number>;
    unsynced: number;
    overdue: number;
  }> {
    const tasks = await this.getAllTasks(userId);
    const now = new Date();

    const stats = {
      total: tasks.length,
      byColumn: {} as Record<string, number>,
      byEnergy: {} as Record<string, number>,
      unsynced: tasks.filter(t => !t.synced).length,
      overdue: tasks.filter(t =>
        t.data.dueDate && new Date(t.data.dueDate) < now && t.data.boardColumn !== 'done'
      ).length,
    };

    tasks.forEach(task => {
      // Count by column
      const column = task.data.boardColumn || 'todo';
      stats.byColumn[column] = (stats.byColumn[column] || 0) + 1;

      // Count by energy
      const energy = task.data.energyLevel || 'MEDIUM';
      stats.byEnergy[energy] = (stats.byEnergy[energy] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const tasksDB = new TasksDB();
