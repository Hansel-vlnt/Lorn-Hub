import React from 'react';
import { useSearch } from '../../hooks/useSearch';
import { useLaw } from '../../context/LawContext';
import { SearchBar } from './SearchBar';
import { FilterChips } from './FilterChips';
import { SearchResultCard } from './SearchResultCard';
import { Article } from '../../types';
import { History, Search, BookOpen, AlertCircle, DownloadCloud } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface SearchViewProps {
  onOpenArticle: (article: Article) => void;
  onOpenCitation: (article: Article) => void;
  onOpenNote: (article: Article) => void;
  onOpenBookmark: (article: Article) => void;
  onOpenScraper?: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onOpenArticle,
  onOpenCitation,
  onOpenNote,
  onOpenBookmark,
  onOpenScraper,
}) => {
  const { query, setQuery, filters, updateFilters, results, isSearching, resultCount } = useSearch();
  const { allArticles } = useLaw();
  const searchHistory = storageService.getSearchHistory();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Search Header Hero */}
      <div className="text-center space-y-2 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pencarian Kilat Regulasi
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Cari nomor pasal, nama delik, unsur pidana/perdata, atau kata kunci kasus secara instan dari naskah yang tersimpan di perangkat Anda.
        </p>
      </div>

      {allArticles.length === 0 ? (
        <div className="max-w-md mx-auto my-8 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Search size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Belum Ada Data Regulasi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tidak ada naskah regulasi yang tersimpan di basis data lokal. Tambahkan peraturan melalui Scraper untuk mengaktifkan pencarian kilat.
            </p>
          </div>
          {onOpenScraper && (
            <button
              type="button"
              onClick={onOpenScraper}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 font-semibold text-xs shadow-xs inline-flex items-center gap-2 transition-colors"
            >
              <DownloadCloud size={15} />
              <span>Buka Scraper / Tambah Regulasi</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Search Bar & Filters */}
          <div className="space-y-3 sticky top-0 z-20 bg-slate-50 dark:bg-slate-950 pt-1 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <SearchBar
              value={query}
              onChange={setQuery}
              onClear={() => setQuery('')}
              autoFocus={true}
            />

            <FilterChips filters={filters} onFilterChange={updateFilters} />
          </div>

          {/* Quick Suggestions & History when empty query */}
          {!query && (
            <div className="space-y-6 pt-4">
              {/* Search History if available */}
              {searchHistory.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      <History size={14} className="text-slate-500 dark:text-slate-400" />
                      <span>Riwayat Pencarian Terakhir</span>
                    </div>
                    <button
                      onClick={() => {
                        storageService.clearSearchHistory();
                        setQuery('');
                      }}
                      className="min-h-[44px] px-2.5 text-xs font-semibold text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center"
                    >
                      Bersihkan
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {searchHistory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setQuery(item.query)}
                        className="min-h-[44px] px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300 hover:border-amber-500/30 transition-colors flex items-center gap-1.5"
                      >
                        <Search size={12} className="text-slate-500 dark:text-slate-400" />
                        <span>{item.query}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Database stats with honest microcopy */}
              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/30 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 shadow-xs">
                <span className="flex items-center gap-2">
                  <BookOpen size={16} className="text-amber-700 dark:text-amber-400" />
                  <span>
                    Indeks Pencarian (<strong>{allArticles.length}</strong> Pasal Tersimpan di IndexedDB)
                  </span>
                </span>
                <span className="text-amber-800 dark:text-amber-300 font-bold">Offline Ready</span>
              </div>
            </div>
          )}

          {/* Results Header */}
          {query && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                Ditemukan <strong className="text-slate-900 dark:text-white">{resultCount}</strong> hasil untuk "
                <span className="text-amber-800 dark:text-amber-300 font-bold">{query}</span>"
              </p>
              {isSearching && (
                <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
                  Mencari...
                </span>
              )}
            </div>
          )}

          {/* Results List */}
          {query && (
            <div className="space-y-3">
              {results.length === 0 && !isSearching ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-2">
                  <AlertCircle className="mx-auto text-slate-400" size={32} />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Tidak ada pasal yang cocok
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    Coba gunakan nomor pasal saja (misal: "1") atau kata kunci delik yang ada di naskah regulasi Anda.
                  </p>
                </div>
              ) : (
                results.map((res) => (
                  <SearchResultCard
                    key={res.id}
                    result={res}
                    query={query}
                    onOpenArticle={onOpenArticle}
                    onOpenCitation={onOpenCitation}
                    onOpenNote={onOpenNote}
                    onOpenBookmark={onOpenBookmark}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
