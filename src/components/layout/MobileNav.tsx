import React from 'react';
import { DownloadCloud, Search, FileText, BookOpen } from 'lucide-react';

export type MainNavTab = 'scraper' | 'search' | 'pdf' | 'reader';

interface MobileNavProps {
  activeTab: MainNavTab;
  onChangeTab: (tab: MainNavTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const navItems = [
    { id: 'scraper' as MainNavTab, label: 'Scraper', icon: <DownloadCloud size={20} /> },
    { id: 'search' as MainNavTab, label: 'Cari', icon: <Search size={20} /> },
    { id: 'pdf' as MainNavTab, label: 'PDF Hub', icon: <FileText size={20} /> },
    { id: 'reader' as MainNavTab, label: 'Baca', icon: <BookOpen size={20} /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe shadow-xs">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 relative min-h-[48px] transition-colors ${
                isActive
                  ? 'text-amber-700 dark:text-amber-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 w-10 h-1 bg-amber-600 dark:bg-amber-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
