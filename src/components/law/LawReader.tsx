import React, { useState, useMemo, useEffect } from 'react';
import { useLaw } from '../../context/LawContext';
import { ArticleCard } from './ArticleCard';
import { TableOfContents } from './TableOfContents';
import { LawCatalog } from './LawCatalog';
import { Article } from '../../types';
import { Search, Book, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface LawReaderProps {
  viewMode?: 'catalog' | 'reading';
  onViewModeChange?: (mode: 'catalog' | 'reading') => void;
  onOpenCitation: (article: Article) => void;
  onOpenNote: (article: Article) => void;
  onOpenBookmark: (article: Article) => void;
  onShowToast?: (msg: string) => void;
  onOpenCompare?: () => void;
}

export const LawReader: React.FC<LawReaderProps> = ({
  viewMode: controlledViewMode,
  onViewModeChange,
  onOpenCitation,
  onOpenNote,
  onOpenBookmark,
  onShowToast,
  onOpenCompare,
}) => {
  const {
    currentLawMetadata,
    currentArticles,
    isLoading,
    error,
    lawsCatalog,
    selectedLawId,
    setSelectedLawId,
  } = useLaw();

  const [internalViewMode, setInternalViewMode] = useState<'catalog' | 'reading'>('catalog');
  const activeViewMode = controlledViewMode ?? internalViewMode;

  const setViewMode = (mode: 'catalog' | 'reading') => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
    setInternalViewMode(mode);
  };

  const [selectedBab, setSelectedBab] = useState<string>('');
  const [inLawFilterQuery, setInLawFilterQuery] = useState<string>('');

  // Whenever selectedLawId changes externally, reset in-law filter
  useEffect(() => {
    setSelectedBab('');
    setInLawFilterQuery('');
  }, [selectedLawId]);

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
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Memuat naskah regulasi...</p>
      </div>
    );
  }

  if (error || !currentLawMetadata) {
    return (
      <div className="text-center py-20 space-y-3">
        <AlertCircle className="mx-auto text-rose-500" size={36} />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Gagal Memuat Regulasi</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">{error || 'Dataset tidak ditemukan'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {activeViewMode === 'catalog' ? (
        <LawCatalog
          onSelectLaw={(lawId) => {
            setSelectedLawId(lawId);
            setViewMode('reading');
            setSelectedBab('');
          }}
          onOpenCompare={onOpenCompare}
          selectedLawId={selectedLawId}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Breadcrumb & Regulation Switcher Bar */}
          <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 sm:px-4 rounded-2xl shadow-xs">
            <button
              onClick={() => setViewMode('catalog')}
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 whitespace-nowrap flex-shrink-0"
              aria-label="Kembali ke Katalog Regulasi"
            >
              <ArrowLeft size={16} />
              <span>Katalog</span>
            </button>

            {/* Quick Switch Dropdown */}
            <div className="flex items-center gap-2 min-w-0 max-w-[210px] sm:max-w-xs">
              <label htmlFor="select-law-quick" className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:inline whitespace-nowrap">
                Pindah Naskah:
              </label>
              <select
                id="select-law-quick"
                value={selectedLawId}
                onChange={(e) => {
                  setSelectedLawId(e.target.value);
                  setSelectedBab('');
                }}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 truncate"
                aria-label="Pilih naskah undang-undang untuk dibaca"
              >
                {lawsCatalog.map((law) => (
                  <option key={law.id} value={law.id}>
                    {law.singkatan}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Law Hero Header */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {currentLawMetadata.judulLengkap}
            </h1>

            {/* Statutory Meta Line */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 dark:text-slate-400 pt-0.5">
              <span className="font-bold text-amber-800 dark:text-amber-400 font-mono">
                {currentLawMetadata.singkatan}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {currentLawMetadata.nomorRegulasi}
              </span>
              <span>•</span>
              <span>Tahun {currentLawMetadata.tahun}</span>
              <span>•</span>
              <Badge
                variant={
                  currentLawMetadata.status === 'berlaku'
                    ? 'success'
                    : currentLawMetadata.status === 'transisi'
                    ? 'warning'
                    : 'secondary'
                }
                size="sm"
              >
                Status:{' '}
                {currentLawMetadata.status === 'berlaku'
                  ? 'BERLAKU'
                  : currentLawMetadata.status === 'transisi'
                  ? 'TRANSISI'
                  : 'SEBAGIAN DICABUT'}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed pt-1">
              {currentLawMetadata.deskripsi}
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <Book size={14} className="text-amber-600 dark:text-amber-400" />
                <span>Dataset Terpilih ({currentArticles.length} Pasal Tersedia)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Teks Resmi & Anotasi</span>
              </span>
            </div>
          </div>

          {/* Filter / Search within Current Law */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                value={inLawFilterQuery}
                onChange={(e) => setInLawFilterQuery(e.target.value)}
                placeholder={`Saring pasal dalam ${currentLawMetadata.singkatan}...`}
                className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {selectedBab && (
              <button
                onClick={() => setSelectedBab('')}
                className="min-h-[44px] text-xs px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-medium whitespace-nowrap"
              >
                Reset Filter Bab ✕
              </button>
            )}
          </div>

          {/* Main Layout Grid (Content + Table of Contents) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Table of Contents for desktop: 3 of 12 columns for well-balanced readable proportion */}
            <div className="hidden lg:block lg:col-span-3 sticky top-20">
              <TableOfContents
                articles={currentArticles}
                selectedBab={selectedBab}
                onSelectBab={setSelectedBab}
              />
            </div>

            {/* Articles List: 9 of 12 columns for optimal reading measure */}
            <div className="lg:col-span-9 space-y-4">
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
      )}
    </div>
  );
};

export default LawReader;
