import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { pdfStorageService, PdfDocument } from '../../services/pdfStorage';
import {
  Upload,
  FileText,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  DownloadCloud,
} from 'lucide-react';
import MiniSearch from 'minisearch';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

// Setup pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

export interface PdfHubProps {
  onSendToScraper?: (data: { rawText: string; judul: string; nomor?: string }) => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PdfHub: React.FC<PdfHubProps> = ({ onSendToScraper, onShowToast }) => {
  const [pdfs, setPdfs] = useState<Omit<PdfDocument, 'data'>[]>([]);
  const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  
  // Extraction states
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [showExtractModal, setShowExtractModal] = useState(false);
  const [copiedExtract, setCopiedExtract] = useState(false);
  
  // Viewer states
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ page: number; text: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [miniSearch, setMiniSearch] = useState<MiniSearch | null>(null);
  const abortIndexRef = useRef<boolean>(false);

  useEffect(() => {
    loadPdfs();
  }, []);

  const loadPdfs = async () => {
    const list = await pdfStorageService.getAllPdfs();
    setPdfs(list);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Hanya file PDF yang diperbolehkan');
      return;
    }

    const buffer = await file.arrayBuffer();
    const newPdf = await pdfStorageService.savePdf(file.name, buffer);
    await loadPdfs();
    handleSelectPdf(newPdf.id);
    
    // Reset file input
    event.target.value = '';
  };

  const handleDeletePdf = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Hapus dokumen ini?')) return;
    await pdfStorageService.deletePdf(id);
    if (selectedPdfId === id) {
      setSelectedPdfId(null);
      setPdfData(null);
      setPdfDoc(null);
    }
    await loadPdfs();
  };

  const handleSelectPdf = async (id: string) => {
    setSelectedPdfId(id);
    const pdf = await pdfStorageService.getPdf(id);
    if (pdf) {
      setPdfData(pdf.data);
      setPageNum(1);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  useEffect(() => {
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;
    let isCancelled = false;

    const loadDoc = async () => {
      if (!pdfData) {
        setPdfDoc(null);
        return;
      }
      
      try {
        loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const doc = await loadingTask.promise;
        if (isCancelled) return;
        
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        
        // Index text for search
        abortIndexRef.current = false;
        indexPdfText(doc);
      } catch (err) {
        console.error("Error loading PDF", err);
      }
    };

    loadDoc();

    return () => {
      isCancelled = true;
      abortIndexRef.current = true;
      if (loadingTask) {
        loadingTask.destroy().catch(() => {});
      }
    };
  }, [pdfData]);

  useEffect(() => {
    let isCancelled = false;
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      
      try {
        const page = await pdfDoc.getPage(pageNum);
        if (isCancelled) return;
        
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context) {
          const outputScale = window.devicePixelRatio || 1;
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = Math.floor(viewport.width) + "px";
          canvas.style.height = Math.floor(viewport.height) + "px";
          
          const transform = outputScale !== 1 
            ? [outputScale, 0, 0, outputScale, 0, 0] 
            : undefined;

          const renderContext: any = {
            canvasContext: context,
            transform: transform,
            viewport: viewport,
          };

          if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
          }

          const renderTask = page.render(renderContext);
          renderTaskRef.current = renderTask;
          
          await renderTask.promise;
        }
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.error("Error rendering page", err);
        }
      }
    };
    
    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, pageNum, scale]);

  const indexPdfText = async (doc: pdfjsLib.PDFDocumentProxy) => {
    setIsSearching(true);
    const ms = new MiniSearch({
      fields: ['text'],
      storeFields: ['page', 'text'],
    });

    const docsToIndex = [];
    for (let i = 1; i <= doc.numPages; i++) {
      if (abortIndexRef.current) return;
      
      try {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(' ');
        docsToIndex.push({
          id: i,
          page: i,
          text
        });

        // Yield to main thread every 10 pages to avoid blocking
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      } catch (e) {
        console.warn(`Failed to extract text from page ${i}`, e);
      }
    }
    
    if (abortIndexRef.current) return;

    ms.addAll(docsToIndex);
    setMiniSearch(ms);
    setIsSearching(false);
  };

  const handleSearch = () => {
    if (!miniSearch || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = miniSearch.search(searchQuery, { prefix: true, fuzzy: 0.2 });
    setSearchResults(results.map(r => ({ page: r.page, text: r.text })));
  };

  const handleExtractFullText = async () => {
    if (!pdfDoc) return;
    setIsExtracting(true);
    try {
      const pageTexts: string[] = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((item: any) => item.str).join(' ');
        if (text.trim()) {
          pageTexts.push(text.trim());
        }
      }
      const full = pageTexts.join('\n\n');
      setExtractedText(full);
      setShowExtractModal(true);
    } catch (err: any) {
      console.error(err);
      onShowToast?.('Gagal mengekstrak teks dari PDF', 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  const selectedPdfName = pdfs.find(p => p.id === selectedPdfId)?.name;

  return (
    <div className="flex flex-col md:flex-row h-full gap-4">
      {/* Sidebar for PDF List */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Dokumen PDF</h2>
          <label className="cursor-pointer bg-amber-600 hover:bg-amber-700 text-white min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors" title="Unggah PDF" aria-label="Unggah dokumen PDF">
            <Upload size={18} />
            <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {pdfs.length === 0 ? (
            <div className="text-center p-4 text-slate-600 dark:text-slate-400 text-sm">
              Belum ada PDF. Unggah dokumen untuk mulai membaca.
            </div>
          ) : (
            pdfs.map(pdf => (
              <div
                key={pdf.id}
                onClick={() => handleSelectPdf(pdf.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                  selectedPdfId === pdf.id 
                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText size={16} className="flex-shrink-0" />
                  <span className="text-sm truncate">{pdf.name}</span>
                </div>
                <button 
                  onClick={(e) => handleDeletePdf(e, pdf.id)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label={`Hapus ${pdf.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Viewer Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {selectedPdfId ? (
          <>
            {/* Toolbar */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-3">
              <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px] md:max-w-md">
                {selectedPdfName}
              </div>
              
              <div className="flex items-center gap-1.5 flex-wrap">
                <button 
                  onClick={() => setScale(Math.max(0.5, scale - 0.2))}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  title="Perkecil"
                  aria-label="Perkecil tampilan"
                >
                  <ZoomOut size={18} />
                </button>
                <button 
                  onClick={() => setScale(Math.min(3, scale + 0.2))}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  title="Perbesar"
                  aria-label="Perbesar tampilan"
                >
                  <ZoomIn size={18} />
                </button>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <button 
                  onClick={() => setPageNum(Math.max(1, pageNum - 1))}
                  disabled={pageNum <= 1}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-1">
                  {pageNum} / {numPages}
                </span>
                <button 
                  onClick={() => setPageNum(Math.min(numPages, pageNum + 1))}
                  disabled={pageNum >= numPages}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight size={20} />
                </button>

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                {/* Extract Text Button */}
                <button
                  type="button"
                  data-testid="btn-extract-pdf-text"
                  onClick={handleExtractFullText}
                  disabled={isExtracting}
                  className="min-h-[44px] px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  title="Ekstrak Teks dari PDF untuk Scraper"
                  aria-label="Ekstrak teks naskah PDF"
                >
                  <FileText size={15} />
                  <span>{isExtracting ? 'Mengekstrak...' : 'Ekstrak Teks'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                <input
                  type="text"
                  placeholder={isSearching ? "Mengindeks..." : "Cari di PDF..."}
                  className="bg-transparent border-none text-sm px-2 py-1 outline-none text-slate-800 dark:text-slate-200 w-32 md:w-48 placeholder-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={isSearching}
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-md transition-colors"
                  aria-label="Cari kata dalam PDF"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>

            {/* Viewer and Search Results Container */}
            <div className="flex-1 flex overflow-hidden relative">
              {searchResults.length > 0 && (
                <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col">
                  <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-800/50">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {searchResults.length} Hasil
                    </span>
                    <button 
                      onClick={() => setSearchResults([])} 
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md"
                      aria-label="Tutup hasil pencarian"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {searchResults.map((res, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setPageNum(res.page)}
                        className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-amber-400 transition-colors"
                      >
                        <div className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1">
                          Halaman {res.page}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                          {res.text.substring(0, 150)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 flex justify-center p-4">
                <canvas 
                  ref={canvasRef} 
                  className="shadow-md bg-white rounded border border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 p-8 text-center">
            <FileText size={64} className="mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">Belum ada dokumen yang dipilih</h3>
            <p className="text-sm">Pilih PDF dari sidebar atau unggah dokumen baru untuk mulai membaca.</p>
          </div>
        )}
      </div>

      {/* Extracted Text Modal */}
      {showExtractModal && (
        <Modal
          isOpen={showExtractModal}
          onClose={() => setShowExtractModal(false)}
          title="Ekstraksi Teks Naskah PDF"
          subtitle={`Naskah digital hasil ekstraksi dari ${selectedPdfName || 'Dokumen'}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <textarea
              readOnly
              rows={12}
              value={extractedText}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {extractedText.length} karakter diekstrak ({numPages} halaman)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(extractedText);
                    setCopiedExtract(true);
                    onShowToast?.('Teks PDF disalin ke clipboard!', 'success');
                    setTimeout(() => setCopiedExtract(false), 2000);
                  }}
                  icon={copiedExtract ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                >
                  {copiedExtract ? 'Tersalin' : 'Salin Teks'}
                </Button>

                {onSendToScraper && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const cleanTitle = (selectedPdfName || 'Naskah Regulasi PDF').replace(/\.pdf$/i, '');
                      onSendToScraper({
                        rawText: extractedText,
                        judul: cleanTitle,
                      });
                      setShowExtractModal(false);
                    }}
                    icon={<DownloadCloud size={14} />}
                  >
                    Kirim ke Scraper Regulasi
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
