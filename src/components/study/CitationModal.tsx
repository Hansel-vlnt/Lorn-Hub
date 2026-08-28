import React, { useState } from 'react';
import { Article, LawMetadata } from '../../types';
import { generateLegalCitation } from '../../services/citationGenerator';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Copy, Check, Quote, Share2 } from 'lucide-react';

interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
  lawMetadata?: LawMetadata;
  onShowToast?: (msg: string) => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({
  isOpen,
  onClose,
  article,
  lawMetadata,
  onShowToast,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!article) return null;

  const citations = generateLegalCitation(article, lawMetadata);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    if (onShowToast) onShowToast(`Kutipan format ${type} disalin ke clipboard!`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generator Sitasi & Kutipan Resmi"
      subtitle={`Sitasi instan untuk makalah, skripsi, atau bahan moot court`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Footnote FH Standar */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Quote size={13} />
              Format Footnote (Standar FH Indonesia)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(citations.footnote, 'Footnote')}
              icon={copiedType === 'Footnote' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            >
              {copiedType === 'Footnote' ? 'Tersalin' : 'Salin'}
            </Button>
          </div>
          <p className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 select-all">
            {citations.footnote}
          </p>
        </div>

        {/* Daftar Pustaka */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Format Daftar Pustaka / Bibliography
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(citations.daftarPustaka, 'Daftar Pustaka')}
              icon={copiedType === 'Daftar Pustaka' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            >
              {copiedType === 'Daftar Pustaka' ? 'Tersalin' : 'Salin'}
            </Button>
          </div>
          <p className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 select-all">
            {citations.daftarPustaka}
          </p>
        </div>

        {/* In-text Citation */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              In-text Citation (Kutipan Tubuh Teks)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(citations.inText, 'In-text')}
              icon={copiedType === 'In-text' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            >
              {copiedType === 'In-text' ? 'Tersalin' : 'Salin'}
            </Button>
          </div>
          <p className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 select-all">
            {citations.inText}
          </p>
        </div>

        {/* WhatsApp & Media Sosial */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Share2 size={13} />
              Format Berbagi Teks / WhatsApp
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(citations.shareableText, 'WhatsApp')}
              icon={copiedType === 'WhatsApp' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            >
              {copiedType === 'WhatsApp' ? 'Tersalin' : 'Salin'}
            </Button>
          </div>
          <p className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 max-h-24 overflow-y-auto whitespace-pre-wrap select-all">
            {citations.shareableText}
          </p>
        </div>
      </div>
    </Modal>
  );
};
