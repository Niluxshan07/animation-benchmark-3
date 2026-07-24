// Runs a production build, serves it locally, then executes 10 independent
// Lighthouse runs to collect statistically meaningful performance data.
//
// Usage:  npm run audit
//
// Output: reports/<app>-run01-<ts>.html  ...  reports/<app>-run10-<ts>.html
//         reports/<app>-summary.json   (averages, std-dev, min, max)

import { build, preview } from 'vite';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reportsDir = path.resolve(__dirname, '../reports');

const NUM_RUNS = 10;
const PAUSE_MS = 2500; // cool-down between runs for stable CPU measurements

function catLabel(key) {
  return { performance: 'Perf', accessibility: 'A11y', 'best-practices': 'BP', seo: 'SEO' }[key] ?? key;
}

function hr(ch = '─', width = 64) {
  return ch.repeat(width);
}

async function run() {
  console.log(`\n[audit] Building "${pkg.name}" for production...`);
  await build({ logLevel: 'warn' });

  console.log('[audit] Starting local preview server...');
  const server = await preview({ preview: { open: false } });
  const url = server.resolvedUrls.local[0];
  console.log(`[audit] App live at ${url}`);

  console.log('[audit] Launching headless Chrome...');
  const chrome = await launch({
    chromeFlags: ['--headless=new', '--disable-gpu', '--no-sandbox'],
  });

  mkdirSync(reportsDir, { recursive: true });

  const allScores = [];

  for (let i = 1; i <= NUM_RUNS; i++) {
    console.log(`\n[audit] ── Run ${i}/${NUM_RUNS} ──────────────────────────────`);

    const result = await lighthouse(url, {
      port: chrome.port,
      output: 'html',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = `${pkg.name}-run${String(i).padStart(2, '0')}-${timestamp}.html`;
    const reportPath = path.join(reportsDir, reportFile);
    writeFileSync(reportPath, result.report);

    const runScores = {};
    for (const [key, cat] of Object.entries(result.lhr.categories)) {
      runScores[key] = Math.round(cat.score * 100);
    }
    allScores.push(runScores);

    const scoreStr = Object.entries(runScores)
      .map(([k, v]) => `${catLabel(k)}: ${String(v).padStart(3)}`)
      .join('  |  ');
    console.log(`  ${scoreStr}`);
    console.log(`  → ${reportFile}`);

    if (i < NUM_RUNS) {
      process.stdout.write(`  [Cooling down ${PAUSE_MS / 1000}s...]`);
      await new Promise((r) => setTimeout(r, PAUSE_MS));
      process.stdout.write(' ready\n');
    }
  }

  await chrome.kill();
  server.httpServer.close();

  // ── Summary ───────────────────────────────────────────────────────────────
  const cats = Object.keys(allScores[0]);
  const COL = 10;

  const tableHeader = `  Run  │ ${cats.map((c) => catLabel(c).padEnd(COL)).join(' │ ')}`;
  const divider = `──────┼─${cats.map(() => '─'.repeat(COL + 1)).join('┼─')}`;

  console.log(`\n[audit] ${hr('═')}`);
  console.log(`[audit]  ${pkg.name}  —  Lighthouse Summary  (${NUM_RUNS} independent runs)`);
  console.log(`[audit] ${hr('═')}`);
  console.log(`[audit] ${tableHeader}`);
  console.log(`[audit] ${divider}`);

  allScores.forEach((scores, idx) => {
    const cells = cats.map((c) => String(scores[c]).padEnd(COL)).join(' │ ');
    console.log(`[audit]   ${String(idx + 1).padStart(2)}   │ ${cells}`);
  });

  console.log(`[audit] ${divider}`);

  // Stats
  const stats = {};
  for (const cat of cats) {
    const vals = allScores.map((s) => s[cat]);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((s, v) => s + (v - avg) ** 2, 0) / vals.length;
    stats[cat] = {
      avg: +avg.toFixed(1),
      sd: +Math.sqrt(variance).toFixed(1),
      min: Math.min(...vals),
      max: Math.max(...vals),
    };
  }

  const row = (label, fn) =>
    `[audit]  ${label.padEnd(5)} │ ${cats.map((c) => fn(stats[c]).padEnd(COL)).join(' │ ')}`;

  console.log(row('AVG', (s) => String(s.avg)));
  console.log(row('SD', (s) => `±${s.sd}`));
  console.log(row('MIN', (s) => String(s.min)));
  console.log(row('MAX', (s) => String(s.max)));
  console.log(`[audit] ${hr('═')}\n`);

  // Save JSON summary
  const summaryPath = path.join(reportsDir, `${pkg.name}-summary.json`);
  writeFileSync(
    summaryPath,
    JSON.stringify({ app: pkg.name, numRuns: NUM_RUNS, runs: allScores, stats }, null, 2)
  );

  console.log(`[audit] HTML reports  → ${reportsDir}`);
  console.log(`[audit] JSON summary  → ${summaryPath}\n`);

  process.exit(0);
}

run().catch((err) => {
  console.error('[audit] Audit failed:', err);
  process.exit(1);
});
