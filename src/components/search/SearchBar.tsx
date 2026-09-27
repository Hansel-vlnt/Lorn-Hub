import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Cari nomor pasal (misal: 362, 1365) atau kata kunci (pencurian, wanprestasi, praperadilan)...',
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-amber-700 dark:text-amber-400 pointer-events-none">
          <Search size={18} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[48px] pl-11 pr-20 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-600 transition-all font-medium"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              onClick={onClear}
              className="min-w-[44px] min-h-[44px] p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg transition-colors flex items-center justify-center"
              title="Bersihkan Pencarian"
              aria-label="Bersihkan pencarian"
            >
              <X size={16} />
            </button>
          )}

          <div className="hidden sm:flex items-center text-[10px] uppercase font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span>Enter</span>
          </div>
        </div>
      </div>
    </div>
  );
};
