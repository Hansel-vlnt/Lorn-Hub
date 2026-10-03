import React, { useState } from 'react';
import { useUserData } from '../../context/UserDataContext';
import { useLaw } from '../../context/LawContext';
import { useTheme } from '../../context/ThemeContext';
import { Bookmark, Edit3, Highlighter, Trash2, ExternalLink, BookOpen, Folder } from 'lucide-react';
import { Tabs } from '../ui/Tabs';
import { Button } from '../ui/Button';
import { Article } from '../../types';

interface StudyDeskProps {
  onSelectArticle: (article: Article) => void;
  onOpenReader?: () => void;
}

export const StudyDesk: React.FC<StudyDeskProps> = ({ onSelectArticle, onOpenReader }) => {
  const { bookmarks, notes, highlights, removeBookmark, deleteNote, removeHighlight } = useUserData();
  const { currentArticles } = useLaw();
  const { fontFamily, fontSize } = useTheme();
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes' | 'highlights'>('bookmarks');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('semua');

  const fontClasses = {
    fontFamily: fontFamily === 'serif' ? 'font-serif' : 'font-sans',
    fontSize: {
      sm: 'text-xs leading-relaxed',
      base: 'text-sm leading-relaxed',
      lg: 'text-base leading-relaxed',
      xl: 'text-lg leading-loose',
    }[fontSize],
  };

  const tabs = [
    { id: 'bookmarks', label: 'Bookmark', icon: <Bookmark size={16} />, count: bookmarks.length },
    { id: 'notes', label: 'Catatan Kuliah', icon: <Edit3 size={16} />, count: notes.length },
    { id: 'highlights', label: 'Stabilo / Highlight', icon: <Highlighter size={16} />, count: highlights.length },
  ];

  const getArticle = (articleId: string): Article | undefined => {
    return currentArticles.find((a) => a.id === articleId);
  };

  const folders = Array.from(
    new Set(bookmarks.map((b) => b.folderName).filter(Boolean) as string[])
  );

  const filteredBookmarks = bookmarks.filter((b) => {
    if (selectedFolderFilter === 'semua') return true;
    return b.folderName === selectedFolderFilter;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Meja Belajar & Catatan Hukum
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Koleksi bookmark pasal penting, catatan kuliah mahasiswa hukum, dan arsip stabilo yuridis tersimpan otomatis di perangkat Anda.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as 'bookmarks' | 'notes' | 'highlights')}
        />
      </div>

      {/* Tab Content: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {/* Folder Filter */}
          {folders.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Folder size={14} /> Folder:
              </span>
              <button
                onClick={() => setSelectedFolderFilter('semua')}
                className={`min-h-[44px] px-3 py-1.5 rounded-lg border transition-all ${
                  selectedFolderFilter === 'semua'
                    ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 border-amber-600 dark:border-amber-500'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Semua ({bookmarks.length})
              </button>
              {folders.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFolderFilter(f)}
                  className={`min-h-[44px] px-3 py-1.5 rounded-lg border transition-all ${
                    selectedFolderFilter === f
                      ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 border-amber-600 dark:border-amber-500'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {f} ({bookmarks.filter((b) => b.folderName === f).length})
                </button>
              ))}
            </div>
          )}

          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <Bookmark className="mx-auto text-slate-400 mb-3" size={32} />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Belum ada pasal yang dibookmark
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Buka naskah regulasi dan klik ikon Bookmark pada kartu pasal untuk menyimpannya di sini.
              </p>
              {onOpenReader && (
                <div className="pt-4">
                  <Button variant="outline" size="sm" onClick={onOpenReader} icon={<BookOpen size={14} />}>
                    Buka Naskah Regulasi
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredBookmarks.map((bm) => {
                const art = getArticle(bm.articleId);
                return (
                  <div
                    key={bm.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Folder size={12} className="text-amber-500" />
                          {bm.folderName || 'Umum'}
                        </span>
                        <button
                          onClick={() => removeBookmark(bm.articleId)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors p-2"
                          title="Hapus Bookmark"
                          aria-label={`Hapus bookmark Pasal ${bm.pasalNomor}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Pasal {bm.pasalNomor} {bm.judul ? `- ${bm.judul}` : ''}
                      </h4>

                      {art && (
                        <p className={`text-slate-700 dark:text-slate-300 line-clamp-3 mt-2 italic ${fontClasses.fontFamily} ${fontClasses.fontSize}`}>
                          "{art.isi}"
                        </p>
                      )}
                    </div>

                    {art && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectArticle(art)}
                          icon={<ExternalLink size={13} />}
                        >
                          Buka Teks Pasal
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <Edit3 className="mx-auto text-slate-400 mb-3" size={32} />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Belum ada catatan kuliah
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Klik ikon Catatan pada kartu pasal untuk menambahkan catatan materi dosen atau ringkasan yuridis.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {notes.map((note) => {
                const art = getArticle(note.articleId);
                return (
                  <div
                    key={note.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                          <Edit3 size={13} className="text-amber-600 dark:text-amber-400" />
                          Catatan: Pasal {note.pasalNomor}
                        </span>
                        <button
                          onClick={() => deleteNote(note.articleId)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors p-2"
                          title="Hapus Catatan"
                          aria-label={`Hapus catatan Pasal ${note.pasalNomor}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <p className={`text-slate-800 dark:text-slate-200 bg-amber-500/5 dark:bg-slate-800/60 p-3 rounded-lg border border-amber-500/20 whitespace-pre-wrap ${fontClasses.fontFamily} ${fontClasses.fontSize}`}>
                        {note.content}
                      </p>
                    </div>

                    {art && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectArticle(art)}
                          icon={<ExternalLink size={13} />}
                        >
                          Buka Teks Pasal
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Highlights */}
      {activeTab === 'highlights' && (
        <div className="space-y-3">
          {highlights.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <Highlighter className="mx-auto text-slate-400 mb-3" size={32} />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Belum ada pasal yang distabilo
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Gunakan fitur stabilo (kuning, hijau, biru, pink) untuk menandai pasal-pasal kunci.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {highlights.map((hl) => {
                const art = getArticle(hl.articleId);
                const colorBadge = {
                  yellow: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300 dark:border-amber-700/50',
                  green: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50',
                  blue: 'bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-300 border-sky-300 dark:border-sky-700/50',
                  pink: 'bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300 dark:border-rose-700/50',
                  orange: 'bg-orange-100 text-orange-900 dark:bg-orange-950/50 dark:text-orange-300 border-orange-300 dark:border-orange-700/50',
                }[hl.color];

                return (
                  <div
                    key={hl.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${colorBadge}`}>
                          Stabilo {hl.color.toUpperCase()} - Pasal {hl.pasalNomor}
                        </span>
                        <button
                          onClick={() => removeHighlight(hl.articleId)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors p-2"
                          title="Hapus Stabilo"
                          aria-label={`Hapus stabilo Pasal ${hl.pasalNomor}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {art && (
                        <p className={`text-slate-700 dark:text-slate-300 line-clamp-3 italic ${fontClasses.fontFamily} ${fontClasses.fontSize}`}>
                          "{art.isi}"
                        </p>
                      )}
                    </div>

                    {art && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectArticle(art)}
                          icon={<ExternalLink size={13} />}
                        >
                          Buka Pasal
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
