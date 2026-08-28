import MiniSearch from 'minisearch';
import { Article, SearchResultItem, SearchFilters } from '../types';

export interface IndexedDocument {
  id: string;
  lawId: string;
  nomor: string;
  judul: string;
  bab: string;
  isi: string;
  penjelasan: string;
  kataKunciStr: string;
  kategori: string;
  article: Article;
}

class SearchEngineService {
  private miniSearch: MiniSearch<IndexedDocument>;
  private isIndexed: boolean = false;
  private articlesMap: Map<string, Article> = new Map();

  constructor() {
    this.miniSearch = new MiniSearch<IndexedDocument>({
      fields: ['nomor', 'judul', 'isi', 'penjelasan', 'kataKunciStr', 'bab'], // fields to index for full-text search
      storeFields: ['id', 'lawId', 'nomor', 'judul', 'kategori'], // fields to return with search results
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
        boost: {
          nomor: 6,
          judul: 4,
          kataKunciStr: 3,
          isi: 1.5,
          penjelasan: 1,
        },
      },
    });
  }

  public indexArticles(articles: Article[]): void {
    if (articles.length === 0) return;

    this.miniSearch.removeAll();
    this.articlesMap.clear();

    const docs: IndexedDocument[] = articles.map((art) => {
      this.articlesMap.set(art.id, art);
      return {
        id: art.id,
        lawId: art.lawId,
        nomor: art.nomor,
        judul: art.judul || '',
        bab: art.bab || '',
        isi: art.isi,
        penjelasan: art.penjelasan || '',
        kataKunciStr: (art.kataKunci || []).join(' '),
        kategori: art.kategori,
        article: art,
      };
    });

    this.miniSearch.addAll(docs);
    this.isIndexed = true;
  }

  public search(query: string, filters?: SearchFilters): SearchResultItem[] {
    const trimmed = query.trim();
    if (!trimmed) return [];

    // Check if query is looking for an exact article number e.g. "362" or "pasal 362"
    const pasalMatch = trimmed.match(/(?:pasal\s+)?([0-9]+[a-zA-Z]?)/i);
    const targetPasalNumber = pasalMatch ? pasalMatch[1] : null;

    let results = this.miniSearch.search(trimmed, {
      filter: (resultDoc) => {
        if (!filters) return true;
        if (filters.kategori && filters.kategori !== 'semua' && resultDoc.kategori !== filters.kategori) {
          return false;
        }
        if (filters.lawId && filters.lawId !== 'semua' && resultDoc.lawId !== filters.lawId) {
          return false;
        }
        return true;
      },
    });

    // If query matches an exact article number, prioritize or include direct exact matches
    const searchResults: SearchResultItem[] = results.map((res) => {
      const art = this.articlesMap.get(res.id);
      const isExactPasal = targetPasalNumber && art?.nomor.toLowerCase() === targetPasalNumber.toLowerCase();

      return {
        id: res.id,
        article: art!,
        score: isExactPasal ? res.score + 50 : res.score,
        matchType: isExactPasal ? 'exact-article' : 'content',
      };
    });

    // Fallback: If search returned nothing but user typed an article number, check direct lookup
    if (searchResults.length === 0 && targetPasalNumber) {
      this.articlesMap.forEach((art) => {
        if (art.nomor.toLowerCase() === targetPasalNumber.toLowerCase()) {
          if (filters?.lawId && filters.lawId !== 'semua' && art.lawId !== filters.lawId) return;
          if (filters?.kategori && filters.kategori !== 'semua' && art.kategori !== filters.kategori) return;

          searchResults.push({
            id: art.id,
            article: art,
            score: 100,
            matchType: 'exact-article',
          });
        }
      });
    }

    return searchResults.sort((a, b) => b.score - a.score);
  }

  public getArticleById(id: string): Article | undefined {
    return this.articlesMap.get(id);
  }

  public isReady(): boolean {
    return this.isIndexed;
  }
}

export const searchEngine = new SearchEngineService();
