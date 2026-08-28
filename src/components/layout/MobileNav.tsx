import React from 'react';
import { BookOpen, Search, GitCompare, BookmarkCheck } from 'lucide-react';

export type MainNavTab = 'reader' | 'search' | 'compare' | 'study';

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
    { id: 'search' as MainNavTab, label: 'Cari Pasal', icon: <Search size={20} /> },
    { id: 'compare' as MainNavTab, label: 'KUHP Baru/Lama', icon: <GitCompare size={20} /> },
    {
      id: 'study' as MainNavTab,
      label: 'Meja Belajar',
      icon: <BookmarkCheck size={20} />,
      badge: bookmarkCount > 0 ? bookmarkCount : undefined,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 relative transition-colors ${
                isActive
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 w-8 h-0.5 bg-amber-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
