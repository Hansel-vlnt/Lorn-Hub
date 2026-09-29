import React, { useState, useMemo } from 'react';
import { useLaw } from '../../context/LawContext';
import { LawMetadata } from '../../types';
import {
  Scale,
  BookOpen,
  ShieldAlert,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GitCompare,
} from 'lucide-react';

interface LawCatalogProps {
  onSelectLaw: (lawId: string) => void;
  onOpenCompare?: () => void;
  selectedLawId?: string;
}

type CategoryFilter = 'all' | 'tata-negara' | 'pidana' | 'perdata' | 'khusus';

export const LawCatalog: React.FC<LawCatalogProps> = ({
  onSelectLaw,
  onOpenCompare,
  selectedLawId,
}) => {
  const { lawsCatalog } = useLaw();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  const categoryFilters: Array<{ id: CategoryFilter; label: string; count: number }> = [
    { id: 'all', label: 'Semua Regulasi', count: lawsCatalog.length },
    {
      id: 'tata-negara',
      label: 'Tata Negara',
      count: lawsCatalog.filter((l) => l.kategori === 'tata-negara').length,
    },
    {
      id: 'pidana',
      label: 'Pidana & Acara',
      count: lawsCatalog.filter((l) => l.kategori === 'pidana' || l.kategori === 'acara').length,
    },
    {
      id: 'perdata',
      label: 'Hukum Perdata',
      count: lawsCatalog.filter((l) => l.kategori === 'perdata').length,
    },
    {
      id: 'khusus',
      label: 'Khusus & Sektoral',
      count: lawsCatalog.filter((l) => l.kategori === 'khusus' || l.kategori === 'ketenagakerjaan').length,
    },
  ];

  const filteredCatalog = useMemo(() => {
    return lawsCatalog.filter((law) => {
      // Category filter
      if (selectedCategory === 'tata-negara' && law.kategori !== 'tata-negara') return false;
      if (selectedCategory === 'pidana' && law.kategori !== 'pidana' && law.kategori !== 'acara') return false;
      if (selectedCategory === 'perdata' && law.kategori !== 'perdata') return false;
      if (
        selectedCategory === 'khusus' &&
        law.kategori !== 'khusus' &&
        law.kategori !== 'ketenagakerjaan'
      )
        return false;

      // Text search
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase().trim();
        const matchesSingkatan = law.singkatan.toLowerCase().includes(q);
        const matchesJudul = law.judulLengkap.toLowerCase().includes(q);
        const matchesNomor = law.nomorRegulasi.toLowerCase().includes(q);
        const matchesDeskripsi = law.deskripsi.toLowerCase().includes(q);
        return matchesSingkatan || matchesJudul || matchesNomor || matchesDeskripsi;
      }
      return true;
    });
  }, [lawsCatalog, selectedCategory, catalogSearch]);

  const getStatusBadge = (status: LawMetadata['status']) => {
    switch (status) {
      case 'berlaku':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={12} />
            <span>Berlaku Penuh</span>
          </span>
        );
      case 'transisi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock size={12} />
            <span>Masa Transisi (2026)</span>
          </span>
        );
      case 'sebagian-dicabut':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <AlertTriangle size={12} />
            <span>Sebagian Dicabut</span>
          </span>
        );
    }
  };

  const getCategoryIcon = (kategori: LawMetadata['kategori']) => {
    switch (kategori) {
      case 'tata-negara':
        return <Scale size={16} className="text-amber-600 dark:text-amber-400" />;
      case 'pidana':
      case 'acara':
        return <ShieldAlert size={16} className="text-rose-600 dark:text-rose-400" />;
      case 'perdata':
        return <FileText size={16} className="text-blue-600 dark:text-blue-400" />;
      default:
        return <BookOpen size={16} className="text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <section className="space-y-6 max-w-5xl mx-auto pb-12" aria-labelledby="katalog-heading">
      {/* Catalog Intro Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h2 id="katalog-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Katalog Peraturan Perundang-Undangan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Pustaka naskah hukum dasar, kodifikasi pidana, perdata, acara, serta regulasi pokok Indonesia ({lawsCatalog.length} Kitab & UU) dengan anotasi resmi dan status keberlakuan yuridis.
            </p>
          </div>

          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-2 self-start sm:self-center flex-shrink-0"
            >
              <GitCompare size={16} className="text-amber-600 dark:text-amber-400" />
              <span>Matriks KUHP Baru vs Lama</span>
            </button>
          )}
        </div>

        {/* Search inside catalog */}
        <div className="relative pt-2">
          <Search size={16} className="absolute left-3.5 top-5 text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            value={catalogSearch}
            onChange={(e) => setCatalogSearch(e.target.value)}
            placeholder="Cari regulasi berdasarkan nama, singkatan (KUHP, BW, UUD), atau nomor UU..."
            className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
      </div>

      {/* Filter Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Kategori Regulasi">
        {categoryFilters.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedCategory(tab.id)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2 ${
                isActive
                  ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 border-amber-600 dark:border-amber-500 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Regulations Grid */}
      {filteredCatalog.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Tidak ada regulasi yang sesuai pencarian
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Coba bersihkan kata kunci atau pilih kategori lain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredCatalog.map((law) => {
            const isCurrentlySelected = selectedLawId === law.id;

            return (
              <article
                key={law.id}
                className={`p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-500/50 ${
                  isCurrentlySelected
                    ? 'ring-2 ring-amber-500/40 border-amber-500/60'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Card Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        {getCategoryIcon(law.kategori)}
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-400">
                        {law.kode}
                      </span>
                    </div>
                    {getStatusBadge(law.status)}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      {law.singkatan}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      {law.nomorRegulasi}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {law.deskripsi}
                  </p>
                </div>

                {/* Card Footer: Metadata & Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Cakupan: {law.totalPasal} Pasal</span>
                    <span>Tahun Terbit: {law.tahun}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectLaw(law.id)}
                      className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-xs font-semibold transition-colors flex items-center justify-center shadow-xs"
                      aria-label={`Buka naskah bacaan ${law.singkatan}`}
                    >
                      <span>Buka Naskah Lengkap</span>
                    </button>

                    {(law.id === 'kuhp-baru-uu-1-2023' || law.id === 'kuhp-lama-wvs') && onOpenCompare && (
                      <button
                        onClick={onOpenCompare}
                        className="min-h-[44px] px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1"
                        title="Bandingkan KUHP Baru vs KUHP Lama"
                        aria-label="Bandingkan di Matriks Komparasi"
                      >
                        <GitCompare size={14} />
                        <span className="hidden sm:inline">Komparasi</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
