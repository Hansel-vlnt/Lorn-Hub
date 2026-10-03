import { chromium } from '@playwright/test';
import path from 'path';

const TARGET_URL = 'http://127.0.0.1:5173/';
const CDP_ENDPOINT = 'http://127.0.0.1:9222';
const OUT_DIR = path.resolve('screenshots/live_verification');

async function runLiveVerification() {
  console.log('🏛️ CONNECTING TO VISIBLE GOOGLE CHROME VIA CDP AT:', CDP_ENDPOINT);

  const browser = await chromium.connectOverCDP(CDP_ENDPOINT);
  const contexts = browser.contexts();
  const context = contexts[0] || (await browser.newContext());
  
  // Use existing page or open a new one
  const pages = context.pages();
  const page = pages.length > 0 ? pages[0] : await context.newPage();

  // Track console logs and network errors
  const consoleErrors = [];
  const network404s = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error('  [Console Error]:', msg.text());
    }
  });

  page.on('response', (res) => {
    if (res.status() === 404) {
      network404s.push({ url: res.url(), status: res.status() });
      console.warn('  [Network 404]:', res.url());
    }
  });

  console.log('📍 Navigating live page to:', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Ingest sample dataset to populate Reader, Catalog, and Sidebar
  console.log('\n📚 Seed dataset into IndexedDB for live test execution...');
  await page.evaluate(async () => {
    const createArticles = (lawId, count, prefix) => {
      const articles = [];
      for (let i = 1; i <= count; i++) {
        articles.push({
          id: `${lawId}-pasal-${i}`,
          lawId,
          nomor: `${i}`,
          bab: i <= 15 ? 'BAB I - Ketentuan Umum' : i <= 35 ? 'BAB II - Tindak Pidana' : 'BAB III - Penutup',
          judul: i === 1 ? 'Ketentuan Pokok' : undefined,
          isi: `Setiap orang yang melanggar tata tertib hukum pasal ${i} diancam pidana atau denda. Naskah ini menjamin kepastian hukum ${prefix} di wilayah Republik Indonesia.`,
          kategori: 'pidana',
          ayat: i % 2 === 0 ? [
            { nomor: 1, teks: `Ketentuan ayat 1 pasal ${i} berlaku untuk seluruh warga negara.` },
            { nomor: 2, teks: `Pemberatan pidana berlaku jika dilakukan berulang kali.` }
          ] : undefined,
          penjelasan: `Penjelasan resmi untuk Pasal ${i} naskah perundang-undangan.`,
        });
      }
      return articles;
    };

    const laws = [
      {
        metadata: {
          id: 'kuhp-2023',
          judul: 'Kitab Undang-Undang Hukum Pidana',
          judulLengkap: 'Undang-Undang Republik Indonesia Nomor 1 Tahun 2023 Tentang Kitab Undang-Undang Hukum Pidana',
          singkatan: 'KUHP Baru',
          nomorRegulasi: 'UU No. 1 Tahun 2023',
          nomor: '1',
          tahun: 2023,
          kategori: 'pidana',
          sumberUrl: 'https://peraturan.go.id/kuhp-2023',
          statusDownload: 'cached-offline',
          totalPasal: 60,
          status: 'transisi',
        },
        pasalList: createArticles('kuhp-2023', 60, 'KUHP Baru 2023'),
      },
      {
        metadata: {
          id: 'uu-ite-2024',
          judul: 'Undang-Undang Informasi dan Transaksi Elektronik',
          judulLengkap: 'Undang-Undang Republik Indonesia Nomor 1 Tahun 2024 Tentang Perubahan Kedua UU ITE',
          singkatan: 'UU ITE',
          nomorRegulasi: 'UU No. 1 Tahun 2024',
          nomor: '1',
          tahun: 2024,
          kategori: 'khusus',
          sumberUrl: 'https://peraturan.go.id/uu-ite-2024',
          statusDownload: 'cached-offline',
          totalPasal: 25,
          status: 'berlaku',
        },
        pasalList: createArticles('uu-ite-2024', 25, 'Informasi dan Transaksi Elektronik'),
      },
      {
        metadata: {
          id: 'uu-tipikor-1999',
          judul: 'Undang-Undang Pemberantasan Tindak Pidana Korupsi',
          judulLengkap: 'Undang-Undang Republik Indonesia Nomor 31 Tahun 1999 Tentang Pemberantasan Tindak Pidana Korupsi',
          singkatan: 'UU Tipikor',
          nomorRegulasi: 'UU No. 31 Tahun 1999',
          nomor: '31',
          tahun: 1999,
          kategori: 'pidana',
          sumberUrl: 'https://peraturan.go.id/uu-tipikor-1999',
          statusDownload: 'cached-offline',
          totalPasal: 20,
          status: 'berlaku',
        },
        pasalList: createArticles('uu-tipikor-1999', 20, 'Tindak Pidana Korupsi'),
      },
    ];

    return new Promise((resolve, reject) => {
      const req = indexedDB.open('LornHubOfflineDB', 1);
      req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction(['metadata', 'datasets'], 'readwrite');
        const metaStore = tx.objectStore('metadata');
        const dataStore = tx.objectStore('datasets');
        for (const item of laws) {
          metaStore.put(item.metadata);
          dataStore.put(item);
        }
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      };
      req.onerror = () => reject(req.error);
    });
  });

  // Reload page to reflect seeded datasets in React state
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const results = {
    test01: null,
    test02: null,
    test03: null,
    test04: null,
    test05: null,
  };

  // ==========================================
  // TEST-01: Independensi Scroll Sidebar
  // ==========================================
  console.log('\n--- [TEST-01] Uji Validasi Scroll Independen Sidebar ---');
  // Switch to reader mode by clicking the first regulation in sidebar
  const regCard = page.locator('aside[data-testid="sidebar-desktop"] span:has-text("KUHP Baru")').first();
  if (await regCard.isVisible()) {
    await regCard.click();
    await page.waitForTimeout(600);
  }

  const topBefore = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    return aside ? aside.getBoundingClientRect().top : null;
  });

  // Scroll main container by 1200px
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = 1200;
  });
  await page.waitForTimeout(500);

  const topAfter = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    return aside ? aside.getBoundingClientRect().top : null;
  });

  const mainScrollTop = await page.evaluate(() => {
    const main = document.querySelector('main');
    return main ? main.scrollTop : 0;
  });

  const test01Pass = topBefore !== null && topBefore === topAfter && mainScrollTop >= 1000;
  results.test01 = {
    pass: test01Pass,
    topBefore,
    topAfter,
    mainScrollTop,
  };
  console.log(`TEST-01 Status: ${test01Pass ? 'PASS' : 'FAIL'} (topBefore: ${topBefore}, topAfter: ${topAfter}, mainScrollTop: ${mainScrollTop})`);

  const shot01 = path.join(OUT_DIR, 'TEST-01_scroll_independence.png');
  await page.screenshot({ path: shot01 });
  console.log(`✓ Screenshot saved: ${shot01}`);

  // Restore main scroll to top
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
  });
  await page.waitForTimeout(300);

  // ==========================================
  // TEST-02: Mini-Filter Sidebar
  // ==========================================
  console.log('\n--- [TEST-02] Uji Interaktif Mini-Filter Sidebar ---');
  const asideInput = page.locator('aside input');
  await asideInput.click();
  await asideInput.fill('KUHP');
  await page.waitForTimeout(400);

  // Verify only KUHP appears
  const filterKuhpResult = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="sidebar-regulations-scroll-container"]');
    if (!container) return { count: 0, titles: [] };
    const items = Array.from(container.querySelectorAll('.group span.truncate'));
    return {
      count: items.length,
      titles: items.map(el => el.textContent.trim()),
    };
  });

  const onlyKuhpVisible = filterKuhpResult.count > 0 && filterKuhpResult.titles.every(t => t.includes('KUHP'));
  console.log(`  Filtered 'KUHP' results (${filterKuhpResult.count}):`, filterKuhpResult.titles);

  const shot02Filter = path.join(OUT_DIR, 'TEST-02_minifilter_KUHP.png');
  await page.screenshot({ path: shot02Filter });

  // Press Escape to reset filter
  await asideInput.press('Escape');
  await page.waitForTimeout(400);

  const filterResetCount = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="sidebar-regulations-scroll-container"]');
    if (!container) return 0;
    return container.querySelectorAll('.group').length;
  });
  console.log(`  After Escape, total regulations visible: ${filterResetCount}`);

  // Negative test: Search XYZ999
  await asideInput.fill('XYZ999');
  await page.waitForTimeout(400);

  const negativeMsg = await page.evaluate(() => {
    const container = document.querySelector('[data-testid="sidebar-regulations-scroll-container"]');
    return container ? container.textContent.trim() : '';
  });

  const negativePass = negativeMsg.includes('Tidak ada regulasi yang cocok');
  console.log(`  Negative query 'XYZ999' message: "${negativeMsg}" (Matches: ${negativePass})`);

  const shot02Negative = path.join(OUT_DIR, 'TEST-02_minifilter_negative.png');
  await page.screenshot({ path: shot02Negative });

  // Clear input
  await asideInput.fill('');
  await page.waitForTimeout(300);

  const test02Pass = onlyKuhpVisible && filterResetCount >= 3 && negativePass;
  results.test02 = {
    pass: test02Pass,
    onlyKuhpVisible,
    filterResetCount,
    negativePass,
  };
  console.log(`TEST-02 Status: ${test02Pass ? 'PASS' : 'FAIL'}`);

  // ==========================================
  // TEST-03: Mode Cetak Dokumen Resmi (@media print)
  // ==========================================
  console.log('\n--- [TEST-03] Uji Mode Cetak Dokumen Resmi ---');
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(500);

  const printStyles = await page.evaluate(() => {
    const header = document.querySelector('header');
    const aside = document.querySelector('aside');
    const body = document.body;

    const headerDisplay = header ? window.getComputedStyle(header).display : 'unknown';
    const asideDisplay = aside ? window.getComputedStyle(aside).display : 'unknown';
    const bodyBg = body ? window.getComputedStyle(body).backgroundColor : 'unknown';

    return {
      headerDisplay,
      asideDisplay,
      bodyBg,
    };
  });

  const test03Pass =
    printStyles.headerDisplay === 'none' &&
    printStyles.asideDisplay === 'none' &&
    printStyles.bodyBg === 'rgb(255, 255, 255)';

  results.test03 = {
    pass: test03Pass,
    ...printStyles,
  };
  console.log(`TEST-03 Computed Styles:`, printStyles);
  console.log(`TEST-03 Status: ${test03Pass ? 'PASS' : 'FAIL'}`);

  const shot03Print = path.join(OUT_DIR, 'TEST-03_print_mode_a4.png');
  await page.screenshot({ path: shot03Print });
  console.log(`✓ Screenshot saved: ${shot03Print}`);

  // Restore screen media
  await page.emulateMedia({ media: 'screen' });
  await page.waitForTimeout(500);

  // ==========================================
  // TEST-04: Ekspor Berkas .TXT & .JSON
  // ==========================================
  console.log('\n--- [TEST-04] Uji Ekspor Berkas .TXT & .JSON ---');
  
  // Install createObjectURL spy in browser
  await page.evaluate(() => {
    window.__capturedBlobs = [];
    const originalCreate = URL.createObjectURL;
    URL.createObjectURL = function(blob) {
      window.__capturedBlobs.push({
        size: blob.size,
        type: blob.type,
      });
      return originalCreate.call(URL, blob);
    };
  });

  // 1. Click Ekspor .TXT
  console.log('  Triggering Ekspor .TXT...');
  const btnExportTxt = page.locator('[data-testid="btn-export-txt"]');
  await btnExportTxt.click();
  await page.waitForTimeout(600);

  const txtCaptured = await page.evaluate(() => {
    return window.__capturedBlobs.find(b => b.type.includes('text/plain'));
  });

  const toastTextTxt = await page.locator('[data-testid="toast"]').textContent().catch(() => '');
  console.log(`  TXT Blob captured:`, txtCaptured, `| Toast: "${toastTextTxt}"`);

  const shot04Txt = path.join(OUT_DIR, 'TEST-04_export_txt.png');
  await page.screenshot({ path: shot04Txt });

  // 2. Click Ekspor .JSON
  console.log('  Triggering Ekspor .JSON...');
  const btnExportJson = page.locator('[data-testid="btn-export-json"]');
  await btnExportJson.click();
  await page.waitForTimeout(600);

  const jsonCaptured = await page.evaluate(() => {
    return window.__capturedBlobs.find(b => b.type.includes('application/json'));
  });

  const toastTextJson = await page.locator('[data-testid="toast"]').textContent().catch(() => '');
  console.log(`  JSON Blob captured:`, jsonCaptured, `| Toast: "${toastTextJson}"`);

  const shot04Json = path.join(OUT_DIR, 'TEST-04_export_json.png');
  await page.screenshot({ path: shot04Json });

  const test04Pass =
    Boolean(txtCaptured && txtCaptured.size > 0) &&
    Boolean(jsonCaptured && jsonCaptured.size > 0);

  results.test04 = {
    pass: test04Pass,
    txtBlobSize: txtCaptured ? txtCaptured.size : 0,
    jsonBlobSize: jsonCaptured ? jsonCaptured.size : 0,
  };
  console.log(`TEST-04 Status: ${test04Pass ? 'PASS' : 'FAIL'}`);

  // ==========================================
  // TEST-05: Audit Integritas Konsol & Jaringan
  // ==========================================
  console.log('\n--- [TEST-05] Audit Integritas Konsol Runtime ---');
  const test05Pass = consoleErrors.length === 0 && network404s.length === 0;
  results.test05 = {
    pass: test05Pass,
    consoleErrorsCount: consoleErrors.length,
    network404sCount: network404s.length,
    consoleErrors,
    network404s,
  };
  console.log(`TEST-05 Status: ${test05Pass ? 'PASS' : 'FAIL'} (Console errors: ${consoleErrors.length}, 404s: ${network404s.length})`);

  console.log('\n=============================================');
  console.log('🏁 LIVE CDP AUDIT SUMMARY RESULTS:');
  console.log(JSON.stringify(results, null, 2));
  console.log('=============================================');

  return results;
}

runLiveVerification().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
