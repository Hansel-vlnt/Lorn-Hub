import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

export const OfflineBanner: React.FC = () => {
  const { isOffline, wasOffline } = useOfflineStatus();

  if (!isOffline && !wasOffline) return null;

  if (isOffline) {
    return (
      <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-inner">
        <WifiOff size={16} />
        <span>Mode Offline Aktif — Seluruh dataset pasal & pencarian tetap berfungsi normal tanpa internet.</span>
      </div>
    );
  }

  return (
    <div className="bg-emerald-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 transition-all">
      <Wifi size={16} />
      <span>Koneksi kembali terhubung!</span>
    </div>
  );
};
