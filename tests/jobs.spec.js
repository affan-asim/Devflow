import { test, expect } from '@playwright/test';

test.describe('Jobs Public Page & Details', () => {
  test('JOB-01: Jobs listing page loads with heading, search input, and filters', async ({ page }) => {
    await page.goto('/jobs');

    await expect(page.getByRole('heading', { name: /Find work that fits how you build/i })).toBeVisible();

    const searchInput = page.getByPlaceholder('Search roles, skills or companies...');
    await expect(searchInput).toBeVisible();

    const searchButton = page.getByRole('button', { name: 'Search jobs' });
    await expect(searchButton).toBeVisible();

    // Verify filter dropdowns
    const locationSelect = page.locator('select').first();
    await expect(locationSelect).toBeVisible();
  });

  test('JOB-02: Job search and filter interaction triggers request with query', async ({ page }) => {
    let requestedUrl = '';
    await page.route('**/api/jobs*', async (route) => {
      requestedUrl = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            jobs: [
              {
                id: 'job-123',
                title: 'Senior Frontend Engineer',
                companyName: 'Acme Corp',
                status: 'ACTIVE',
                locationPreference: 'REMOTE',
                skills: [{ name: 'React' }, { name: 'TypeScript' }],
              },
            ],
            metadata: { totalCount: 1, totalPages: 1, page: 1, hasNextPage: false, hasPreviousPage: false },
          },
        }),
      });
    });

    await page.goto('/jobs');

    const searchInput = page.getByPlaceholder('Search roles, skills or companies...');
    await searchInput.fill('Frontend');
    await page.getByRole('button', { name: 'Search jobs' }).click();

    await expect.poll(() => requestedUrl).toContain('search=Frontend');
    await expect(page.getByRole('heading', { name: 'Senior Frontend Engineer' })).toBeVisible();
  });

  test('JOB-03: Clicking a job card navigates to the job detail page', async ({ page }) => {
    await page.route('**/api/jobs*', async (route) => {
      if (route.request().url().includes('/api/jobs/job-test-456')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'job-test-456',
              title: 'Staff Platform Engineer',
              companyName: 'Linear Labs',
              description: 'We are seeking a Staff Platform Engineer to design reliable systems.',
              locationPreference: 'REMOTE',
              employmentType: 'FULL_TIME',
              experienceLevel: 'SENIOR',
              skills: [{ name: 'Kubernetes' }, { name: 'Go' }],
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
              jobs: [
                {
                  id: 'job-test-456',
                  title: 'Staff Platform Engineer',
                  companyName: 'Linear Labs',
                  status: 'ACTIVE',
                  locationPreference: 'REMOTE',
                  skills: [{ name: 'Kubernetes' }, { name: 'Go' }],
                },
              ],
              metadata: { totalCount: 1, totalPages: 1, page: 1 },
            },
          }),
        });
      }
    });

    await page.goto('/jobs');
    const jobLink = page.getByRole('link', { name: /Staff Platform Engineer/i });
    await expect(jobLink).toBeVisible();
    await jobLink.click();

    await expect(page).toHaveURL(/\/jobs\/job-test-456/);
    await expect(page.getByRole('heading', { name: 'Staff Platform Engineer' })).toBeVisible();
  });

  test('JOB-04: Empty results state displays when no jobs match', async ({ page }) => {
    await page.route('**/api/jobs*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            jobs: [],
            metadata: { totalCount: 0, totalPages: 0, page: 1 },
          },
        }),
      });
    });

    await page.goto('/jobs');

    await expect(page.getByText('No opportunities found.')).toBeVisible();
    await expect(page.getByText('Try adjusting your search or removing some filters.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear filters' })).toBeVisible();
  });

  test('JOB-05: API error state renders error message and retry action', async ({ page }) => {
    await page.route('**/api/jobs*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Database service unavailable' }),
      });
    });

    await page.goto('/jobs');

    await expect(page.getByText('Unable to load jobs')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });

  test('JOB-06: Nonexistent or invalid job ID displays job unavailable screen', async ({ page }) => {
    await page.route('**/api/jobs/invalid-job-999', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Job not found' }),
      });
    });

    await page.goto('/jobs/invalid-job-999');

    await expect(page.getByText('Job unavailable')).toBeVisible();
    await expect(page.getByRole('heading', { name: "This opportunity couldn't be loaded." })).toBeVisible();

    const backLink = page.getByRole('link', { name: 'Back to jobs' });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/jobs/);
  });
});
