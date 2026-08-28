import React, { useState, useMemo } from 'react';
import { useLaw } from '../../context/LawContext';
import { ArticleCard } from './ArticleCard';
import { TableOfContents } from './TableOfContents';
import { Article } from '../../types';
import { Search, Book, Sparkles, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface LawReaderProps {
  onOpenCitation: (article: Article) => void;
  onOpenNote: (article: Article) => void;
  onOpenBookmark: (article: Article) => void;
  onShowToast?: (msg: string) => void;
}

export const LawReader: React.FC<LawReaderProps> = ({
  onOpenCitation,
  onOpenNote,
  onOpenBookmark,
  onShowToast,
}) => {
  const { currentLawMetadata, currentArticles, isLoading, error } = useLaw();
  const [selectedBab, setSelectedBab] = useState<string>('');
  const [inLawFilterQuery, setInLawFilterQuery] = useState<string>('');

  const filteredArticles = useMemo(() => {
    return currentArticles.filter((art) => {
      if (selectedBab && art.bab !== selectedBab) return false;
      if (inLawFilterQuery.trim()) {
        const q = inLawFilterQuery.toLowerCase().trim();
        const matchesNomor = art.nomor.toLowerCase().includes(q);
        const matchesJudul = art.judul?.toLowerCase().includes(q);
        const matchesIsi = art.isi.toLowerCase().includes(q);
        const matchesKataKunci = art.kataKunci?.some((k) => k.toLowerCase().includes(q));
        return matchesNomor || matchesJudul || matchesIsi || matchesKataKunci;
      }
      return true;
    });
  }, [currentArticles, selectedBab, inLawFilterQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Memuat teks undang-undang...</p>
      </div>
    );
  }

  if (error || !currentLawMetadata) {
    return (
      <div className="text-center py-20 space-y-3">
        <AlertCircle className="mx-auto text-rose-500" size={36} />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Gagal Memuat Regulasi</h3>
        <p className="text-xs text-slate-500">{error || 'Dataset tidak ditemukan'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Law Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider">
              {currentLawMetadata.singkatan}
            </span>
            <Badge variant="secondary" size="sm">
              {currentLawMetadata.nomorRegulasi}
            </Badge>
            <Badge variant={currentLawMetadata.status === 'berlaku' ? 'success' : 'warning'} size="sm">
              Status: {currentLawMetadata.status.toUpperCase()}
            </Badge>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {currentLawMetadata.judulLengkap}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            {currentLawMetadata.deskripsi}
          </p>

          <div className="flex items-center gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Book size={14} className="text-amber-400" />
              <span>{currentArticles.length} Pasal Tersedia</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-400" />
              <span>Teks Resmi & Anotasi</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter / Search within Current Law */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={inLawFilterQuery}
            onChange={(e) => setInLawFilterQuery(e.target.value)}
            placeholder={`Saring pasal dalam ${currentLawMetadata.singkatan}...`}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {selectedBab && (
          <button
            onClick={() => setSelectedBab('')}
            className="text-xs px-3 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 whitespace-nowrap"
          >
            Reset Filter Bab ✕
          </button>
        )}
      </div>

      {/* Main Layout Grid (Content + Table of Contents) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Table of Contents for desktop */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <TableOfContents
            articles={currentArticles}
            selectedBab={selectedBab}
            onSelectBab={setSelectedBab}
          />
        </div>

        {/* Articles List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Mobile Table of Contents Accordion/Pills */}
          <div className="lg:hidden">
            <TableOfContents
              articles={currentArticles}
              selectedBab={selectedBab}
              onSelectBab={setSelectedBab}
            />
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tidak ada pasal yang cocok
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Coba ubah kata kunci atau bersihkan filter bab.
              </p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onOpenCitation={onOpenCitation}
                onOpenNote={onOpenNote}
                onOpenBookmark={onOpenBookmark}
                onShowToast={onShowToast}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
