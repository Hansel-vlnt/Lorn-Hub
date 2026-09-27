import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface PdfDocument {
  id: string;
  name: string;
  data: ArrayBuffer;
  uploadDate: number;
}

interface PdfDBSchema extends DBSchema {
  pdfs: {
    key: string;
    value: Omit<PdfDocument, 'data'>;
    indexes: { 'by-date': number };
  };
  pdfData: {
    key: string;
    value: ArrayBuffer;
  };
}

let dbPromise: Promise<IDBPDatabase<PdfDBSchema>> | null = null;

const getDb = () => {
  if (!dbPromise) {
    dbPromise = openDB<PdfDBSchema>('LornHubPDFs', 2, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        if (oldVersion < 1) {
          const store = db.createObjectStore('pdfs', { keyPath: 'id' });
          store.createIndex('by-date', 'uploadDate');
        }
        if (oldVersion < 2) {
          db.createObjectStore('pdfData');
          // We could try to migrate data from 'pdfs' to 'pdfData', but since this is a new feature we can clear it or just leave as is.
          // Since old pdfs had 'data' inside 'pdfs', let's clear it to avoid schema conflict or just rely on fresh uploads.
          transaction.objectStore('pdfs').clear();
        }
      },
    });
  }
  return dbPromise;
};

export const pdfStorageService = {
  async savePdf(name: string, data: ArrayBuffer): Promise<PdfDocument> {
    const db = await getDb();
    const id = `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newPdfMeta: Omit<PdfDocument, 'data'> = {
      id,
      name,
      uploadDate: Date.now(),
    };
    
    const tx = db.transaction(['pdfs', 'pdfData'], 'readwrite');
    await tx.objectStore('pdfs').put(newPdfMeta);
    await tx.objectStore('pdfData').put(data, id);
    await tx.done;
    
    return { ...newPdfMeta, data };
  },

  async getAllPdfs(): Promise<Omit<PdfDocument, 'data'>[]> {
    const db = await getDb();
    const pdfs = await db.getAllFromIndex('pdfs', 'by-date');
    return pdfs.sort((a, b) => b.uploadDate - a.uploadDate);
  },

  async getPdf(id: string): Promise<PdfDocument | undefined> {
    const db = await getDb();
    const meta = await db.get('pdfs', id);
    if (!meta) return undefined;
    const data = await db.get('pdfData', id);
    if (!data) return undefined;
    return { ...meta, data };
  },

  async deletePdf(id: string): Promise<void> {
    const db = await getDb();
    const tx = db.transaction(['pdfs', 'pdfData'], 'readwrite');
    await tx.objectStore('pdfs').delete(id);
    await tx.objectStore('pdfData').delete(id);
    await tx.done;
  },
};
