#!/usr/bin/env node
import fs from "node:fs";

const files = process.argv.slice(2);
if (!files.length) {
  console.error("Usage: node scripts/quality/lighthouse-summary.mjs <report.json> [...]");
  process.exit(2);
}

const pct = (v) => Math.round((v ?? 0) * 100);
const ms = (v) => Number.isFinite(v) ? Math.round(v) : null;
const fmt = (v) => v == null ? "n/a" : String(v);

console.log("| URL | Perf | Access. | Bonnes pratiques | SEO | LCP ms | CLS | TBT ms |");
console.log("|---|---:|---:|---:|---:|---:|---:|---:|");

for (const file of files) {
  const r = JSON.parse(fs.readFileSync(file, "utf8"));
  const c = r.categories || {};
  const a = r.audits || {};
  const url = r.finalDisplayedUrl || r.finalUrl || r.requestedUrl || file;
  const cls = a["cumulative-layout-shift"]?.numericValue;
  const clsText = Number.isFinite(cls) ? cls.toFixed(3) : "n/a";
  console.log(`| ${url} | ${pct(c.performance?.score)} | ${pct(c.accessibility?.score)} | ${pct(c["best-practices"]?.score)} | ${pct(c.seo?.score)} | ${fmt(ms(a["largest-contentful-paint"]?.numericValue))} | ${clsText} | ${fmt(ms(a["total-blocking-time"]?.numericValue))} |`);
}