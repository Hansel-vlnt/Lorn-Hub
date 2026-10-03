import { Article, DynamicLawDataset, LawMetadata } from '../types';

interface ExportableLaw {
  metadata: LawMetadata;
  pasalList: Article[];
}

function sanitizeFilename(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'naskah-hukum'
  );
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportLawAsTxt(law: ExportableLaw): void {
  const { metadata, pasalList } = law;
  const regNumber = metadata.nomorRegulasi || metadata.nomor || '-';
  const title = metadata.judulLengkap || metadata.judul || '-';
  const year = metadata.tahun || '-';
  const category = (metadata.kategori || 'umum').toUpperCase();
  const source = metadata.sumberUrl || '-';

  const lines: string[] = [
    '================================================================================',
    '                              REPUBLIK INDONESIA',
    '                         SALINAN RESMI NASKAH HUKUM',
    '================================================================================',
    '',
    `NOMOR REGULASI : ${regNumber}`,
    `JUDUL          : ${title}`,
    `TAHUN          : ${year}`,
    `KATEGORI       : ${category}`,
    `SUMBER DATA    : ${source}`,
    `TOTAL PASAL    : ${pasalList.length}`,
    `TANGGAL EKSPOR : ${new Date().toISOString().split('T')[0]}`,
    '',
    '================================================================================',
    '',
  ];

  let lastBab = '';
  let lastBagian = '';

  for (const article of pasalList) {
    if (article.bab && article.bab !== lastBab) {
      lines.push('');
      lines.push(article.bab.toUpperCase());
      lastBab = article.bab;
    }

    if (article.bagian && article.bagian !== lastBagian) {
      lines.push('');
      lines.push(article.bagian.toUpperCase());
      lastBagian = article.bagian;
    }

    lines.push('');
    lines.push(`Pasal ${article.nomor}`);
    if (article.judul) {
      lines.push(`(${article.judul})`);
    }

    if (article.ayat && article.ayat.length > 0) {
      for (const ayat of article.ayat) {
        lines.push(`(${ayat.nomor}) ${ayat.teks}`);
      }
    } else if (article.isi) {
      lines.push(article.isi);
    }

    if (article.penjelasan) {
      lines.push('');
      lines.push(`Penjelasan Pasal ${article.nomor}:`);
      lines.push(article.penjelasan);
    }
  }

  lines.push('');
  lines.push('================================================================================');
  lines.push('             DOKUMEN INI DIHASILKAN SECARA OTOMATIS OLEH LORN-HUB');
  lines.push('================================================================================');

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const filename = `${sanitizeFilename(metadata.singkatan || metadata.nomorRegulasi || metadata.judul)}.txt`;
  downloadBlob(blob, filename);
}

export function exportLawAsJson(law: ExportableLaw): void {
  const { metadata, pasalList } = law;
  const exportPayload: DynamicLawDataset = {
    metadata: {
      ...metadata,
      statusDownload: 'cached-offline',
      totalPasal: pasalList.length,
    },
    pasalList,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const filename = `${sanitizeFilename(metadata.singkatan || metadata.nomorRegulasi || metadata.judul)}.json`;
  downloadBlob(blob, filename);
}
