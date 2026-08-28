import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LawMetadata, Article, LawDataset } from '../types/law';
import { LAWS_METADATA } from '../data/lawsMetadata';
import { searchEngine } from '../services/searchEngine';

interface LawContextType {
  lawsCatalog: LawMetadata[];
  selectedLawId: string;
  setSelectedLawId: (id: string) => void;
  currentLawMetadata?: LawMetadata;
  currentArticles: Article[];
  allArticles: Article[];
  isLoading: boolean;
  error: string | null;
  loadLaw: (lawId: string) => Promise<void>;
  getArticleById: (articleId: string) => Article | undefined;
}

const LawContext = createContext<LawContextType | undefined>(undefined);

export const LawProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lawsCatalog] = useState<LawMetadata[]>(LAWS_METADATA);
  const [selectedLawId, setSelectedLawId] = useState<string>('uud-1945');
  const [datasetsCache, setDatasetsCache] = useState<Record<string, Article[]>>({});
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Preload all legal datasets
  useEffect(() => {
    let isMounted = true;

    async function loadAllDatasets() {
      setIsLoading(true);
      setError(null);

      try {
        const loadedDatasets: Record<string, Article[]> = {};
        const combinedArticles: Article[] = [];

        await Promise.all(
          LAWS_METADATA.map(async (meta) => {
            try {
              const res = await fetch(`/data/${meta.fileData}`);
              if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
              const data: LawDataset = await res.json();
              loadedDatasets[meta.id] = data.pasalList;
              combinedArticles.push(...data.pasalList);
            } catch (err) {
              console.warn(`Failed to fetch /data/${meta.fileData}`, err);
            }
          })
        );

        if (isMounted) {
          setDatasetsCache(loadedDatasets);
          setAllArticles(combinedArticles);
          // Initialize offline MiniSearch index
          searchEngine.indexArticles(combinedArticles);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Gagal memuat dataset hukum');
          setIsLoading(false);
        }
      }
    }

    loadAllDatasets();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadLaw = useCallback(async (lawId: string) => {
    setSelectedLawId(lawId);
  }, []);

  const currentLawMetadata = lawsCatalog.find((l) => l.id === selectedLawId);
  const currentArticles = datasetsCache[selectedLawId] || [];

  const getArticleById = useCallback(
    (articleId: string): Article | undefined => {
      return allArticles.find((a) => a.id === articleId);
    },
    [allArticles]
  );

  return (
    <LawContext.Provider
      value={{
        lawsCatalog,
        selectedLawId,
        setSelectedLawId,
        currentLawMetadata,
        currentArticles,
        allArticles,
        isLoading,
        error,
        loadLaw,
        getArticleById,
      }}
    >
      {children}
    </LawContext.Provider>
  );
};

export const useLaw = () => {
  const context = useContext(LawContext);
  if (!context) {
    throw new Error('useLaw must be used within a LawProvider');
  }
  return context;
};
