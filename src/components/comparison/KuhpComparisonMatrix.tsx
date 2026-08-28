import React, { useState } from 'react';
import { KUHP_COMPARISONS } from '../../data/comparisons';
import { GitCompare, CheckCircle, Info, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const KuhpComparisonMatrix: React.FC = () => {
  const [selectedComparisonId, setSelectedComparisonId] = useState<string>(KUHP_COMPARISONS[0].id);

  const selectedCmp = KUHP_COMPARISONS.find((c) => c.id === selectedComparisonId) || KUHP_COMPARISONS[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 border border-amber-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <GitCompare size={22} />
            </span>
            <Badge variant="amber" size="md">
              TRANSISI HUKUM PIDANA NASIONAL
            </Badge>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Komparasi KUHP Baru (UU 1/2023) vs KUHP Lama (WvS)
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Perbandingan pasal demi pasal antara Wetboek van Strafrecht (KUHP Kolonial) dengan Kitab Undang-Undang Hukum Pidana Nasional 2023.
          </p>
        </div>
      </div>

      {/* Category Picker Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {KUHP_COMPARISONS.map((cmp) => {
          const isSelected = cmp.id === selectedComparisonId;
          return (
            <button
              key={cmp.id}
              onClick={() => setSelectedComparisonId(cmp.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
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
              <span className="text-xs font-mono text-slate-400">Staatsblad 1915:732</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedCmp.pasalLama.nomor}
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              Judul Delik: {selectedCmp.pasalLama.judul}
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm font-serif leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              "{selectedCmp.pasalLama.isi}"
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Ancaman Pidana Pokok:</span>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5 font-medium">{selectedCmp.pasalLama.sanksi}</p>
          </div>
        </div>

        {/* KUHP Baru (UU 1/2023) Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/40 shadow-xs flex flex-col justify-between space-y-4 relative">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="amber" size="sm">
                KUHP BARU (UU NO. 1/2023)
              </Badge>
              <span className="text-xs font-mono text-amber-500 font-bold">Hukum Nasional</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedCmp.pasalBaru.nomor}
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              Judul Delik: {selectedCmp.pasalBaru.judul}
            </p>

            <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 text-xs sm:text-sm font-serif leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              "{selectedCmp.pasalBaru.isi}"
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-xs">
            <span className="font-bold text-amber-700 dark:text-amber-300">Ancaman Pidana Pokok & Denda:</span>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5 font-medium">{selectedCmp.pasalBaru.sanksi}</p>
          </div>
        </div>
      </div>

      {/* Analysis & Changes Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Analisis Yuridis & Pokok Perubahan
          </h3>
        </div>

        <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          {selectedCmp.poinPerubahan.map((point, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckCircle size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        {selectedCmp.catatanPenting && (
          <div className="p-3.5 rounded-xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/20 text-xs flex items-start gap-2 text-blue-700 dark:text-blue-300">
            <Info size={15} className="flex-shrink-0 mt-0.5 text-blue-500" />
            <p>
              <span className="font-bold">Catatan Ujian / Sidang Semu:</span> {selectedCmp.catatanPenting}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
