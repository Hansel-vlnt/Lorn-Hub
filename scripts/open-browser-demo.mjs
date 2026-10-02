import { chromium } from '@playwright/test';

const TARGET_URL = 'http://localhost:5173/';

async function openLiveBrowserTour() {
  console.log('🚀 Membuka Google Chrome nyata (Headless: FALSE) di layar Anda...');

  // Buka Chrome asli di Windows dengan mode Headed (tampak di layar)
  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: null, // Mengikuti ukuran jendela maksimal
  });

  const page = await context.newPage();

  console.log('📍 1. Membuka URL Lorn-Hub:', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Pastikan ada dataset sampel untuk demonstrasi membaca naskah hukum
  console.log('📚 2. Menyiapkan dataset simulasi regulasi untuk demonstrasi pembacaan...');
  await page.evaluate(async () => {
    const sampleArticles = [];
    for (let i = 1; i <= 60; i++) {
      sampleArticles.push({
        id: `uu-simulasi-2026-pasal-${i}`,
        lawId: 'uu-simulasi-2026',
        nomor: `${i}`,
        judul: i === 16 ? 'Tindak Pidana Pencurian' : undefined,
        bab: i <= 15 ? 'BAB I - Ketentuan Umum' : i <= 35 ? 'BAB II - Tindak Pidana Pencurian' : 'BAB III - Penutup',
        isi: `Setiap orang yang melanggar ketentuan tata tertib hukum pasal ${i} diancam dengan pidana denda atau pengawasan. Ketentuan ini menjamin kepastian hukum dan perlindungan hak asasi bagi seluruh warga negara di wilayah Republik Indonesia.`,
        kategori: 'pidana',
        ayat: i % 3 === 0 ? [
          { nomor: 1, teks: 'Tindak pidana sebagaimana dimaksud pada pasal ini dilakukan dengan sengaja secara melawan hukum.' },
          { nomor: 2, teks: 'Pemberatan pidana berlaku jika perbuatan dilakukan pada malam hari atau secara berkelompok.' },
        ] : undefined,
      });
    }

    const testLaw = {
      metadata: {
        id: 'uu-simulasi-2026',
        judul: 'Undang-Undang Simulasi Tata Tertib Hukum Nasional',
        singkatan: 'UU Simulasi 2026',
        nomorRegulasi: 'UU No. 99 Tahun 2026',
        nomor: '99',
        tahun: 2026,
        kategori: 'pidana',
        sumberUrl: 'https://peraturan.go.id/simulasi',
        statusDownload: 'cached-offline',
        totalPasal: 60,
        status: 'berlaku',
      },
      pasalList: sampleArticles,
    };

    return new Promise((resolve) => {
      const req = indexedDB.open('LornHubOfflineDB', 1);
      req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction(['metadata', 'datasets'], 'readwrite');
        tx.objectStore('metadata').put(testLaw.metadata);
        tx.objectStore('datasets').put(testLaw);
        tx.oncomplete = () => resolve(true);
      };
      req.onerror = () => resolve(false);
    });
  });

  // Reload agar data langsung terhidrasi ke state
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // 1. Pilih regulasi di sidebar
  console.log('📖 3. Memilih regulasi di sidebar dan masuk ke mode Baca...');
  const regItem = page.locator('aside[data-testid="sidebar-desktop"] span:has-text("UU Simulasi 2026")').first();
  if (await regItem.isVisible()) {
    await regItem.click();
    await page.waitForTimeout(1500);
  }

  // 2. Demo Independensi Scroll
  console.log('📜 4. Demonstrasi Scroll: Naskah pasal bergulir lancar sementara Sidebar tetap 100% diam...');
  const main = page.locator('main');
  for (let s = 1; s <= 5; s++) {
    await main.evaluate((el, step) => el.scrollBy({ top: 400, behavior: 'smooth' }), s);
    await page.waitForTimeout(600);
  }
  await page.waitForTimeout(1000);

  // Scroll kembali ke atas
  await main.evaluate((el) => el.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

  // 3. Demo Tipografi Hukum
  console.log('✍️ 5. Demonstrasi Tipografi: Beralih ke font Serif (buku hukum cetak)...');
  const serifBtn = page.locator('header button:has-text("Serif")').first();
  if (await serifBtn.isVisible()) {
    await serifBtn.click();
    await page.waitForTimeout(1500);
  }

  console.log('✍️ 6. Demonstrasi Skala Huruf: Mengubah ukuran teks naskah ke XL...');
  const xlBtn = page.locator('header button:has-text("XL")').first();
  if (await xlBtn.isVisible()) {
    await xlBtn.click();
    await page.waitForTimeout(1500);
  }

  console.log('✍️ 7. Mengembalikan ukuran teks ke BASE dan font Sans (Inter modern)...');
  const baseBtn = page.locator('header button:has-text("BASE")').first();
  if (await baseBtn.isVisible()) {
    await baseBtn.click();
    await page.waitForTimeout(800);
  }
  const sansBtn = page.locator('header button:has-text("Sans")').first();
  if (await sansBtn.isVisible()) {
    await sansBtn.click();
    await page.waitForTimeout(1000);
  }

  // 4. Demo Theme Toggle (Light & Dark)
  console.log('☀️ 8. Demonstrasi Mode Terang (Editorial Paper Light)...');
  const themeBtn = page.locator('button[aria-label="Beralih tema terang atau gelap"]').first();
  if (await themeBtn.isVisible()) {
    await themeBtn.click();
    await page.waitForTimeout(2500); // Beri waktu user menikmati tampilan mode terang

    console.log('🌙 9. Beralih kembali ke Mode Gelap (Slate Dark Authority)...');
    await themeBtn.click();
    await page.waitForTimeout(1500);
  }

  // 5. Demo Pencarian Kilat
  console.log('🔍 10. Demonstrasi Pencarian Kilat: Mengetik kata kunci "pencurian"...');
  const searchTabBtn = page.locator('button[data-testid="sidebar-nav-search"]');
  if (await searchTabBtn.isVisible()) {
    await searchTabBtn.click();
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await page.keyboard.type('pencurian', { delay: 100 });
      await page.waitForTimeout(2000);
    }
  }

  // 6. Kembali ke Mode Baca Regulasi
  console.log('📖 11. Kembali ke naskah regulasi utama...');
  const readerTabBtn = page.locator('button[data-testid="sidebar-nav-reader"]');
  if (await readerTabBtn.isVisible()) {
    await readerTabBtn.click();
    await page.waitForTimeout(1500);
  }

  // 7. Demo Modal Sitasi
  console.log('📑 12. Membuka modal Sitasi Hukum standar...');
  const citationBtn = page.locator('button[title="Sitasi Hukum"]').first();
  if (await citationBtn.isVisible()) {
    await citationBtn.click();
    await page.waitForTimeout(2000);

    // Tutup modal
    console.log('Tutup modal...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  }

  console.log('\n✅ SELURUH DEMONSTRASI SELESAI!');
  console.log('🌐 Browser Chrome dibiarkan TETAP TERBUKA di layar Anda.');
  console.log('Anda dapat langsung mencoba klik, membaca naskah, dan berinteraksi secara bebas.');

  // Menjaga proses tetap aktif agar browser TIDAK menutup sendiri
  await new Promise(() => {});
}

openLiveBrowserTour().catch((err) => {
  console.error('Error saat menjalankan live browser:', err);
});
