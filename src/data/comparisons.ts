import { KuhpComparison } from '../types/law';

export const KUHP_COMPARISONS: KuhpComparison[] = [
  {
    id: 'cmp-pencurian',
    kategoriKejahatan: 'Pencurian Biasa',
    pasalLama: {
      nomor: 'Pasal 362 KUHP',
      judul: 'Pencurian',
      isi: 'Barang siapa mengambil barang sesuatu, yang seluruhnya atau sebagian kepunyaan orang lain, dengan maksud untuk dimiliki secara melawan hukum, diancam karena pencurian, dengan pidana penjara paling lama lima tahun atau pidana denda paling banyak sembilan ratus rupiah.',
      sanksi: 'Penjara maks. 5 tahun / Denda Kategori V (penyesuaian Perma 2/2012)',
    },
    pasalBaru: {
      nomor: 'Pasal 476 UU 1/2023',
      judul: 'Pencurian',
      isi: 'Setiap Orang yang mengambil suatu Barang yang sebagian atau seluruhnya milik orang lain, dengan maksud untuk dimiliki secara melawan hukum, dipidana karena pencurian, dengan pidana penjara paling lama 5 (lima) tahun atau pidana denda paling banyak kategori IV.',
      sanksi: 'Penjara maks. 5 tahun / Denda Kategori IV (maks. Rp200.000.000)',
    },
    poinPerubahan: [
      'Unsur "Barang siapa" diubah menjadi "Setiap Orang" untuk mencakup korporasi/badan hukum.',
      'Sistem denda menggunakan klasifikasi kategori denda (Kategori I s/d VIII) yang pasti nilainya.',
      'Peluang penerapan alternatif pidana pengawasan atau kerja sosial bagi tindak pidana berancaman di bawah 5 tahun.',
    ],
    catatanPenting: 'Definisi barang diperluas mencakup data elektronik dan energi yang memiliki nilai ekonomis.',
  },
  {
    id: 'cmp-pembunuhan-biasa',
    kategoriKejahatan: 'Pembunuhan Biasa (Doodslag)',
    pasalLama: {
      nomor: 'Pasal 338 KUHP',
      judul: 'Pembunuhan',
      isi: 'Barang siapa dengan sengaja merampas nyawa orang lain, diancam karena pembunuhan dengan pidana penjara paling lama lima belas tahun.',
      sanksi: 'Penjara paling lama 15 tahun',
    },
    pasalBaru: {
      nomor: 'Pasal 458 ayat (1) UU 1/2023',
      judul: 'Pembunuhan',
      isi: 'Setiap Orang yang merampas nyawa orang lain, dipidana karena pembunuhan, dengan pidana penjara paling lama 15 (lima belas) tahun.',
      sanksi: 'Penjara paling lama 15 tahun',
    },
    poinPerubahan: [
      'Konstruksi redaksional disederhanakan tanpa mengurangi bobot unsur perampasan nyawa.',
      'Terdapat penambahan ayat khusus jika pembunuhan dilakukan terhadap pejabat yang sedang bertugas.',
    ],
    catatanPenting: 'Doktrin kesengajaan (dolus) tetap menjadi syarat utama pertanggungjawaban pidana.',
  },
  {
    id: 'cmp-pembunuhan-berencana',
    kategoriKejahatan: 'Pembunuhan Berencana (Moord)',
    pasalLama: {
      nomor: 'Pasal 340 KUHP',
      judul: 'Pembunuhan Berencana',
      isi: 'Barang siapa dengan sengaja dan dengan rencana lebih dahulu merampas nyawa orang lain, diancam karena pembunuhan dengan rencana, dengan pidana mati atau pidana penjara seumur hidup atau selama waktu tertentu, paling lama dua puluh tahun.',
      sanksi: 'Pidana mati / Penjara seumur hidup / Penjara maks. 20 tahun',
    },
    pasalBaru: {
      nomor: 'Pasal 459 UU 1/2023',
      judul: 'Pembunuhan Berencana',
      isi: 'Setiap Orang yang dengan rencana terlebih dahulu merampas nyawa orang lain, dipidana karena pembunuhan berencana, dengan pidana mati atau pidana penjara seumur hidup atau pidana penjara paling lama 20 (dua puluh) tahun.',
      sanksi: 'Pidana mati / Penjara seumur hidup / Penjara maks. 20 tahun',
    },
    poinPerubahan: [
      'Pidana mati kini menjadi pidana alternatif/khusus dengan masa percobaan (probation) 10 tahun (Pasal 100 KUHP Baru).',
      'Jika terpidana berkelakuan baik selama masa percobaan, pidana mati dapat diubah menjadi pidana penjara seumur hidup.',
    ],
    catatanPenting: 'Perubahan paradigma pidana mati dari hukuman pokok menjadi hukuman alternatif bersyarat (restorative justice).',
  },
  {
    id: 'cmp-penipuan',
    kategoriKejahatan: 'Penipuan (Oplichting)',
    pasalLama: {
      nomor: 'Pasal 378 KUHP',
      judul: 'Penipuan',
      isi: 'Barang siapa dengan maksud untuk menguntungkan diri sendiri atau orang lain secara melawan hukum, dengan memakai nama palsu atau martabat palsu, dengan tipu muslihat, ataupun rangkaian kebohongan, menggerakkan orang lain untuk menyerahkan barang sesuatu kepadanya...',
      sanksi: 'Penjara paling lama 4 tahun',
    },
    pasalBaru: {
      nomor: 'Pasal 492 UU 1/2023',
      judul: 'Penipuan',
      isi: 'Setiap Orang yang dengan maksud menguntungkan diri sendiri atau orang lain secara melawan hukum dengan memakai nama palsu atau kedudukan palsu, menggunakan tipu muslihat atau rangkaian kata bohong, menggerakkan orang untuk menyerahkan suatu Barang, memberi Utang, membuat Pengakuan Utang, atau menghapus Piutang...',
      sanksi: 'Penjara paling lama 4 tahun atau pidana denda paling banyak Kategori V (Rp500.000.000)',
    },
    poinPerubahan: [
      'Memperjelas terminologi objek penipuan: Barang, Utang, Pengakuan Utang, atau Penghapusan Piutang.',
      'Sanksi denda diperjelas hingga Kategori V.',
    ],
    catatanPenting: 'Sangat sering digunakan dalam kasus sengketa bisnis perdata yang dilaporkan ke ranah pidana.',
  },
  {
    id: 'cmp-pencemaran-nama-baik',
    kategoriKejahatan: 'Pencemaran Nama Baik & Menista',
    pasalLama: {
      nomor: 'Pasal 310 KUHP',
      judul: 'Penistaan / Pencemaran Nama Baik',
      isi: 'Barang siapa sengaja menyerang kehormatan atau nama baik seseorang dengan menuduhkan sesuatu hal, yang maksudnya terang supaya hal itu diketahui umum, diancam karena pencemaran dengan pidana penjara paling lama sembilan bulan...',
      sanksi: 'Penjara paling lama 9 bulan (lisan) / 1 tahun 4 bulan (tulisan/gambar)',
    },
    pasalBaru: {
      nomor: 'Pasal 433 & 434 UU 1/2023',
      judul: 'Pencemaran dan Fitnah',
      isi: 'Setiap Orang yang dengan lisan menyerang kehormatan atau nama baik orang lain dengan cara menuduhkan suatu hal, dengan maksud supaya hal tersebut diketahui umum, dipidana karena pencemaran, dengan pidana penjara paling lama 9 (sembilan) bulan atau denda Kategori II...',
      sanksi: 'Penjara maks. 9 bulan (pencemaran lisan) atau penjara 1 tahun 6 bulan (tulisan/gambar)',
    },
    poinPerubahan: [
      'Pengecualian demi kepentingan umum atau pembelaan terpaksa dirumuskan lebih tegas dan terstruktur.',
      'Delik aduan absolut: hanya dapat dituntut atas pengaduan korban langsung.',
    ],
    catatanPenting: 'Harmonisasi antara KUHP Baru dengan pasal 27A UU ITE 2024.',
  },
];
