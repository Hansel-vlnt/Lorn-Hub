import { DynamicLawDataset, LawMetadata } from '../types/law';

const DB_NAME = 'LornHubOfflineDB';
const DB_VERSION = 1;
const STORE_DATASETS = 'datasets'; // Stores full DynamicLawDataset
const STORE_METADATA = 'metadata'; // Stores just LawMetadata for quick catalog listing

export class OfflineStorageService {
  private db: IDBDatabase | null = null;

  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_DATASETS)) {
          db.createObjectStore(STORE_DATASETS, { keyPath: 'metadata.id' });
        }
        if (!db.objectStoreNames.contains(STORE_METADATA)) {
          db.createObjectStore(STORE_METADATA, { keyPath: 'id' });
        }
      };
    });
  }

  public async saveDataset(dataset: DynamicLawDataset): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_DATASETS, STORE_METADATA], 'readwrite');
      
      const datasetsStore = transaction.objectStore(STORE_DATASETS);
      const metadataStore = transaction.objectStore(STORE_METADATA);
      
      const metaToSave = { ...dataset.metadata, statusDownload: 'cached-offline' };
      const datasetToSave = { ...dataset, metadata: metaToSave };

      datasetsStore.put(datasetToSave);
      metadataStore.put(metaToSave);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  public async getDataset(id: string): Promise<DynamicLawDataset | undefined> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_DATASETS], 'readonly');
      const store = transaction.objectStore(STORE_DATASETS);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async getAllMetadata(): Promise<LawMetadata[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_METADATA], 'readonly');
      const store = transaction.objectStore(STORE_METADATA);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async getAllDatasets(): Promise<DynamicLawDataset[]> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_DATASETS], 'readonly');
      const store = transaction.objectStore(STORE_DATASETS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  public async getOfflineCount(): Promise<number> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_METADATA], 'readonly');
      const store = transaction.objectStore(STORE_METADATA);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteDataset(id: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_DATASETS, STORE_METADATA], 'readwrite');
      transaction.objectStore(STORE_DATASETS).delete(id);
      transaction.objectStore(STORE_METADATA).delete(id);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  public async clearAllDatasets(): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_DATASETS, STORE_METADATA], 'readwrite');
      transaction.objectStore(STORE_DATASETS).clear();
      transaction.objectStore(STORE_METADATA).clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const offlineStorage = new OfflineStorageService();
