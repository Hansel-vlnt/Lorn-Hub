import React, { useState } from 'react';
import { useLaw } from '../../context/LawContext';
import {
  DownloadCloud,
  Globe,
  Loader2,
  CheckCircle2,
  Database,
  ArrowRight,
  FileCode,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { LawCategory, LawMetadata } from '../../types/law';

export interface RegulationScraperViewProps {
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onOpenLaw?: (lawId: string) => void;
  initialData?: {
    rawText?: string;
    judul?: string;
    nomor?: string;
  } | null;
}

export const RegulationScraperView: React.FC<RegulationScraperViewProps> = ({
  onShowToast,
  onOpenLaw,
  initialData,
}) => {
  const { lawsCatalog, downloadLaw, ingestTextLaw, deleteLaw, clearAllLaws } = useLaw();
  const [ingestMode, setIngestMode] = useState<'url' | 'text'>('text');

  // URL mode state
  const [url, setUrl] = useState('');

  // Text mode state
  const [rawText, setRawText] = useState('');

  // Common metadata state
  const [meta, setMeta] = useState<{
    id: string;
    judul: string;
    nomor: string;
    tahun: number;
    kategori: LawCategory;
  }>({
    id: '',
    judul: '',
    nomor: '',
    tahun: new Date().getFullYear(),
    kategori: 'khusus',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      if (initialData.rawText) {
        setRawText(initialData.rawText);
        setIngestMode('text');
      }
      const title = initialData.judul || '';
      const autoId = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '';
      setMeta((prev) => ({
        ...prev,
        judul: title || prev.judul,
        nomor: initialData.nomor || prev.nomor,
        id: autoId || prev.id,
      }));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalId = (meta.id.trim() || meta.judul.trim()).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!finalId || !meta.judul.trim()) {
      onShowToast?.('Mohon isi Judul regulasi.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      if (ingestMode === 'url') {
        if (!url.trim()) {
          onShowToast?.('Mohon masukkan tautan URL naskah.', 'error');
          setIsSubmitting(false);
          return;
        }
        await downloadLaw(url.trim(), {
          ...meta,
          id: finalId,
        });
        onShowToast?.(`Berhasil mengunduh & menyimpan "${meta.judul}"`, 'success');
        setUrl('');
      } else {
        if (!rawText.trim()) {
          onShowToast?.('Mohon masukkan naskah teks atau JSON regulasi.', 'error');
          setIsSubmitting(false);
          return;
        }
        await ingestTextLaw(rawText, {
          ...meta,
          id: finalId,
        });
        onShowToast?.(`Berhasil memproses & menyimpan "${meta.judul}"`, 'success');
        setRawText('');
      }

      setMeta({
        id: '',
        judul: '',
        nomor: '',
        tahun: new Date().getFullYear(),
        kategori: 'khusus',
      });
    } catch (err: any) {
      onShowToast?.(`Gagal menyimpan: ${err.message || 'Terjadi kesalahan'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (lawId: string, lawJudul: string) => {
    if (confirm(`Hapus regulasi "${lawJudul}" dari IndexedDB?`)) {
      try {
        await deleteLaw(lawId);
        onShowToast?.(`Regulasi "${lawJudul}" dihapus.`, 'info');
      } catch (err: any) {
        onShowToast?.(`Gagal menghapus: ${err.message}`, 'error');
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('Hapus seluruh regulasi dari basis data lokal? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        await clearAllLaws();
        onShowToast?.('Seluruh regulasi telah dibersihkan.', 'info');
      } catch (err: any) {
        onShowToast?.(`Gagal membersihkan: ${err.message}`, 'error');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Globe size={20} />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Scraper & Tambah Regulasi
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Tambahkan naskah peraturan hukum asli langsung ke penyimpanan IndexedDB lokal Anda. Masukkan tautan URL web/JSON atau tempel teks peraturan secara langsung untuk pengindeksan offline instan.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <Database size={15} className="text-amber-600 dark:text-amber-400" />
            <span>{lawsCatalog.length} Regulasi Tersimpan</span>
          </div>
        </div>
      </div>

      {/* Main Ingestion Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        {/* Ingestion Mode Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            type="button"
            onClick={() => setIngestMode('text')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              ingestMode === 'text'
                ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <FileCode size={16} />
            <span>Input Teks Langsung / Salin-Tempel</span>
          </button>
          <button
            type="button"
            onClick={() => setIngestMode('url')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              ingestMode === 'url'
                ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Globe size={16} />
            <span>Tautan URL (Online Scraping)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ID Unik Dokumen <span className="text-rose-500">*</span>
              </label>
              <input
                required
                data-testid="scraper-input-id"
                placeholder="Misal: uu-1-2024 atau kuhp-2023"
                value={meta.id}
                onChange={(e) => setMeta({ ...meta, id: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Judul Regulasi <span className="text-rose-500">*</span>
              </label>
              <input
                required
                data-testid="scraper-input-judul"
                placeholder="Misal: Undang-Undang Informasi dan Transaksi Elektronik"
                value={meta.judul}
                onChange={(e) => setMeta({ ...meta, judul: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nomor Resmi Regulasi
              </label>
              <input
                data-testid="scraper-input-nomor"
                placeholder="Misal: UU No. 1 Tahun 2024"
                value={meta.nomor}
                onChange={(e) => setMeta({ ...meta, nomor: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tahun Terbit
                </label>
                <input
                  type="number"
                  data-testid="scraper-input-tahun"
                  value={meta.tahun}
                  onChange={(e) => setMeta({ ...meta, tahun: parseInt(e.target.value, 10) || new Date().getFullYear() })}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kategori
                </label>
                <select
                  value={meta.kategori}
                  onChange={(e) => setMeta({ ...meta, kategori: e.target.value as LawCategory })}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                >
                  <option value="khusus">Hukum Khusus / Sektoral</option>
                  <option value="pidana">Hukum Pidana</option>
                  <option value="perdata">Hukum Perdata</option>
                  <option value="tata-negara">Hukum Tata Negara</option>
                  <option value="acara">Hukum Acara</option>
                  <option value="ketenagakerjaan">Ketenagakerjaan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dynamic Input depending on Mode */}
          {ingestMode === 'url' ? (
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                URL Sumber Naskah (.html atau .json) <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="url"
                data-testid="scraper-input-url"
                placeholder="https://contoh-sumber-hukum.go.id/peraturan.html"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
              <p className="text-[11px] text-slate-500">
                Sistem akan mengunduh dan mengekstrak struktur pasal serta penjelasan dari tautan di atas.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Naskah Teks Regulasi atau JSON <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={8}
                data-testid="scraper-textarea-raw"
                placeholder="Tempel naskah undang-undang di sini... (Sistem mengenali format 'BAB ...', 'Pasal 1 ...', '(1) ...' secara otomatis, atau array JSON pasal)"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono leading-relaxed"
              />
              <p className="text-[11px] text-slate-500">
                Tips: Tempel salinan naskah asli dari dokumen hukum. Parser otomatis akan mengelompokkan pasal dan ayat ke dalam IndexedDB.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              data-testid="scraper-btn-submit"
              disabled={isSubmitting}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 font-semibold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sedang Memproses...</span>
                </>
              ) : (
                <>
                  <DownloadCloud size={16} />
                  <span>Simpan ke IndexedDB</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Synchronized Storage List */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Arsip Regulasi Tersimpan ({lawsCatalog.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daftar seluruh undang-undang dan naskah hukum yang aktif tersimpan di basis data lokal browser.
            </p>
          </div>

          {lawsCatalog.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="min-h-[44px] px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-rose-200 dark:border-rose-900/60 flex items-center gap-1.5 self-start sm:self-center"
            >
              <Trash2 size={14} />
              <span>Bersihkan Semua Data</span>
            </button>
          )}
        </div>

        {lawsCatalog.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
            <AlertTriangle className="mx-auto text-amber-500" size={24} />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Belum ada naskah regulasi yang tersimpan
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Gunakan formulir di atas untuk mengimpor naskah hukum via teks langsung atau tautan URL online.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {lawsCatalog.map((law: LawMetadata) => {
              return (
                <div
                  key={law.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs tracking-tight text-slate-900 dark:text-white">
                        {law.singkatan || law.judul}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={11} />
                        IndexedDB Offline
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                      {law.nomorRegulasi || law.nomor} - {law.judul}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Cakupan: {law.totalPasal || 0} Pasal | Tahun: {law.tahun} | Sumber: {law.sumberUrl || 'Naskah Langsung'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    {onOpenLaw && (
                      <button
                        type="button"
                        onClick={() => onOpenLaw(law.id)}
                        className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <span>Buka di Pembaca</span>
                        <ArrowRight size={14} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(law.id, law.singkatan || law.judul)}
                      className="min-h-[44px] min-w-[44px] px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center justify-center"
                      title="Hapus dari penyimpanan"
                      aria-label={`Hapus ${law.singkatan || law.judul}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
