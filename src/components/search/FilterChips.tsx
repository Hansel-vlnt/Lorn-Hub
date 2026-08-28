import React from 'react';
import { LawCategory, SearchFilters } from '../../types';

interface FilterChipsProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ filters, onFilterChange }) => {
  const categories: Array<{ id: LawCategory | 'semua'; label: string }> = [
    { id: 'semua', label: 'Semua Bidang' },
    { id: 'pidana', label: '⚖️ Hukum Pidana' },
    { id: 'perdata', label: '📜 Hukum Perdata' },
    { id: 'tata-negara', label: '🏛️ Tata Negara / Konstitusi' },
    { id: 'acara', label: '🛡️ Hukum Acara / Formal' },
    { id: 'khusus', label: '🔍 Khusus (ITE / Tipikor)' },
    { id: 'ketenagakerjaan', label: '💼 Ketenagakerjaan' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => {
        const isSelected = filters.kategori === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onFilterChange({ kategori: cat.id })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              isSelected
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
