import { test, expect } from '@playwright/test';

test.describe('Recruiters Public Directory & Profiles', () => {
  test('REC-01: Recruiter directory loads header, search field, and filters button', async ({ page }) => {
    await page.goto('/recruiters');

    await expect(page.getByRole('heading', { name: /Connecting teams with great opportunities/i })).toBeVisible();

    const searchInput = page.getByPlaceholder('Name, bio, company...');
    await expect(searchInput).toBeVisible();

    const filtersBtn = page.getByRole('button', { name: /Filters/i });
    await expect(filtersBtn).toBeVisible();
  });

  test('REC-02: Recruiter filters drawer toggles and exposes filter parameters', async ({ page }) => {
    await page.goto('/recruiters');

    const filtersBtn = page.getByRole('button', { name: /Filters/i });
    await filtersBtn.click();

    // Check filter form inputs
    const filterForm = page.locator('#recruiter-filters');
    await expect(filterForm).toBeVisible();

    await expect(filterForm.getByPlaceholder('e.g. Technical Recruiter')).toBeVisible();
    await expect(filterForm.getByRole('button', { name: 'Apply filters' })).toBeVisible();
    await expect(filterForm.getByRole('button', { name: 'Clear all filters' })).toBeVisible();
  });

  test('REC-03: Recruiter card navigates to recruiter detail profile', async ({ page }) => {
    await page.route('**/api/profile/recruiter/general*', async (route) => {
      const url = route.request().url();
      if (url.includes('/api/profile/recruiter/general/rec-profile-100')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'rec-profile-100',
              jobTitle: 'Senior Tech Recruiter',
              yearsOfExp: 5,
              locationPreference: 'REMOTE',
              user: { name: 'Sarah Recruiter', isVerified: true, createdAt: '2025-01-01' },
              company: { name: 'Acme Talent', isVerified: true },
              bio: 'Connecting exceptional engineers with world-class engineering teams.',
              recruiterHistory: [],
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
              profiles: [
                {
                  id: 'rec-profile-100',
                  jobTitle: 'Senior Tech Recruiter',
                  yearsOfExp: 5,
                  locationPreference: 'REMOTE',
                  user: { name: 'Sarah Recruiter', isVerified: true },
                  company: { name: 'Acme Talent' },
                  bio: 'Connecting exceptional engineers with world-class engineering teams.',
                },
              ],
              metadata: { totalCount: 1, totalPages: 1, page: 1 },
            },
          }),
        });
      }
    });

    await page.goto('/recruiters');

    const profileLink = page.getByRole('link', { name: /View profile/i }).first();
    await expect(profileLink).toBeVisible();
    await profileLink.click();

    await expect(page).toHaveURL(/\/recruiters\/rec-profile-100/);
    await expect(page.getByRole('heading', { name: 'Sarah Recruiter' })).toBeVisible();
  });

  test('REC-04: Empty state renders when no recruiters match criteria', async ({ page }) => {
    await page.route('**/api/profile/recruiter/general*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            profiles: [],
            metadata: { totalCount: 0, totalPages: 0, page: 1 },
          },
        }),
      });
    });

    await page.goto('/recruiters');

    await expect(page.getByRole('heading', { name: 'No recruiters found' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();
  });

  test('REC-05: Nonexistent recruiter profile displays unavailable fallback', async ({ page }) => {
    await page.route('**/api/profile/recruiter/general/nonexistent-recruiter', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Recruiter profile not found' }),
      });
    });

    await page.goto('/recruiters/nonexistent-recruiter');

    await expect(page.getByText('Profile not found.')).toBeVisible();
    const browseLink = page.getByRole('link', { name: 'Browse recruiters' });
    await expect(browseLink).toBeVisible();
    await browseLink.click();
    await expect(page).toHaveURL(/\/recruiters/);
  });
});
