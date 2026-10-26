import { test, expect } from '@playwright/test';

test.describe('Developers Public Page & Profiles', () => {
  test('DEV-01: Developers directory loads heading, search bar, sort select, and filters toggle', async ({ page }) => {
    await page.goto('/developers');

    await expect(page.getByRole('heading', { name: /Developers building the modern web/i })).toBeVisible();

    const searchInput = page.getByPlaceholder('Search developers...');
    await expect(searchInput).toBeVisible();

    // Sort select
    const sortSelect = page.getByLabel('Sort developers');
    await expect(sortSelect).toBeVisible();

    // Filters toggle button
    const filtersBtn = page.getByRole('button', { name: /Filters/i });
    await expect(filtersBtn).toBeVisible();
  });

  test('DEV-02: Expanding filters form displays granular criteria', async ({ page }) => {
    await page.goto('/developers');

    const filtersBtn = page.getByRole('button', { name: /Filters/i });
    await filtersBtn.click();

    await expect(page.getByLabel('Location preference')).toBeVisible();
    await expect(page.getByLabel('Minimum experience (years)')).toBeVisible();
    await expect(page.getByLabel('Maximum experience (years)')).toBeVisible();
    await expect(page.getByLabel('Skills')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Apply filters' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear all' })).toBeVisible();
  });

  test('DEV-03: Developer card navigates to developer profile detail page', async ({ page }) => {
    await page.route('**/api/profile/developer*', async (route) => {
      const url = route.request().url();
      if (url.includes('/api/profile/developer/user-alpha-123')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              userId: 'user-alpha-123',
              user: { name: 'Alice Developer', isVerified: true, createdAt: '2025-01-01T00:00:00.000Z' },
              bio: 'Full-stack software architect specializing in distributed cloud services.',
              yearsOfExp: 6,
              locationPreference: 'REMOTE',
              skills: [{ name: 'React' }, { name: 'Next.js' }, { name: 'PostgreSQL' }],
              employmentHistory: [],
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'dev-1',
                userId: 'user-alpha-123',
                user: { name: 'Alice Developer', isVerified: true },
                bio: 'Full-stack software architect.',
                yearsOfExp: 6,
                locationPreference: 'REMOTE',
                skills: [{ name: 'React' }, { name: 'Next.js' }],
              },
            ],
            metadata: { totalCount: 1, totalPages: 1, page: 1 },
          }),
        });
      }
    });

    await page.goto('/developers');

    const viewProfileLink = page.getByRole('link', { name: /View profile/i });
    await expect(viewProfileLink).toBeVisible();
    await viewProfileLink.click();

    await expect(page).toHaveURL(/\/developers\/user-alpha-123/);
    await expect(page.getByRole('heading', { name: 'Alice Developer' })).toBeVisible();
  });

  test('DEV-04: Empty state renders when no developers match filters', async ({ page }) => {
    await page.route('**/api/profile/developer*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          metadata: { totalCount: 0, totalPages: 0, page: 1 },
        }),
      });
    });

    await page.goto('/developers');

    await expect(page.getByRole('heading', { name: 'No matching developers' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();
  });

  test('DEV-05: Nonexistent developer profile displays error fallback', async ({ page }) => {
    await page.route('**/api/profile/developer/nonexistent-dev', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Developer profile not found' }),
      });
    });

    await page.goto('/developers/nonexistent-dev');

    await expect(page.getByRole('heading', { name: 'We couldn’t find this developer.' })).toBeVisible();
    const exploreBtn = page.getByRole('link', { name: /Explore developers/i });
    await expect(exploreBtn).toBeVisible();
    await exploreBtn.click();
    await expect(page).toHaveURL(/\/developers/);
  });
});
