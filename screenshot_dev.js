const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3002/');

  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'screenshot_dev.png', fullPage: true });
  await browser.close();
})();
