import React, { useState } from 'react';
import { Scale, Moon, Sun, Download, Type, WifiOff, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

interface HeaderProps {
  onOpenSearch?: () => void;
}

const fontSizes: Array<{ id: 'sm' | 'base' | 'lg' | 'xl'; label: string; desc: string }> = [
  { id: 'sm', label: 'SM', desc: 'Kompak (14px)' },
  { id: 'base', label: 'MD', desc: 'Standar (16px)' },
  { id: 'lg', label: 'LG', desc: 'Nyaman (18px)' },
  { id: 'xl', label: 'XL', desc: 'Besar (20px)' },
];

export const Header: React.FC<HeaderProps> = () => {
  const { theme, setTheme, fontFamily, setFontFamily, fontSize, setFontSize } = useTheme();
  const { isInstallable, installPWA } = usePWAInstall();
  const { isOffline } = useOfflineStatus();
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-xs flex-shrink-0">
            <Scale size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                Lorn<span className="text-amber-600 dark:text-amber-400">Hub</span>
              </span>
              <span className="hidden sm:inline-flex text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-bold">
                HUKUM ID
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 hidden md:block">
              Antarmuka Pembacaan & Komparasi Regulasi Indonesia
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Offline Status Badge */}
          {isOffline && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-medium">
              <WifiOff size={13} />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          {/* Install PWA Button */}
          {isInstallable && (
            <button
              onClick={installPWA}
              className="flex items-center gap-1.5 min-h-[44px] px-2.5 sm:px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-xs font-semibold shadow-xs transition-colors"
              title="Install aplikasi ke HP / Komputer"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* Typography Mode Selector: Responsive Toggle */}
          <div className="flex items-center">
            {/* Mobile single toggle button (sm:hidden) */}
            <button
              onClick={() => setFontFamily(fontFamily === 'sans' ? 'serif' : 'sans')}
              className={`sm:hidden min-h-[44px] min-w-[44px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 transition-colors flex items-center justify-center text-xs font-semibold ${
                fontFamily === 'serif' ? 'font-serif text-amber-800 dark:text-amber-400' : 'font-sans text-slate-800 dark:text-slate-200'
              }`}
              title={fontFamily === 'sans' ? 'Ganti ke Font Serif (Buku Hukum)' : 'Ganti ke Font Sans (Modern)'}
              aria-label="Ganti model huruf Sans atau Serif"
            >
              <span>{fontFamily === 'serif' ? 'Serif' : 'Sans'}</span>
            </button>

            {/* Desktop segmented control (hidden sm:flex) */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setFontFamily('sans')}
                className={`min-h-[44px] px-3 py-1.5 text-xs rounded-md font-sans transition-all flex items-center justify-center ${
                  fontFamily === 'sans'
                    ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 font-bold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Tipografi Sans-Serif (Modern / Inter)"
              >
                Sans
              </button>
              <button
                onClick={() => setFontFamily('serif')}
                className={`min-h-[44px] px-3 py-1.5 text-xs rounded-md font-serif transition-all flex items-center justify-center ${
                  fontFamily === 'serif'
                    ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 font-bold shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Tipografi Serif (Buku Hukum Cetak / Merriweather)"
              >
                Serif
              </button>
            </div>
          </div>

          {/* 4-Level Font Size Selector (Desktop segmented, Mobile dropdown) */}
          <div className="relative">
            {/* Desktop 4-Segment Scale */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              {fontSizes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFontSize(item.id)}
                  className={`min-h-[44px] px-2.5 py-1 text-xs rounded-md transition-all font-semibold flex items-center justify-center ${
                    fontSize === item.id
                      ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={`Ukuran Teks: ${item.desc}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Mobile / Tablet Font Size Button */}
            <button
              onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
              className="lg:hidden min-h-[44px] min-w-[44px] px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1 text-xs font-semibold"
              title="Ubah Ukuran Teks Bacaan"
              aria-label="Pengaturan ukuran teks bacaan"
            >
              <Type size={16} />
              <span className="uppercase text-[11px] font-bold text-amber-700 dark:text-amber-400">
                {fontSize}
              </span>
            </button>

            {/* Dropdown Menu for Mobile Font Size */}
            {showFontSizeMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowFontSizeMenu(false)}
                  aria-hidden="true"
                />
                <div
                  className="absolute right-0 top-12 z-50 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md p-1.5 space-y-1"
                >
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    Ukuran Huruf
                  </div>
                  {fontSizes.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setFontSize(item.id);
                        setShowFontSizeMenu(false);
                      }}
                      className={`w-full min-h-[44px] px-3 py-2 rounded-lg text-left text-xs font-medium flex items-center justify-between transition-colors ${
                        fontSize === item.id
                          ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <span className="font-bold">{item.label}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">
                          {item.desc}
                        </span>
                      </div>
                      {fontSize === item.id && <Check size={14} className="text-amber-600 dark:text-amber-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="min-h-[44px] min-w-[44px] p-2.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center"
            title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            aria-label="Beralih tema terang atau gelap"
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

