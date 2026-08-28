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
  kode: string; // e.g. "KUHP-2023", "KUHP-WVS", "UUD-1945", "KUHPERDATA", "KUHAP"
  judulLengkap: string;
  nomorRegulasi: string; // e.g. "UU No. 1 Tahun 2023", "Staatsblad 1915:732"
  singkatan: string; // e.g. "KUHP Baru", "KUHP Lama", "KUHPerdata"
  kategori: LawCategory;
  tahun: number;
  status: 'berlaku' | 'transisi' | 'dicabut' | 'sebagian-dicabut';
  deskripsi: string;
  totalPasal: number;
  fileData: string; // filename in /data/*.json
}

export interface LawDataset {
  metadata: LawMetadata;
  pasalList: Article[];
}

export interface KuhpComparison {
  id: string;
  kategoriKejahatan: string;
  pasalLama: {
    nomor: string;
    judul: string;
    isi: string;
    sanksi: string;
  };
  pasalBaru: {
    nomor: string;
    judul: string;
    isi: string;
    sanksi: string;
  };
  poinPerubahan: string[];
  catatanPenting: string;
}
