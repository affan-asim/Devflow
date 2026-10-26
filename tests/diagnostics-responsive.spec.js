import { test, expect } from '@playwright/test';

test.describe('Responsive & Layout Diagnostics', () => {
  const publicRoutes = ['/', '/jobs', '/companies', '/developers', '/recruiters'];

  for (const route of publicRoutes) {
    test(`DIAG: No console errors or unhandled exceptions on ${route}`, async ({ page }) => {
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('pageerror', (exception) => {
        consoleErrors.push(exception.message);
      });

      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      // Assert no runtime JS errors occurred during initialization
      expect(consoleErrors).toEqual([]);
    });

    test(`RESP: No horizontal viewport overflow on mobile for ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(isOverflowing).toBe(false);
    });
  }
});
