// Visual-refinement check: every status / priority / category shows an SVG icon + visible text; no strikethrough.
import { chromium } from 'playwright';
const URL_ = process.argv[2] || 'http://localhost:8765/task-submissions/task-04/';
const C = ['Work', 'Personal', 'Study', 'Development'], P = ['Low', 'Medium', 'High'], S = ['Pending', 'In Progress', 'Completed'];
let failed = 0; const ck = (n, ok, d = '') => { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${d ? ' -> ' + d : ''}`); };
const b = await chromium.launch(); const errs = [];
const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto(URL_);
for (let i = 0; i < 12; i++) {
  await p.fill('#title', `Task ${i} ${C[i % 4]} ${P[i % 3]} ${S[i % 3]}`);
  await p.selectOption('#category', C[i % 4]); await p.selectOption('#priority', P[i % 3]); await p.selectOption('#status', S[i % 3]);
  await p.click('#submit-btn');
}
const rows = await p.evaluate(() => [...document.querySelectorAll('.task-card')].map((c) => ({
  title: c.querySelector('.task-title').textContent,
  deco: getComputedStyle(c.querySelector('.task-title')).textDecorationLine,
  cat: c.querySelector('.badge-category').innerText.trim(), catSvg: c.querySelectorAll('.badge-category svg').length,
  pri: c.querySelector('.badge-priority').innerText.trim(), priSvg: c.querySelectorAll('.badge-priority svg').length,
  sta: c.querySelector('.badge-status').innerText.trim(), staSvg: c.querySelectorAll('.badge-status svg').length,
  hidden: [...c.querySelectorAll('svg')].every((s) => s.getAttribute('aria-hidden') === 'true' && s.getAttribute('focusable') === 'false'),
  shapes: [c.querySelector('.badge-category svg').innerHTML, c.querySelector('.badge-priority svg').innerHTML, c.querySelector('.badge-status svg').innerHTML],
})));
ck('12 cards rendered', rows.length === 12);
ck('no strikethrough/text-decoration on any title (incl. Completed)', rows.every((r) => r.deco === 'none') && rows.some((r) => r.sta.includes('Completed')));
ck('every badge has exactly 1 SVG icon', rows.every((r) => r.catSvg === 1 && r.priSvg === 1 && r.staSvg === 1));
ck('all icons aria-hidden + not focusable', rows.every((r) => r.hidden));
ck('status text visible (Pending / In Progress / Completed)', S.every((s) => rows.some((r) => r.sta.endsWith(s))));
ck('priority text visible (Priority: Low/Medium/High)', P.every((s) => rows.some((r) => r.pri === `Priority: ${s}`)));
ck('category text visible', C.every((s) => rows.some((r) => r.cat.endsWith(s))));
const uniq = (idx) => new Set(rows.map((r) => r.shapes[idx])).size;
ck('icon shapes differ per value (4 categories, 3 priorities, 3 statuses)', uniq(0) === 4 && uniq(1) === 3 && uniq(2) === 3, `${uniq(0)}/${uniq(1)}/${uniq(2)}`);
ck('select option values unchanged, no emoji/icons in options', await p.evaluate(() => [...document.querySelectorAll('#category option,#priority option,#status option,#filter-status option,#filter-category option,#filter-priority option')].every((o) => /^[A-Za-z ]*$/.test(o.value) && /^[A-Za-z ]*$/.test(o.textContent))));
ck('badges not clipped (no h-scroll)', await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
ck('no console errors', errs.length === 0, errs.join(';'));
await p.locator('.task-card').nth(2).scrollIntoViewIfNeeded();
await p.screenshot({ path: '/tmp/icons-390.png' });
await p.setViewportSize({ width: 1280, height: 900 });
await p.screenshot({ path: '/tmp/icons-1280.png' });
await b.close(); console.log(failed ? `${failed} FAILED` : 'ICON CHECKS PASSED'); process.exit(failed ? 1 : 0);
