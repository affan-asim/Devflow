import { test, expect } from '@playwright/test';

test.describe('Companies Public Page & Details', () => {
  test('COMP-01: Companies listing page loads heading and search controls', async ({ page }) => {
    await page.goto('/companies');

    await expect(page.getByRole('heading', { name: /Meet the companies behind the work/i })).toBeVisible();

    const searchInput = page.getByPlaceholder('Search companies...');
    await expect(searchInput).toBeVisible();

    const searchButton = page.getByRole('button', { name: 'Search' });
    await expect(searchButton).toBeVisible();
  });

  test('COMP-02: Company search and industry filter trigger request', async ({ page }) => {
    let requestedUrl = '';
    await page.route('**/api/company*', async (route) => {
      requestedUrl = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            comapanies: [
              {
                id: 'comp-101',
                name: 'Vercel Ecosystem',
                industry: 'TECHNOLOGY',
                country: 'United States',
                isVerified: true,
                jobs: [],
              },
            ],
            metadata: { totalCount: 1, totalPages: 1, page: 1 },
          },
        }),
      });
    });

    await page.goto('/companies');

    const searchInput = page.getByPlaceholder('Search companies...');
    await searchInput.fill('Vercel');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect.poll(() => requestedUrl).toContain('search=Vercel');
    await expect(page.getByRole('heading', { name: 'Vercel Ecosystem' })).toBeVisible();
  });

  test('COMP-03: Company card navigates to company detail page', async ({ page }) => {
    await page.route('**/api/company*', async (route) => {
      if (route.request().url().includes('/api/company/comp-xyz')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'comp-xyz',
              name: 'Stripe Global',
              description: 'Financial infrastructure for the internet.',
              industry: 'FINANCE',
              country: 'United States',
              isVerified: true,
              jobs: [],
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              comapanies: [
                {
                  id: 'comp-xyz',
                  name: 'Stripe Global',
                  industry: 'FINANCE',
                  country: 'United States',
                  isVerified: true,
                  jobs: [],
                },
              ],
              metadata: { totalCount: 1, totalPages: 1, page: 1 },
            },
          }),
        });
      }
    });

    await page.goto('/companies');
    const compLink = page.getByRole('link', { name: /Stripe Global/i });
    await expect(compLink).toBeVisible();
    await compLink.click();

    await expect(page).toHaveURL(/\/companies\/comp-xyz/);
    await expect(page.getByRole('heading', { name: 'Stripe Global' })).toBeVisible();
  });

  test('COMP-04: Empty state displays when no companies match', async ({ page }) => {
    await page.route('**/api/company*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            comapanies: [],
            metadata: { totalCount: 0, totalPages: 0, page: 1 },
          },
        }),
      });
    });

    await page.goto('/companies');

    await expect(page.getByText('No companies found.')).toBeVisible();
    await expect(page.getByText('Try adjusting your search or removing some filters.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();
  });

  test('COMP-05: Nonexistent company ID displays company unavailable screen', async ({ page }) => {
    await page.route('**/api/company/unknown-id-888', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Company not found' }),
      });
    });

    await page.goto('/companies/unknown-id-888');

    await expect(page.getByText('Company unavailable')).toBeVisible();
    await expect(page.getByRole('heading', { name: "This company couldn't be loaded." })).toBeVisible();

    const backLink = page.getByRole('link', { name: 'Back to companies' });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/companies/);
  });
});
