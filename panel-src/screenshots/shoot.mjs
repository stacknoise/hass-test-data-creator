// Renders the screenshots of the panel with the demo data of fixtures.mjs.
//   npm run screenshots                   English images into ../docs/images (for the README)
//   SHOT_LANG=de npm run screenshots      German images into ./out-de (for the homepage)
//   SHOT_THEME=dark ...                   dark theme
//   CHROMIUM_PATH=/path/to/chrome ...     use this browser instead of Edge
// The built panel is served to the page by Playwright itself; no server is started.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const LANG = process.env.SHOT_LANG === 'de' ? 'de' : 'en';
const THEME = process.env.SHOT_THEME === 'dark' ? 'dark' : 'light';
const OUT = LANG === 'de' ? path.join(here, 'out-de') : path.join(here, '..', '..', 'docs', 'images');
const BUNDLE = path.join(
  here,
  '..',
  '..',
  'custom_components',
  'hass_test_data_creator',
  'frontend',
  'hass-test-data-creator-panel.js',
);
const FILES = {
  '/harness.html': [path.join(here, 'harness.html'), 'text/html'],
  '/fixtures.mjs': [path.join(here, 'fixtures.mjs'), 'text/javascript'],
  '/panel.js': [BUNDLE, 'text/javascript'],
};
const WIDTH = 1100;

/** The texts of the buttons that the shots click, in both languages. */
const TEXT = {
  en: { show: 'Show what will be removed', curve: 'Change curve', next: 'Next 24 hours' },
  de: { show: 'Anzeigen, was entfernt wird', curve: 'Kurve ändern', next: 'Nächste 24 Stunden' },
}[LANG];

/** What the filled form of a new schedule shows. */
const NEW_SCHEDULE_NAME = LANG === 'de' ? 'Ausfall in der Küche' : 'Kitchen dropout';
const KITCHEN_PLUG = LANG === 'de' ? 'Steckdose Küche' : 'Kitchen plug';

/** The tabs in the order of the navigation. */
const TAB = { devices: 1, schedules: 2, scenarios: 3, groups: 4, history: 5, remove: 6 };

/** Open the harness page with the panel and wait until it shows its data. */
async function open(browser, height) {
  const context = await browser.newContext({
    viewport: { width: WIDTH, height },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
    locale: LANG,
    timezoneId: 'Europe/Vienna',
  });
  await context.route('http://tdc.test/**', (route) => {
    const url = new URL(route.request().url());
    const file = FILES[url.pathname];
    if (!file) return route.fulfill({ status: 404, body: 'not found' });
    return route.fulfill({ body: fs.readFileSync(file[0]), contentType: file[1] });
  });
  const page = await context.newPage();
  await page.goto(`http://tdc.test/harness.html?lang=${LANG}&theme=${THEME}`);
  await page.waitForFunction('window.__ready === true');
  await page.locator('tdc-device-list tr.device').first().waitFor();
  return page;
}

/** Click the tab with the given number. */
async function tab(page, name) {
  await page.locator(`nav button:nth-child(${TAB[name]})`).click();
  await page.waitForTimeout(400);
}

/** Save a screenshot of the whole panel, as high as it is. */
async function panelShot(page, file) {
  await page.waitForTimeout(300);
  await page.locator('hass-test-data-creator-panel').screenshot({ path: path.join(OUT, `${file}.png`) });
  console.log('wrote', file);
}

/** Save a screenshot of the visible window, for the popups. */
async function windowShot(page, file) {
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, `${file}.png`) });
  console.log('wrote', file);
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : 'msedge',
  executablePath: process.env.CHROMIUM_PATH,
  args: process.env.CHROMIUM_PATH ? ['--no-sandbox'] : [],
});
try {
  // the device list, and the details of one device with the curve editor
  let page = await open(browser, 700);
  await panelShot(page, 'devices');
  await page.close();
  page = await open(browser, 1400);
  // the kitchen plug: used by a schedule and a scenario, the curve of its voltage open
  await page.locator('tdc-device-list tr.device').nth(1).click();
  await page.locator('tdc-device-detail details summary').first().click();
  await page.getByRole('button', { name: TEXT.curve }).nth(2).click();
  await page.waitForTimeout(500);
  const box = await page.locator('tdc-device-detail').boundingBox();
  await page.screenshot({
    path: path.join(OUT, 'device-details.png'),
    fullPage: true,
    clip: { x: 0, y: 0, width: WIDTH, height: Math.ceil(box.y + box.height) },
  });
  console.log('wrote device-details');
  await page.close();

  // the popup to create devices
  page = await open(browser, 820);
  await page.locator('tdc-device-list > p button.primary, tdc-device-list button.primary').first().click();
  await windowShot(page, 'create-devices');
  await page.close();

  // the create popup with a custom device that started from a template, and the manager of own templates
  page = await open(browser, 1000);
  await page.locator('tdc-device-list button.primary').first().click();
  await page.locator('tdc-creation-wizard select').first().selectOption('custom');
  await page.locator('tdc-entities-form select').first().selectOption({ index: 3 });
  await windowShot(page, 'create-custom-device');
  await page.close();
  page = await open(browser, 620);
  await page.locator('tdc-device-list button.primary').nth(1).click();
  await windowShot(page, 'own-templates');
  await page.close();

  // the schedules with the next 24 hours open, and the popup of a new schedule
  page = await open(browser, 900);
  await tab(page, 'schedules');
  await page.locator('tdc-schedule-panel details summary').first().click();
  await panelShot(page, 'schedules');
  await page.locator('tdc-schedule-panel button.primary').first().click();
  // a filled form: one plug and a fault, which shows the optional entity select
  const form = page.locator('tdc-schedule-form#new');
  await form.locator('input').first().fill(NEW_SCHEDULE_NAME);
  await form.locator('select').nth(2).selectOption('device');
  await form.locator('tdc-multi-select button.trigger').click();
  await form.locator('tdc-multi-select label.option', { hasText: KITCHEN_PLUG }).click();
  await page.locator('tdc-dialog h3, tdc-dialog h2').first().click(); // closes the list; Escape would close the popup
  await form.locator('tdc-work-picker select').last().selectOption('fault_dropout');
  await form.locator('input').nth(1).fill('20:15');
  await page.locator('tdc-dialog h3, tdc-dialog h2').first().click(); // takes the focus off the field
  await windowShot(page, 'schedule-new');
  await page.close();

  // the scenarios, the first one open
  page = await open(browser, 900);
  await tab(page, 'scenarios');
  await page.locator('tdc-scenario-panel tr.scenario').first().click();
  await panelShot(page, 'scenarios');
  await page.close();

  // the MQTT groups
  page = await open(browser, 500);
  await tab(page, 'groups');
  await panelShot(page, 'groups');
  await page.close();

  // the history
  page = await open(browser, 560);
  await tab(page, 'history');
  await panelShot(page, 'history');
  await page.close();

  // the removal with what it would delete
  page = await open(browser, 700);
  await tab(page, 'remove');
  await page.getByRole('button', { name: TEXT.show }).click();
  await page.waitForTimeout(500);
  await panelShot(page, 'removal');
  await page.close();
} finally {
  await browser.close();
}
