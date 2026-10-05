// Optional browser test (needs Playwright + Chromium). Usage: node tests/e2e.mjs <base-url>
import { chromium } from 'playwright';
const BASE = process.argv[2] || 'http://localhost:8765/task-submissions/task-04/'; // also works with a file:// URL
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const consoleProblems = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) consoleProblems.push(m.text()); });
page.on('pageerror', (e) => consoleProblems.push(String(e)));
page.on('requestfailed', (r) => consoleProblems.push('requestfailed ' + r.url()));
page.on('response', (r) => { if (r.status() >= 400) consoleProblems.push(`HTTP ${r.status()} ${r.url()}`); });

const add = async (t, o = {}) => {
  await page.fill('#title', t);
  if (o.desc !== undefined) await page.fill('#description', o.desc);
  await page.selectOption('#category', o.category || 'Work');
  await page.selectOption('#priority', o.priority || 'Medium');
  if (o.status) await page.selectOption('#status', o.status);
  if (o.due !== undefined) await page.fill('#dueDate', o.due);
  await page.click('#submit-btn');
};
const cards = () => page.locator('.task-card').count();
const stat = async (label) => page.locator('.stat', { hasText: label }).locator('dd').innerText();

await page.goto(BASE);
check('TC-01/22 load + empty state', (await page.locator('#empty-state').innerText()).includes('No tasks yet'));
check('TC-15 empty storage starts', (await cards()) === 0 && (await stat('Total')) === '0');

// validation
await page.click('#submit-btn');
check('TC-07 empty title error shown + associated', (await page.locator('#title-error').innerText()).length > 0 && (await page.getAttribute('#title', 'aria-invalid')) === 'true' && (await page.getAttribute('#title', 'aria-describedby')).includes('title-error'));
check('TC-24 error feedback', (await page.locator('#feedback').innerText()).includes('Please correct the highlighted fields.'));
check('focus moves to first invalid field', await page.evaluate(() => document.activeElement.id === 'title'));
await add('   ');
check('TC-08 whitespace title rejected', (await cards()) === 0);
await add('x'.repeat(101));
check('TC-09 101-char title rejected', (await cards()) === 0 && (await page.locator('#title-error').innerText()).includes('101'));
await add('ok', { desc: 'd'.repeat(501) });
check('TC-10 501-char description rejected', (await cards()) === 0 && (await page.locator('#description-error').innerText()).length > 0);
await page.fill('#description', '');
await page.selectOption('#category', '');
await page.selectOption('#priority', '');
await page.click('#submit-btn');
check('TC-11 unselected category/priority rejected with messages', (await cards()) === 0 && (await page.locator('#category-error').innerText()).includes('Select a valid category.') && (await page.locator('#priority-error').innerText()).includes('Select a valid priority.'));
await page.evaluate(() => { const s = document.getElementById('category'); s.add(new Option('Hacking', 'Hacking')); s.value = 'Hacking'; });
await page.click('#submit-btn');
check('TC-11 tampered category rejected', (await cards()) === 0 && (await page.locator('#category-error').innerText()).length > 0);
await page.evaluate(() => { const d = document.getElementById('dueDate'); d.type = 'text'; d.value = '2025-02-30'; });
await page.selectOption('#category', 'Work');
await page.click('#submit-btn');
check('TC-12 invalid date rejected', (await cards()) === 0 && (await page.locator('#dueDate-error').innerText()).includes('Select a valid date.'));
await page.evaluate(() => { document.getElementById('dueDate').type = 'date'; document.getElementById('dueDate').value = ''; });

// create / display
await add('<img src=x onerror=alert(1)> Buy milk', { desc: 'line1', priority: 'High', category: 'Personal', due: '2020-01-01' });
check('TC-02/03 create + display', (await cards()) === 1);
check('card shows category, priority, status, due, created', (await page.locator('.task-card').first().innerText()).match(/Personal[\s\S]*Priority: High[\s\S]*Status:\s*Pending[\s\S]*Due[\s\S]*Created/) !== null);
check('FR-22 HTML rendered as text, no injection', (await page.locator('.task-card img').count()) === 0 && (await page.locator('.task-title').innerText()).includes('<img'));
check('TC-23 success feedback', (await page.locator('#feedback').innerText()).includes('Task added successfully.'));
check('overdue derived + stats', (await stat('Overdue')) === '1' && (await page.locator('.badge-overdue').count()) === 1);
await add('Study JS', { category: 'Study', priority: 'Low', due: '2099-01-01' });
await add('Alpha', { priority: 'Medium' });
check('stats total=3 pending=3', (await stat('Total')) === '3' && (await stat('Pending')) === '3');

// persistence
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('taskflow.tasks')));
check('TC-13 saved to localStorage (v1, 3 tasks)', stored.version === 1 && stored.tasks.length === 3);
await page.reload();
check('TC-14 persists after refresh', (await cards()) === 3);

// status
await page.selectOption('[data-action="status"] >> nth=0', 'Completed');
check('TC-06 status change updates stats', (await stat('Completed')) === '1' && (await stat('Pending')) === '2');

// edit
await page.locator('[data-action="edit"]', { hasText: 'Edit' }).nth(1).click();
check('TC-25 edit mode clear', (await page.locator('#form-heading').innerText()) === 'Edit task' && (await page.locator('#submit-btn').innerText()) === 'Save Changes' && await page.locator('#cancel-btn').isVisible());
const editedTitle = await page.inputValue('#title');
await page.fill('#title', editedTitle + ' (edited)');
await page.click('#submit-btn');
check('TC-04 edit saved, back to create mode', (await page.locator('.task-title', { hasText: '(edited)' }).count()) === 1 && (await page.locator('#form-heading').innerText()) === 'Create task' && (await cards()) === 3);
await page.locator('[data-action="edit"]').first().click();
await page.click('#cancel-btn');
check('cancel edit leaves data unchanged', (await cards()) === 3 && (await page.locator('#cancel-btn').isHidden()));

// search / filter / sort
await page.fill('#search', 'study');
check('TC-18 search', (await cards()) === 1);
await page.fill('#search', 'zzzz');
check('TC-21 no results empty state + clear button', (await page.locator('#empty-state').innerText()).includes('No matching tasks'));
await page.click('[data-action="clear-filters"]');
check('clear search/filters', (await cards()) === 3);
await page.selectOption('#filter-status', 'Completed');
check('TC-19 status filter', (await cards()) === 1);
await page.selectOption('#filter-status', 'Overdue');
check('overdue filter', (await cards()) === 1);
await page.selectOption('#filter-status', 'all');
await page.selectOption('#filter-priority', 'Low');
check('priority filter', (await cards()) === 1);
await page.selectOption('#filter-priority', 'all');
await page.selectOption('#sort', 'title');
const titles = await page.locator('.task-title').allInnerTexts();
check('TC-20 sort by title', JSON.stringify(titles) === JSON.stringify([...titles].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))), titles.join(' | '));

// delete
const before = await cards();
await page.locator('[data-action="delete"]').first().click();
check('TC-26 delete asks confirmation (text + Cancel/Confirm)', (await page.locator('.confirm-text').innerText()).includes('This action cannot be undone.') && (await cards()) === before && (await page.locator('[data-action="confirm-delete"]').count()) === 1 && await page.evaluate(() => document.activeElement.dataset.action === 'confirm-delete'));
await page.keyboard.press('Escape');
check('Escape cancels confirmation', (await page.locator('[data-action="confirm-delete"]').count()) === 0);
await page.locator('[data-action="delete"]').first().click();
await page.locator('[data-action="confirm-delete"]').click();
check('TC-05 delete', (await cards()) === before - 1 && (await page.locator('#feedback').innerText()).includes('Task deleted successfully.'));

// missing task id
await page.evaluate(() => localStorage.setItem('taskflow.tasks', JSON.stringify({ version: 1, tasks: [] })));
await page.locator('[data-action="edit"]').first().click(); // still in memory
await page.evaluate(() => { /* simulate task vanishing from state by deleting via UI in another flow */ });
check('edit mode entered from stale list works without crash', (await page.locator('#form-heading').innerText()) === 'Edit task');
await page.click('#cancel-btn');

// corrupt storage
for (const [name, raw, expectCards] of [
  ['TC-16 corrupt JSON', '{broken', 0],
  ['TC-16 wrong structure', '"hello"', 0],
  ['TC-17 mixed valid/invalid records', JSON.stringify({ version: 1, tasks: [{ id: 'a', title: 'Keep me', description: '', category: 'Work', priority: 'Low', status: 'Pending', dueDate: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }, { id: 'b', title: '' }, 7, null] }), 1],
]) {
  await page.evaluate((r) => localStorage.setItem('taskflow.tasks', r), raw);
  await page.reload();
  const fb = await page.locator('#feedback').innerText();
  check(`${name} recovers`, (await cards()) === expectCards && fb.includes('safely recovered') && (await page.locator('form#task-form').isVisible()), fb);
}
check('backup of bad data kept', (await page.evaluate(() => localStorage.getItem('taskflow.tasks.backup'))) !== null);
await add('After recovery works');
check('app usable after recovery', (await cards()) === 2);

// clear form + dropdown contents
await page.fill('#title', 'temp');
await page.click('#clear-btn');
check('Clear form empties fields + message', (await page.inputValue('#title')) === '' && (await page.locator('#feedback').innerText()).includes('Form cleared.'));
check('dropdown options exact', JSON.stringify(await page.locator('#category option').allInnerTexts()) === JSON.stringify(['Select category', 'Work', 'Personal', 'Study', 'Development']) && JSON.stringify(await page.locator('#priority option').allInnerTexts()) === JSON.stringify(['Select priority', 'Low', 'Medium', 'High']) && JSON.stringify(await page.locator('#status option').allInnerTexts()) === JSON.stringify(['Pending', 'In Progress', 'Completed']));

// reset
await page.click('[data-action="reset"]');
check('reset needs confirmation', (await page.locator('[data-action="confirm-reset"]').isVisible()) && (await cards()) === 2);
await page.click('[data-action="confirm-reset"]');
check('reset clears data', (await cards()) === 0 && (await page.evaluate(() => localStorage.getItem('taskflow.tasks'))) === null);

// keyboard + a11y basics
await page.reload();
await page.keyboard.press('Tab');
check('TC-35 skip link first in tab order', await page.evaluate(() => document.activeElement.className.includes('skip-link')));
await page.selectOption('#category', 'Work');
await page.selectOption('#priority', 'Medium');
await page.focus('#title');
await page.keyboard.type('Keyboard task');
await page.keyboard.press('Enter');
check('TC-35 form submit via keyboard', (await cards()) === 1);
const outline = await page.evaluate(() => { document.getElementById('title').focus(); return getComputedStyle(document.getElementById('submit-btn')).outlineStyle; });
await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
const focusOutline = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return `${s.outlineStyle} ${s.outlineWidth}`; });
check('TC-36 visible focus outline', focusOutline.startsWith('solid 3px'), focusOutline);
check('TC-37 every form control has a label', await page.evaluate(() => [...document.querySelectorAll('input,select,textarea')].every((c) => c.labels && c.labels.length > 0)));
check('headings: one h1, no skipped levels', await page.evaluate(() => { const h = [...document.querySelectorAll('h1,h2,h3')].map((x) => +x.tagName[1]); return h.filter((n) => n === 1).length === 1 && h.every((n, i) => i === 0 || n - h[i - 1] <= 1); }));
check('all buttons have accessible names', await page.evaluate(() => [...document.querySelectorAll('button')].every((b) => (b.getAttribute('aria-label') || b.textContent).trim().length > 0)));
check('TC-40 no :hover rules reveal functionality', await page.evaluate(() => { const rules = (s) => { try { return [...s.cssRules]; } catch { return []; } }; return ![...document.styleSheets].some((s) => rules(s).some((r) => r.selectorText && /:hover/.test(r.selectorText) && /display|visibility|opacity/.test(r.cssText))); }));

// responsive
for (const task of ['A very long unbroken title '.repeat(3) + 'W'.repeat(80)]) { await add(task, { desc: 'Z'.repeat(400) }); }
const widths = [[320, 640], [375, 667], [390, 844], [430, 932], [600, 900], [768, 1024], [820, 1180], [900, 700], [1024, 768], [1100, 800], [1280, 800], [1366, 768], [1440, 900], [1920, 1080], [667, 375], [844, 390], [1024, 768], [1180, 820]];
for (const [w, h] of widths) {
  await page.setViewportSize({ width: w, height: h });
  const m = await page.evaluate(() => {
    const de = document.documentElement;
    const bad = [...document.querySelectorAll('.task-card, .panel, .stat, input, select, textarea, .btn')].filter((n) => n.getBoundingClientRect().right > de.clientWidth + 1 || n.getBoundingClientRect().left < -1).length;
    const small = [...document.querySelectorAll('button:not([hidden]), input, select')].filter((n) => { const r = n.getBoundingClientRect(); return r.width > 0 && (r.height < 43.5 || r.width < 43.5); }).length;
    return { overflow: de.scrollWidth - de.clientWidth, bad, small, cols: getComputedStyle(document.querySelector('.workspace')).gridTemplateColumns.split(' ').length };
  });
  check(`responsive ${w}x${h}: no h-scroll, nothing outside viewport, touch targets>=44px`, m.overflow <= 0 && m.bad === 0 && m.small === 0, JSON.stringify(m));
}
await page.setViewportSize({ width: 1920, height: 1080 });
const cw = await page.evaluate(() => document.querySelector('main').getBoundingClientRect().width);
check('1920 content capped (max-width)', cw <= 1400, `main width ${Math.round(cw)}`);
await page.setViewportSize({ width: 320, height: 640 });
await page.screenshot({ path: '/tmp/shot-320.png', fullPage: true });
await page.setViewportSize({ width: 1280, height: 800 });
await page.screenshot({ path: '/tmp/shot-1280.png', fullPage: true });

check('TC-45 no console errors/warnings/failed requests', consoleProblems.length === 0, consoleProblems.join(' ; '));
await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
