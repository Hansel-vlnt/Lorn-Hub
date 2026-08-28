import React, { useRef, useEffect } from 'react';
import { Search, X, Zap } from 'lucide-react';

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
        <div className="absolute left-4 text-amber-500 pointer-events-none">
          <Search size={18} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-20 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-medium"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {value && (
            <button
              onClick={onClear}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
            >
              <X size={16} />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <Zap size={11} className="text-amber-500" />
            <span>0.01s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
