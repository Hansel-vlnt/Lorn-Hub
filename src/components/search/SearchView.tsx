import React from 'react';
import { useSearch } from '../../hooks/useSearch';
import { useLaw } from '../../context/LawContext';
import { SearchBar } from './SearchBar';
import { FilterChips } from './FilterChips';
import { SearchResultCard } from './SearchResultCard';
import { Article } from '../../types';
import { History, Zap, BookOpen, AlertCircle } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface SearchViewProps {
  onOpenArticle: (article: Article) => void;
  onOpenCitation: (article: Article) => void;
  onOpenNote: (article: Article) => void;
  onOpenBookmark: (article: Article) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onOpenArticle,
  onOpenCitation,
  onOpenNote,
  onOpenBookmark,
}) => {
  const { query, setQuery, filters, updateFilters, results, isSearching, resultCount } = useSearch();
  const { allArticles } = useLaw();
  const searchHistory = storageService.getSearchHistory();

  const suggestedQueries = [
    { label: 'Pasal 362 (Pencurian)', q: '362' },
    { label: 'Pasal 1365 (PMH)', q: '1365' },
    { label: 'Wanprestasi', q: 'wanprestasi' },
    { label: 'Pencemaran Nama Baik', q: 'pencemaran nama baik' },
    { label: 'Praperadilan', q: 'praperadilan' },
    { label: 'Gratifikasi', q: 'gratifikasi' },
    { label: 'Asas Legalitas', q: 'asas legalitas' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Search Header Hero */}
      <div className="text-center space-y-2 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pencarian Kilat Seluruh Pasal Hukum
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Cari nomor pasal, nama delik, unsur pidana/perdata, atau kata kunci kasus secara instan (100% offline).
        </p>
      </div>

      {/* Search Bar & Filters */}
      <div className="space-y-3 sticky top-16 z-20 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md pt-2 pb-1">
        <SearchBar
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          autoFocus={true}
        />

        <FilterChips filters={filters} onFilterChange={updateFilters} />
      </div>

      {/* Quick Suggestions when empty */}
      {!query && (
        <div className="space-y-6 pt-4">
          {/* Quick Search Chips */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              <Zap size={14} className="text-amber-500" />
              <span>Pencarian Populer Mahasiswa Hukum</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {suggestedQueries.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(s.q)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <History size={14} className="text-slate-400" />
                  <span>Riwayat Pencarian Terakhir</span>
                </div>
                <button
                  onClick={() => {
                    storageService.clearSearchHistory();
                    setQuery('');
                  }}
                  className="text-xs text-slate-400 hover:text-rose-500"
                >
                  Bersihkan
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {searchHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setQuery(item.query)}
                    className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    🔍 {item.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Database stats */}
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <BookOpen size={16} className="text-amber-500" />
              <span>Total Indeks Database: <strong>{allArticles.length}</strong> Pasal Hukum</span>
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Offline Ready ⚡</span>
          </div>
        </div>
      )}

      {/* Results Header */}
      {query && (
        <div className="flex items-center justify-between px-1">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Ditemukan <strong className="text-slate-900 dark:text-white">{resultCount}</strong> hasil untuk "
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{query}</span>"
          </p>
          {isSearching && (
            <span className="text-xs text-amber-500 animate-pulse font-medium">
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
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Coba gunakan nomor pasal saja (misal: "362") atau kata kunci lebih umum seperti "pencurian" atau "ganti rugi".
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
    </div>
  );
};
