import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LawMetadata, Article, DynamicLawDataset } from '../types/law';
import { searchEngine } from '../services/searchEngine';
import { offlineStorage } from '../services/offlineStorageService';
import { regulationScraper } from '../services/regulationScraperService';

interface LawContextType {
  lawsCatalog: LawMetadata[];
  selectedLawId: string;
  setSelectedLawId: (id: string) => void;
  currentLawMetadata?: LawMetadata;
  currentArticles: Article[];
  allArticles: Article[];
  isLoading: boolean;
  error: string | null;
  offlineCount: number;
  loadLaw: (lawId: string) => Promise<void>;
  getArticleById: (articleId: string) => Article | undefined;
  downloadLaw: (url: string, metadata: Partial<LawMetadata>) => Promise<void>;
  ingestTextLaw: (rawText: string, metadata: Partial<LawMetadata>) => Promise<DynamicLawDataset>;
  deleteLaw: (lawId: string) => Promise<void>;
  clearAllLaws: () => Promise<void>;
}

const LawContext = createContext<LawContextType | undefined>(undefined);

export const LawProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lawsCatalog, setLawsCatalog] = useState<LawMetadata[]>([]);
  const [selectedLawId, setSelectedLawId] = useState<string>('');
  const [datasetsCache, setDatasetsCache] = useState<Record<string, Article[]>>({});
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadLaw = useCallback(async (lawId: string) => {
    if (!lawId) {
      setSelectedLawId('');
      return;
    }
    setSelectedLawId(lawId);

    setDatasetsCache((prev) => {
      if (prev[lawId]) return prev;
      offlineStorage
        .getDataset(lawId)
        .then((dataset) => {
          if (dataset) {
            setDatasetsCache((c) => ({ ...c, [lawId]: dataset.pasalList }));
            setAllArticles((existing) => {
              const filtered = existing.filter((a) => a.lawId !== lawId);
              const combined = [...filtered, ...dataset.pasalList];
              searchEngine.indexArticles(combined);
              return combined;
            });
          }
        })
        .catch((err) => {
          console.error(err);
          setError('Gagal memuat naskah regulasi.');
        });
      return prev;
    });
  }, []);

  // Load all datasets dynamically from IndexedDB on startup (No hardcoded data)
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        setIsLoading(true);
        const datasets = await offlineStorage.getAllDatasets();

        if (isMounted) {
          const metadataList = datasets.map((d) => d.metadata);
          const cache: Record<string, Article[]> = {};
          const articles: Article[] = [];

          for (const ds of datasets) {
            cache[ds.metadata.id] = ds.pasalList;
            articles.push(...ds.pasalList);
          }

          setLawsCatalog(metadataList);
          setDatasetsCache(cache);
          setAllArticles(articles);
          searchEngine.indexArticles(articles);

          if (metadataList.length > 0) {
            setSelectedLawId((prev) => prev || metadataList[0].id);
          } else {
            setSelectedLawId('');
          }
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError('Gagal memuat katalog dari database lokal.');
          setIsLoading(false);
        }
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const downloadLaw = useCallback(
    async (url: string, metadataParams: Partial<LawMetadata>) => {
      try {
        setIsLoading(true);
        const dataset = await regulationScraper.scrapeLaw(url, metadataParams);
        await offlineStorage.saveDataset(dataset);

        const newMeta = { ...dataset.metadata, statusDownload: 'cached-offline' } as LawMetadata;

        setLawsCatalog((prev) => {
          const filtered = prev.filter((m) => m.id !== newMeta.id);
          return [newMeta, ...filtered];
        });

        setDatasetsCache((prev) => ({ ...prev, [newMeta.id]: dataset.pasalList }));

        setAllArticles((prev) => {
          const filtered = prev.filter((a) => a.lawId !== newMeta.id);
          const combined = [...dataset.pasalList, ...filtered];
          searchEngine.indexArticles(combined);
          return combined;
        });

        setSelectedLawId(newMeta.id);
        setIsLoading(false);
      } catch (err: any) {
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  const ingestTextLaw = useCallback(
    async (rawText: string, metadataParams: Partial<LawMetadata>): Promise<DynamicLawDataset> => {
      try {
        setIsLoading(true);
        const dataset = regulationScraper.parseRawText(rawText, metadataParams);
        await offlineStorage.saveDataset(dataset);

        const newMeta = { ...dataset.metadata, statusDownload: 'cached-offline' } as LawMetadata;

        setLawsCatalog((prev) => {
          const filtered = prev.filter((m) => m.id !== newMeta.id);
          return [newMeta, ...filtered];
        });

        setDatasetsCache((prev) => ({ ...prev, [newMeta.id]: dataset.pasalList }));

        setAllArticles((prev) => {
          const filtered = prev.filter((a) => a.lawId !== newMeta.id);
          const combined = [...dataset.pasalList, ...filtered];
          searchEngine.indexArticles(combined);
          return combined;
        });

        setSelectedLawId(newMeta.id);
        setIsLoading(false);
        return dataset;
      } catch (err: any) {
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  const deleteLaw = useCallback(async (lawId: string) => {
    try {
      setIsLoading(true);
      await offlineStorage.deleteDataset(lawId);

      setLawsCatalog((prev) => {
        const remaining = prev.filter((m) => m.id !== lawId);
        setSelectedLawId((cur) => {
          if (cur === lawId) {
            return remaining.length > 0 ? remaining[0].id : '';
          }
          return cur;
        });
        return remaining;
      });

      setDatasetsCache((prev) => {
        const copy = { ...prev };
        delete copy[lawId];
        return copy;
      });

      setAllArticles((prev) => {
        const remainingArticles = prev.filter((a) => a.lawId !== lawId);
        searchEngine.indexArticles(remainingArticles);
        return remainingArticles;
      });

      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      throw err;
    }
  }, []);

  const clearAllLaws = useCallback(async () => {
    try {
      setIsLoading(true);
      await offlineStorage.clearAllDatasets();
      setLawsCatalog([]);
      setSelectedLawId('');
      setDatasetsCache({});
      setAllArticles([]);
      searchEngine.indexArticles([]);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      throw err;
    }
  }, []);

  const handleSetSelectedLawId = useCallback(
    (id: string) => {
      loadLaw(id);
    },
    [loadLaw]
  );

  const currentLawMetadata = lawsCatalog.find((l) => l.id === selectedLawId);
  const currentArticles = datasetsCache[selectedLawId] || [];

  const getArticleById = useCallback(
    (articleId: string): Article | undefined => {
      return allArticles.find((a) => a.id === articleId);
    },
    [allArticles]
  );

  const offlineCount = lawsCatalog.filter((l) => l.statusDownload === 'cached-offline').length;

  return (
    <LawContext.Provider
      value={{
        lawsCatalog,
        selectedLawId,
        setSelectedLawId: handleSetSelectedLawId,
        currentLawMetadata,
        currentArticles,
        allArticles,
        isLoading,
        error,
        offlineCount,
        loadLaw,
        getArticleById,
        downloadLaw,
        ingestTextLaw,
        deleteLaw,
        clearAllLaws,
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
