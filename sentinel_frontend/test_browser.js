const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
  page.on('requestfailed', request =>
    console.error(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`)
  );
  page.on('response', response =>
    console.log(`RESPONSE: ${response.status()} ${response.url()}`)
  );

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log("BODY TEXT:\n", text);

  await browser.close();
})();
