import React, { useState, useEffect } from 'react';
import { Article } from '../../types';
import { useUserData } from '../../context/UserDataContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Save, Trash2, BookOpen } from 'lucide-react';

interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
  onShowToast?: (msg: string) => void;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  isOpen,
  onClose,
  article,
  onShowToast,
}) => {
  const { getNote, saveNote, deleteNote } = useUserData();
  const [content, setContent] = useState('');

  useEffect(() => {
    if (article) {
      const existing = getNote(article.id);
      setContent(existing ? existing.content : '');
    }
  }, [article, getNote]);

  if (!article) return null;

  const handleSave = () => {
    if (!content.trim()) {
      deleteNote(article.id);
      if (onShowToast) onShowToast('Catatan dikosongkan.');
    } else {
      saveNote(article.id, article.lawId, article.nomor, content);
      if (onShowToast) onShowToast('Catatan berhasil disimpan!');
    }
    onClose();
  };

  const handleDelete = () => {
    deleteNote(article.id);
    setContent('');
    if (onShowToast) onShowToast('Catatan dihapus.');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Catatan Kuliah: Pasal ${article.nomor}`}
      subtitle={article.judul || 'Tambahkan anotasi atau penjelasan materi dosen'}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Article Preview */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 max-h-24 overflow-y-auto">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 mb-1">
            <BookOpen size={12} />
            <span>Kutipan Pasal:</span>
          </div>
          <p className="italic">"{article.isi}"</p>
        </div>

        {/* Textarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Tulis Catatan Pribadi / Catatan Dosen:
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contoh: Dosen A menekankan unsur objektif pasal ini keluar saat UTS. Perhatikan yurisprudensi MA No. 123/Pid/2020..."
            className="w-full h-40 p-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          {getNote(article.id) ? (
            <Button variant="danger" size="sm" onClick={handleDelete} icon={<Trash2 size={14} />}>
              Hapus
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} icon={<Save size={14} />}>
              Simpan Catatan
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
