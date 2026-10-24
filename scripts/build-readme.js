#!/usr/bin/env node
/**
 * Regenerates the data-driven parts of README.md from data/*.json.
 *
 * Two regions are rewritten; everything outside them is hand-written and left untouched:
 *   <!-- stats:start --> … <!-- stats:end -->   the at-a-glance strip (counts)
 *   <!-- codes:start --> … <!-- codes:end -->   the per-brand index + collapsible code tables
 *
 *   node scripts/build-readme.js          # rewrite README.md
 *   node scripts/build-readme.js --check  # exit 1 if README.md is out of date
 */
'use strict';

const fs = require('fs');
const path = require('path');
const codes = require('../index.js');

const README = path.join(__dirname, '..', 'README.md');
const REGIONS = {
  stats: { start: '<!-- stats:start -->', end: '<!-- stats:end -->', render: renderStats },
  codes: { start: '<!-- codes:start -->', end: '<!-- codes:end -->', render: renderCodes }
};

/** README order. `where` is the booking field on the brand's own site, kept verbatim. */
const SECTIONS = [
  { key: 'marriott', program: 'Marriott Bonvoy', brand: 'Marriott', site: 'marriott.com', url: 'https://www.marriott.com', where: 'Special Rates → Corporate/Promo Code' },
  { key: 'hilton', program: 'Hilton Honors', brand: 'Hilton', site: 'hilton.com', url: 'https://www.hilton.com', where: 'Special Rates → Corporate Account', note: 'Hilton also publishes company-specific booking pages at `hilton.com/en/preferred-rates/{company}/`.' },
  { key: 'ihg', program: 'IHG One Rewards', brand: 'IHG', site: 'ihg.com', url: 'https://www.ihg.com', where: 'Rate Preference → Corporate ID' },
  { key: 'hyatt', program: 'World of Hyatt', brand: 'Hyatt', site: 'hyatt.com', url: 'https://www.hyatt.com', where: 'Special Rates → Corporate or Group Code' },
  { key: 'wyndham', program: 'Wyndham Rewards', brand: 'Wyndham', site: 'wyndhamhotels.com', url: 'https://www.wyndhamhotels.com', where: 'Special Rates → Corporate Code' },
  { key: 'radisson', program: 'Radisson Rewards', brand: 'Radisson', site: 'radissonhotels.com', url: 'https://www.radissonhotels.com', where: 'Corporate account number' },
  { key: 'bestwestern', program: 'Best Western Rewards', brand: 'Best Western', site: 'bestwestern.com', url: 'https://www.bestwestern.com', where: 'Special Rate → Corporate ID' },
  { key: 'choice', program: 'Choice Privileges', brand: 'Choice Hotels', site: 'choicehotels.com', url: 'https://www.choicehotels.com', where: 'Special Rate → Client ID' },
  { key: 'accor', program: 'Accor ALL', brand: 'Accor', site: 'all.accor.com', url: 'https://all.accor.com', where: 'Preferential code' },
  { key: 'omni', program: 'Omni Select Guest', brand: 'Omni', site: 'omnihotels.com', url: 'https://www.omnihotels.com', where: 'Corporate ID' }
];

const TABLE_HEADER = [
  '| Code | Company | Discount | Region | ID check | Source |',
  '|:-----|:--------|:---------|:-------|:---------|:------:|'
].join('\n');

/** Escape a cell value for a markdown table; unknown (null/empty) → em dash. */
function cell(value) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value).replace(/\|/g, '\\|');
}

function idCheck(value) {
  if (value === null || value === undefined || value === '') return '—';
  const text = cell(value);
  switch (String(value).trim().toLowerCase()) {
    case 'no':
    case 'rarely':
      return `✅ ${text}`;
    case 'sometimes':
    case 'may ask':
      return `⚠️ ${text}`;
    case 'yes':
      return '❌ Required';
    default:
      return text;
  }
}

/** A `source` on the brand's own domain is official evidence; one on hotelcorporatecodes.com is the site's record page. */
function officialSource(record) {
  return typeof record.source === 'string' && record.source.startsWith('https://') && !/https:\/\/(www\.)?hotelcorporatecodes\.com\//.test(record.source);
}

function source(record) {
  if (officialSource(record)) return `[official ↗](${record.source})`;
  if (typeof record.source === 'string' && record.source) return `[site ↗](${record.source})`;
  return '';
}

function row(record) {
  const code = record.discount === null || record.discount === undefined
    ? `\`${cell(record.code)}\``
    : `**\`${cell(record.code)}\`**`;
  return `| ${code} | ${cell(record.company)} | ${cell(record.discount)} | ${cell(record.region)} | ${idCheck(record.idRequired)} | ${source(record)} |`;
}

function table(records) {
  return [TABLE_HEADER, ...records.map(row)].join('\n');
}

function orderedRecords(key) {
  const records = codes.getBrand(key);
  const withDiscount = records.filter((r) => r.discount !== null && r.discount !== undefined);
  const withoutDiscount = records.filter((r) => r.discount === null || r.discount === undefined);
  return withDiscount.concat(withoutDiscount);
}

function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

/** Per-brand index: one row per hotel group, linking to its section below. */
function indexTable() {
  const lines = [
    '| Hotel group | Codes | With reported discount | Where the code goes on the brand site |',
    '|:------------|------:|-----------------------:|:--------------------------------------|'
  ];
  for (const s of SECTIONS) {
    const records = codes.getBrand(s.key);
    const reported = records.filter((r) => r.discount !== null && r.discount !== undefined).length;
    lines.push(`| [${s.program}](#${anchor(s)}) | **${records.length}** | ${reported} | [${s.site}](${s.url}) → ${s.where} |`);
  }
  return lines.join('\n');
}

function anchor(s) {
  return `${s.program} ${plural(codes.getBrand(s.key).length, 'code', 'codes')}`
    .toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-');
}

function section(s) {
  const rows = orderedRecords(s.key);
  const out = [
    `### ${s.program} (${plural(rows.length, 'code', 'codes')})`,
    '',
    `Enter the code at [${s.site}](${s.url}) → ${s.where}.${s.note ? ' ' + s.note : ''}`,
    '',
    '<details>',
    `<summary>Show all ${plural(rows.length, 'code', 'codes')}</summary>`,
    '',
    table(rows),
    '',
    '</details>'
  ];
  return out.join('\n');
}

function renderStats() {
  const total = codes.totalCodes;
  const groups = codes.brands.length;
  const reported = codes.brands.reduce((n, b) => n + codes.getBrand(b).filter((r) => r.discount !== null && r.discount !== undefined).length, 0);
  const sourced = codes.brands.reduce((n, b) => n + codes.getBrand(b).filter(officialSource).length, 0);
  return [
    '<table align="center">',
    '  <tr>',
    `    <td align="center"><h3>${total}</h3><sub>hotel codes</sub></td>`,
    `    <td align="center"><h3>${groups}</h3><sub>hotel groups</sub></td>`,
    `    <td align="center"><h3>${reported}</h3><sub>with a reported discount range</sub></td>`,
    `    <td align="center"><h3>${sourced}</h3><sub>backed by an official brand page</sub></td>`,
    `    <td align="center"><h3>${codes.carRental.length}</h3><sub>car-rental agreements</sub></td>`,
    '  </tr>',
    '</table>'
  ].join('\n');
}

function renderCodes() {
  const covered = new Set(SECTIONS.map((s) => s.key));
  for (const brand of codes.brands) {
    if (!covered.has(brand)) throw new Error(`scripts/build-readme.js has no README section for brand "${brand}"`);
  }
  return [indexTable(), '', SECTIONS.map(section).join('\n\n')].join('\n');
}

function replaceRegion(current, { start, end, render }) {
  const a = current.indexOf(start);
  const b = current.indexOf(end);
  if (a === -1 || b === -1 || b < a) throw new Error(`README.md must contain ${start} followed by ${end}`);
  return current.slice(0, a + start.length) + '\n\n' + render() + '\n\n' + current.slice(b);
}

function build(current) {
  return Object.values(REGIONS).reduce(replaceRegion, current);
}

function main() {
  const current = fs.readFileSync(README, 'utf8');
  const next = build(current);
  const changed = next !== current;

  if (process.argv.includes('--check')) {
    if (changed) {
      console.error('README.md is out of date — run `npm run build:readme`');
      process.exit(1);
    }
    console.log('README.md is up to date');
    return;
  }

  if (changed) fs.writeFileSync(README, next);
  console.log(`README.md ${changed ? 'updated' : 'already up to date'} (${codes.totalCodes} codes, ${codes.brands.length} brands)`);
}

if (require.main === module) main();

module.exports = { render: renderCodes, renderStats, build };
