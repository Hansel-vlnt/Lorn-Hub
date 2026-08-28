import { useState, useEffect, useCallback, useTransition } from 'react';
import { SearchResultItem, SearchFilters } from '../types';
import { searchEngine } from '../services/searchEngine';
import { storageService } from '../services/storageService';

export function useSearch(initialQuery: string = '') {
  const [query, setQuery] = useState<string>(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({
    kategori: 'semua',
    lawId: 'semua',
  });
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  const performSearch = useCallback((searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    startTransition(() => {
      const searchResults = searchEngine.search(searchQuery, searchFilters);
      setResults(searchResults);
      setIsSearching(false);

      if (searchQuery.trim().length >= 2) {
        storageService.addSearchHistory(searchQuery, searchResults.length);
      }
    });
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      performSearch(query, filters);
    }, 150);

    return () => clearTimeout(handler);
  }, [query, filters, performSearch]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    updateFilters,
    results,
    isSearching,
    resultCount: results.length,
  };
}
