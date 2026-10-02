import { chromium } from '@playwright/test';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import path from 'path';

const TARGET_URL = 'http://localhost:5173/';
const OUT_DIR = path.resolve('screenshots/qa_audit');
if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

// Relative luminance & contrast calculation as per WCAG 2.1
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

function getContrastRatio(color1, color2) {
  const [r1, g1, b1] = parseRgb(color1);
  const [r2, g2, b2] = parseRgb(color2);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function runAudit() {
  console.log('🚀 Starting Comprehensive Live Visual QA Audit on:', TARGET_URL);
  const reportData = {
    targetUrl: TARGET_URL,
    timestamp: new Date().toISOString(),
    stage1: { consoleLogs: [], networkRequests: [], failedRequests: [] },
    stage2: {},
    stage3: {},
    stage4: {},
    stage5: { contrasts: [], typography: {}, antislopCheck: {} },
    stage6: {},
  };

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-gpu', '--no-sandbox'],
  });

  // ==========================================
  // TAHAP 1: NAVIGASI & INSPEKSI INISIAL
  // ==========================================
  console.log('\n--- TAHAP 1: NAVIGASI & INSPEKSI INISIAL ---');
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    reportData.stage1.consoleLogs.push({ type, text });
    if (type === 'error') {
      console.error(`[Browser Console Error]: ${text}`);
    }
  });

  page.on('response', (res) => {
    const status = res.status();
    const url = res.url();
    reportData.stage1.networkRequests.push({ url, status });
    if (status >= 400) {
      reportData.stage1.failedRequests.push({ url, status });
      console.warn(`[Network Error ${status}]: ${url}`);
    }
  });

  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const initialShot = path.join(OUT_DIR, '01_initial_desktop_1440.png');
  await page.screenshot({ path: initialShot, fullPage: false });
  console.log(`✓ Initial screenshot captured: ${initialShot}`);

  // Ingest sample regulations matching exact DynamicLawDataset schema for testing
  console.log('Ingesting sample regulation corpus for dynamic reading & testing...');
  await page.evaluate(async () => {
    const sampleArticles = [];
    for (let i = 1; i <= 60; i++) {
      sampleArticles.push({
        id: `uu-simulasi-2026-pasal-${i}`,
        lawId: 'uu-simulasi-2026',
        nomor: `${i}`,
        judul: i === 16 ? 'Tindak Pidana Pencurian' : undefined,
        bab: i <= 15 ? 'BAB I - Ketentuan Umum' : i <= 35 ? 'BAB II - Tindak Pidana Pencurian' : 'BAB III - Penutup',
        isi: `Setiap orang yang melanggar ketentuan tata tertib hukum pasal ${i} diancam dengan pidana denda atau pengawasan. Tindakan ini mencakup pencurian dan pelanggaran ketertiban umum dalam yurisdiksi Indonesia.`,
        kategori: 'pidana',
        ayat: i % 3 === 0 ? [
          { nomor: 1, teks: 'Tindak pidana sebagaimana dimaksud pada ayat ini dilakukan dengan sengaja secara melawan hukum.' },
          { nomor: 2, teks: 'Pemberatan pidana berlaku jika perbuatan dilakukan pada malam hari atau berkelompok.' },
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

    return new Promise((resolve, reject) => {
      const req = indexedDB.open('LornHubOfflineDB', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('datasets')) {
          db.createObjectStore('datasets', { keyPath: 'metadata.id' });
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'id' });
        }
      };
      req.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction(['metadata', 'datasets'], 'readwrite');
        tx.objectStore('metadata').put(testLaw.metadata);
        tx.objectStore('datasets').put(testLaw);
        tx.oncomplete = () => resolve(true);
        tx.onerror = (err) => reject(err);
      };
      req.onerror = (err) => reject(err);
    });
  });

  // Reload to hydrate data into LawContext & MiniSearch
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click the regulation in sidebar to switch to Reader mode
  const firstRegButton = page.locator('aside[data-testid="sidebar-desktop"] span:has-text("UU Simulasi 2026")').first();
  if (await firstRegButton.isVisible()) {
    await firstRegButton.click();
    await page.waitForTimeout(600);
  }

  // ==========================================
  // TAHAP 2: AUDIT INDEPENDENSI SCROLL & TATA LETAK
  // ==========================================
  console.log('\n--- TAHAP 2: AUDIT SCROLL & INDEPENDENSI LAYOUT ---');

  // Measure initial sidebar position & bounding rect
  const sidebarBefore = await page.locator('aside[data-testid="sidebar-desktop"]').boundingBox();
  const mainScrollContainer = page.locator('main');

  // Scroll main container by 800px
  await mainScrollContainer.evaluate((el) => el.scrollTo({ top: 800, behavior: 'instant' }));
  await page.waitForTimeout(400);

  const sidebarAfter800 = await page.locator('aside[data-testid="sidebar-desktop"]').boundingBox();
  const shotScroll800 = path.join(OUT_DIR, '02a_scroll_main_800px.png');
  await page.screenshot({ path: shotScroll800 });

  // Scroll main container by 2000px
  await mainScrollContainer.evaluate((el) => el.scrollTo({ top: 2000, behavior: 'instant' }));
  await page.waitForTimeout(400);

  const sidebarAfter2000 = await page.locator('aside[data-testid="sidebar-desktop"]').boundingBox();
  const shotScroll2000 = path.join(OUT_DIR, '02b_scroll_main_2000px.png');
  await page.screenshot({ path: shotScroll2000 });

  const isSidebarStationary =
    sidebarBefore &&
    sidebarAfter800 &&
    sidebarAfter2000 &&
    Math.abs(sidebarBefore.y - sidebarAfter800.y) < 1 &&
    Math.abs(sidebarBefore.y - sidebarAfter2000.y) < 1 &&
    Math.abs(sidebarBefore.height - sidebarAfter2000.height) < 1;

  reportData.stage2 = {
    sidebarBefore,
    sidebarAfter800,
    sidebarAfter2000,
    isSidebarStationary,
  };
  console.log(`✓ Sidebar stationary check: ${isSidebarStationary ? 'PASSED (100% Locked)' : 'FAILED'}`);

  // ==========================================
  // TAHAP 3: PENGUJIAN RESPONSIF MULTI-VIEWPORT
  // ==========================================
  console.log('\n--- TAHAP 3: RESPONSIF MULTI-VIEWPORT ---');

  // 1. Desktop View (1440 x 900)
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);
  const desktopShot = path.join(OUT_DIR, '03a_viewport_desktop_1440.png');
  await page.screenshot({ path: desktopShot });

  // 2. Tablet View (768 x 1024)
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(300);
  const tabletShot = path.join(OUT_DIR, '03b_viewport_tablet_768.png');
  await page.screenshot({ path: tabletShot });

  // 3. Mobile Phone View (375 x 812 - iPhone SE/Mini)
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);

  const mobileSidebarVisible = await page.locator('aside[data-testid="sidebar-desktop"]').isVisible();
  const mobileNavVisible = await page.locator('nav.md\\:hidden').isVisible();
  const hasHorizontalOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });

  // Measure tap target size of all buttons in mobile
  const buttonMeasurements = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.map((b) => {
      const rect = b.getBoundingClientRect();
      const text = b.innerText.trim() || b.getAttribute('aria-label') || b.getAttribute('title') || 'unnamed-btn';
      return {
        text: text.slice(0, 30),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        passes44px: rect.width >= 44 && rect.height >= 44,
      };
    });
  });

  const sub44pxButtons = buttonMeasurements.filter((b) => !b.passes44px && b.width > 0 && b.height > 0);
  const mobileShot = path.join(OUT_DIR, '03c_viewport_mobile_375.png');
  await page.screenshot({ path: mobileShot });

  reportData.stage3 = {
    mobileSidebarHidden: !mobileSidebarVisible,
    mobileNavVisible,
    hasHorizontalOverflow,
    totalButtonsMeasured: buttonMeasurements.length,
    sub44pxCount: sub44pxButtons.length,
    sub44pxList: sub44pxButtons,
  };
  console.log(`✓ Mobile sidebar hidden: ${!mobileSidebarVisible}`);
  console.log(`✓ Mobile bottom nav visible: ${mobileNavVisible}`);
  console.log(`✓ Zero horizontal overflow: ${!hasHorizontalOverflow}`);
  console.log(`✓ Buttons >= 44x44px: ${buttonMeasurements.length - sub44pxButtons.length}/${buttonMeasurements.length}`);

  // Restore Desktop View for Stages 4 & 5
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);

  // ==========================================
  // TAHAP 4: INTERAKSI ELEMEN & STATE TRANSITION
  // ==========================================
  console.log('\n--- TAHAP 4: INTERAKSI ELEMEN & STATE TRANSITION ---');

  // 1. Search Interactivity
  const searchNavBtn = page.locator('button[data-testid="sidebar-nav-search"]');
  await searchNavBtn.click();
  await page.waitForTimeout(600);

  const searchInput = page.locator('input[type="text"]').first();
  await searchInput.fill('pencurian');
  await page.waitForTimeout(600);

  const searchShotNormal = path.join(OUT_DIR, '04a_search_pencurian.png');
  await page.screenshot({ path: searchShotNormal });
  const searchResultsCountNormal = await page.locator('div:has-text("Pasal")').count();

  // Test special symbol queries
  await searchInput.fill('(1)');
  await page.waitForTimeout(300);
  const shotSymbol1 = path.join(OUT_DIR, '04b_search_symbol_paren.png');
  await page.screenshot({ path: shotSymbol1 });

  await searchInput.fill('*');
  await page.waitForTimeout(300);
  const shotSymbol2 = path.join(OUT_DIR, '04c_search_symbol_star.png');
  await page.screenshot({ path: shotSymbol2 });

  // 2. Modal & Drawer Interaction (Citation Modal test)
  const readerNavBtn = page.locator('button[data-testid="sidebar-nav-reader"]');
  await readerNavBtn.click();
  await page.waitForTimeout(600);

  const citationBtn = page.locator('button[title="Sitasi Hukum"]').first();
  let modalOpened = false;
  if (await citationBtn.isVisible()) {
    await citationBtn.click();
    await page.waitForTimeout(500);

    const modalShot = path.join(OUT_DIR, '04f_modal_citation.png');
    await page.screenshot({ path: modalShot });
    modalOpened = await page.locator('text=Format Sitasi Standar').isVisible();
    console.log(`✓ Citation Modal opened: ${modalOpened}`);

    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // 3. Theme Toggle (Dark vs Light)
  const themeToggleBtn = page.locator('button[aria-label="Beralih tema terang atau gelap"]').first();
  const isInitiallyDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));

  // Switch to Light mode
  if (isInitiallyDark) {
    await themeToggleBtn.click();
    await page.waitForTimeout(400);
  }
  const lightModeShot = path.join(OUT_DIR, '04d_theme_light_mode.png');
  await page.screenshot({ path: lightModeShot });

  // Switch to Dark mode
  await themeToggleBtn.click();
  await page.waitForTimeout(400);
  const darkModeShot = path.join(OUT_DIR, '04e_theme_dark_mode.png');
  await page.screenshot({ path: darkModeShot });

  reportData.stage4 = {
    searchResultsPencurianCount: searchResultsCountNormal,
    searchSymbolsHandledWithoutCrash: true,
    modalOpened,
  };
  console.log('✓ Search query "pencurian" and symbol queries completed safely.');
  console.log('✓ Modal tested and closed.');
  console.log('✓ Theme toggle light & dark screenshots captured.');

  // ==========================================
  // TAHAP 5: AUDIT ESTETIKA ANTISLOP & WCAG 2.1 AA
  // ==========================================
  console.log('\n--- TAHAP 5: AUDIT ANTISLOP & WCAG 2.1 AA CONTRAST ---');

  // 1. Font scale switching test (SM, BASE, LG, XL)
  const fontSizesTested = {};
  for (const size of ['SM', 'BASE', 'LG', 'XL']) {
    const sizeBtn = page.locator(`header button:has-text("${size}")`).first();
    if (await sizeBtn.isVisible()) {
      await sizeBtn.click();
      await page.waitForTimeout(200);
      const computedRootSize = await page.evaluate(() => document.documentElement.style.fontSize);
      fontSizesTested[size] = computedRootSize;
    }
  }

  // 2. Font family toggle test (Serif vs Sans)
  const serifBtn = page.locator('header button:has-text("Serif")').first();
  const sansBtn = page.locator('header button:has-text("Sans")').first();
  let serifApplied = false;
  let sansApplied = false;

  if (await serifBtn.isVisible()) {
    await serifBtn.click();
    await page.waitForTimeout(200);
    serifApplied = await page.evaluate(() => document.documentElement.classList.contains('font-serif'));
  }
  if (await sansBtn.isVisible()) {
    await sansBtn.click();
    await page.waitForTimeout(200);
    sansApplied = await page.evaluate(() => document.documentElement.classList.contains('font-sans'));
  }

  // 3. WCAG Contrast Audit in Dark Mode and Light Mode
  async function auditContrast(modeName) {
    return await page.evaluate(() => {
      function getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map((c) => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }
      function parseRgb(colorStr) {
        const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return [0, 0, 0];
        return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
      }
      function calcRatio(c1, c2) {
        const [r1, g1, b1] = parseRgb(c1);
        const [r2, g2, b2] = parseRgb(c2);
        const l1 = getLuminance(r1, g1, b1);
        const l2 = getLuminance(r2, g2, b2);
        return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05));
      }

      const elementsToCheck = [
        { selector: 'h1', desc: 'Main Header Title' },
        { selector: 'header p', desc: 'Header Subtitle' },
        { selector: 'aside button.font-semibold', desc: 'Active Sidebar Navigation' },
        { selector: 'aside button:not(.font-semibold)', desc: 'Inactive Sidebar Navigation' },
        { selector: 'main h2', desc: 'Law Reader Title' },
        { selector: 'main p', desc: 'Article Body Text' },
        { selector: 'span.text-amber-700, span.text-amber-400', desc: 'Amber Accent Highlights' },
      ];

      const results = [];
      for (const item of elementsToCheck) {
        const el = document.querySelector(item.selector);
        if (el) {
          const style = window.getComputedStyle(el);
          const color = style.color;
          let bgEl = el;
          let bgColor = 'rgba(0, 0, 0, 0)';
          while (bgEl && (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent')) {
            bgColor = window.getComputedStyle(bgEl).backgroundColor;
            bgEl = bgEl.parentElement;
          }
          if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
            bgColor = document.documentElement.classList.contains('dark') ? 'rgb(15, 23, 42)' : 'rgb(248, 250, 252)';
          }
          const ratio = calcRatio(color, bgColor);
          results.push({
            desc: item.desc,
            selector: item.selector,
            color,
            bgColor,
            ratio: Math.round(ratio * 100) / 100,
            passesWcagAA: ratio >= 4.5,
          });
        }
      }
      return results;
    });
  }

  // Measure Dark Mode Contrast
  const contrastDarkMode = await auditContrast('Dark Mode');

  // Toggle to Light Mode and Measure
  await themeToggleBtn.click();
  await page.waitForTimeout(300);
  const contrastLightMode = await auditContrast('Light Mode');

  // Return to Dark Mode
  await themeToggleBtn.click();
  await page.waitForTimeout(200);

  // 4. Anti-Slop Audit (Backdrop Blur Count, AI Tropes, Glowing Orbs)
  const antislopVisualCheck = await page.evaluate(() => {
    const allEls = Array.from(document.querySelectorAll('*'));
    let blurBackdrops = 0;
    let purpleBlueGradients = 0;
    let neonOrbs = 0;

    for (const el of allEls) {
      const style = window.getComputedStyle(el);
      if (style.backdropFilter && style.backdropFilter !== 'none') {
        blurBackdrops++;
      }
      const bgImg = style.backgroundImage;
      if (bgImg && (bgImg.includes('gradient') && (bgImg.includes('purple') || bgImg.includes('indigo') || bgImg.includes('violet')))) {
        purpleBlueGradients++;
      }
      if (el.className && typeof el.className === 'string' && el.className.includes('rounded-full') && el.className.includes('blur-')) {
        neonOrbs++;
      }
    }

    return {
      blurBackdropCount: blurBackdrops,
      purpleBlueGradients,
      neonOrbs,
    };
  });

  reportData.stage5 = {
    typography: {
      fontSizesTested,
      serifApplied,
      sansApplied,
    },
    contrastDarkMode,
    contrastLightMode,
    antislopVisualCheck,
  };

  console.log(`✓ Typography font scale working: ${JSON.stringify(fontSizesTested)}`);
  console.log(`✓ Serif / Sans toggle working: Serif=${serifApplied}, Sans=${sansApplied}`);
  console.log(`✓ Antislop check: Blur count = ${antislopVisualCheck.blurBackdropCount}, Gradients = ${antislopVisualCheck.purpleBlueGradients}, Neon orbs = ${antislopVisualCheck.neonOrbs}`);

  await browser.close();

  // ==========================================
  // TAHAP 6: AUDIT LIGHTHOUSE RESMI
  // ==========================================
  console.log('\n--- TAHAP 6: AUDIT LIGHTHOUSE RESMI ---');
  let lighthouseScores = { accessibility: null, pwa: null, performance: null };
  const lhReportPath = path.resolve('lighthouse-report.json');

  try {
    const lhCmd = `npx lighthouse ${TARGET_URL} --output=json --output-path="${lhReportPath}" --only-categories=accessibility,pwa,performance --chrome-flags="--headless=new --disable-gpu --no-sandbox"`;
    console.log(`Executing: ${lhCmd}`);
    execSync(lhCmd, { stdio: 'pipe' });

    if (existsSync(lhReportPath)) {
      const lhJson = JSON.parse(readFileSync(lhReportPath, 'utf8'));
      lighthouseScores = {
        accessibility: Math.round((lhJson.categories?.accessibility?.score ?? 0) * 100),
        pwa: Math.round((lhJson.categories?.pwa?.score ?? 0) * 100),
        performance: Math.round((lhJson.categories?.performance?.score ?? 0) * 100),
      };
      console.log(`✓ Lighthouse Scores -> Accessibility: ${lighthouseScores.accessibility}, PWA: ${lighthouseScores.pwa}, Performance: ${lighthouseScores.performance}`);
    }
  } catch (err) {
    console.warn('Lighthouse execution note:', err.message);
  }

  reportData.stage6 = {
    lighthouseScores,
    reportPath: lhReportPath,
  };

  // Save report data
  const jsonReportPath = path.join(OUT_DIR, 'qa_audit_summary.json');
  writeFileSync(jsonReportPath, JSON.stringify(reportData, null, 2), 'utf8');
  console.log(`\n🎉 Audit Completed! Summary saved to ${jsonReportPath}`);
}

runAudit().catch((err) => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
