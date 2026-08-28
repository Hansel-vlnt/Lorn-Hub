import React from 'react';
import { SearchResultItem } from '../../types';
import { useLaw } from '../../context/LawContext';
import { useUserData } from '../../context/UserDataContext';
import { Bookmark, Edit3, Quote, ArrowRight, Shield } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface SearchResultCardProps {
  result: SearchResultItem;
  query: string;
  onOpenArticle: (article: SearchResultItem['article']) => void;
  onOpenCitation: (article: SearchResultItem['article']) => void;
  onOpenNote: (article: SearchResultItem['article']) => void;
  onOpenBookmark: (article: SearchResultItem['article']) => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  query,
  onOpenArticle,
  onOpenCitation,
  onOpenNote,
  onOpenBookmark,
}) => {
  const { article, matchType } = result;
  const { lawsCatalog } = useLaw();
  const { isBookmarked, getNote, getHighlight } = useUserData();

  const lawMeta = lawsCatalog.find((l) => l.id === article.lawId);
  const bookmarked = isBookmarked(article.id);
  const note = getNote(article.id);
  const highlight = getHighlight(article.id);

  // Helper for highlighting search term in text
  const renderHighlightedText = (text: string) => {
    if (!query.trim() || query.length < 2) return text;
    const parts = text.split(new RegExp(`(${query.trim()})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.trim().toLowerCase() ? (
        <mark key={i} className="bg-amber-400/40 dark:bg-amber-400/30 text-slate-950 dark:text-amber-200 px-0.5 rounded font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="amber" size="sm">
            {lawMeta?.singkatan || article.lawId}
          </Badge>
          {matchType === 'exact-article' && (
            <Badge variant="success" size="sm">
              Nomor Pasal Tepat
            </Badge>
          )}
          {article.bab && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[200px] sm:max-w-xs">
              {article.bab}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {highlight && <span className="w-2 h-2 rounded-full bg-amber-400" title="Ada stabilo" />}
          {note && <span className="w-2 h-2 rounded-full bg-blue-500" title="Ada catatan" />}
          {bookmarked && <Bookmark size={14} className="text-amber-500 fill-amber-500" />}
        </div>
      </div>

      {/* Article Title / Number */}
      <h3
        onClick={() => onOpenArticle(article)}
        className="text-base font-bold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors flex items-center gap-2 mb-2"
      >
        <span>Pasal {article.nomor}</span>
        {article.judul && <span className="text-sm font-normal text-slate-600 dark:text-slate-300">- {renderHighlightedText(article.judul)}</span>}
      </h3>

      {/* Article Content Preview */}
      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed mb-3">
        {renderHighlightedText(article.isi)}
      </p>

      {/* Explanation snippet if present */}
      {article.penjelasan && (
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 mb-3 flex items-start gap-2">
          <Shield size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-2 italic">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Penjelasan:</span> {renderHighlightedText(article.penjelasan)}
          </p>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenCitation(article)}
            className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors"
            title="Salin Kutipan / Sitasi Skripsi"
          >
            <Quote size={14} />
            <span className="hidden sm:inline text-[11px]">Sitasi</span>
          </button>

          <button
            onClick={() => onOpenBookmark(article)}
            className={`p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              bookmarked ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400 hover:text-amber-500'
            }`}
            title="Simpan Bookmark"
          >
            <Bookmark size={14} className={bookmarked ? 'fill-amber-500' : ''} />
            <span className="hidden sm:inline text-[11px]">{bookmarked ? 'Tersimpan' : 'Simpan'}</span>
          </button>

          <button
            onClick={() => onOpenNote(article)}
            className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors"
            title="Tambah Catatan Pribadi"
          >
            <Edit3 size={14} />
            <span className="hidden sm:inline text-[11px]">Catatan</span>
          </button>
        </div>

        <button
          onClick={() => onOpenArticle(article)}
          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-amber-500/10 transition-all"
        >
          <span>Baca Penuh</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
