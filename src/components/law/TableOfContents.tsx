import React from 'react';
import { Article } from '../../types';
import { ListFilter } from 'lucide-react';

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
  // Extract unique chapters / bab
  const chapters: string[] = ['Semua Bab'];
  articles.forEach((a) => {
    if (a.bab && !chapters.includes(a.bab)) {
      chapters.push(a.bab);
    }
  });

  if (chapters.length <= 1) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <ListFilter size={16} className="text-amber-500" />
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Daftar Bab & Struktur ({chapters.length - 1} Bab)
        </h4>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {chapters.map((ch) => {
          const isSelected = (ch === 'Semua Bab' && !selectedBab) || selectedBab === ch;
          const articleCount = ch === 'Semua Bab' ? articles.length : articles.filter((a) => a.bab === ch).length;

          return (
            <button
              key={ch}
              onClick={() => onSelectBab(ch === 'Semua Bab' ? '' : ch)}
              className={`w-full text-left p-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span className="line-clamp-1 flex-1">{ch}</span>
              <span className="text-[10px] opacity-60 ml-2">({articleCount})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
