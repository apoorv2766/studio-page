import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';

test('Preview page renders and is accessible', async ({ page }) => {
  await page.goto('/preview/home');
  
  // Smoke tests
  // Check that the Hero heading exists (the text may have been changed in the studio)
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('section').locator('a').first()).toBeVisible();

  // CTA Interaction
  const cta = page.locator('section').locator('a').first();
  await expect(cta).toHaveAttribute('href', '/signup');

  // Accessibility (axe)
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  
  fs.writeFileSync('a11y-report.json', JSON.stringify(accessibilityScanResults, null, 2));

  // Critical violations should fail CI
  expect(accessibilityScanResults.violations).toEqual([]);
});
