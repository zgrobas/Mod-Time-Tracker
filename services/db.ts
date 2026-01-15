
const DB_NAME = 'MODTrackerDB';
const DB_VERSION = 1;

export class DBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('userId', 'userId', { unique: false });
        }
        if (!db.objectStoreNames.contains('logs')) {
          const logStore = db.createObjectStore('logs', { keyPath: 'id' });
          logStore.createIndex('userId', 'userId', { unique: false });
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  // --- Operaciones de Usuario ---
  async getUsers(): Promise<any[]> {
    return this.getAll('users');
  }

  async saveUser(user: any): Promise<void> {
    return this.put('users', user);
  }

  // --- Operaciones de Proyectos ---
  async getProjects(userId: string): Promise<any[]> {
    return this.getAllByIndex('projects', 'userId', userId);
  }

  async saveProject(project: any): Promise<void> {
    return this.put('projects', project);
  }

  async deleteProject(id: string): Promise<void> {
    return this.delete('projects', id);
  }

  // --- Operaciones de Logs ---
  async getLogs(userId: string): Promise<any[]> {
    return this.getAllByIndex('logs', 'userId', userId);
  }

  async saveLog(log: any): Promise<void> {
    return this.put('logs', log);
  }

  // --- Helpers de bajo nivel ---
  private async put(storeName: string, item: any): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    });
  }

  private async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    });
  }

  private async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e);
    });
  }

  private async getAllByIndex(storeName: string, indexName: string, value: any): Promise<any[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readonly');
      const index = tx.objectStore(storeName).index(indexName);
      const request = index.getAll(IDBKeyRange.only(value));
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e);
    });
  }
}

export const db = new DBService();
