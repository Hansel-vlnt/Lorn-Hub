import React, { useState } from 'react';
import { Article } from '../../types';
import { useUserData } from '../../context/UserDataContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Bookmark, FolderPlus, Check } from 'lucide-react';

interface BookmarkDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
  onShowToast?: (msg: string) => void;
}

export const BookmarkDrawer: React.FC<BookmarkDrawerProps> = ({
  isOpen,
  onClose,
  article,
  onShowToast,
}) => {
  const { studyData, addBookmark, removeBookmark, isBookmarked } = useUserData();
  const [selectedFolder, setSelectedFolder] = useState<string>('Umum');
  const [customFolderInput, setCustomFolderInput] = useState<string>('');
  const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false);

  if (!article) return null;

  const bookmarked = isBookmarked(article.id);

  const handleToggleBookmark = (folder: string) => {
    if (bookmarked) {
      removeBookmark(article.id);
      if (onShowToast) onShowToast(`Bookmark Pasal ${article.nomor} dihapus.`);
    } else {
      addBookmark({
        articleId: article.id,
        lawId: article.lawId,
        pasalNomor: article.nomor,
        judul: article.judul,
        folderName: folder,
      });
      if (onShowToast) onShowToast(`Pasal ${article.nomor} disimpan ke folder "${folder}"!`);
    }
    onClose();
  };

  const handleAddCustomFolder = () => {
    if (!customFolderInput.trim()) return;
    const folder = customFolderInput.trim();
    studyData.customFolders.push(folder);
    setSelectedFolder(folder);
    setCustomFolderInput('');
    setIsAddingFolder(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bookmarked ? 'Hapus dari Bookmark?' : 'Simpan ke Bookmark'}
      subtitle={`Kelompokkan Pasal ${article.nomor} ke folder belajar`}
      maxWidth="sm"
    >
      <div className="space-y-4">
        {bookmarked ? (
          <div className="text-center py-3">
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Pasal ini sudah tersimpan dalam bookmark Anda.
            </p>
            <Button
              variant="danger"
              size="md"
              className="w-full"
              onClick={() => handleToggleBookmark(selectedFolder)}
            >
              Hapus Bookmark
            </Button>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Pilih Folder Koleksi:
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {studyData.customFolders.map((folder) => {
                  const isSelected = selectedFolder === folder;
                  return (
                    <button
                      key={folder}
                      onClick={() => setSelectedFolder(folder)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>📁 {folder}</span>
                      {isSelected && <Check size={14} className="text-amber-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add new folder */}
            {isAddingFolder ? (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="text"
                  value={customFolderInput}
                  onChange={(e) => setCustomFolderInput(e.target.value)}
                  placeholder="Nama folder baru..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  autoFocus
                />
                <Button size="sm" variant="primary" onClick={handleAddCustomFolder}>
                  Tambah
                </Button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingFolder(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline pt-1"
              >
                <FolderPlus size={14} />
                <span>Buat Folder Baru</span>
              </button>
            )}

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => handleToggleBookmark(selectedFolder)}
                icon={<Bookmark size={15} />}
              >
                Simpan Bookmark
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
