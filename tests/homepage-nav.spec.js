import { test, expect } from '@playwright/test';

test.describe('Homepage & Navigation', () => {
  test('HP-01: Homepage loads and renders main sections', async ({ page }) => {
    await page.goto('/');

    // Check main hero heading
    const heroHeading = page.getByRole('heading', { name: /The people behind the software/i });
    await expect(heroHeading).toBeVisible();

    // Verify presence of main landing sections
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByText('The developer network', { exact: false }).first()).toBeVisible();
    await expect(page.getByText(/DevFlow connects developers/i).first()).toBeVisible();
  });

  test('HP-02: Hero action buttons navigate to target public pages', async ({ page }) => {
    await page.goto('/');

    // Hero "Explore opportunities" in Hero section -> /jobs
    const heroSection = page.locator('section').first();
    const exploreJobsBtn = heroSection.getByRole('link', { name: /Explore opportunities/i });
    await expect(exploreJobsBtn).toBeVisible();
    await exploreJobsBtn.click();
    await expect(page).toHaveURL(/\/jobs/);

    // Return and click "Meet developers" in Hero section -> /developers
    await page.goto('/');
    const meetDevsBtn = page.locator('section').first().getByRole('link', { name: /Meet developers/i });
    await expect(meetDevsBtn).toBeVisible();
    await meetDevsBtn.click();
    await expect(page).toHaveURL(/\/developers/);
  });

  test('NAV-01: Desktop navigation links lead to correct public pages', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Target the main header's desktop nav
    const header = page.locator('header').first();
    const nav = header.locator('nav.hidden.md\\:flex');
    await expect(nav).toBeVisible();

    // Verify Desktop links
    await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    await expect(nav.getByRole('link', { name: 'Find work' })).toHaveAttribute('href', '/jobs');
    await expect(nav.getByRole('link', { name: 'Developers' })).toHaveAttribute('href', '/developers');
    await expect(nav.getByRole('link', { name: 'Companies' })).toHaveAttribute('href', '/companies');
    await expect(nav.getByRole('link', { name: 'For teams' })).toHaveAttribute('href', '/recruiters');

    // Click through one of the links to verify navigation
    await nav.getByRole('link', { name: 'Companies' }).click();
    await expect(page).toHaveURL(/\/companies/);
  });

  test('NAV-02: Unauthenticated visitors see Sign in and Join DevFlow links', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const header = page.locator('header').first();
    const signInLink = header.getByRole('link', { name: /Sign in/i });
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveAttribute('href', '/login');

    const joinLink = header.getByRole('link', { name: /Join DevFlow/i });
    await expect(joinLink).toBeVisible();
    await expect(joinLink).toHaveAttribute('href', '/register');
  });

  test('NAV-03: Mobile menu drawer toggles and presents navigation links', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const header = page.locator('header').first();

    // Desktop nav in header should be hidden
    await expect(header.locator('nav.hidden.md\\:flex')).not.toBeVisible();

    // Hamburger toggle button
    const toggleButton = header.getByRole('button', { name: 'Toggle navigation' });
    await expect(toggleButton).toBeVisible();

    await toggleButton.click();

    // Mobile nav drawer links inside header
    const mobileDrawer = header.locator('div.border-t.md\\:hidden');
    await expect(mobileDrawer).toBeVisible();
    await expect(mobileDrawer.getByRole('link', { name: 'Find work' })).toHaveAttribute('href', '/jobs');
    await expect(mobileDrawer.getByRole('link', { name: 'Developers' })).toHaveAttribute('href', '/developers');
    await expect(mobileDrawer.getByRole('link', { name: 'Companies' })).toHaveAttribute('href', '/companies');
    await expect(mobileDrawer.getByRole('link', { name: 'For teams' })).toHaveAttribute('href', '/recruiters');

    // Clicking a link closes and navigates
    await mobileDrawer.getByRole('link', { name: 'Find work' }).click();
    await expect(page).toHaveURL(/\/jobs/);
  });
});
