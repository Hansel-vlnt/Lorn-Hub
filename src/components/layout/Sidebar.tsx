import React, { useState, useMemo } from 'react';
import {
  Search,
  FileText,
  BookOpen,
  BookmarkCheck,
  ChevronRight,
  Trash2,
  Globe,
} from 'lucide-react';
import { MainNavTab } from './MobileNav';
import { useLaw } from '../../context/LawContext';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';
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
  const { isOnline } = useOfflineStatus();
  const [filterQuery, setFilterQuery] = useState<string>('');

  const mainNav = [
    { id: 'catalog' as MainNavTab, label: 'Jelajah Regulasi', icon: <BookOpen size={18} /> },
    { id: 'search' as MainNavTab, label: 'Pencarian Kilat', icon: <Search size={18} /> },
    { id: 'scraper' as MainNavTab, label: 'Tambah / Sinkron Regulasi', icon: <Globe size={18} /> },
    { id: 'pdf' as MainNavTab, label: 'PDF & Dokumen Hub', icon: <FileText size={18} /> },
    { id: 'study' as MainNavTab, label: 'Meja Belajar', icon: <BookmarkCheck size={18} /> },
  ];

  const filteredLaws = useMemo(() => {
    if (!filterQuery.trim()) return lawsCatalog;
    const q = filterQuery.toLowerCase().trim();
    return lawsCatalog.filter((law) => {
      const singkatan = (law.singkatan || '').toLowerCase();
      const nomor = (law.nomorRegulasi || law.nomor || '').toLowerCase();
      const judul = (law.judulLengkap || law.judul || '').toLowerCase();
      const kode = (law.kode || '').toLowerCase();
      return (
        singkatan.includes(q) ||
        nomor.includes(q) ||
        judul.includes(q) ||
        kode.includes(q)
      );
    });
  }, [lawsCatalog, filterQuery]);

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
      className="hidden md:flex w-72 h-full flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto flex-shrink-0"
    >
      {/* Top Section: Primary Navigation & Katalog Peraturan */}
      <div className="p-3.5 space-y-4 flex-1 min-h-0 flex flex-col">
        {/* Menu Utama: 5 Essential Tools */}
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
                  <span
                    className={
                      isActive
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-400 dark:text-slate-400'
                    }
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Katalog Peraturan with Mini-Filter */}
        <div className="space-y-2 flex-1 min-h-0 flex flex-col border-t border-slate-100 dark:border-slate-800/80 pt-3">
          <div className="flex items-center justify-between px-3 flex-shrink-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {filterQuery.trim()
                ? `Katalog Peraturan (${filteredLaws.length} dari ${lawsCatalog.length})`
                : `Katalog Peraturan (${lawsCatalog.length})`}
            </p>
          </div>

          {/* Mini-Filter Search Input */}
          <div className="relative px-1 flex-shrink-0">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setFilterQuery('');
                }
              }}
              placeholder="Saring undang-undang..."
              className="w-full h-[34px] pl-8 pr-7 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
            {filterQuery && (
              <button
                type="button"
                onClick={() => setFilterQuery('')}
                aria-label="Hapus saringan"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                ✕
              </button>
            )}
          </div>

          {/* Regulation Items List */}
          <div
            data-testid="sidebar-regulations-scroll-container"
            className="space-y-1 flex-1 min-h-0 overflow-y-auto pr-1 mt-1"
          >
            {filteredLaws.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 px-3 py-4 text-center">
                {filterQuery.trim()
                  ? 'Tidak ada regulasi yang cocok'
                  : 'Belum ada regulasi tersimpan.'}
              </p>
            ) : (
              filteredLaws.map((law: LawMetadata) => {
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
                        className={
                          isSelected
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'opacity-40 text-slate-400'
                        }
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer: Storage & Offline Status Card */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div
          data-testid="sidebar-storage-card"
          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Storage & Offline
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isOnline ? 'Online Ready' : 'Offline Active'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {lawsCatalog.length} Regulasi Tersimpan Offline
          </p>
        </div>
      </div>
    </aside>
  );
};
