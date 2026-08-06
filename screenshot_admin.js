const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3001/admin/login');

  await page.fill('input[placeholder="Name"]', 'admin');
  await page.fill('input[placeholder="Password"]', 'admin12345');

  await page.click('button[type="submit"]');

  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'screenshot_admin_dashboard.png', fullPage: true });
  await browser.close();
})();
