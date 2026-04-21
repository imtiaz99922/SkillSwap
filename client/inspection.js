const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: 'new'});
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log('page loaded');
    await page.screenshot({path: 'page.png', fullPage: true});
    console.log('screenshot saved');
  } catch (e) {
    console.error('error navigating:', e);
  }
  await browser.close();
})();
