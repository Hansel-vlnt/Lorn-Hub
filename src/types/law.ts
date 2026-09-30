export type LawCategory = 
  | 'pidana' 
  | 'perdata' 
  | 'tata-negara' 
  | 'acara' 
  | 'khusus' 
  | 'ketenagakerjaan';

export interface Ayat {
  nomor: number;
  teks: string;
  penjelasan?: string;
}

export interface Article {
  id: string; // e.g. "uud-1945-pasal-1" or "kuhp-baru-pasal-476"
  lawId: string;
  nomor: string; // e.g. "1", "28A", "362"
  judul?: string; // e.g. "Pencurian Biasa", "Perbuatan Melawan Hukum"
  bab?: string; // e.g. "BAB XXII - Kejahatan Terhadap Hak Milik"
  bagian?: string;
  paragraf?: string;
  isi: string;
  ayat?: Ayat[];
  penjelasan?: string;
  kataKunci?: string[];
  kategori: LawCategory;
  tags?: string[];
}

export interface LawMetadata {
  id: string;
  kode?: string;
  judul: string; 
  nomor: string; 
  tahun: number;
  kategori: LawCategory;
  sumberUrl: string;
  statusDownload: 'online-only' | 'cached-offline';
  totalPasal?: number;
  judulLengkap?: string;
  singkatan?: string;
  nomorRegulasi?: string;
  deskripsi?: string;
  status?: 'berlaku' | 'transisi' | 'dicabut' | 'sebagian-dicabut';
}

export interface DynamicLawDataset {
  metadata: LawMetadata;
  pasalList: Article[];
}
