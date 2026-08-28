import { BookmarkItem, HighlightItem, NoteItem, UserStudyData, SearchHistoryItem } from '../types';

const STORAGE_KEYS = {
  USER_STUDY_DATA: 'lorn_hub_user_study_data_v1',
  SEARCH_HISTORY: 'lorn_hub_search_history_v1',
  APP_THEME: 'lorn_hub_theme_preference',
  FONT_SETTINGS: 'lorn_hub_font_settings',
};

const DEFAULT_STUDY_DATA: UserStudyData = {
  bookmarks: [],
  notes: [],
  highlights: [],
  customFolders: ['Umum', 'Hukum Pidana', 'Hukum Perdata', 'Tugas / Makalah', 'Moot Court'],
};

export const storageService = {
  getStudyData(): UserStudyData {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_STUDY_DATA);
      if (!data) return DEFAULT_STUDY_DATA;
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load study data from localStorage', e);
      return DEFAULT_STUDY_DATA;
    }
  },

  saveStudyData(data: UserStudyData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_STUDY_DATA, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save study data to localStorage', e);
    }
  },

  addBookmark(bookmark: Omit<BookmarkItem, 'id' | 'createdAt'>): BookmarkItem {
    const current = this.getStudyData();
    const newItem: BookmarkItem = {
      ...bookmark,
      id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    current.bookmarks.unshift(newItem);
    this.saveStudyData(current);
    return newItem;
  },

  removeBookmark(articleId: string): void {
    const current = this.getStudyData();
    current.bookmarks = current.bookmarks.filter((b) => b.articleId !== articleId);
    this.saveStudyData(current);
  },

  saveNote(note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>): NoteItem {
    const current = this.getStudyData();
    const existingIndex = current.notes.findIndex((n) => n.articleId === note.articleId);

    if (existingIndex >= 0) {
      current.notes[existingIndex].content = note.content;
      current.notes[existingIndex].updatedAt = Date.now();
      this.saveStudyData(current);
      return current.notes[existingIndex];
    } else {
      const newNote: NoteItem = {
        ...note,
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      current.notes.unshift(newNote);
      this.saveStudyData(current);
      return newNote;
    }
  },

  deleteNote(articleId: string): void {
    const current = this.getStudyData();
    current.notes = current.notes.filter((n) => n.articleId !== articleId);
    this.saveStudyData(current);
  },

  setHighlight(highlight: Omit<HighlightItem, 'id' | 'createdAt'>): HighlightItem {
    const current = this.getStudyData();
    current.highlights = current.highlights.filter((h) => h.articleId !== highlight.articleId);
    const newHighlight: HighlightItem = {
      ...highlight,
      id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };
    current.highlights.unshift(newHighlight);
    this.saveStudyData(current);
    return newHighlight;
  },

  removeHighlight(articleId: string): void {
    const current = this.getStudyData();
    current.highlights = current.highlights.filter((h) => h.articleId !== articleId);
    this.saveStudyData(current);
  },

  getSearchHistory(): SearchHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addSearchHistory(query: string, resultCount: number): void {
    if (!query.trim()) return;
    try {
      let history = this.getSearchHistory();
      history = history.filter((h) => h.query.toLowerCase() !== query.toLowerCase());
      history.unshift({
        id: `sh-${Date.now()}`,
        query: query.trim(),
        timestamp: Date.now(),
        resultCount,
      });
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history.slice(0, 15)));
    } catch (e) {
      console.error('Failed to save search history', e);
    }
  },

  clearSearchHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
  },
};
