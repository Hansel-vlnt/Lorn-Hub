import React from 'react';
import { BookOpen, Search, GitCompare, BookmarkCheck, ChevronRight, ShieldCheck, FileText } from 'lucide-react';
import { MainNavTab } from './MobileNav';
import { useLaw } from '../../context/LawContext';
import { LawMetadata } from '../../types';

interface SidebarProps {
  activeTab: MainNavTab;
  onChangeTab: (tab: MainNavTab) => void;
  bookmarkCount?: number;
  readerViewMode?: 'catalog' | 'reading';
  onOpenCatalog?: () => void;
  onSelectLawAndRead?: (lawId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onChangeTab,
  bookmarkCount = 0,
  readerViewMode = 'catalog',
  onOpenCatalog,
  onSelectLawAndRead,
}) => {
  const { lawsCatalog, selectedLawId, setSelectedLawId } = useLaw();

  const mainNav = [
    { id: 'reader' as MainNavTab, label: 'Jelajah Kitab & UU', icon: <BookOpen size={18} /> },
    { id: 'search' as MainNavTab, label: 'Pencarian Pasal', icon: <Search size={18} /> },
    { id: 'compare' as MainNavTab, label: 'Komparasi KUHP Baru vs Lama', icon: <GitCompare size={18} /> },
    { id: 'pdf' as MainNavTab, label: 'PDF Hub', icon: <FileText size={18} /> },
    {
      id: 'study' as MainNavTab,
      label: 'Meja Belajar Mahasiswa',
      icon: <BookmarkCheck size={18} />,
      badge: bookmarkCount > 0 ? bookmarkCount : undefined,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 space-y-6 flex-shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Primary Tabs */}
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Menu Utama
        </p>
        {mainNav.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'reader' && onOpenCatalog) {
                  onOpenCatalog();
                }
                onChangeTab(item.id);
              }}
              className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-amber-600 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legal Kit Switcher */}
      <div className="space-y-1 flex-1 overflow-y-auto pr-1">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Katalog Peraturan ({lawsCatalog.length})
          </p>
        </div>

        <div className="space-y-1">
          {lawsCatalog.map((law: LawMetadata) => {
            const isSelected = activeTab === 'reader' && readerViewMode === 'reading' && selectedLawId === law.id;
            return (
              <button
                key={law.id}
                onClick={() => {
                  if (onSelectLawAndRead) {
                    onSelectLawAndRead(law.id);
                  } else {
                    setSelectedLawId(law.id);
                    if (activeTab !== 'reader') onChangeTab('reader');
                  }
                }}
                className={`w-full text-left p-2.5 min-h-[44px] rounded-xl transition-all border ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800/80 border-amber-500/40 text-slate-900 dark:text-white shadow-xs'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs tracking-tight">{law.singkatan}</span>
                  <ChevronRight size={14} className={isSelected ? 'text-amber-500' : 'opacity-30'} />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {law.nomorRegulasi}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Offline Verified Badge Footer */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
        <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200">Arsip Regulasi Lokal</p>
          <p className="text-[10px]">Seluruh naskah tersimpan di perangkat untuk dibaca tanpa internet.</p>
        </div>
      </div>
    </aside>
  );
};
