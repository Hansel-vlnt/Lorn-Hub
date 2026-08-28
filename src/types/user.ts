export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange';

export interface HighlightItem {
  id: string;
  articleId: string;
  lawId: string;
  pasalNomor: string;
  color: HighlightColor;
  note?: string;
  createdAt: number;
}

export interface NoteItem {
  id: string;
  articleId: string;
  lawId: string;
  pasalNomor: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface BookmarkItem {
  id: string;
  articleId: string;
  lawId: string;
  pasalNomor: string;
  judul?: string;
  folderName: string; // e.g. "Hukum Pidana 1", "Moot Court", "Skripsi"
  createdAt: number;
}

export interface UserStudyData {
  bookmarks: BookmarkItem[];
  notes: NoteItem[];
  highlights: HighlightItem[];
  customFolders: string[];
}
