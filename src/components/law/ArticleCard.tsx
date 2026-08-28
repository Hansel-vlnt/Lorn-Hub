import React, { useState } from 'react';
import { Article, HighlightColor } from '../../types';
import { useUserData } from '../../context/UserDataContext';
import { useLaw } from '../../context/LawContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Bookmark,
  Edit3,
  Highlighter,
  Quote,
  Shield,
  Copy,
  Check,
  Tag,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

interface ArticleCardProps {
  article: Article;
  onOpenCitation: (article: Article) => void;
  onOpenNote: (article: Article) => void;
  onOpenBookmark: (article: Article) => void;
  onShowToast?: (msg: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onOpenCitation,
  onOpenNote,
  onOpenBookmark,
  onShowToast,
}) => {
  const { isBookmarked, getNote, getHighlight, setHighlight, removeHighlight } = useUserData();
  const { lawsCatalog } = useLaw();
  const { fontFamily, fontSize } = useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const lawMeta = lawsCatalog.find((l) => l.id === article.lawId);
  const bookmarked = isBookmarked(article.id);
  const note = getNote(article.id);
  const highlight = getHighlight(article.id);

  const colors: HighlightColor[] = ['yellow', 'green', 'blue', 'pink', 'orange'];

  const highlightBg = highlight
    ? {
        yellow: 'bg-yellow-500/10 border-yellow-500/30',
        green: 'bg-emerald-500/10 border-emerald-500/30',
        blue: 'bg-blue-500/10 border-blue-500/30',
        pink: 'bg-pink-500/10 border-pink-500/30',
        orange: 'bg-orange-500/10 border-orange-500/30',
      }[highlight.color]
    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800';

  const fontClasses = {
    fontFamily: fontFamily === 'serif' ? 'font-serif' : 'font-sans',
    fontSize: {
      sm: 'text-xs sm:text-sm',
      base: 'text-sm sm:text-base',
      lg: 'text-base sm:text-lg',
      xl: 'text-lg sm:text-xl',
    }[fontSize],
  };

  const handleCopyText = () => {
    const textToCopy = `Pasal ${article.nomor} ${lawMeta?.singkatan || ''}\n${article.isi}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    if (onShowToast) onShowToast(`Teks Pasal ${article.nomor} disalin!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectColor = (color: HighlightColor) => {
    if (highlight && highlight.color === color) {
      removeHighlight(article.id);
      if (onShowToast) onShowToast('Stabilo dihapus.');
    } else {
      setHighlight(article.id, article.lawId, article.nomor, color);
      if (onShowToast) onShowToast(`Stabilo ${color} diterapkan!`);
    }
    setShowColorPicker(false);
  };

  return (
    <article
      id={`pasal-${article.nomor.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-xs hover:shadow-md ${highlightBg} space-y-4`}
    >
      {/* Article Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          {article.bab && (
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              {article.bab}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Pasal {article.nomor}
            </h3>
            {article.judul && (
              <Badge variant="secondary" size="md">
                {article.judul}
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1">
          {/* Stabilo / Highlight Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`p-2 rounded-lg transition-colors text-xs ${
                highlight
                  ? 'text-amber-500 bg-amber-500/10'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Stabilo / Highlight Pasal"
            >
              <Highlighter size={16} />
            </button>

            {showColorPicker && (
              <div className="absolute right-0 top-10 z-20 flex items-center gap-1.5 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl animate-in zoom-in-95">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleSelectColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                      c === 'yellow'
                        ? 'bg-yellow-400'
                        : c === 'green'
                        ? 'bg-emerald-400'
                        : c === 'blue'
                        ? 'bg-blue-400'
                        : c === 'pink'
                        ? 'bg-pink-400'
                        : 'bg-orange-400'
                    }`}
                  >
                    {highlight?.color === c && <Check size={12} className="text-slate-950" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bookmark */}
          <button
            onClick={() => onOpenBookmark(article)}
            className={`p-2 rounded-lg transition-colors text-xs ${
              bookmarked
                ? 'text-amber-500 bg-amber-500/10'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Simpan Bookmark"
          >
            <Bookmark size={16} className={bookmarked ? 'fill-amber-500' : ''} />
          </button>

          {/* Notes */}
          <button
            onClick={() => onOpenNote(article)}
            className={`p-2 rounded-lg transition-colors text-xs ${
              note
                ? 'text-blue-500 bg-blue-500/10'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Catatan Kuliah / Dosen"
          >
            <Edit3 size={16} />
          </button>

          {/* Copy Text */}
          <button
            onClick={handleCopyText}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-xs"
            title="Salin Teks Pasal"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
          </button>

          {/* Sitasi Resmi */}
          <button
            onClick={() => onOpenCitation(article)}
            className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-xs"
            title="Generator Sitasi Resmi Footnote"
          >
            <Quote size={16} />
          </button>
        </div>
      </div>

      {/* Article Body */}
      <div className={`${fontClasses.fontFamily} ${fontClasses.fontSize} text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap`}>
        {article.isi}
      </div>

      {/* Ayat-Ayat list if present */}
      {article.ayat && article.ayat.length > 0 && (
        <div className="space-y-2 pt-2">
          {article.ayat.map((ay) => (
            <div
              key={ay.nomor}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm"
            >
              <div className="font-bold text-amber-600 dark:text-amber-400 mb-1">
                Ayat ({ay.nomor})
              </div>
              <p className={`${fontClasses.fontFamily} text-slate-700 dark:text-slate-300`}>
                {ay.teks}
              </p>
              {ay.penjelasan && (
                <p className="text-xs text-slate-500 italic mt-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                  💡 {ay.penjelasan}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Penjelasan Pasal */}
      {article.penjelasan && (
        <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-slate-800/60 border border-amber-500/20 text-xs sm:text-sm flex items-start gap-2.5">
          <Shield size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Penjelasan Resmi:
            </span>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              {article.penjelasan}
            </p>
          </div>
        </div>
      )}

      {/* User Note Display if present */}
      {note && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs sm:text-sm">
          <div className="flex items-center justify-between font-bold text-blue-600 dark:text-blue-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Edit3 size={13} />
              Catatan Pribadi Anda:
            </span>
            <button
              onClick={() => onOpenNote(article)}
              className="text-[11px] underline hover:text-blue-700"
            >
              Edit
            </button>
          </div>
          <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
            {note.content}
          </p>
        </div>
      )}

      {/* Keywords / Tags */}
      {article.kataKunci && article.kataKunci.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <Tag size={12} className="text-slate-400" />
          {article.kataKunci.map((kw, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              #{kw}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};
