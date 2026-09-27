import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { pdfStorageService, PdfDocument } from '../../services/pdfStorage';
import { Upload, FileText, Search, Trash2, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import MiniSearch from 'minisearch';

// Setup pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

export const PdfHub: React.FC = () => {
  const [pdfs, setPdfs] = useState<Omit<PdfDocument, 'data'>[]>([]);
  const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  
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

  const selectedPdfName = pdfs.find(p => p.id === selectedPdfId)?.name;

  return (
    <div className="flex flex-col md:flex-row h-full gap-4">
      {/* Sidebar for PDF List */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Dokumen PDF</h2>
          <label className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-white p-1.5 rounded-lg transition-colors" title="Unggah PDF">
            <Upload size={18} />
            <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {pdfs.length === 0 ? (
            <div className="text-center p-4 text-slate-500 text-sm">
              Belum ada PDF. Unggah dokumen untuk mulai membaca.
            </div>
          ) : (
            pdfs.map(pdf => (
              <div
                key={pdf.id}
                onClick={() => handleSelectPdf(pdf.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                  selectedPdfId === pdf.id 
                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText size={16} className="flex-shrink-0" />
                  <span className="text-sm truncate">{pdf.name}</span>
                </div>
                <button 
                  onClick={(e) => handleDeletePdf(e, pdf.id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
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
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setScale(Math.max(0.5, scale - 0.2))}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Perkecil"
                >
                  <ZoomOut size={18} />
                </button>
                <button 
                  onClick={() => setScale(Math.min(3, scale + 0.2))}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Perbesar"
                >
                  <ZoomIn size={18} />
                </button>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <button 
                  onClick={() => setPageNum(Math.max(1, pageNum - 1))}
                  disabled={pageNum <= 1}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {pageNum} / {numPages}
                </span>
                <button 
                  onClick={() => setPageNum(Math.min(numPages, pageNum + 1))}
                  disabled={pageNum >= numPages}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                <input
                  type="text"
                  placeholder={isSearching ? "Mengindeks..." : "Cari di PDF..."}
                  className="bg-transparent border-none text-sm px-2 py-1 outline-none text-slate-800 dark:text-slate-200 w-32 md:w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  disabled={isSearching}
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="p-1 text-slate-500 hover:text-amber-500 transition-colors"
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
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {searchResults.length} Hasil
                    </span>
                    <button onClick={() => setSearchResults([])} className="text-slate-400 hover:text-slate-700">
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
                        <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
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
                  className="shadow-lg bg-white rounded"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <FileText size={64} className="mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">Belum ada dokumen yang dipilih</h3>
            <p className="text-sm">Pilih PDF dari sidebar atau unggah dokumen baru untuk mulai membaca.</p>
          </div>
        )}
      </div>
    </div>
  );
};
