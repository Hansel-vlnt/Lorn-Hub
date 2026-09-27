import { Article, LawMetadata } from '../types/law';

export interface CitationFormats {
  footnote: string;
  daftarPustaka: string;
  inText: string;
  shareableText: string;
}

export function generateLegalCitation(article: Article, lawMetadata?: LawMetadata): CitationFormats {
  const nomorPasal = article.nomor;
  const regulasi = lawMetadata ? lawMetadata.nomorRegulasi : 'Peraturan Perundang-undangan';
  const judul = lawMetadata ? lawMetadata.judulLengkap : 'Himpunan Peraturan Perundang-undangan';
  const singkatan = lawMetadata ? lawMetadata.singkatan : '';
  const tahun = lawMetadata ? lawMetadata.tahun : '';

  // Format Footnote Standar Penulisan Karya Ilmiah Hukum Indonesia
  // Contoh: Indonesia, Undang-Undang Nomor 1 Tahun 2023 tentang Kitab Undang-Undang Hukum Pidana, Pasal 476.
  const footnote = `Indonesia, ${regulasi} tentang ${judul}, Pasal ${nomorPasal}.`;

  // Format Daftar Pustaka
  // Contoh: Republik Indonesia. (2023). Undang-Undang Nomor 1 Tahun 2023 tentang Kitab Undang-Undang Hukum Pidana. Lembaran Negara Republik Indonesia.
  const daftarPustaka = `Republik Indonesia. (${tahun}). ${regulasi} tentang ${judul}. Lembaran Negara Republik Indonesia, Pasal ${nomorPasal}.`;

  // Format In-text
  // Contoh: (UU No. 1/2023, Pasal 476)
  const inText = `(${singkatan || regulasi}, Pasal ${nomorPasal})`;

  // Format Ringkas & WhatsApp Share
  const shareableText = `*${singkatan ? `${singkatan} - ` : ''}Pasal ${nomorPasal}*
${article.judul ? `_${article.judul}_\n` : ''}
"${article.isi}"
${article.penjelasan ? `\nPenjelasan: ${article.penjelasan}` : ''}

Dikutip dari Lorn-Hub (Kompilasi Hukum Indonesia)`;

  return {
    footnote,
    daftarPustaka,
    inText,
    shareableText,
  };
}
