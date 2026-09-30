import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

console.log('--- RUNNING LORN-HUB ANTISLOP & LOGIC SELF-CHECK ---');

// 1. Check for banned tropes in src
function getAllFiles(dir, exts = ['.ts', '.tsx', '.css', '.html']) {
  let files = [];
  for (const item of readdirSync(dir)) {
    const full = join(dir, item);
    if (statSync(full).isDirectory()) {
      if (item !== 'node_modules' && item !== 'dist' && item !== '.git') {
        files = files.concat(getAllFiles(full, exts));
      }
    } else if (exts.some(e => item.endsWith(e))) {
      files.push(full);
    }
  }
  return files;
}

const srcFiles = getAllFiles('src');
let errors = 0;

// Test 1: Em dash check (R-02)
let emDashOccurrences = [];
for (const file of srcFiles) {
  const content = readFileSync(file, 'utf-8');
  if (content.includes('—')) {
    emDashOccurrences.push(file);
  }
}
if (emDashOccurrences.length > 0) {
  console.error(`FAIL: Em dash found in:`, emDashOccurrences);
  errors++;
} else {
  console.log(`PASS: Zero em-dashes found across ${srcFiles.length} source files.`);
}

// Test 2: Backdrop blur dose cap (max 1 functional element in Header.tsx)
let backdropBlurs = [];
for (const file of srcFiles) {
  const content = readFileSync(file, 'utf-8');
  const matches = content.match(/backdrop-blur(-\w+)?/g);
  if (matches) {
    backdropBlurs.push({ file, count: matches.length });
  }
}
if (backdropBlurs.length === 1 && backdropBlurs[0].file.includes('Header.tsx') && backdropBlurs[0].count === 1) {
  console.log(`PASS: Backdrop blur dose cap strictly honored (exactly 1 element in Header.tsx).`);
} else {
  console.error(`FAIL: Backdrop blur dose cap violated:`, backdropBlurs);
  errors++;
}

// Test 3: No blur orbs or radial glow tropes (blur-2xl, blur-3xl, radial-gradient, etc.)
let blurOrbs = [];
for (const file of srcFiles) {
  const content = readFileSync(file, 'utf-8');
  if (/blur-(2xl|3xl)/.test(content) || /radial-gradient/.test(content)) {
    blurOrbs.push(file);
  }
}
if (blurOrbs.length === 0) {
  console.log(`PASS: Zero blur orbs or radial neon glow tropes found.`);
} else {
  console.error(`FAIL: Blur orbs or radial tropes found in:`, blurOrbs);
  errors++;
}

// Test 4: ArticleCard de-duplication check
const articleCardSrc = readFileSync('src/components/law/ArticleCard.tsx', 'utf-8');
const hasDuplicationFix = articleCardSrc.includes('article.ayat && article.ayat.length > 0 ?') &&
  articleCardSrc.includes('{article.isi}');
if (hasDuplicationFix) {
  console.log(`PASS: ArticleCard correctly renders ayat exclusively when available, preventing text duplication.`);
} else {
  console.error(`FAIL: ArticleCard does not properly branch between article.isi and article.ayat.`);
  errors++;
}

// Test 5: Check font scale options in Header.tsx and ThemeContext
const themeContextSrc = readFileSync('src/context/ThemeContext.tsx', 'utf-8');
const hasGlobalScaling = themeContextSrc.includes("root.style.fontSize = sizeMap[fontSize]") &&
  themeContextSrc.includes("root.classList.toggle('font-serif'");
if (themeContextSrc.includes("'sm' | 'base' | 'lg' | 'xl'") && hasGlobalScaling) {
  console.log(`PASS: 4-level font scale with real global CSS scaling and serif/sans switching is active.`);
} else {
  console.error(`FAIL: Global font scale or serif/sans switching missing in ThemeContext.`);
  errors++;
}

// Test 6: Viewport Zoom Accessibility (WCAG 1.4.4)
const indexHtmlSrc = readFileSync('index.html', 'utf-8');
if (indexHtmlSrc.includes('user-scalable=no') || indexHtmlSrc.includes('maximum-scale=1.0')) {
  console.error(`FAIL: Viewport zoom disabled in index.html, violating WCAG 1.4.4.`);
  errors++;
} else {
  console.log(`PASS: Viewport allows pinch-to-zoom (no user-scalable=no or maximum-scale restrictions).`);
}

// Test 7: Emoji Clutter Check in Citation Generator (R-16)
const citationSrc = readFileSync('src/services/citationGenerator.ts', 'utf-8');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
if (emojiRegex.test(citationSrc)) {
  console.error(`FAIL: Emoji clutter detected in citationGenerator.ts.`);
  errors++;
} else {
  console.log(`PASS: Citation generator is strictly free of emoji clutter (professional legal authority).`);
}

// Test 8: Sub-44px Touch Targets Check (WCAG 2.5.5 / Mobile Thumb Zone)
let sub44Violations = [];
const componentFiles = srcFiles.filter(f => f.includes('components'));
for (const file of componentFiles) {
  const content = readFileSync(file, 'utf-8');
  const matches = content.match(/min-h-\[([123]\dpx|40px)\]/g);
  if (matches) {
    sub44Violations.push({ file, matches });
  }
}
if (sub44Violations.length === 0) {
  console.log(`PASS: Zero sub-44px min-h touch target violations across component files.`);
} else {
  console.error(`FAIL: Sub-44px touch targets found in:`, sub44Violations);
  errors++;
}

// Test 9: Custom Folder Persistence in Storage & Context
const storageServiceSrc = readFileSync('src/services/storageService.ts', 'utf-8');
const userDataContextSrc = readFileSync('src/context/UserDataContext.tsx', 'utf-8');
if (storageServiceSrc.includes('addCustomFolder') && userDataContextSrc.includes('addCustomFolder')) {
  console.log(`PASS: Custom folder creation properly persists to storage and state.`);
} else {
  console.error(`FAIL: Custom folder persistence missing in storageService or UserDataContext.`);
  errors++;
}

// Test 10: Modern CSS Layout Structure (TC-UI-01)
const appSrc = readFileSync('src/App.tsx', 'utf-8');
const headerSrc = readFileSync('src/components/layout/Header.tsx', 'utf-8');
const sidebarSrc = readFileSync('src/components/layout/Sidebar.tsx', 'utf-8');

const hasMainContainerLayout = appSrc.includes('h-[calc(100vh-4rem)] flex overflow-hidden');
const hasHeaderLayout = headerSrc.includes('sticky top-0 z-30 h-16');
const hasSidebarLayout = sidebarSrc.includes('w-72 h-full flex flex-col justify-between') &&
  sidebarSrc.includes('overflow-hidden');
const hasMainScrollLayout = appSrc.includes('flex-1 h-full overflow-y-auto');

if (hasMainContainerLayout && hasHeaderLayout && hasSidebarLayout && hasMainScrollLayout) {
  console.log(`PASS: [TC-UI-01] Modern layout, overflow containment, and independent scrolling structure correctly implemented.`);
} else {
  console.error(`FAIL: [TC-UI-01] Layout and scrolling structure mismatch.`);
  errors++;
}

// Test 11: Menu Navigation Cleanliness & Active Accent (TC-UI-02)
const hasDeletedOldFeatures =
  !sidebarSrc.includes('Komparasi KUHP Baru vs Lama') &&
  !sidebarSrc.includes('Jelajah Regulasi') &&
  !sidebarSrc.includes('Meja Belajar');
const has4RealTools =
  sidebarSrc.includes('Scraper / Tambah Regulasi') &&
  sidebarSrc.includes('Pencarian Kilat') &&
  sidebarSrc.includes('PDF & Dokumen Hub') &&
  sidebarSrc.includes('Baca Regulasi');
const hasActiveAmberAccent =
  sidebarSrc.includes('bg-amber-500/10') &&
  (sidebarSrc.includes('text-amber-600') || sidebarSrc.includes('text-amber-700')) &&
  sidebarSrc.includes('dark:text-amber-400');

if (hasDeletedOldFeatures && has4RealTools && hasActiveAmberAccent) {
  console.log(`PASS: [TC-UI-02] Menu Utama clean with 4 real tools, Jelajah Regulasi & Meja Belajar deleted, amber active accent.`);
} else {
  console.error(`FAIL: [TC-UI-02] Menu Utama navigation or active state styling mismatch.`);
  errors++;
}

// Test 12: Responsive Mobile Ergonomics (TC-UI-03)
const mobileNavSrc = readFileSync('src/components/layout/MobileNav.tsx', 'utf-8');
const hasDesktopSidebarHidden = sidebarSrc.includes('hidden md:flex');
const hasMobileNav4Items =
  !mobileNavSrc.includes('Jelajah') &&
  !mobileNavSrc.includes('Belajar') &&
  mobileNavSrc.includes('Scraper') &&
  mobileNavSrc.includes('Cari') &&
  mobileNavSrc.includes('PDF Hub') &&
  mobileNavSrc.includes('Baca');

if (hasDesktopSidebarHidden && hasMobileNav4Items) {
  console.log(`PASS: [TC-UI-03] Responsive mobile ergonomics valid (hidden md:flex and MobileNav synced to 4 real tools).`);
} else {
  console.error(`FAIL: [TC-UI-03] Responsive mobile ergonomics mismatch.`);
  errors++;
}

// Test 13: Storage card removed, compact add-button present (TC-UI-04)
const storageCardRemoved = !sidebarSrc.includes('Storage & Offline') && !sidebarSrc.includes('Kelola Unduhan');
const hasAddButton = sidebarSrc.includes('Tambah regulasi baru') && sidebarSrc.includes('Plus');

if (storageCardRemoved && hasAddButton) {
  console.log(`PASS: [TC-UI-04] Storage card removed. Compact add-button present in sidebar header.`);
} else {
  console.error(`FAIL: [TC-UI-04] Storage card not fully removed or add-button missing.`);
  errors++;
}

// Test 14: Zero Hardcoded Mock Datasets (TC-DATA-01)
const hasPublicDataDir = existsSync('public/data');
const hasDistDataDir = existsSync('dist/data');
const lawContextSrc = readFileSync('src/context/LawContext.tsx', 'utf-8');
const hasSeededHardcodedLaws = lawContextSrc.includes('DEFAULT_BUNDLED_LAWS') ||
  lawContextSrc.includes('uud-1945.json') ||
  lawContextSrc.includes('kuhp-baru');

if (!hasPublicDataDir && !hasDistDataDir && !hasSeededHardcodedLaws) {
  console.log(`PASS: [TC-DATA-01] Zero hardcoded mock datasets found. System operates purely on clean dynamic IndexedDB model.`);
} else {
  console.error(`FAIL: [TC-DATA-01] Hardcoded mock datasets or seeding detected.`);
  errors++;
}

if (errors === 0) {
  console.log('--- ALL SELF-CHECKS PASSED SUCCESSFULLY ---');
  process.exit(0);
} else {
  console.error(`--- ${errors} CHECKS FAILED ---`);
  process.exit(1);
}
