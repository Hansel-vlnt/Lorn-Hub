import React from 'react';
import { BookOpen, Search, GitCompare, BookmarkCheck, FileText } from 'lucide-react';

export type MainNavTab = 'reader' | 'search' | 'compare' | 'study' | 'pdf';

interface MobileNavProps {
  activeTab: MainNavTab;
  onChangeTab: (tab: MainNavTab) => void;
  bookmarkCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onChangeTab,
  bookmarkCount = 0,
}) => {
  const navItems = [
    { id: 'reader' as MainNavTab, label: 'Jelajah', icon: <BookOpen size={20} /> },
    { id: 'search' as MainNavTab, label: 'Cari', icon: <Search size={20} /> },
    { id: 'compare' as MainNavTab, label: 'Komparasi', icon: <GitCompare size={20} /> },
    { id: 'pdf' as MainNavTab, label: 'PDF Hub', icon: <FileText size={20} /> },
    {
      id: 'study' as MainNavTab,
      label: 'Belajar',
      icon: <BookmarkCheck size={20} />,
      badge: bookmarkCount > 0 ? bookmarkCount : undefined,
    },
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
                  ? 'text-amber-800 dark:text-amber-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-amber-600 dark:bg-amber-500 text-white dark:text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center leading-none">
                    {item.badge}
                  </span>
                )}
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
