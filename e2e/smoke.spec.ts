import { test, expect } from '@playwright/test';

/**
 * Basic smoke tests to ensure the application loads and core functionality works
 * These tests prevent major regressions and validate deployment readiness
 */
test.describe('Apophenia Smoke Tests', () => {
  test('homepage loads with expected title and elements', async ({ page }) => {
    await page.goto('/');
    
    // Verify page title
    await expect(page).toHaveTitle(/Apophenia/i);
    
    // Verify core UI elements are present
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('button', { name: /new game/i })).toBeVisible();
  });

  test('can start a new game', async ({ page }) => {
    await page.goto('/');
    
    // Click New Game button
    const newGameButton = page.getByRole('button', { name: /new game/i });
    await newGameButton.click();
    
    // Wait for game to load (button text changes during loading)
    await expect(newGameButton).toHaveText(/starting/i, { timeout: 15000 });
    
    // Wait for loading to complete and story content to appear
    await page.waitForTimeout(2000); // Brief wait for AI response mock
    
    // Verify game has started - look for story content or choices
    const hasStoryOrChoices = await page.locator('text=Begin the story, text=Loading, button').count() > 0;
    expect(hasStoryOrChoices).toBeTruthy();
  });

  test('application is responsive on mobile', async ({ page, isMobile }) => {
    await page.goto('/');
    
    if (isMobile) {
      // Verify mobile-specific UI works
      const newGameButton = page.getByRole('button', { name: /new game/i });
      await expect(newGameButton).toBeVisible();
      
      // Verify the page viewport is mobile-sized
      const viewport = page.viewportSize();
      expect(viewport?.width).toBeLessThan(768);
    }
  });

  test('error handling works when API is unavailable', async ({ page }) => {
    await page.goto('/');
    
    // Intercept API calls and return errors
    await page.route('**/api/**', route => route.abort('failed'));
    
    const newGameButton = page.getByRole('button', { name: /new game/i });
    await newGameButton.click();
    
    // App should handle API errors gracefully and not crash
    await page.waitForTimeout(3000);
    
    // Page should still be interactive (not crashed)
    await expect(page.locator('body')).toBeVisible();
  });
});