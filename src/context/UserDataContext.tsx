import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BookmarkItem, HighlightItem, NoteItem, UserStudyData, HighlightColor } from '../types';
import { storageService } from '../services/storageService';

interface UserDataContextType {
  studyData: UserStudyData;
  bookmarks: BookmarkItem[];
  notes: NoteItem[];
  highlights: HighlightItem[];
  addBookmark: (bookmark: Omit<BookmarkItem, 'id' | 'createdAt'>) => BookmarkItem;
  removeBookmark: (articleId: string) => void;
  isBookmarked: (articleId: string) => boolean;
  saveNote: (articleId: string, lawId: string, pasalNomor: string, content: string) => NoteItem;
  deleteNote: (articleId: string) => void;
  getNote: (articleId: string) => NoteItem | undefined;
  setHighlight: (articleId: string, lawId: string, pasalNomor: string, color: HighlightColor) => HighlightItem;
  removeHighlight: (articleId: string) => void;
  getHighlight: (articleId: string) => HighlightItem | undefined;
  addCustomFolder: (folderName: string) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studyData, setStudyData] = useState<UserStudyData>(() => storageService.getStudyData());

  useEffect(() => {
    const fresh = storageService.getStudyData();
    setStudyData(fresh);
  }, []);

  const addBookmark = useCallback((bookmark: Omit<BookmarkItem, 'id' | 'createdAt'>) => {
    const item = storageService.addBookmark(bookmark);
    setStudyData(storageService.getStudyData());
    return item;
  }, []);

  const removeBookmark = useCallback((articleId: string) => {
    storageService.removeBookmark(articleId);
    setStudyData(storageService.getStudyData());
  }, []);

  const isBookmarked = useCallback(
    (articleId: string) => {
      return studyData.bookmarks.some((b) => b.articleId === articleId);
    },
    [studyData.bookmarks]
  );

  const saveNote = useCallback((articleId: string, lawId: string, pasalNomor: string, content: string) => {
    const item = storageService.saveNote({
      articleId,
      lawId,
      pasalNomor,
      content,
    });
    setStudyData(storageService.getStudyData());
    return item;
  }, []);

  const deleteNote = useCallback((articleId: string) => {
    storageService.deleteNote(articleId);
    setStudyData(storageService.getStudyData());
  }, []);

  const getNote = useCallback(
    (articleId: string) => {
      return studyData.notes.find((n) => n.articleId === articleId);
    },
    [studyData.notes]
  );

  const setHighlight = useCallback(
    (articleId: string, lawId: string, pasalNomor: string, color: HighlightColor) => {
      const item = storageService.setHighlight({
        articleId,
        lawId,
        pasalNomor,
        color,
      });
      setStudyData(storageService.getStudyData());
      return item;
    },
    []
  );

  const removeHighlight = useCallback((articleId: string) => {
    storageService.removeHighlight(articleId);
    setStudyData(storageService.getStudyData());
  }, []);

  const getHighlight = useCallback(
    (articleId: string) => {
      return studyData.highlights.find((h) => h.articleId === articleId);
    },
    [studyData.highlights]
  );

  const addCustomFolder = useCallback((folderName: string) => {
    storageService.addCustomFolder(folderName);
    setStudyData(storageService.getStudyData());
  }, []);

  return (
    <UserDataContext.Provider
      value={{
        studyData,
        bookmarks: studyData.bookmarks,
        notes: studyData.notes,
        highlights: studyData.highlights,
        addBookmark,
        removeBookmark,
        isBookmarked,
        saveNote,
        deleteNote,
        getNote,
        setHighlight,
        removeHighlight,
        getHighlight,
        addCustomFolder,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
