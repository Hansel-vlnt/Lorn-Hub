import React, { useState } from 'react';
import { KUHP_COMPARISONS } from '../../data/comparisons';
import { GitCompare, CheckCircle, Info, Scale, Copy, Check } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useTheme } from '../../context/ThemeContext';

export const KuhpComparisonMatrix: React.FC = () => {
  const [selectedComparisonId, setSelectedComparisonId] = useState<string>(KUHP_COMPARISONS[0].id);
  const [copied, setCopied] = useState<boolean>(false);
  const { fontFamily, fontSize } = useTheme();

  const selectedCmp = KUHP_COMPARISONS.find((c) => c.id === selectedComparisonId) || KUHP_COMPARISONS[0];

  const fontClasses = {
    fontFamily: fontFamily === 'serif' ? 'font-serif' : 'font-sans',
    fontSize: {
      sm: 'text-sm leading-normal',
      base: 'text-base leading-relaxed',
      lg: 'text-lg leading-relaxed',
      xl: 'text-xl leading-loose',
    }[fontSize],
  };

  const handleCopyComparison = () => {
    const text = `KOMPARASI KUHP:\n\n[KUHP LAMA - ${selectedCmp.pasalLama.nomor}]\nJudul: ${selectedCmp.pasalLama.judul}\nIsi: ${selectedCmp.pasalLama.isi}\nSanksi: ${selectedCmp.pasalLama.sanksi}\n\n[KUHP BARU - ${selectedCmp.pasalBaru.nomor}]\nJudul: ${selectedCmp.pasalBaru.judul}\nIsi: ${selectedCmp.pasalBaru.isi}\nSanksi: ${selectedCmp.pasalBaru.sanksi}\n\n[POKOK PERUBAHAN]\n${selectedCmp.poinPerubahan.map((p) => `- ${p}`).join('\n')}\n\nDikutip dari Lorn-Hub`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-xs relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <GitCompare size={20} />
            </span>
            <Badge variant="amber" size="md">
              TRANSISI HUKUM PIDANA NASIONAL
            </Badge>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Komparasi KUHP Baru (UU 1/2023) vs KUHP Lama (WvS)
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Perbandingan pasal demi pasal antara Wetboek van Strafrecht (KUHP Kolonial) dengan Kitab Undang-Undang Hukum Pidana Nasional 2023.
          </p>
        </div>
      </div>

      {/* Category Picker Tabs (min-h-[44px] for thumb zone accessibility) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {KUHP_COMPARISONS.map((cmp) => {
          const isSelected = cmp.id === selectedComparisonId;
          return (
            <button
              key={cmp.id}
              onClick={() => setSelectedComparisonId(cmp.id)}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center ${
                isSelected
                  ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 border-amber-600 dark:border-amber-500 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {cmp.kategoriKejahatan}
            </button>
          );
        })}
      </div>

      {/* Side by Side Comparison Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* KUHP Lama (WvS) Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" size="sm">
                KUHP LAMA (WvS 1915)
              </Badge>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Staatsblad 1915:732</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedCmp.pasalLama.nomor}
            </h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Judul Delik: {selectedCmp.pasalLama.judul}
            </p>

            <div className={`p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 ${fontClasses.fontFamily} ${fontClasses.fontSize} text-slate-900 dark:text-slate-100 whitespace-pre-wrap`}>
              "{selectedCmp.pasalLama.isi}"
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">Ancaman Pidana Pokok:</span>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5 font-medium">{selectedCmp.pasalLama.sanksi}</p>
          </div>
        </div>

        {/* KUHP Baru (UU 1/2023) Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/40 shadow-xs flex flex-col justify-between space-y-4 relative">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="amber" size="sm">
                KUHP BARU (UU NO. 1/2023)
              </Badge>
              <span className="text-xs font-mono text-amber-800 dark:text-amber-400 font-bold">Hukum Nasional</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedCmp.pasalBaru.nomor}
            </h3>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Judul Delik: {selectedCmp.pasalBaru.judul}
            </p>

            <div className={`p-4 rounded-xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 ${fontClasses.fontFamily} ${fontClasses.fontSize} text-slate-900 dark:text-slate-100 whitespace-pre-wrap`}>
              "{selectedCmp.pasalBaru.isi}"
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-xs">
            <span className="font-bold text-amber-800 dark:text-amber-300">Ancaman Pidana Pokok & Denda:</span>
            <p className="text-slate-800 dark:text-slate-200 mt-0.5 font-medium">{selectedCmp.pasalBaru.sanksi}</p>
          </div>
        </div>
      </div>

      {/* Analysis & Changes Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-amber-700 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Analisis Yuridis & Pokok Perubahan
            </h3>
          </div>
          <button
            onClick={handleCopyComparison}
            className="min-h-[44px] px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
            title="Salin Matriks Komparasi"
            aria-label="Salin teks matriks komparasi ini"
          >
            {copied ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin' : 'Salin Komparasi'}</span>
          </button>
        </div>

        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
          {selectedCmp.poinPerubahan.map((point, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        {selectedCmp.catatanPenting && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-start gap-2.5 text-slate-800 dark:text-slate-200">
            <Info size={16} className="flex-shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
            <p>
              <span className="font-bold">Catatan Ujian / Sidang Semu:</span> {selectedCmp.catatanPenting}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
