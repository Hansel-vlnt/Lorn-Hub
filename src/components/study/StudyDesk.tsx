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
}

export const StudyDesk: React.FC<StudyDeskProps> = ({ onSelectArticle }) => {
  const { bookmarks, notes, highlights, removeBookmark, deleteNote, removeHighlight } = useUserData();
  const { allArticles } = useLaw();
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

  // Get unique folders for bookmark filtering
  const folders = Array.from(new Set(bookmarks.map((b) => b.folderName)));

  const filteredBookmarks = selectedFolderFilter === 'semua'
    ? bookmarks
    : bookmarks.filter((b) => b.folderName === selectedFolderFilter);

  const getArticle = (articleId: string) => {
    return allArticles.find((a) => a.id === articleId);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <BookOpen size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Meja Belajar Mahasiswa Hukum</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Koleksi pasal pilihan, rangkuman catatan kuliah, dan stabilo penting Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as any)} />

      {/* Tab Content: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {/* Folder filter pills */}
          {folders.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedFolderFilter('semua')}
                className={`min-h-[44px] px-3.5 py-2 text-xs rounded-xl font-semibold transition-all flex items-center gap-1.5 border ${
                  selectedFolderFilter === 'semua'
                    ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 border-amber-600 dark:border-amber-500 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span>Semua Folder</span>
                <span className="opacity-80">({bookmarks.length})</span>
              </button>
              {folders.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFolderFilter(f)}
                  className={`min-h-[44px] px-3.5 py-2 text-xs rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                    selectedFolderFilter === f
                      ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950 border-amber-600 dark:border-amber-500 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <Folder size={13} />
                  <span>{f}</span>
                  <span className="opacity-80">({bookmarks.filter((b) => b.folderName === f).length})</span>
                </button>
              ))}
            </div>
          )}

          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
              <Bookmark className="mx-auto text-slate-400 mb-3" size={32} />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Belum ada bookmark tersimpan
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Tandai pasal saat membaca kitab hukum agar mudah diakses kembali untuk bahan tugas dan ujian.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredBookmarks.map((bm) => {
                const art = getArticle(bm.articleId);
                return (
                  <div
                    key={bm.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Folder size={12} />
                          <span>{bm.folderName}</span>
                        </span>
                        <button
                          onClick={() => removeBookmark(bm.articleId)}
                          className="min-h-[44px] min-w-[44px] text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 p-2 flex items-center justify-center rounded-lg"
                          title="Hapus Bookmark"
                          aria-label="Hapus bookmark"
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
                Klik ikon "Catatan" pada kartu pasal untuk menambahkan catatan materi dosen atau ringkasan yuridis.
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
