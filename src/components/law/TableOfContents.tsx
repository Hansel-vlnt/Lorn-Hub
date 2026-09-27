import React, { useState } from 'react';
import { Article } from '../../types';
import { ListFilter, ChevronDown } from 'lucide-react';

interface TableOfContentsProps {
  articles: Article[];
  selectedBab: string;
  onSelectBab: (bab: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  articles,
  selectedBab,
  onSelectBab,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract unique chapters / bab
  const chapters: string[] = ['Semua Bab'];
  articles.forEach((a) => {
    if (a.bab && !chapters.includes(a.bab)) {
      chapters.push(a.bab);
    }
  });

  if (chapters.length <= 1) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2 shadow-xs">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-left lg:cursor-default"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <ListFilter size={16} className="text-amber-700 dark:text-amber-400" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Daftar Bab & Struktur ({chapters.length - 1} Bab)
          </h4>
        </div>
        <div className="lg:hidden flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-semibold">
          <span className="max-w-[120px] truncate">{selectedBab || 'Semua'}</span>
          <ChevronDown size={15} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <div className={`space-y-1 max-h-72 overflow-y-auto pr-1 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {chapters.map((ch) => {
          const isSelected = (ch === 'Semua Bab' && !selectedBab) || selectedBab === ch;
          const articleCount = ch === 'Semua Bab' ? articles.length : articles.filter((a) => a.bab === ch).length;

          return (
            <button
              key={ch}
              onClick={() => {
                onSelectBab(ch === 'Semua Bab' ? '' : ch);
                setIsExpanded(false);
              }}
              className={`w-full min-h-[44px] text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
                isSelected
                  ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold border-amber-500/30'
                  : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="line-clamp-1 flex-1">{ch}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold ml-2">({articleCount})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
