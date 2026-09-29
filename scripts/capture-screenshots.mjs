import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { mkdirSync } from 'fs';

async function capture() {
  mkdirSync('screenshots', { recursive: true });

  const server = await createServer({
    server: { port: 5173 },
  });
  await server.listen();
  const address = server.httpServer.address();
  const port = address.port;
  console.log(`Vite server running at http://localhost:${port}`);

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop Dark
    const contextDark = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    });
    const pageDark = await contextDark.newPage();
    await pageDark.goto(`http://localhost:${port}`);
    await pageDark.waitForTimeout(1000);
    // Home page on load: Catalog view
    await pageDark.screenshot({ path: 'screenshots/home_desktop.png', fullPage: false });
    await pageDark.screenshot({ path: 'screenshots/home_desktop_full.png', fullPage: true });

    // Open Reader via primary CTA button
    const openReaderBtnDark = pageDark.locator('button:has-text("Buka Naskah Lengkap")').first();
    if (await openReaderBtnDark.isVisible()) {
      await openReaderBtnDark.click();
      await pageDark.waitForTimeout(800);
      await pageDark.screenshot({ path: 'screenshots/home_desktop_reader.png', fullPage: false });
      await pageDark.screenshot({ path: 'screenshots/home_desktop_reader_full.png', fullPage: true });

      // Click Kembali ke Katalog to verify breadcrumb navigation
      const backBtn = pageDark.locator('button:has-text("Kembali ke Katalog")');
      if (await backBtn.isVisible()) {
        await backBtn.click();
        await pageDark.waitForTimeout(600);
      }
    }

    // 2. Desktop Light
    const contextLight = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    });
    const pageLight = await contextLight.newPage();
    await pageLight.addInitScript(() => {
      localStorage.setItem('lorn_hub_theme', 'light');
    });
    await pageLight.goto(`http://localhost:${port}`);
    await pageLight.waitForTimeout(1000);
    await pageLight.screenshot({ path: 'screenshots/home_desktop_light.png', fullPage: false });
    await pageLight.screenshot({ path: 'screenshots/home_desktop_light_full.png', fullPage: true });

    const openReaderBtnLight = pageLight.locator('button:has-text("Buka Naskah Lengkap")').first();
    if (await openReaderBtnLight.isVisible()) {
      await openReaderBtnLight.click();
      await pageLight.waitForTimeout(800);
      await pageLight.screenshot({ path: 'screenshots/home_desktop_reader_light.png', fullPage: false });
      await pageLight.screenshot({ path: 'screenshots/home_desktop_reader_light_full.png', fullPage: true });
    }

    // 3. Mobile Dark
    const contextMobile = await browser.newContext({
      viewport: { width: 360, height: 780 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const pageMobile = await contextMobile.newPage();
    await pageMobile.goto(`http://localhost:${port}`);
    await pageMobile.waitForTimeout(1000);
    // Home page on load for mobile: Catalog view
    await pageMobile.screenshot({ path: 'screenshots/home_mobile.png', fullPage: false });
    await pageMobile.screenshot({ path: 'screenshots/home_mobile_full.png', fullPage: true });

    // Open Reader on mobile
    const openReaderBtnMobile = pageMobile.locator('button:has-text("Buka Naskah Lengkap")').first();
    if (await openReaderBtnMobile.isVisible()) {
      await openReaderBtnMobile.click();
      await pageMobile.waitForTimeout(800);
      await pageMobile.screenshot({ path: 'screenshots/home_mobile_reader.png', fullPage: false });
      await pageMobile.screenshot({ path: 'screenshots/home_mobile_reader_full.png', fullPage: true });
    }

    await contextDark.close();
    await contextLight.close();
    await contextMobile.close();
    console.log('All screenshots captured successfully.');
  } finally {
    await browser.close();
    await server.close();
  }
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
