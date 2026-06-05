import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';
import { createServer } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outputDir = join(root, 'verification-screenshots');
const reportPath = join(outputDir, 'visual-report.json');

const pages = [
  { name: 'home', path: '/' },
  { name: 'home-menu-open', path: '/', openMobileMenu: true },
  { name: 'login', path: '/login' },
  { name: 'register', path: '/register' },
  { name: 'standings', path: '/competition/standings' },
  { name: 'rankings', path: '/competition/rankings' },
  { name: 'fixtures', path: '/competition/fixtures' },
  { name: 'club-rankings', path: '/competition/club-rankings' },
  { name: 'player-profile', path: '/player/player_jason' },
  { name: 'live-hub', path: '/live' }
];

const profiles = [
  {
    name: 'desktop',
    options: {
      viewport: { width: 1366, height: 900 },
      deviceScaleFactor: 1
    }
  },
  {
    name: 'tablet',
    options: {
      viewport: { width: 768, height: 1024 },
      deviceScaleFactor: 1,
      hasTouch: true
    }
  },
  {
    name: 'iphone',
    options: devices['iPhone 13']
  },
  {
    name: 'android',
    options: devices['Pixel 5']
  }
];

mkdirSync(outputDir, { recursive: true });

const server = await createServer({
  root,
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false
  },
  logLevel: 'error'
});

await server.listen();

const urls = server.resolvedUrls?.local ?? ['http://127.0.0.1:5173/'];
const baseUrl = urls[0].replace(/\/$/, '');

const browser = await chromium.launch({ headless: true });
const report = {
  createdAt: new Date().toISOString(),
  baseUrl,
  profiles: []
};

try {
  for (const profile of profiles) {
    const context = await browser.newContext(profile.options);
    const page = await context.newPage();
    const consoleMessages = [];
    const profileReport = {
      name: profile.name,
      viewport: profile.options.viewport ?? profile.options.defaultBrowserType,
      pages: []
    };

    page.on('console', (message) => {
      if (['error', 'warning'].includes(message.type())) {
        consoleMessages.push({
          type: message.type(),
          text: message.text()
        });
      }
    });

    page.on('pageerror', (error) => {
      consoleMessages.push({
        type: 'pageerror',
        text: error.message
      });
    });

    for (const appPage of pages) {
      const url = `${baseUrl}${appPage.path}`;
      const screenshotPath = join(outputDir, `${profile.name}-${appPage.name}.png`);

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(750);

      if (appPage.openMobileMenu) {
        const menuButton = page.locator('.mobile-menu-btn');

        if (!(await menuButton.isVisible().catch(() => false))) {
          continue;
        }

        await menuButton.click();
        await page.waitForTimeout(500);
      }

      await page.screenshot({
        path: screenshotPath,
        fullPage: !appPage.openMobileMenu
      });

      const metrics = await page.evaluate(() => {
        const allowedScrollContainers = [
          '.table-wrap',
          '.standings-table-wrap',
          '.rankings-table-wrap',
          '.club-table-scroll',
          '.fixture-player-table-wrap'
        ];
        const intentionallyOffscreen = [
          '.mobile-sidebar'
        ];
        const viewportWidth = document.documentElement.clientWidth;
        const documentWidth = Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth
        );

        const overflowingElements = Array.from(document.querySelectorAll('body *'))
          .filter((element) => {
            if (allowedScrollContainers.some((selector) => element.closest(selector))) {
              return false;
            }

            if (intentionallyOffscreen.some((selector) => element.closest(selector))) {
              return false;
            }

            const rect = element.getBoundingClientRect();
            return rect.left < -1 || rect.right > viewportWidth + 1;
          })
          .slice(0, 12)
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              tag: element.tagName.toLowerCase(),
              className:
                typeof element.className === 'string'
                  ? element.className
                  : '',
              text: (element.textContent || '').trim().slice(0, 80),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            };
          });

        return {
          viewportWidth,
          documentWidth,
          hasPageOverflow: documentWidth > viewportWidth + 1,
          overflowingElements
        };
      });

      const pageMessages = consoleMessages.splice(0);

      profileReport.pages.push({
        name: appPage.name,
        path: appPage.path,
        screenshot: screenshotPath,
        metrics,
        consoleMessages: pageMessages
      });

      const issueCount =
        Number(metrics.hasPageOverflow) +
        metrics.overflowingElements.length +
        pageMessages.filter((message) => message.type === 'error').length;

      console.log(
        `Captured ${profile.name} ${appPage.name}` +
          (issueCount ? ` (${issueCount} signal${issueCount === 1 ? '' : 's'})` : '')
      );
    }

    await context.close();
    report.profiles.push(profileReport);
  }
} finally {
  await browser.close();
  await server.close();
}

writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

const overflowSignals = report.profiles.flatMap((profile) =>
  profile.pages
    .filter((appPage) => appPage.metrics.hasPageOverflow)
    .map((appPage) => `${profile.name}/${appPage.name}`)
);

console.log(`Screenshots saved to ${outputDir}`);
console.log(`Report saved to ${reportPath}`);

if (overflowSignals.length) {
  console.log(`Review possible page overflow: ${overflowSignals.join(', ')}`);
}
