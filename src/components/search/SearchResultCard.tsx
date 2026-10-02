import React from 'react';
import { SearchResultItem } from '../../types';
import { useLaw } from '../../context/LawContext';
import { useUserData } from '../../context/UserDataContext';
import { Bookmark, Edit3, Quote, ArrowRight, Shield, Highlighter } from 'lucide-react';
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
        <mark key={i} className="bg-amber-500/20 dark:bg-amber-400/20 text-amber-900 dark:text-amber-200 px-1 rounded font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="amber" size="sm">
            {lawMeta?.singkatan || lawMeta?.nomorRegulasi || lawMeta?.nomor || article.lawId}
          </Badge>
          {matchType === 'exact-article' && (
            <Badge variant="success" size="sm">
              Nomor Pasal Tepat
            </Badge>
          )}
          {article.bab && (
            <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 max-w-[200px] sm:max-w-xs font-medium">
              {article.bab}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {highlight && (
            <span title="Terdapat stabilo pada pasal ini" aria-label="Terdapat stabilo pada pasal ini">
              <Highlighter size={14} className="text-amber-700 dark:text-amber-400" />
            </span>
          )}
          {note && (
            <span title="Terdapat catatan kuliah pada pasal ini" aria-label="Terdapat catatan kuliah pada pasal ini">
              <Edit3 size={14} className="text-slate-600 dark:text-slate-400" />
            </span>
          )}
          {bookmarked && (
            <span title="Tersimpan di bookmark" aria-label="Tersimpan di bookmark">
              <Bookmark size={14} className="text-amber-700 dark:text-amber-400 fill-amber-700 dark:fill-amber-400" />
            </span>
          )}
        </div>
      </div>

      {/* Article Title / Number */}
      <h3
        onClick={() => onOpenArticle(article)}
        className="text-base font-bold text-slate-900 dark:text-white hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer transition-colors flex items-center gap-2 mb-2"
      >
        <span>Pasal {article.nomor}</span>
        {article.judul && <span className="text-sm font-normal text-slate-700 dark:text-slate-300">- {renderHighlightedText(article.judul)}</span>}
      </h3>

      {/* Article Content Preview */}
      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-3 leading-relaxed mb-3">
        {renderHighlightedText(article.isi)}
      </p>

      {/* Explanation snippet if present */}
      {article.penjelasan && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 mb-3 flex items-start gap-2">
          <Shield size={14} className="text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-2 italic">
            <span className="font-semibold text-slate-900 dark:text-white not-italic">Penjelasan:</span> {renderHighlightedText(article.penjelasan)}
          </p>
        </div>
      )}

      {/* Action Footer (44px+ tap targets) */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenCitation(article)}
            className="min-h-[44px] px-3 py-2 text-slate-700 hover:text-amber-800 dark:text-slate-300 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1.5 transition-colors font-medium"
            title="Salin Kutipan / Sitasi Skripsi"
          >
            <Quote size={14} />
            <span className="hidden sm:inline text-xs">Sitasi</span>
          </button>

          <button
            onClick={() => onOpenBookmark(article)}
            className={`min-h-[44px] px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1.5 transition-colors font-medium ${
              bookmarked ? 'text-amber-800 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300 hover:text-amber-800'
            }`}
            title="Simpan Bookmark"
          >
            <Bookmark size={14} className={bookmarked ? 'fill-amber-700 dark:fill-amber-400' : ''} />
            <span className="hidden sm:inline text-xs">{bookmarked ? 'Tersimpan' : 'Simpan'}</span>
          </button>

          <button
            onClick={() => onOpenNote(article)}
            className="min-h-[44px] px-3 py-2 text-slate-700 hover:text-amber-800 dark:text-slate-300 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1.5 transition-colors font-medium"
            title="Tambah Catatan Pribadi"
          >
            <Edit3 size={14} />
            <span className="hidden sm:inline text-xs">Catatan</span>
          </button>
        </div>

        <button
          onClick={() => onOpenArticle(article)}
          className="min-h-[44px] text-xs font-semibold text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1.5 py-2 px-3.5 rounded-lg hover:bg-amber-500/10 transition-all"
        >
          <span>Buka Teks</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
