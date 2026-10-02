import React from 'react';
import { LawCategory, SearchFilters } from '../../types';

interface FilterChipsProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ filters, onFilterChange }) => {
  const categories: Array<{ id: LawCategory | 'semua'; label: string }> = [
    { id: 'semua', label: 'Semua Bidang' },
    { id: 'pidana', label: 'Hukum Pidana' },
    { id: 'perdata', label: 'Hukum Perdata' },
    { id: 'tata-negara', label: 'Tata Negara & Konstitusi' },
    { id: 'acara', label: 'Hukum Acara & Formal' },
    { id: 'khusus', label: 'Khusus (ITE & Tipikor)' },
    { id: 'ketenagakerjaan', label: 'Ketenagakerjaan' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
      {categories.map((cat) => {
        const isSelected = filters.kategori === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onFilterChange({ kategori: cat.id })}
            className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center ${
              isSelected
                ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 border-amber-600 dark:border-amber-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
