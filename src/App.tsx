import React, { useState } from 'react';
import { useLaw } from './context/LawContext';
import { useUserData } from './context/UserDataContext';
import { Header, MobileNav, Sidebar, OfflineBanner, PwaInstallPrompt, MainNavTab } from './components/layout';
import { LawReader } from './components/law/LawReader';
import { SearchView } from './components/search/SearchView';
import { KuhpComparisonMatrix } from './components/comparison/KuhpComparisonMatrix';
import { StudyDesk } from './components/study/StudyDesk';
import { CitationModal, NotesDrawer, BookmarkDrawer } from './components/study';
import { Toast, ToastMessage } from './components/ui/Toast';
import { Article } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainNavTab>('reader');
  const { setSelectedLawId, lawsCatalog } = useLaw();
  const { bookmarks } = useUserData();

  // Active Modals & Selected Article
  const [selectedArticleForCitation, setSelectedArticleForCitation] = useState<Article | null>(null);
  const [selectedArticleForNote, setSelectedArticleForNote] = useState<Article | null>(null);
  const [selectedArticleForBookmark, setSelectedArticleForBookmark] = useState<Article | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: `toast-${Date.now()}`,
      type,
      title: message,
    });
  };

  const handleOpenArticleFromSearchOrStudy = (article: Article) => {
    setSelectedLawId(article.lawId);
    setActiveTab('reader');
    setTimeout(() => {
      const el = document.getElementById(`pasal-${article.nomor.toLowerCase().replace(/[^a-z0-9]/g, '-')}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const lawMetaForCitation = selectedArticleForCitation
    ? lawsCatalog.find((l) => l.id === selectedArticleForCitation.lawId)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-amber-500 selection:text-white">
      {/* Offline Alert Banner */}
      <OfflineBanner />

      {/* App Header */}
      <Header />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          bookmarkCount={bookmarks.length}
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'reader' && (
            <LawReader
              onOpenCitation={setSelectedArticleForCitation}
              onOpenNote={setSelectedArticleForNote}
              onOpenBookmark={setSelectedArticleForBookmark}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'search' && (
            <SearchView
              onOpenArticle={handleOpenArticleFromSearchOrStudy}
              onOpenCitation={setSelectedArticleForCitation}
              onOpenNote={setSelectedArticleForNote}
              onOpenBookmark={setSelectedArticleForBookmark}
            />
          )}

          {activeTab === 'compare' && <KuhpComparisonMatrix />}

          {activeTab === 'study' && (
            <StudyDesk onSelectArticle={handleOpenArticleFromSearchOrStudy} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        bookmarkCount={bookmarks.length}
      />

      {/* PWA Add to Home Screen Prompt */}
      <PwaInstallPrompt />

      {/* Global Modals for Study & Citations */}
      <CitationModal
        isOpen={Boolean(selectedArticleForCitation)}
        onClose={() => setSelectedArticleForCitation(null)}
        article={selectedArticleForCitation}
        lawMetadata={lawMetaForCitation}
        onShowToast={showToast}
      />

      <NotesDrawer
        isOpen={Boolean(selectedArticleForNote)}
        onClose={() => setSelectedArticleForNote(null)}
        article={selectedArticleForNote}
        onShowToast={showToast}
      />

      <BookmarkDrawer
        isOpen={Boolean(selectedArticleForBookmark)}
        onClose={() => setSelectedArticleForBookmark(null)}
        article={selectedArticleForBookmark}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
export default App;
