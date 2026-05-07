import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';

test('Preview page renders and is accessible', async ({ page }) => {
  await page.goto('/preview/home');
  
  // Smoke tests
  await expect(page.locator('h1')).toContainText('Welcome to Page Studio');
  await expect(page.locator('text=Ready to dive in?')).toBeVisible();

  // CTA Interaction
  const cta = page.locator('a', { hasText: 'Get Started' });
  await expect(cta).toHaveAttribute('href', '/signup');

  // Accessibility (axe)
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  
  fs.writeFileSync('a11y-report.json', JSON.stringify(accessibilityScanResults, null, 2));

  // Critical violations should fail CI
  expect(accessibilityScanResults.violations).toEqual([]);
});
