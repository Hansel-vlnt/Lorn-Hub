import { Article, LawCategory } from './law';

export interface SearchFilters {
  kategori?: LawCategory | 'semua';
  lawId?: string | 'semua';
  status?: string | 'semua';
}

export interface SearchResultItem {
  id: string;
  article: Article;
  score: number;
  matchType: 'exact-article' | 'keyword' | 'content';
  highlightSnippet?: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  resultCount: number;
}
