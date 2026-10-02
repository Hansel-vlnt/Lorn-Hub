import assert from 'node:assert';
import { RegulationScraperService } from '../src/services/regulationScraperService.ts';

console.log('--- RUNNING REGULATION SCRAPER UNIT & LOGIC TESTS ---');

const scraper = new RegulationScraperService();
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(err);
    failed++;
  }
}

// 1. Plain text with standard articles and ayats
test('Scraper parses standard text with BAB and numbered ayats', () => {
  const rawText = `BAB I
KETENTUAN UMUM

Pasal 1
Dalam Undang-Undang ini yang dimaksud dengan:
(1) Informasi Elektronik adalah satu atau sekumpulan data elektronik.
(2) Transaksi Elektronik adalah perbuatan hukum.

Pasal 2
Undang-Undang ini berlaku untuk setiap Orang yang melakukan perbuatan hukum.`;

  const dataset = scraper.parseRawText(rawText, {
    id: 'uu-ite-test',
    judul: 'UU ITE Test',
    nomor: 'UU No. 1 Tahun 2024',
    tahun: 2024,
    kategori: 'khusus',
  });

  assert.strictEqual(dataset.metadata.id, 'uu-ite-test');
  assert.strictEqual(dataset.metadata.totalPasal, 2);
  assert.strictEqual(dataset.pasalList.length, 2);

  // Pasal 1 assertions
  const p1 = dataset.pasalList[0];
  assert.strictEqual(p1.nomor, '1');
  assert.strictEqual(p1.bab, 'BAB I - KETENTUAN UMUM');
  assert.strictEqual(p1.ayat?.length, 2);
  assert.strictEqual(p1.ayat[0].nomor, 1);
  assert.ok(p1.ayat[0].teks.includes('Informasi Elektronik'));

  // Pasal 2 assertions
  const p2 = dataset.pasalList[1];
  assert.strictEqual(p2.nomor, '2');
  assert.ok(p2.isi.includes('berlaku untuk setiap Orang'));
});

// 2. Edge case numbering: Pasal 1A, Pasal 2 bis, Pasal 27B
test('Scraper parses edge-case statutory numbering (Pasal 1A, 2 bis, 27 B)', () => {
  const rawText = `Pasal 1A
Penyelenggaraan sistem elektronik wajib andal dan aman.

Pasal 2 bis
Ketentuan pidana siber transnasional.

Pasal 27 B
Setiap orang dengan sengaja menyebarkan informasi elektronik yang bermuatan ancaman.`;

  const dataset = scraper.parseRawText(rawText, {
    id: 'uu-edge-test',
    judul: 'UU Edge Numbering',
  });

  assert.strictEqual(dataset.pasalList.length, 3);
  assert.strictEqual(dataset.pasalList[0].nomor, '1A');
  assert.strictEqual(dataset.pasalList[0].id, 'uu-edge-test-pasal-1a');

  assert.strictEqual(dataset.pasalList[1].nomor, '2 BIS');
  assert.strictEqual(dataset.pasalList[1].id, 'uu-edge-test-pasal-2-bis');

  assert.strictEqual(dataset.pasalList[2].nomor, '27B');
  assert.strictEqual(dataset.pasalList[2].id, 'uu-edge-test-pasal-27b');
});

// 3. Multi-line BAB and BAGIAN hierarchical headers
test('Scraper captures multi-line BAB and Bagian structures', () => {
  const rawText = `BAB II
ASAS DAN TUJUAN

Bagian Kesatu
Asas

Pasal 3
Pemanfaatan Teknologi Informasi dan Transaksi Elektronik dilaksanakan berdasarkan asas kepastian hukum.

Bagian Kedua
Tujuan

Pasal 4
Pemanfaatan Teknologi Informasi bertujuan untuk mencerdaskan kehidupan bangsa.`;

  const dataset = scraper.parseRawText(rawText, { id: 'uu-hierarki' });
  assert.strictEqual(dataset.pasalList.length, 2);
  assert.strictEqual(dataset.pasalList[0].bab, 'BAB II - ASAS DAN TUJUAN');
  assert.strictEqual(dataset.pasalList[0].bagian, 'Bagian Kesatu - Asas');
  assert.strictEqual(dataset.pasalList[1].bagian, 'Bagian Kedua - Tujuan');
});

// 4. JSON array format ingestion
test('Scraper ingests valid JSON array of articles', () => {
  const jsonText = JSON.stringify([
    {
      nomor: '1',
      isi: 'Ketentuan pidana umum.',
      kategori: 'pidana',
      bab: 'BAB I - UMUM',
    },
    {
      nomor: '2',
      isi: 'Tindak pidana pencurian.',
      kategori: 'pidana',
      bab: 'BAB II - TINDAK PIDANA',
      ayat: [
        { nomor: 1, teks: 'Diancam dengan pidana penjara.' },
      ],
    },
  ]);

  const dataset = scraper.parseRawText(jsonText, {
    id: 'kuhp-json-test',
    judul: 'KUHP JSON Test',
  });

  assert.strictEqual(dataset.pasalList.length, 2);
  assert.strictEqual(dataset.pasalList[0].nomor, '1');
  assert.strictEqual(dataset.pasalList[1].nomor, '2');
  assert.strictEqual(dataset.pasalList[1].ayat?.length, 1);
});

// 5. JSON object with pasalList property
test('Scraper ingests JSON object containing pasalList property', () => {
  const jsonText = JSON.stringify({
    metadata: { judul: 'UU Custom JSON' },
    pasalList: [
      { nomor: '10', isi: 'Isi pasal 10 custom.' },
      { nomor: '11', isi: 'Isi pasal 11 custom.' },
    ],
  });

  const dataset = scraper.parseRawText(jsonText, { id: 'custom-json' });
  assert.strictEqual(dataset.pasalList.length, 2);
  assert.strictEqual(dataset.pasalList[0].nomor, '10');
  assert.strictEqual(dataset.pasalList[1].nomor, '11');
});

// 6. Fallback single article when text has no 'Pasal' keywords
test('Scraper creates single article fallback for unformatted text', () => {
  const plainNarrative = 'Ini adalah naskah pengumuman hukum yang tidak memiliki penomoran pasal baku.';
  const dataset = scraper.parseRawText(plainNarrative, { id: 'naskah-narasi' });

  assert.strictEqual(dataset.pasalList.length, 1);
  assert.strictEqual(dataset.pasalList[0].nomor, '1');
  assert.strictEqual(dataset.pasalList[0].isi, plainNarrative);
});

// 7. Error handling for empty or whitespace-only inputs
test('Scraper throws informative error when raw text is empty', () => {
  assert.throws(
    () => scraper.parseRawText('   \n\t  ', { id: 'empty-test' }),
    /Teks naskah kosong/
  );
});

// 8. Auto slug generation logic
test('Auto slug generation produces clean, URL-safe identifiers', () => {
  const title1 = 'Undang-Undang Informasi dan Transaksi Elektronik';
  const slug1 = title1.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  assert.strictEqual(slug1, 'undang-undang-informasi-dan-transaksi-elektronik');

  const title2 = 'UU No. 1 / 2024 & Perubahan Ke-2!';
  const slug2 = title2.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  assert.strictEqual(slug2, 'uu-no-1-2024-perubahan-ke-2');
});

// 9. Paragraf hierarchy parsing
test('Scraper captures BAB -> Bagian -> Paragraf hierarchy', () => {
  const rawText = `BAB III
BENTUK USAHA

Bagian Pertama
Perseroan Terbatas

Paragraf 1
Pendirian dan Anggaran Dasar

Pasal 10
(1) Perseroan didirikan oleh 2 orang atau lebih.
(2) Pendirian dilakukan dengan akta notaris.`;

  const dataset = scraper.parseRawText(rawText, { id: 'uu-pt-test' });
  assert.strictEqual(dataset.pasalList.length, 1);
  const p10 = dataset.pasalList[0];
  assert.strictEqual(p10.nomor, '10');
  assert.strictEqual(p10.bab, 'BAB III - BENTUK USAHA');
  assert.strictEqual(p10.bagian, 'Bagian Pertama - Perseroan Terbatas');
  assert.strictEqual(p10.paragraf, 'Paragraf 1 - Pendirian dan Anggaran Dasar');
  assert.strictEqual(p10.ayat?.length, 2);
});

// 10. Article title (Judul Pasal) extraction
test('Scraper extracts article title when formatted with dash or colon', () => {
  const rawText = `Pasal 362 - Pencurian
Barang siapa mengambil barang sesuatu, yang seluruhnya atau sebagian kepunyaan orang lain.

Pasal 378: Penipuan
Barang siapa dengan maksud untuk menguntungkan diri sendiri.`;

  const dataset = scraper.parseRawText(rawText, { id: 'kuhp-titles' });
  assert.strictEqual(dataset.pasalList.length, 2);
  assert.strictEqual(dataset.pasalList[0].nomor, '362');
  assert.strictEqual(dataset.pasalList[0].judul, 'Pencurian');
  assert.strictEqual(dataset.pasalList[1].nomor, '378');
  assert.strictEqual(dataset.pasalList[1].judul, 'Penipuan');
});

// 11. Indonesian chapter numbering in words (BAB KESATU, BAB KEDUA)
test('Scraper captures chapter names written in words (BAB KESATU)', () => {
  const rawText = `BAB KESATU
KETENTUAN UMUM

Pasal 1
Ketentuan penafsiran hukum.

BAB KEDUA
ASAS HUKUM

Pasal 2
Asas legalitas berlaku mutlak.`;

  const dataset = scraper.parseRawText(rawText, { id: 'uu-words' });
  assert.strictEqual(dataset.pasalList.length, 2);
  assert.strictEqual(dataset.pasalList[0].bab, 'BAB KESATU - KETENTUAN UMUM');
  assert.strictEqual(dataset.pasalList[1].bab, 'BAB KEDUA - ASAS HUKUM');
});

// 12. HTML parsing fallback
test('Scraper fallback correctly parses HTML document into articles', () => {
  const htmlDoc = `
    <html>
      <body>
        <h1>UNDANG-UNDANG CONTOH</h1>
        <h2>BAB I - UMUM</h2>
        <h3>Pasal 1</h3>
        <p>(1) Setiap warga negara berhak atas pendidikan.</p>
        <p>(2) Pendidikan diselenggarakan oleh negara.</p>
        <h3>Pasal 2</h3>
        <p>Pemerintah memajukan kebudayaan nasional.</p>
      </body>
    </html>
  `;

  // Use parseRawText on stripped HTML or test internal HTML behavior
  const rawParsed = scraper.parseRawText(htmlDoc, { id: 'html-test' });
  assert.strictEqual(rawParsed.pasalList.length, 2);
  assert.strictEqual(rawParsed.pasalList[0].nomor, '1');
  assert.strictEqual(rawParsed.pasalList[1].nomor, '2');
});

console.log(`\n========================================`);
console.log(`SCRAPER TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
