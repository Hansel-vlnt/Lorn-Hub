import React, { useState, useMemo, useEffect } from 'react';
import { useLaw } from '../../context/LawContext';
import { ArticleCard } from './ArticleCard';
import { TableOfContents, extractBabKey } from './TableOfContents';
import { Article } from '../../types';
import { Search, Book, ShieldCheck, AlertCircle, DownloadCloud, FileText, BookOpen, Printer, Download } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { exportLawAsTxt, exportLawAsJson } from '../../services/exportService';

interface LawReaderProps {
  onOpenCitation: (article: Article) => void;
  onOpenNote: (article: Article) => void;
  onOpenBookmark: (article: Article) => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenScraper?: () => void;
  onOpenPdf?: () => void;
}

export const LawReader: React.FC<LawReaderProps> = ({
  onOpenCitation,
  onOpenNote,
  onOpenBookmark,
  onShowToast,
  onOpenScraper,
  onOpenPdf,
}) => {
  const {
    currentLawMetadata,
    currentArticles,
    isLoading,
    error,
    lawsCatalog,
    selectedLawId,
    setSelectedLawId,
    loadLaw,
  } = useLaw();

  const [selectedBab, setSelectedBab] = useState<string>('');
  const [inLawFilterQuery, setInLawFilterQuery] = useState<string>('');

  const handleSelectBab = (bab: string) => {
    setSelectedBab(bab);
    requestAnimationFrame(() => {
      const container = document.getElementById('articles-list-container');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  };

  // Whenever selectedLawId changes externally, reset in-law filter
  useEffect(() => {
    setSelectedBab('');
    setInLawFilterQuery('');
  }, [selectedLawId]);

  // If selectedLawId is empty but laws exist, select the first one
  useEffect(() => {
    if (!selectedLawId && lawsCatalog.length > 0) {
      setSelectedLawId(lawsCatalog[0].id);
      loadLaw(lawsCatalog[0].id);
    }
  }, [selectedLawId, lawsCatalog, setSelectedLawId, loadLaw]);

  const filteredArticles = useMemo(() => {
    const selectedKey = extractBabKey(selectedBab);
    return currentArticles.filter((art) => {
      if (selectedKey && extractBabKey(art.bab) !== selectedKey) return false;
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

  if (isLoading && lawsCatalog.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Memuat naskah regulasi...</p>
      </div>
    );
  }

  // Honest Empty State: When no regulations have been ingested or scraped yet
  if (lawsCatalog.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
          <BookOpen size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Belum Ada Regulasi Tersimpan
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
            Basis data lokal perangkat Anda saat ini masih kosong. Silakan unduh atau masukkan naskah regulasi melalui Scraper, atau telusuri berkas hukum di PDF Hub.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onOpenScraper && (
            <button
              type="button"
              onClick={onOpenScraper}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <DownloadCloud size={16} />
              <span>Tambah Regulasi via Scraper</span>
            </button>
          )}

          {onOpenPdf && (
            <button
              type="button"
              onClick={onOpenPdf}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <FileText size={16} className="text-amber-600 dark:text-amber-400" />
              <span>Buka PDF & Dokumen Hub</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (error || !currentLawMetadata) {
    return (
      <div className="text-center py-20 space-y-3">
        <AlertCircle className="mx-auto text-rose-500" size={36} />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Gagal Memuat Regulasi</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">{error || 'Naskah regulasi tidak ditemukan'}</p>
        {lawsCatalog.length > 0 && (
          <button
            onClick={() => setSelectedLawId(lawsCatalog[0].id)}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 underline"
          >
            Pilih regulasi lain
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Kop Dokumen Cetak Resmi Negara (hanya tampil saat diprint) */}
      <div className="hidden print:block text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-xl font-bold tracking-wider uppercase text-black">
          REPUBLIK INDONESIA
        </h1>
        <h2 className="text-base font-bold uppercase mt-1 text-black">
          {currentLawMetadata.nomorRegulasi || currentLawMetadata.nomor}
        </h2>
        <h3 className="text-sm font-semibold uppercase mt-1 text-black">
          {currentLawMetadata.judulLengkap || currentLawMetadata.judul}
        </h3>
        <p className="text-xs text-black mt-1">
          Salinan Naskah Resmi - Lorn-Hub Kompilasi Hukum Indonesia
        </p>
      </div>

      {/* Top Regulation Switcher & Document Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:px-4 rounded-2xl shadow-xs">
        {/* Regulation Dropdown Switcher */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <BookOpen size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Naskah Aktif:
          </span>
          <select
            id="select-law-quick"
            value={selectedLawId}
            onChange={(e) => {
              setSelectedLawId(e.target.value);
              loadLaw(e.target.value);
              setSelectedBab('');
            }}
            className="w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 truncate"
            aria-label="Pilih naskah regulasi untuk dibaca"
          >
            {lawsCatalog.map((law) => (
              <option key={law.id} value={law.id}>
                {law.singkatan || law.judul} ({law.nomorRegulasi || law.nomor})
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons: Print & Export */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            type="button"
            data-testid="btn-print-law"
            onClick={() => window.print()}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
            title="Cetak Naskah Resmi (Ctrl + P)"
            aria-label="Cetak Naskah"
          >
            <Printer size={15} className="text-amber-600 dark:text-amber-400" />
            <span>Cetak Naskah</span>
          </button>

          <button
            type="button"
            data-testid="btn-export-txt"
            onClick={() => {
              exportLawAsTxt({ metadata: currentLawMetadata, pasalList: currentArticles });
              if (onShowToast) onShowToast('Naskah berhasil diekspor (.txt)!', 'success');
            }}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
            title="Ekspor Naskah .TXT"
            aria-label="Ekspor TXT"
          >
            <Download size={15} className="text-amber-600 dark:text-amber-400" />
            <span>Ekspor .TXT</span>
          </button>

          <button
            type="button"
            data-testid="btn-export-json"
            onClick={() => {
              exportLawAsJson({ metadata: currentLawMetadata, pasalList: currentArticles });
              if (onShowToast) onShowToast('Naskah berhasil diekspor (.json)!', 'success');
            }}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
            title="Ekspor Naskah .JSON"
            aria-label="Ekspor JSON"
          >
            <Download size={15} className="text-amber-600 dark:text-amber-400" />
            <span>Ekspor .JSON</span>
          </button>
        </div>
      </div>

      {/* Law Hero Header */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {currentLawMetadata.judulLengkap || currentLawMetadata.judul}
        </h1>

        {/* Statutory Meta Line */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 dark:text-slate-400 pt-0.5">
          {currentLawMetadata.singkatan && (
            <>
              <span className="font-bold text-amber-800 dark:text-amber-400 font-mono">
                {currentLawMetadata.singkatan}
              </span>
              <span>•</span>
            </>
          )}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {currentLawMetadata.nomorRegulasi || currentLawMetadata.nomor}
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
              : currentLawMetadata.status === 'sebagian-dicabut'
              ? 'SEBAGIAN DICABUT'
              : 'TERSIMPAN'}
          </Badge>
        </div>

        {currentLawMetadata.deskripsi && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed pt-1">
            {currentLawMetadata.deskripsi}
          </p>
        )}

        <div className="flex items-center gap-4 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1.5">
            <Book size={14} className="text-amber-600 dark:text-amber-400" />
            <span>{currentArticles.length} Pasal Tersedia</span>
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Naskah Tersimpan di IndexedDB</span>
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
            placeholder={`Saring pasal dalam ${currentLawMetadata.singkatan || currentLawMetadata.judul}...`}
            className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {selectedBab && (
          <button
            type="button"
            onClick={() => handleSelectBab('')}
            className="min-h-[44px] text-xs px-3.5 py-2 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-medium whitespace-nowrap cursor-pointer hover:bg-amber-500/20 transition-colors"
          >
            Reset Filter Bab ✕
          </button>
        )}
      </div>

      {/* Main Layout Grid (Content + Table of Contents) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table of Contents for desktop */}
        <div className="hidden lg:block lg:col-span-4 sticky top-4">
          <TableOfContents
            articles={currentArticles}
            selectedBab={selectedBab}
            onSelectBab={handleSelectBab}
          />
        </div>

        {/* Articles List */}
        <div id="articles-list-container" className="lg:col-span-8 space-y-4">
          <div className="lg:hidden">
            <TableOfContents
              articles={currentArticles}
              selectedBab={selectedBab}
              onSelectBab={handleSelectBab}
            />
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tidak ada pasal yang cocok
              </p>
              <p className="text-xs text-slate-500">
                Coba ubah kata kunci atau bersihkan filter bab.
              </p>
            </div>
          ) : (
            filteredArticles.map((article, index) => (
              <ArticleCard
                key={`${article.id || article.lawId}-${article.nomor}-${index}`}
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

export default LawReader;
