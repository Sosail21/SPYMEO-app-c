// Cdw-Spm: Smoke Tests E2E SPYMEO
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Critical Paths', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SPYMEO/i);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('health check endpoint returns 200', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.checks.database).toBe('connected');
  });

  test('navigation menu works', async ({ page }) => {
    await page.goto('/');

    // Test navigation links
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check key links exist
    await expect(page.getByRole('link', { name: /praticiens/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /pass/i })).toBeVisible();
  });

  test('search functionality accessible', async ({ page }) => {
    await page.goto('/recherche');
    await expect(page.locator('h1')).toContainText(/recherche/i);

    // Check search form exists
    await expect(page.locator('input[type="search"], input[name="query"]')).toBeVisible();
  });

  test('practitioner listing page loads', async ({ page }) => {
    await page.goto('/praticiens');
    await expect(page.locator('h1')).toContainText(/praticiens/i);
  });

  test('login page accessible', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('404 page for non-existent route', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-xyz');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Pro Dashboard Access', () => {
  test('pro dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/pro/dashboard');
    // Should redirect to login
    await page.waitForURL(/auth\/login/);
    expect(page.url()).toContain('/auth/login');
  });
});
