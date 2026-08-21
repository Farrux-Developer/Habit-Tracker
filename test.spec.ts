import { test, expect } from '@playwright/test';
test('check errors in browser console', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') {
       console.log("Console error message:", msg.text());
       errors.push(msg.text());
    }
  });

  await page.route('**/auth/v1/session', route => route.fulfill({
    status: 200,
    body: JSON.stringify({
      access_token: 'fake',
      user: { id: 'test-user', email: 'test@example.com' }
    })
  }));

  await page.addInitScript(() => {
    window.localStorage.setItem('supabase.auth.token', JSON.stringify({
      currentSession: {
        access_token: 'fake',
        user: { id: 'test-user', email: 'test@example.com' }
      }
    }));
  });

  await page.goto('http://localhost:3000');

  // Wait for the dashboard to render
  await page.waitForTimeout(4000);

  console.log("Errors captured:", errors);
  // Filtering out network errors
  const reactErrors = errors.filter(e => !e.includes('net::'));
  expect(reactErrors.length).toBe(0);
});
