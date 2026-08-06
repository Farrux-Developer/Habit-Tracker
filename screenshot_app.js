const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3001/auth/register');

  await page.fill('input[type="text"]', 'testuser');
  await page.fill('input[type="email"]', 'test@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(2000);
  await page.goto('http://localhost:3001');
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'screenshot_app.png', fullPage: true });
  await browser.close();
})();
