#!/usr/bin/env node
/**
 * Regenerates the per-brand code tables in README.md from data/*.json.
 *
 * Only the region between `<!-- codes:start -->` and `<!-- codes:end -->` is
 * rewritten; everything outside the markers is hand-written and left untouched.
 *
 *   node scripts/build-readme.js          # rewrite README.md
 *   node scripts/build-readme.js --check  # exit 1 if README.md is out of date
 */
'use strict';

const fs = require('fs');
const path = require('path');
const codes = require('../index.js');

const README = path.join(__dirname, '..', 'README.md');
const START = '<!-- codes:start -->';
const END = '<!-- codes:end -->';

/** Rows shown in the main table; anything beyond goes into a collapsed <details>. */
const MAX_MAIN_ROWS = 12;

/** README order. `hint` lines are kept verbatim from the hand-written README. */
const SECTIONS = [
  {
    key: 'marriott',
    program: 'Marriott Bonvoy',
    brand: 'Marriott',
    hint: '> Enter code at [marriott.com](https://www.marriott.com) → Special Rates → Corporate/Promo Code'
  },
  {
    key: 'hilton',
    program: 'Hilton Honors',
    brand: 'Hilton',
    hint: [
      '> Enter code at [hilton.com](https://www.hilton.com) → Special Rates → Corporate Code',
      '> ',
      '> Hilton now offers company-specific booking pages at `hilton.com/en/preferred-rates/{company}/`'
    ].join('\n')
  },
  {
    key: 'ihg',
    program: 'IHG One Rewards',
    brand: 'IHG',
    hint: '> Enter code at [ihg.com](https://www.ihg.com) → Corporate Code'
  },
  {
    key: 'hyatt',
    program: 'World of Hyatt',
    brand: 'Hyatt',
    hint: '> Enter code at [hyatt.com](https://www.hyatt.com) → Corp or Group Code'
  },
  { key: 'wyndham', program: 'Wyndham Rewards', brand: 'Wyndham' },
  { key: 'radisson', program: 'Radisson Rewards', brand: 'Radisson' },
  { key: 'bestwestern', program: 'Best Western Rewards', brand: 'Best Western' },
  { key: 'choice', program: 'Choice Privileges', brand: 'Choice Hotels' },
  { key: 'accor', program: 'Accor ALL', brand: 'Accor' },
  { key: 'omni', program: 'Omni Select Guest', brand: 'Omni' }
];

const TABLE_HEADER = [
  '| Code | Company | Discount | Region | ID Check |',
  '|------|---------|----------|--------|----------|'
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

function row(record) {
  const code = record.discount === null || record.discount === undefined
    ? cell(record.code)
    : `**${cell(record.code)}**`;
  return `| ${code} | ${cell(record.company)} | ${cell(record.discount)} | ${cell(record.region)} | ${idCheck(record.idRequired)} |`;
}

function table(records) {
  return [TABLE_HEADER, ...records.map(row)].join('\n');
}

function section({ key, program, brand, hint }) {
  const records = codes.getBrand(key);
  const withDiscount = records.filter((r) => r.discount !== null && r.discount !== undefined);
  const withoutDiscount = records.filter((r) => r.discount === null || r.discount === undefined);
  const rows = withDiscount.concat(withoutDiscount);
  const main = rows.length > MAX_MAIN_ROWS ? rows.slice(0, MAX_MAIN_ROWS) : rows;
  const rest = rows.slice(main.length);

  const out = [`## ${program} — ${rows.length} ${rows.length === 1 ? 'Code' : 'Codes'}`, ''];
  if (hint) out.push(hint, '');
  out.push(table(main));
  if (rest.length) {
    out.push(
      '',
      '<details>',
      `<summary><strong>View all ${rows.length} ${brand} codes →</strong></summary>`,
      '',
      table(rest),
      '',
      '</details>'
    );
  }
  return out.join('\n');
}

/** The full generated block, without the markers. */
function render() {
  const covered = new Set(SECTIONS.map((s) => s.key));
  for (const brand of codes.brands) {
    if (!covered.has(brand)) throw new Error(`scripts/build-readme.js has no README section for brand "${brand}"`);
  }
  return SECTIONS.map(section).join('\n\n---\n\n');
}

function build(current) {
  const start = current.indexOf(START);
  const end = current.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`README.md must contain ${START} followed by ${END}`);
  }
  return current.slice(0, start + START.length) + '\n\n' + render() + '\n\n' + current.slice(end);
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

module.exports = { render, build };
