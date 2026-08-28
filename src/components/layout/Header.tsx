import React from 'react';
import { Scale, Moon, Sun, Download, Type, WifiOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

interface HeaderProps {
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { theme, setTheme, fontFamily, setFontFamily, fontSize, setFontSize } = useTheme();
  const { isInstallable, installPWA } = usePWAInstall();
  const { isOffline } = useOfflineStatus();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
            <Scale size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                Lorn<span className="text-amber-500">Hub</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                HUKUM ID
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Asisten Kompilasi & Penelusuran Pasal Offline
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline Status Badge */}
          {isOffline && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-medium">
              <WifiOff size={13} />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          {/* Install PWA Button */}
          {isInstallable && (
            <button
              onClick={installPWA}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white dark:text-slate-950 dark:bg-amber-400 dark:hover:bg-amber-300 text-xs font-semibold shadow-sm transition-all animate-bounce"
              title="Install aplikasi ke HP / Komputer"
            >
              <Download size={14} />
              <span>Install App</span>
            </button>
          )}

          {/* Typography Selector (Serif vs Sans) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFontFamily('sans')}
              className={`px-2 py-1 text-xs rounded font-sans font-medium transition-all ${
                fontFamily === 'sans'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Font Sans Modern"
            >
              Sans
            </button>
            <button
              onClick={() => setFontFamily('serif')}
              className={`px-2 py-1 text-xs rounded font-serif font-medium transition-all ${
                fontFamily === 'serif'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Font Serif (Buku Hukum)"
            >
              Serif
            </button>
          </div>

          {/* Font Size Toggle */}
          <button
            onClick={() => {
              const sizes: Array<'sm' | 'base' | 'lg' | 'xl'> = ['sm', 'base', 'lg', 'xl'];
              const next = sizes[(sizes.indexOf(fontSize) + 1) % sizes.length];
              setFontSize(next);
            }}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 text-xs"
            title="Ubah Ukuran Huruf Dokumen"
          >
            <Type size={16} />
            <span className="uppercase text-[10px] font-bold">{fontSize}</span>
          </button>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
