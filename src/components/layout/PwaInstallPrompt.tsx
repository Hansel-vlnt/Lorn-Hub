import React, { useState } from 'react';
import { Smartphone, Download, X, Check } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Button } from '../ui/Button';

export const PwaInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || !isInstallable || isDismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-amber-500/30 animate-in slide-in-from-bottom-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Smartphone size={24} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Pasang Lorn-Hub di HP Anda</h4>
            <p className="text-xs text-slate-300 mt-1">
              Gunakan tanpa kuota internet di ruang sidang, perpustakaan, atau saat kuliah.
            </p>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-amber-300">
              <Check size={12} />
              <span>Pencarian Cepat 0.01 Detik</span>
              <Check size={12} />
              <span>Full Offline</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white p-1"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
        <Button
          onClick={installPWA}
          variant="primary"
          size="sm"
          className="w-full font-bold"
          icon={<Download size={14} />}
        >
          Download / Tambahkan ke Layar Utama
        </Button>
      </div>
    </div>
  );
};
