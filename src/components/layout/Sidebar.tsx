import React from 'react';
import {
  DownloadCloud,
  Search,
  FileText,
  BookOpen,
  ChevronRight,
  Trash2,
  Plus,
} from 'lucide-react';
import { MainNavTab } from './MobileNav';
import { useLaw } from '../../context/LawContext';
import { LawMetadata } from '../../types';

interface SidebarProps {
  activeTab: MainNavTab;
  onChangeTab: (tab: MainNavTab) => void;
  onSelectLawAndRead?: (lawId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onChangeTab,
  onSelectLawAndRead,
}) => {
  const { lawsCatalog, selectedLawId, setSelectedLawId, deleteLaw } = useLaw();

  const mainNav = [
    { id: 'scraper' as MainNavTab, label: 'Scraper / Tambah Regulasi', icon: <DownloadCloud size={18} /> },
    { id: 'search' as MainNavTab, label: 'Pencarian Kilat', icon: <Search size={18} /> },
    { id: 'pdf' as MainNavTab, label: 'PDF & Dokumen Hub', icon: <FileText size={18} /> },
    { id: 'reader' as MainNavTab, label: 'Baca Regulasi', icon: <BookOpen size={18} /> },
  ];

  const handleSelectLaw = (lawId: string) => {
    if (onSelectLawAndRead) {
      onSelectLawAndRead(lawId);
    } else {
      setSelectedLawId(lawId);
      if (activeTab !== 'reader') onChangeTab('reader');
    }
  };

  const handleDeleteLaw = async (e: React.MouseEvent, lawId: string, lawTitle: string) => {
    e.stopPropagation();
    if (confirm(`Hapus regulasi "${lawTitle}" dari basis data lokal?`)) {
      await deleteLaw(lawId);
    }
  };

  return (
    <aside
      data-testid="sidebar-desktop"
      className="hidden md:flex w-72 h-full flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex-shrink-0"
    >
      {/* Top Section: Primary Navigation & Stored Regulations Switcher */}
      <div className="p-3.5 space-y-4 flex-1 min-h-0 flex flex-col">
        {/* Menu Utama: 4 Real Tools */}
        <div className="space-y-1 flex-shrink-0">
          <p className="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Menu Utama
          </p>
          {mainNav.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                data-testid={`sidebar-nav-${item.id}`}
                onClick={() => onChangeTab(item.id)}
                className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all border ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold border-amber-500/20 shadow-xs'
                    : 'border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isActive && (
                    <span className="w-1.5 h-4 rounded-full bg-amber-600 dark:bg-amber-400 -ml-1 flex-shrink-0" />
                  )}
                  <span className={isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Stored Regulations Switcher */}
        <div className="space-y-1 flex-1 min-h-0 flex flex-col border-t border-slate-100 dark:border-slate-800/80 pt-3">
          <div className="flex items-center justify-between px-3 mb-1.5 flex-shrink-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Regulasi Tersimpan ({lawsCatalog.length})
            </p>
            <button
              type="button"
              onClick={() => onChangeTab('scraper')}
              title="Tambah regulasi baru"
              aria-label="Tambah regulasi baru"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div
            data-testid="sidebar-regulations-scroll-container"
            className="space-y-1 flex-1 min-h-0 overflow-y-auto pr-1"
          >
            {lawsCatalog.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 px-3 py-4">
                Belum ada regulasi. Gunakan Scraper untuk menambahkan.
              </p>
            ) : (
              lawsCatalog.map((law: LawMetadata) => {
                const isSelected = activeTab === 'reader' && selectedLawId === law.id;
                return (
                  <div
                    key={law.id}
                    onClick={() => handleSelectLaw(law.id)}
                    className={`group w-full text-left p-2.5 min-h-[44px] rounded-xl transition-all border cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/40 text-slate-900 dark:text-white shadow-xs'
                        : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs tracking-tight truncate text-slate-900 dark:text-slate-100">
                          {law.singkatan || law.judul}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {law.nomorRegulasi || law.nomor}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteLaw(e, law.id, law.singkatan || law.judul)}
                        title={`Hapus ${law.singkatan || law.judul}`}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded-md transition-opacity"
                        aria-label={`Hapus ${law.singkatan || law.judul}`}
                      >
                        <Trash2 size={13} />
                      </button>
                      <ChevronRight
                        size={14}
                        className={isSelected ? 'text-amber-600 dark:text-amber-400' : 'opacity-40 text-slate-400'}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
