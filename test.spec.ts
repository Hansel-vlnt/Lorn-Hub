import { test, expect } from '@playwright/test';
import path from 'path';

test('upload pdf', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // click "PDF Hub" tab in the nav
  await page.click('button:has-text("PDF")');

  // wait for the upload input
  const fileInput = page.locator('input[type="file"]');
  
  // upload the pdf
  await fileInput.setInputFiles('./dummy.pdf');
  
  // Wait a bit for processing
  await page.waitForTimeout(2000);
  
  // The document should appear in the sidebar
  await expect(page.locator('text=dummy.pdf').first()).toBeVisible();

  // Test search
  await page.fill('input[placeholder="Cari di PDF..."]', 'World');
  await page.keyboard.press('Enter');

  await page.waitForTimeout(1000);
  const results = await page.locator('text=Hasil').textContent();
  console.log('Search Results:', results);
});
