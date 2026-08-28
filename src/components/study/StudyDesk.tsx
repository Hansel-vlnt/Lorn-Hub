import React, { useState } from 'react';
import { useUserData } from '../../context/UserDataContext';
import { useLaw } from '../../context/LawContext';
import { Bookmark, Edit3, Highlighter, Trash2, ExternalLink, BookOpen } from 'lucide-react';
import { Tabs } from '../ui/Tabs';
import { Button } from '../ui/Button';
import { Article } from '../../types';

interface StudyDeskProps {
  onSelectArticle: (article: Article) => void;
}

export const StudyDesk: React.FC<StudyDeskProps> = ({ onSelectArticle }) => {
  const { bookmarks, notes, highlights, removeBookmark, deleteNote, removeHighlight } = useUserData();
  const { allArticles } = useLaw();
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes' | 'highlights'>('bookmarks');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('semua');

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
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Meja Belajar Mahasiswa Hukum</h1>
            <p className="text-xs text-slate-300">
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
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  selectedFolderFilter === 'semua'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Semua Folder ({bookmarks.length})
              </button>
              {folders.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFolderFilter(f)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all whitespace-nowrap ${
                    selectedFolderFilter === f
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  📁 {f} ({bookmarks.filter((b) => b.folderName === f).length})
                </button>
              ))}
            </div>
          )}

          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <Bookmark className="mx-auto text-slate-400 mb-3" size={32} />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Belum ada bookmark tersimpan
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
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
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          📁 {bm.folderName}
                        </span>
                        <button
                          onClick={() => removeBookmark(bm.articleId)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                          title="Hapus Bookmark"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Pasal {bm.pasalNomor} {bm.judul ? `- ${bm.judul}` : ''}
                      </h4>

                      {art && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mt-1.5 italic">
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
                        <span className="font-bold text-xs text-amber-600 dark:text-amber-400">
                          📌 Catatan: Pasal {note.pasalNomor}
                        </span>
                        <button
                          onClick={() => deleteNote(note.articleId)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                          title="Hapus Catatan"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <p className="text-xs text-slate-800 dark:text-slate-200 bg-amber-500/5 dark:bg-slate-800/60 p-3 rounded-lg border border-amber-500/20 whitespace-pre-wrap">
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
                  yellow: 'bg-yellow-400/20 text-yellow-600 dark:text-yellow-400 border-yellow-400/40',
                  green: 'bg-emerald-400/20 text-emerald-600 dark:text-emerald-400 border-emerald-400/40',
                  blue: 'bg-blue-400/20 text-blue-600 dark:text-blue-400 border-blue-400/40',
                  pink: 'bg-pink-400/20 text-pink-600 dark:text-pink-400 border-pink-400/40',
                  orange: 'bg-orange-400/20 text-orange-600 dark:text-orange-400 border-orange-400/40',
                }[hl.color];

                return (
                  <div
                    key={hl.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${colorBadge}`}>
                          Stabilo {hl.color.toUpperCase()} - Pasal {hl.pasalNomor}
                        </span>
                        <button
                          onClick={() => removeHighlight(hl.articleId)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                          title="Hapus Stabilo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {art && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 italic">
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
