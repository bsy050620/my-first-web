import { test, expect, Page } from '@playwright/test';

// Test configuration
const testEmail = process.env.TEST_EMAIL || 'test@example.com';
const testPassword = process.env.TEST_PASSWORD || 'Test@1234';
const testTitle = `테스트 제목 ${Date.now()}`;
const testContent = '테스트 콘텐츠입니다. 이것은 충분히 긴 테스트 내용입니다.';

// Helper: Wait for login success via UI element
async function waitForLoginSuccess(page: Page) {
  // Wait for either posts page heading or check URL is not /login
  await Promise.all([
    page.waitForURL(/\/posts|\/$/, { timeout: 10000 }),
    page.getByRole('heading', { level: 1, name: /블로그|게시글/i }).waitFor({ timeout: 10000 }),
  ]).catch(() => {
    // Fallback: just ensure we're not on login page
  });
  
  // Verify we're not on login page
  const url = page.url();
  if (url.includes('/login')) {
    const errorMsg = await page.locator('[role="alert"]').first().textContent().catch(() => null);
    throw new Error(`Login failed - still on login page. Error: ${errorMsg || 'None'}`);
  }
}

test.describe('Auth & CRUD E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app root to verify it's running
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test.describe('Happy Path: Login → Create Post → View in List', () => {
    test('should complete full workflow: login, create post, and verify in list', async ({
      page,
    }) => {
      // 1. Navigate to login page
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1, name: /로그인/i })).toBeVisible({ timeout: 5000 });

      // 2. Fill login form
      await page.locator('#email').fill(testEmail);
      await page.locator('#password').fill(testPassword);

      // 3. Click login button and wait for navigation
      const loginButton = page.getByRole('button', { name: /로그인/i });
      await expect(loginButton).toBeEnabled({ timeout: 5000 });
      
      // Use Promise.all to synchronize navigation with button click
      await Promise.all([
        page.waitForNavigation({ url: /\/posts|\/$/, waitUntil: 'domcontentloaded', timeout: 10000 }),
        loginButton.click(),
      ]);

      // 4. Verify successful login by checking UI element instead of URL
      await expect(page.getByRole('heading', { level: 1, name: /블로그/i })).toBeVisible({ timeout: 5000 });

      // 5. Navigate to new post page
      await page.goto('/posts/new', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1, name: /새 게시글 작성/i })).toBeVisible({ timeout: 5000 });

      // 6. Fill post form
      await page.locator('#title').fill(testTitle);
      await page.locator('#content').fill(testContent);

      // 7. Click save button and wait for navigation to posts list
      const saveButton = page.getByRole('button', { name: /저장/i });
      await expect(saveButton).toBeEnabled({ timeout: 5000 });
      
      await Promise.all([
        page.waitForNavigation({ url: /\/posts$/, waitUntil: 'domcontentloaded', timeout: 10000 }),
        saveButton.click(),
      ]);

      // 8. Verify the new post appears in the list
      // Use a more specific locator for better reliability
      const postItem = page.getByRole('link').filter({ hasText: testTitle });
      await expect(postItem).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Rejection Path: Unauthorized Access Redirect', () => {
    test('should redirect to login when accessing /posts/new without authentication', async ({
      page,
      context,
    }) => {
      // Create a new context to ensure no authentication cookies
      const newContext = await page.context().browser()?.newContext();
      if (!newContext) {
        throw new Error('Failed to create new browser context');
      }

      const newPage = await newContext.newPage();

      // 1. Try to access /posts/new without authentication
      await newPage.goto('/posts/new', { waitUntil: 'domcontentloaded' });

      // 2. Verify redirect to login page (check both URL and UI)
      await expect(newPage).toHaveURL('/login');
      await expect(newPage.getByRole('heading', { level: 1, name: /로그인/i })).toBeVisible({ timeout: 5000 });

      await newContext.close();
    });

    test('should redirect to login after logout when accessing protected routes', async ({
      page,
    }) => {
      // 1. Login first
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      await page.locator('#email').fill(testEmail);
      await page.locator('#password').fill(testPassword);
      
      const loginButton = page.getByRole('button', { name: /로그인/i });
      await expect(loginButton).toBeEnabled({ timeout: 5000 });
      
      await Promise.all([
        page.waitForNavigation({ url: /\/posts|\/$/, waitUntil: 'domcontentloaded', timeout: 10000 }),
        loginButton.click(),
      ]);

      // Verify login succeeded
      await expect(page.getByRole('heading', { level: 1, name: /블로그/i })).toBeVisible({ timeout: 5000 });

      // 2. Sign out
      const logoutButton = page.getByRole('button', { name: /로그아웃/i });
      await expect(logoutButton).toBeVisible({ timeout: 5000 });
      
      await Promise.all([
        page.waitForNavigation({ url: /\/login/, waitUntil: 'domcontentloaded', timeout: 10000 }),
        logoutButton.click(),
      ]);

      // 3. Try to access /posts/new after logout
      await page.goto('/posts/new', { waitUntil: 'domcontentloaded' });

      // 4. Verify redirect to login via both URL and UI
      await expect(page).toHaveURL('/login');
      await expect(page.getByRole('heading', { level: 1, name: /로그인/i })).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Additional Security Checks', () => {
    test('should prevent access to /posts/new without valid session', async ({ page }) => {
      // Clear all cookies to ensure no session
      await page.context().clearCookies();
      
      // Try to access protected route
      await page.goto('/posts/new', { waitUntil: 'domcontentloaded' });

      // Should be redirected to login
      await expect(page).toHaveURL('/login');
      await expect(page.getByRole('heading', { level: 1, name: /로그인/i })).toBeVisible({ timeout: 5000 });
    });

    test('should allow viewing posts list without authentication', async ({ page }) => {
      // Create new context to ensure no auth
      const newContext = await page.context().browser()?.newContext();
      if (!newContext) {
        throw new Error('Failed to create new browser context');
      }

      const newPage = await newContext.newPage();

      // Access posts list
      await newPage.goto('/posts', { waitUntil: 'domcontentloaded' });

      // Should be able to view posts list
      await expect(newPage).toHaveURL('/posts');
      await expect(newPage.getByRole('heading', { level: 1, name: /블로그/i })).toBeVisible({ timeout: 5000 });

      await newContext.close();
    });
  });
});
