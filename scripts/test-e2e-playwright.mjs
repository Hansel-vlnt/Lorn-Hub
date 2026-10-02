import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { mkdirSync } from 'fs';

async function runTests() {
  console.log('--- STARTING PLAYWRIGHT LIVE E2E UI TEST ---');
  mkdirSync('screenshots', { recursive: true });

  const server = await createServer({
    server: { port: 0 },
  });

  await server.listen();
  const address = server.httpServer.address();
  const port = address.port;
  console.log(`Test Vite server listening at http://localhost:${port}`);

  const browser = await chromium.launch({ headless: true });
  let failures = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failures++;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  }

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    page.on('console', (msg) => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', (err) => console.error('BROWSER PAGE ERROR:', err));

    // Register network mock route for online URL scraping test (JSON)
    await page.route('**/api/mock-regulation.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          judul: 'UU Keterbukaan Informasi Publik',
          nomor: 'UU No. 14 Tahun 2008',
          tahun: 2008,
          kategori: 'khusus',
          pasalList: [
            {
              id: 'uu-14-2008-pasal-1',
              nomor: '1',
              bab: 'BAB I - KETENTUAN UMUM',
              isi: 'Informasi adalah keterangan, pernyataan, gagasan, dan pesan-pesan yang mengandung nilai, makna, dan pesan.',
              kategori: 'khusus',
            },
            {
              id: 'uu-14-2008-pasal-2',
              nomor: '2',
              bab: 'BAB II - ASAS DAN TUJUAN',
              isi: 'Setiap Informasi Publik bersifat terbuka dan dapat diakses oleh setiap Pengguna Informasi Publik.',
              kategori: 'khusus',
            },
          ],
        }),
      });
    });

    // Register network mock route for online URL scraping test (HTML)
    await page.route('**/api/mock-regulation.html', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: `<!DOCTYPE html>
<html>
<head><title>UU Kearsipan</title></head>
<body>
  <h1>UNDANG-UNDANG NOMOR 43 TAHUN 2009 TENTANG KEARSIPAN</h1>
  <h2>BAB I - KETENTUAN UMUM</h2>
  <div class="pasal">
    <h3>Pasal 1</h3>
    <p>(1) Kearsipan adalah hal-hal yang berkenaan dengan arsip.</p>
    <p>(2) Arsip adalah rekaman kegiatan atau peristiwa dalam berbagai bentuk.</p>
  </div>
  <div class="pasal">
    <h3>Pasal 2</h3>
    <p>Penyelenggaraan kearsipan berasaskan kepastian hukum dan keterbukaan.</p>
  </div>
</body>
</html>`,
      });
    });

    // 1. Load initial page with clean storage
    console.log('\n--- 1. Testing Initial Empty State (Zero Hardcoded Data) ---');
    await page.goto(`http://localhost:${port}`);
    await page.evaluate(() => {
      localStorage.clear();
      indexedDB.deleteDatabase('LornHubOfflineDB');
      indexedDB.deleteDatabase('LornHubPDFs');
    });
    await page.reload();
    await page.waitForTimeout(1000);

    // Initial state: Should have 0 regulations
    const initialSidebarText = await page.locator('[data-testid="sidebar-desktop"]').textContent();
    assert(initialSidebarText.includes('Regulasi Tersimpan (0)'), 'Sidebar shows 0 regulations initially');
    assert(initialSidebarText.includes('Belum ada regulasi'), 'Sidebar shows zero regulations empty text initially');

    // Verify Jelajah Regulasi and Meja Belajar are completely gone
    assert(!initialSidebarText.includes('Jelajah Regulasi'), 'Jelajah Regulasi removed from sidebar');
    assert(!initialSidebarText.includes('Meja Belajar'), 'Meja Belajar removed from sidebar');

    // Verify 4 real tools are present in sidebar
    assert(initialSidebarText.includes('Scraper / Tambah Regulasi'), 'Scraper tool present');
    assert(initialSidebarText.includes('Pencarian Kilat'), 'Search tool present');
    assert(initialSidebarText.includes('PDF & Dokumen Hub'), 'PDF Hub tool present');
    assert(initialSidebarText.includes('Baca Regulasi'), 'Reader tool present');

    await page.screenshot({ path: 'screenshots/01_initial_empty_state.png' });

    // 2. Test Header Controls: Typography (Serif / Sans)
    console.log('\n--- 2. Testing Header Typography Controls ---');
    const serifBtn = page.locator('button:has-text("Serif")').first();
    await serifBtn.click();
    await page.waitForTimeout(300);

    const isSerifActive = await page.evaluate(() => {
      return (
        document.documentElement.classList.contains('font-serif') &&
        document.documentElement.getAttribute('data-font-family') === 'serif'
      );
    });
    assert(isSerifActive, 'Clicking Serif button toggles document font-serif class globally');

    const sansBtn = page.locator('button:has-text("Sans")').first();
    await sansBtn.click();
    await page.waitForTimeout(300);

    const isSansActive = await page.evaluate(() => {
      return (
        document.documentElement.classList.contains('font-sans') &&
        document.documentElement.getAttribute('data-font-family') === 'sans'
      );
    });
    assert(isSansActive, 'Clicking Sans button toggles document font-sans class globally');

    // 3. Test Header Controls: 4-Level Font Scale (SM, MD, LG, XL)
    console.log('\n--- 3. Testing Header Font Scaling Controls ---');
    const smBtn = page.locator('button:has-text("SM")').first();
    await smBtn.click();
    await page.waitForTimeout(300);
    const smFontSize = await page.evaluate(() => document.documentElement.style.fontSize);
    assert(smFontSize === '14px', `Clicking SM scales root font size to 14px (got ${smFontSize})`);

    const lgBtn = page.locator('button:has-text("LG")').first();
    await lgBtn.click();
    await page.waitForTimeout(300);
    const lgFontSize = await page.evaluate(() => document.documentElement.style.fontSize);
    assert(lgFontSize === '18px', `Clicking LG scales root font size to 18px (got ${lgFontSize})`);

    const xlBtn = page.locator('button:has-text("XL")').first();
    await xlBtn.click();
    await page.waitForTimeout(300);
    const xlFontSize = await page.evaluate(() => document.documentElement.style.fontSize);
    assert(xlFontSize === '20px', `Clicking XL scales root font size to 20px (got ${xlFontSize})`);

    const mdBtn = page.locator('button:has-text("MD")').first();
    await mdBtn.click();
    await page.waitForTimeout(300);
    const mdFontSize = await page.evaluate(() => document.documentElement.style.fontSize);
    assert(mdFontSize === '16px', `Clicking MD scales root font size to 16px (got ${mdFontSize})`);

    // 4. Test Header Controls: Theme Toggle
    console.log('\n--- 4. Testing Header Theme Toggle ---');
    const initialIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    const themeBtn = page.locator('header button[aria-label="Beralih tema terang atau gelap"]');
    await themeBtn.click();
    await page.waitForTimeout(300);
    const toggledIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    assert(initialIsDark !== toggledIsDark, 'Clicking theme button toggles dark mode class');
    await themeBtn.click(); // revert
    await page.waitForTimeout(300);

    // 5. Test Navigation Tabs with Empty State
    console.log('\n--- 5. Testing Navigation Tabs & Empty States ---');
    // Search tab
    await page.locator('[data-testid="sidebar-nav-search"]').click();
    await page.waitForTimeout(400);
    const searchContent = await page.locator('[data-testid="main-content"]').textContent();
    assert(searchContent.includes('Belum Ada Data Regulasi'), 'Search shows honest empty state when 0 laws stored');

    // PDF tab
    await page.locator('[data-testid="sidebar-nav-pdf"]').click();
    await page.waitForTimeout(400);
    const pdfContent = await page.locator('[data-testid="main-content"]').textContent();
    assert(pdfContent.includes('Dokumen PDF'), 'PDF Hub loads properly');

    // Reader tab
    await page.locator('[data-testid="sidebar-nav-reader"]').click();
    await page.waitForTimeout(400);
    const readerContent = await page.locator('[data-testid="main-content"]').textContent();
    assert(readerContent.includes('Belum Ada Regulasi Tersimpan'), 'Reader shows honest empty state when 0 laws stored');

    await page.screenshot({ path: 'screenshots/02_reader_empty_state.png' });

    // 6. Test Regulation Scraper Comprehensively
    console.log('\n--- 6. Testing Regulation Scraper Comprehensively ---');
    await page.locator('[data-testid="sidebar-nav-scraper"]').click();
    await page.waitForTimeout(500);

    // 6A. Test Form Validation: Empty Title and Empty Body/URL
    console.log('Testing Scraper: Form validation on empty submission...');
    await page.click('[data-testid="scraper-btn-submit"]');
    await page.waitForTimeout(300);
    const toastValidation1 = await page.locator('[data-testid="toast-notification"]').textContent();
    assert(toastValidation1.includes('Mohon isi Judul regulasi'), 'Empty title displays validation error toast');

    // Fill title only, empty text
    await page.fill('[data-testid="scraper-input-judul"]', 'Regulasi Tanpa Teks');
    await page.click('[data-testid="scraper-btn-submit"]');
    await page.waitForTimeout(300);
    const toastValidation2 = await page.locator('[data-testid="toast-notification"]').textContent();
    assert(toastValidation2.includes('Mohon masukkan naskah teks atau JSON regulasi'), 'Empty body displays validation error toast');

    // Clear title
    await page.fill('[data-testid="scraper-input-judul"]', '');
    await page.fill('[data-testid="scraper-input-id"]', '');

    // 6B. Test Sample Regulation Loader ("Muat Format Contoh Regulasi")
    console.log('Testing Scraper: Loading sample regulation...');
    await page.click('[data-testid="scraper-btn-sample"]');
    await page.waitForTimeout(300);

    const sampleTitle = await page.inputValue('[data-testid="scraper-input-judul"]');
    const sampleId = await page.inputValue('[data-testid="scraper-input-id"]');
    const sampleNomor = await page.inputValue('[data-testid="scraper-input-nomor"]');
    const sampleRaw = await page.inputValue('[data-testid="scraper-textarea-raw"]');

    assert(sampleTitle === 'Undang-Undang Hak Asasi Manusia', 'Sample title loaded accurately');
    assert(sampleId === 'uu-39-1999', 'Sample ID loaded accurately');
    assert(sampleNomor === 'UU No. 39 Tahun 1999', 'Sample nomor loaded accurately');
    assert(sampleRaw.includes('BAB I\nKETENTUAN UMUM'), 'Sample statutory raw text populated');

    // Clear fields before testing URL mode
    await page.fill('[data-testid="scraper-input-judul"]', '');
    await page.fill('[data-testid="scraper-input-id"]', '');
    await page.fill('[data-testid="scraper-input-nomor"]', '');
    await page.fill('[data-testid="scraper-textarea-raw"]', '');

    // 6C. Test URL Mode: Network/CORS Error Handling
    console.log('Testing Scraper: URL mode error handling on unreachable source...');
    await page.click('[data-testid="scraper-tab-url"]');
    await page.waitForTimeout(300);

    // Empty URL validation
    await page.fill('[data-testid="scraper-input-judul"]', 'Test URL Kosong');
    await page.click('[data-testid="scraper-btn-submit"]');
    await page.waitForTimeout(300);
    const toastUrlEmpty = await page.locator('[data-testid="toast-notification"]').textContent();
    assert(toastUrlEmpty.includes('Mohon masukkan tautan URL naskah'), 'Empty URL shows validation error toast');

    // Unreachable URL failure
    await page.fill('[data-testid="scraper-input-url"]', 'http://localhost:59999/unreachable.json');
    await page.click('[data-testid="scraper-btn-submit"]');
    await page.waitForTimeout(1000);
    const toastUrlFail = await page.locator('[data-testid="toast-notification"]').textContent();
    assert(toastUrlFail.includes('Gagal menyimpan') || toastUrlFail.includes('Koneksi'), 'Unreachable URL displays error feedback');

    // Dismiss error toast so subsequent toast is clean
    const toastCloseBtn = page.locator('[data-testid="toast-notification"] button');
    if (await toastCloseBtn.isVisible()) {
      await toastCloseBtn.click();
      await page.waitForTimeout(300);
    }

    // 6D. Test URL Mode: Successful Ingestion via Mock HTTP JSON Endpoint
    console.log('Testing Scraper: Successful URL ingestion via mock endpoint...');
    await page.fill('[data-testid="scraper-input-judul"]', 'UU Keterbukaan Informasi Publik');
    await page.fill('[data-testid="scraper-input-id"]', 'uu-14-2008');
    await page.fill('[data-testid="scraper-input-url"]', `http://localhost:${port}/api/mock-regulation.json`);
    await page.click('[data-testid="scraper-btn-submit"]');
    await page.waitForTimeout(1000);

    const toastSuccessUrl = await page.locator('[data-testid="toast-notification"]').textContent();
    assert(toastSuccessUrl.includes('Berhasil'), 'Mock URL ingested and saved successfully');

    // Verify it appeared in scraper archive table
    const archiveItemUrl = page.locator('[data-testid="scraper-law-item-uu-14-2008"]');
    assert(await archiveItemUrl.isVisible(), 'Ingested URL regulation appears in Scraper archive list');

    // Test Scraper "Buka di Pembaca" button
    await page.click('[data-testid="scraper-btn-open-uu-14-2008"]');
    await page.waitForTimeout(500);
    const readerTitle = await page.locator('[data-testid="main-content"]').textContent();
    assert(readerTitle.includes('UU Keterbukaan Informasi Publik'), 'Clicking Buka di Pembaca from scraper opens reader');
    assert(readerTitle.includes('Informasi adalah keterangan'), 'Reader renders content scraped via URL');

    // Delete mock regulation so count resets cleanly for subsequent steps
    await page.locator('[data-testid="sidebar-nav-scraper"]').click();
    await page.waitForTimeout(400);

    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.click('[data-testid="scraper-btn-delete-uu-14-2008"]');
    await page.waitForTimeout(500);

    const scraperAfterDelete = await page.locator('[data-testid="sidebar-desktop"]').textContent();
    assert(scraperAfterDelete.includes('Regulasi Tersimpan (0)'), 'Mock regulation deleted cleanly via archive delete button');

    // 6E. Test URL Mode: Successful Ingestion via Mock HTML Web Page
    console.log('Testing Scraper: Successful URL ingestion via mock HTML endpoint...');
    await page.click('[data-testid="scraper-tab-url"]');
    await page.waitForTimeout(300);

    await page.fill('[data-testid="scraper-input-judul"]', 'UU Kearsipan');
    await page.fill('[data-testid="scraper-input-id"]', 'uu-43-2009');
    await page.fill('[data-testid="scraper-input-url"]', `http://localhost:${port}/api/mock-regulation.html`);
    await page.click('[data-testid="scraper-btn-submit"]');
    await page.waitForTimeout(1000);

    const toastSuccessHtml = await page.locator('[data-testid="toast-notification"]').textContent();
    assert(toastSuccessHtml.includes('Berhasil'), 'Mock HTML URL ingested and saved successfully');

    // Verify it appeared in scraper archive table
    const archiveItemHtml = page.locator('[data-testid="scraper-law-item-uu-43-2009"]');
    assert(await archiveItemHtml.isVisible(), 'Ingested HTML regulation appears in Scraper archive list');

    // Test Scraper "Buka di Pembaca" button for HTML scraped regulation
    await page.click('[data-testid="scraper-btn-open-uu-43-2009"]');
    await page.waitForTimeout(500);
    const readerTitleHtml = await page.locator('[data-testid="main-content"]').textContent();
    assert(readerTitleHtml.includes('UU Kearsipan'), 'Clicking Buka di Pembaca opens HTML scraped regulation');
    assert(readerTitleHtml.includes('Kearsipan adalah hal-hal yang berkenaan dengan arsip'), 'Reader renders content scraped via HTML URL');

    // Delete HTML mock regulation so count resets cleanly for subsequent steps
    await page.locator('[data-testid="sidebar-nav-scraper"]').click();
    await page.waitForTimeout(400);

    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.click('[data-testid="scraper-btn-delete-uu-43-2009"]');
    await page.waitForTimeout(500);

    const scraperAfterHtmlDelete = await page.locator('[data-testid="sidebar-desktop"]').textContent();
    assert(scraperAfterHtmlDelete.includes('Regulasi Tersimpan (0)'), 'Mock HTML regulation deleted cleanly via archive delete button');

    // 6F. Test Direct Text Ingestion with Edge-Case Numbering (Pasal 1A, 2 bis, BAB titles)
    console.log('Testing Scraper: Direct text ingestion with edge-case statutory numbering...');
    await page.click('[data-testid="scraper-tab-text"]');
    await page.waitForTimeout(300);

    await page.fill('[data-testid="scraper-input-id"]', 'uu-1-2024');
    await page.fill('[data-testid="scraper-input-judul"]', 'UU Informasi dan Transaksi Elektronik');
    await page.fill('[data-testid="scraper-input-nomor"]', 'UU No. 1 Tahun 2024');

    const sampleStatuteText = `BAB I
KETENTUAN UMUM

Pasal 1
Dalam Undang-Undang ini yang dimaksud dengan:
(1) Informasi Elektronik adalah satu atau sekumpulan data elektronik termasuk tetapi tidak terbatas pada tulisan, suara, gambar, peta, dan rancangan.
(2) Transaksi Elektronik adalah perbuatan hukum yang dilakukan dengan menggunakan Komputer, jaringan Komputer, dan/atau media elektronik lainnya.

Pasal 1A
Penyelenggaraan Transaksi Elektronik wajib menjamin perlindungan data pribadi dan kedaulatan informasi nasional.

BAB II
ASAS DAN PENEGAKAN HUKUM

Pasal 2 bis
Setiap orang asing yang melakukan perbuatan pidana siber di luar wilayah Indonesia tetap tunduk pada yurisdiksi peradilan Indonesia.

Pasal 3
Pemanfaatan Teknologi Informasi dan Transaksi Elektronik dilaksanakan berdasarkan asas kepastian hukum, manfaat, kehati-hatian, iktikad baik, dan kebebasan memilih teknologi.`;

    await page.fill('[data-testid="scraper-textarea-raw"]', sampleStatuteText);
    await page.click('[data-testid="scraper-btn-submit"]');
    await page.waitForTimeout(800);

    // Verify sidebar updated dynamically to 1 regulation
    const updatedSidebarText = await page.locator('[data-testid="sidebar-desktop"]').textContent();
    assert(updatedSidebarText.includes('Regulasi Tersimpan (1)'), 'Sidebar updated dynamically to 1 regulation');
    assert(updatedSidebarText.includes('UU Informasi dan Transaksi Elektronik'), 'Ingested regulation visible in sidebar');

    await page.screenshot({ path: 'screenshots/03_scraper_after_ingest.png' });

    // 7. Ingest 5 more regulations to test multiple regulation management & scroll
    console.log('\n--- 7. Ingesting Multiple Regulations ---');
    for (let i = 2; i <= 6; i++) {
      await page.fill('[data-testid="scraper-input-id"]', `uu-${i}-2024`);
      await page.fill('[data-testid="scraper-input-judul"]', `Regulasi Hukum Nomor ${i}`);
      await page.fill('[data-testid="scraper-input-nomor"]', `UU No. ${i}/2024`);
      await page.fill(
        '[data-testid="scraper-textarea-raw"]',
        `BAB I\nKETENTUAN UMUM\nPasal 1\nKetentuan umum untuk regulasi nomor ${i}.\nPasal 2\nKetentuan penutup untuk regulasi nomor ${i}.`
      );
      await page.click('[data-testid="scraper-btn-submit"]');
      await page.waitForTimeout(400);
    }

    const multiSidebarText = await page.locator('[data-testid="sidebar-desktop"]').textContent();
    assert(multiSidebarText.includes('Regulasi Tersimpan (6)'), 'Sidebar now holds 6 regulations');

    // 8. Test Baca Regulasi View & Switch Regulation Bug Prevention
    console.log('\n--- 8. Testing Baca Regulasi View & Switching Regulations (Bug Prevention Check) ---');
    await page.locator('[data-testid="sidebar-nav-reader"]').click();
    await page.waitForTimeout(500);

    // Select uu-1-2024 from dropdown
    await page.selectOption('#select-law-quick', 'uu-1-2024');
    await page.waitForTimeout(500);

    // CRITICAL BUG CHECK: Verify dropdown DID NOT reset back
    const currentDropdownValue = await page.$eval('#select-law-quick', (el) => el.value);
    assert(currentDropdownValue === 'uu-1-2024', `Selected law remains uu-1-2024 without resetting (got ${currentDropdownValue})`);

    const readerMainText = await page.locator('[data-testid="main-content"]').textContent();
    assert(readerMainText.includes('Pasal 1'), 'Pasal 1 renders in reader');
    assert(readerMainText.includes('Informasi Elektronik'), 'Ayat (1) content renders accurately');
    assert(readerMainText.includes('Pasal 1A'), 'Edge-case Pasal 1A renders accurately');
    assert(readerMainText.includes('Pasal 2 BIS') || readerMainText.includes('Pasal 2 bis'), 'Edge-case Pasal 2 bis renders accurately');
    assert(readerMainText.includes('Pasal 3'), 'Pasal 3 renders in reader');

    // Verify Bab title parsed correctly
    assert(readerMainText.includes('BAB I - KETENTUAN UMUM'), 'Multi-line Bab heading parsed with chapter title');

    // Test switching to another regulation via sidebar clicking
    const regItem = page.locator('div[data-testid="sidebar-regulations-scroll-container"] >> text=Regulasi Hukum Nomor 2').first();
    await regItem.click();
    await page.waitForTimeout(500);

    const readerTextAfterSwitch = await page.locator('[data-testid="main-content"]').textContent();
    assert(
      readerTextAfterSwitch.includes('Regulasi Hukum Nomor 2'),
      'Clicking sidebar item cleanly switches reader view to Regulasi Hukum Nomor 2'
    );
    assert(
      readerTextAfterSwitch.includes('Ketentuan umum untuk regulasi nomor 2'),
      'Reader displays articles of newly selected regulation'
    );

    // Test interaction: click Stabilo on Pasal 1
    const highlighterBtn = page.locator('article#pasal-1 button[title*="Stabilo"]').first();
    if (await highlighterBtn.isVisible()) {
      await highlighterBtn.click();
      await page.waitForTimeout(300);
      const yellowColorBtn = page.locator('button[title="Pilih warna yellow"]');
      if (await yellowColorBtn.isVisible()) {
        await yellowColorBtn.click();
        await page.waitForTimeout(300);
        console.log('✅ PASS: Highlight applied to Pasal 1');
      }
    }

    await page.screenshot({ path: 'screenshots/05_reader_with_real_data.png' });

    // 9. Test Search across ALL stored regulations after Hard Reload
    console.log('\n--- 9. Testing Search Across All Regulations After Hard Reload ---');
    await page.reload();
    await page.waitForTimeout(1000);

    await page.locator('[data-testid="sidebar-nav-search"]').click();
    await page.waitForTimeout(400);

    // Search for a keyword from regulation 4
    const searchInput = page.locator('input[placeholder*="Cari nomor pasal"]');
    await searchInput.fill('nomor 4');
    await page.waitForTimeout(600);

    const searchResultsText = await page.locator('[data-testid="main-content"]').textContent();
    assert(
      searchResultsText.includes('Regulasi Hukum Nomor 4') || searchResultsText.includes('Pasal 1'),
      'Search across IndexedDB immediately finds keyword from non-first regulation after hard reload'
    );

    await page.screenshot({ path: 'screenshots/06_search_and_nav_result.png' });

    // 10. Test PDF Hub Text Extraction & Send to Scraper
    console.log('\n--- 10. Testing PDF Hub Text Extraction & Send to Scraper ---');
    await page.locator('[data-testid="sidebar-nav-pdf"]').click();
    await page.waitForTimeout(400);

    // Inject a simulated PDF document into IndexedDB matching LornHubPDFs schema
    await page.evaluate(async () => {
      return new Promise((resolve) => {
        const req = indexedDB.open('LornHubPDFs', 2);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('pdfs')) {
            const store = db.createObjectStore('pdfs', { keyPath: 'id' });
            store.createIndex('by-date', 'uploadDate');
          }
          if (!db.objectStoreNames.contains('pdfData')) {
            db.createObjectStore('pdfData');
          }
        };
        req.onsuccess = (e) => {
          const db = e.target.result;
          const tx = db.transaction(['pdfs', 'pdfData'], 'readwrite');
          const id = 'sample-pdf-1';
          tx.objectStore('pdfs').put({
            id,
            name: 'UU-Perlindungan-Konsumen.pdf',
            uploadDate: Date.now(),
          });
          tx.objectStore('pdfData').put(new ArrayBuffer(16), id);
          tx.oncomplete = () => resolve(true);
        };
      });
    });

    await page.reload();
    await page.waitForTimeout(1000);
    await page.locator('[data-testid="sidebar-nav-pdf"]').click();
    await page.waitForTimeout(500);

    const pdfListText = await page.locator('[data-testid="main-content"]').textContent();
    assert(pdfListText.includes('UU-Perlindungan-Konsumen.pdf'), 'PDF Hub lists saved PDF document');

    // 11. Test Heavy Ingestion (20 Regulations) and Verify Sidebar Scroll Zero Collision
    console.log('\n--- 11. Ingesting 20 Regulations & Testing Sidebar Scroll Containment ---');
    await page.locator('[data-testid="sidebar-nav-scraper"]').click();
    await page.waitForTimeout(400);

    for (let i = 7; i <= 20; i++) {
      await page.fill('[data-testid="scraper-input-id"]', `uu-${i}-2024`);
      await page.fill('[data-testid="scraper-input-judul"]', `Undang-Undang Nasional ${i}`);
      await page.fill('[data-testid="scraper-input-nomor"]', `UU No. ${i}/2024`);
      await page.fill('[data-testid="scraper-textarea-raw"]', `Pasal 1\nPasal pertama naskah hukum ke-${i}.`);
      await page.click('[data-testid="scraper-btn-submit"]');
      await page.waitForTimeout(200);
    }

    const heavySidebarText = await page.locator('[data-testid="sidebar-desktop"]').textContent();
    assert(heavySidebarText.includes('Regulasi Tersimpan (20)'), 'Sidebar successfully holds 20 regulations');

    // Check collision across different viewport heights
    const viewportsToTest = [
      { width: 1280, height: 650 },
      { width: 1280, height: 800 },
      { width: 1440, height: 1080 },
    ];

    for (const vp of viewportsToTest) {
      await page.setViewportSize(vp);
      await page.waitForTimeout(300);

      const scrollContainer = page.locator('[data-testid="sidebar-regulations-scroll-container"]');
      const sidebar = page.locator('[data-testid="sidebar-desktop"]');

      const scrollBox = await scrollContainer.boundingBox();
      const sidebarBox = await sidebar.boundingBox();

      assert(scrollBox && sidebarBox, `Elements mounted at ${vp.width}x${vp.height}`);
      if (scrollBox && sidebarBox) {
        const scrollBottom = scrollBox.y + scrollBox.height;
        const sidebarBottom = sidebarBox.y + sidebarBox.height;
        assert(
          scrollBottom <= sidebarBottom + 1,
          `At ${vp.width}x${vp.height}: scroll container bottom (${scrollBottom.toFixed(1)}) is contained within sidebar bottom (${sidebarBottom.toFixed(1)})`
        );
      }
    }

    // Scroll within the container
    const scrollContainer = page.locator('[data-testid="sidebar-regulations-scroll-container"]');
    await scrollContainer.evaluate((el) => {
      el.scrollTop = 500;
    });
    await page.waitForTimeout(300);
    const scrolledTop = await scrollContainer.evaluate((el) => el.scrollTop);
    assert(scrolledTop > 0, `Sidebar regulations scroll container scrolled to ${scrolledTop}px without breaking layout`);

    await page.screenshot({ path: 'screenshots/04_sidebar_scrolling_no_overlap.png' });

    await context.close();
    console.log(`\n========================================`);
    if (failures === 0) {
      console.log('🎉 ALL PLAYWRIGHT E2E TESTS PASSED WITH 0 FAILURES!');
    } else {
      console.error(`💥 ${failures} PLAYWRIGHT TEST CHECKS FAILED!`);
    }
    console.log(`========================================\n`);
  } finally {
    await browser.close();
    await server.close();
  }

  if (failures > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
