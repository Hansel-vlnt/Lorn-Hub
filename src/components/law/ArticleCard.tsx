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
      sm: 'text-sm leading-normal',
      base: 'text-base leading-relaxed',
      lg: 'text-lg leading-relaxed',
      xl: 'text-xl leading-loose',
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
      className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-xs hover:border-slate-300 dark:hover:border-slate-700 ${highlightBg} space-y-4`}
    >
      {/* Article Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="space-y-1 min-w-0 flex-1">
          {article.bab && (
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {article.bab}
            </p>
          )}
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Pasal {article.nomor}
            </h3>
            {article.judul && (
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                ({article.judul})
              </span>
            )}
          </div>
        </div>

        {/* Quick Toolbar (44x44px minimum tap targets for accessibility) */}
        <div className="flex items-center gap-1 self-start sm:self-auto flex-wrap sm:flex-nowrap pt-1 sm:pt-0">
          {/* Stabilo / Highlight Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`min-w-[44px] min-h-[44px] p-2.5 rounded-lg transition-colors flex items-center justify-center ${
                highlight
                  ? 'text-amber-800 bg-amber-500/15 dark:text-amber-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Stabilo / Highlight Pasal"
              aria-label="Stabilo atau highlight pasal"
            >
              <Highlighter size={17} />
            </button>

            {showColorPicker && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowColorPicker(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-12 z-20 flex items-center gap-1.5 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleSelectColor(c)}
                      className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      title={`Pilih warna ${c}`}
                      aria-label={`Pilih warna stabilo ${c}`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs ${
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
                        {highlight?.color === c && <Check size={14} className="text-slate-950 font-bold" />}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bookmark */}
          <button
            onClick={() => onOpenBookmark(article)}
            className={`min-w-[44px] min-h-[44px] p-2.5 rounded-lg transition-colors flex items-center justify-center ${
              bookmarked
                ? 'text-amber-800 bg-amber-500/15 dark:text-amber-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Simpan Bookmark"
            aria-label="Simpan pasal ke bookmark"
          >
            <Bookmark size={17} className={bookmarked ? 'fill-amber-600 dark:fill-amber-400' : ''} />
          </button>

          {/* Notes */}
          <button
            onClick={() => onOpenNote(article)}
            className={`min-w-[44px] min-h-[44px] p-2.5 rounded-lg transition-colors flex items-center justify-center ${
              note
                ? 'text-amber-800 bg-amber-500/15 dark:text-amber-300'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Catatan Kuliah / Dosen"
            aria-label="Tambah catatan kuliah untuk pasal ini"
          >
            <Edit3 size={17} />
          </button>

          {/* Copy Text */}
          <button
            onClick={handleCopyText}
            className="min-w-[44px] min-h-[44px] p-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center"
            title="Salin Teks Pasal"
            aria-label="Salin teks pasal"
          >
            {copied ? <Check size={17} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={17} />}
          </button>

          {/* Sitasi Resmi */}
          <button
            onClick={() => onOpenCitation(article)}
            className="min-w-[44px] min-h-[44px] p-2.5 text-slate-600 hover:text-amber-800 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center"
            title="Generator Sitasi Resmi Footnote"
            aria-label="Buat sitasi footnote resmi"
          >
            <Quote size={17} />
          </button>
        </div>
      </div>

      {/* Article Content: Structured Ayat OR Clean Raw Isi (No Double Display) */}
      {article.ayat && article.ayat.length > 0 ? (
        <div className="space-y-3 pt-1">
          {article.ayat.map((ay) => (
            <div
              key={ay.nomor}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
            >
              <div className="font-bold text-xs uppercase tracking-wide text-amber-800 dark:text-amber-400">
                Ayat ({ay.nomor})
              </div>
              <div className={`${fontClasses.fontFamily} ${fontClasses.fontSize} text-slate-900 dark:text-slate-100`}>
                {ay.teks}
              </div>
              {ay.penjelasan && (
                <div className="text-xs text-slate-600 dark:text-slate-300 italic pt-1.5 border-t border-slate-200 dark:border-slate-700/80 flex items-start gap-1.5">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 not-italic">Penjelasan:</span>
                  <span>{ay.penjelasan}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`${fontClasses.fontFamily} ${fontClasses.fontSize} text-slate-900 dark:text-slate-100 whitespace-pre-wrap`}>
          {article.isi}
        </div>
      )}

      {/* Penjelasan Pasal (Official Legal Commentary) */}
      {article.penjelasan && (
        <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-slate-800/60 border border-amber-500/30 text-xs sm:text-sm flex items-start gap-2.5">
          <Shield size={16} className="text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Penjelasan Resmi:
            </span>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
              {article.penjelasan}
            </p>
          </div>
        </div>
      )}

      {/* User Note Display if present */}
      {note && (
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm">
          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-1">
            <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
              <Edit3 size={13} />
              Catatan Pribadi Anda:
            </span>
            <button
              onClick={() => onOpenNote(article)}
              className="min-h-[44px] min-w-[44px] px-2 text-xs underline text-amber-700 dark:text-amber-400 hover:text-amber-900 flex items-center justify-center"
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
          <Tag size={13} className="text-slate-500 dark:text-slate-400" />
          {article.kataKunci.map((kw, i) => (
            <span
              key={i}
              className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              #{kw}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};
