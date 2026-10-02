import React, { useState } from 'react';
import { useLaw } from './context/LawContext';
import { Header, MobileNav, Sidebar, OfflineBanner, PwaInstallPrompt, MainNavTab } from './components/layout';
import { LawReader } from './components/law/LawReader';
import { SearchView } from './components/search/SearchView';
import { RegulationScraperView } from './components/scraper';
import { CitationModal, NotesDrawer, BookmarkDrawer } from './components/study';
import { PdfHub } from './components/pdf/PdfHub';
import { Toast, ToastMessage } from './components/ui/Toast';
import { Article } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainNavTab>('scraper');
  const { setSelectedLawId, lawsCatalog } = useLaw();

  // Active Modals & Selected Article
  const [selectedArticleForCitation, setSelectedArticleForCitation] = useState<Article | null>(null);
  const [selectedArticleForNote, setSelectedArticleForNote] = useState<Article | null>(null);
  const [selectedArticleForBookmark, setSelectedArticleForBookmark] = useState<Article | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Scraper initial pre-filled data (e.g. from PDF text extraction)
  const [scraperInitialData, setScraperInitialData] = useState<{
    rawText?: string;
    judul?: string;
    nomor?: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: `toast-${Date.now()}`,
      type,
      title: message,
    });
  };

  const handleSendPdfToScraper = (data: { rawText: string; judul: string; nomor?: string }) => {
    setScraperInitialData(data);
    setActiveTab('scraper');
    showToast(`Naskah dari "${data.judul}" dimuat ke Scraper!`, 'success');
  };

  const handleOpenArticleFromSearch = (article: Article) => {
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
      <div className="h-[calc(100vh-4rem)] flex overflow-hidden w-full">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onSelectLawAndRead={(lawId) => {
            setSelectedLawId(lawId);
            setActiveTab('reader');
          }}
        />

        {/* Dynamic Main View Area */}
        <main
          data-testid="main-content"
          className="flex-1 h-full overflow-y-auto p-6 pb-24 md:pb-6"
        >
          {activeTab === 'scraper' && (
            <RegulationScraperView
              initialData={scraperInitialData}
              onShowToast={showToast}
              onOpenLaw={(lawId) => {
                setSelectedLawId(lawId);
                setActiveTab('reader');
              }}
            />
          )}

          {activeTab === 'search' && (
            <SearchView
              onOpenArticle={handleOpenArticleFromSearch}
              onOpenCitation={setSelectedArticleForCitation}
              onOpenNote={setSelectedArticleForNote}
              onOpenBookmark={setSelectedArticleForBookmark}
              onOpenScraper={() => setActiveTab('scraper')}
            />
          )}

          {activeTab === 'pdf' && (
            <PdfHub
              onSendToScraper={handleSendPdfToScraper}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'reader' && (
            <LawReader
              onOpenScraper={() => setActiveTab('scraper')}
              onOpenPdf={() => setActiveTab('pdf')}
              onOpenCitation={setSelectedArticleForCitation}
              onOpenNote={setSelectedArticleForNote}
              onOpenBookmark={setSelectedArticleForBookmark}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
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
