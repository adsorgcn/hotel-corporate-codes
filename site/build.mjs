import { readFile, writeFile, mkdir, cp, readdir } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const siteUrl = 'https://adsorgcn.github.io/hotel-corporate-codes/';
export const conceptDoi = '10.5281/zenodo.24061853';
const gitHub = 'https://github.com/adsorgcn/hotel-corporate-codes';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const copyIcon = '<svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="6" y="5" width="9" height="11" rx="1"/><path d="M12 5V2H3v11h3"/></svg>';
const gitIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.84.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.83c.85 0 1.71.11 2.51.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>';

const hotelBrands = [
  ['marriott', 'Marriott', 'Marriott Bonvoy', 'https://www.marriott.com', 'Special Rates → Corporate/Promo Code'],
  ['hilton', 'Hilton', 'Hilton Honors', 'https://www.hilton.com', 'Special Rates → Corporate Account'],
  ['ihg', 'IHG', 'IHG One Rewards', 'https://www.ihg.com', 'Rate Preference → Corporate ID'],
  ['hyatt', 'Hyatt', 'World of Hyatt', 'https://www.hyatt.com', 'Special Rates → Corporate or Group Code'],
  ['wyndham', 'Wyndham', 'Wyndham Rewards', 'https://www.wyndhamhotels.com', 'Special Rates → Corporate Code'],
  ['radisson', 'Radisson', 'Radisson Rewards', 'https://www.radissonhotels.com', 'Corporate account number'],
  ['bestwestern', 'Best Western', 'Best Western Rewards', 'https://www.bestwestern.com', 'Special Rate → Corporate ID'],
  ['choice', 'Choice Hotels', 'Choice Privileges', 'https://www.choicehotels.com', 'Special Rate → Client ID'],
  ['accor', 'Accor', 'Accor ALL', 'https://all.accor.com', 'Preferential code'],
  ['omni', 'Omni', 'Omni Select Guest', 'https://www.omnihotels.com', 'Corporate ID'],
];
const rentalBrands = [['hertz', 'Hertz', 'https://www.hertz.com'], ['avis', 'Avis', 'https://www.avis.com'], ['sixt', 'Sixt', 'https://www.sixt.com']];
const brandInfo = new Map(hotelBrands.map(([key, name, program, url, instructions]) => [key, { key, name, program, url, instructions, kind: 'hotel' }]));
for (const [key, name, url] of rentalBrands) brandInfo.set(key, { key, name, url, kind: 'rental' });

export async function loadData() {
  const records = [];
  for (const [brand, brandName] of hotelBrands) {
    const rows = JSON.parse(await readFile(join(root, 'data', brand + '.json'), 'utf8'));
    for (const [index, record] of rows.entries()) {
      if (typeof record.code !== 'string') throw new Error(`Expected string code: ${brand}:${index}`);
      records.push({ ...record, id: `${brand}-${index}`, brand, brandName, kind: 'hotel' });
    }
  }
  const rentals = JSON.parse(await readFile(join(root, 'data/car-rental.json'), 'utf8'));
  for (const [index, record] of rentals.entries()) {
    if (typeof record.businessCode !== 'string' || typeof record.leisureCode !== 'string') throw new Error('Rental codes must stay strings');
    records.push({ ...record, id: `rental-${index}`, brand: record.brand.toLowerCase(), brandName: record.brand, kind: 'rental' });
  }
  records.sort((a, b) => a.kind.localeCompare(b.kind) || a.company.localeCompare(b.company, 'en') || a.brandName.localeCompare(b.brandName, 'en'));
  return { records, brands: [...brandInfo.values()] };
}

function codeLine(value, company, label = '') {
  return `${label ? `<p class="code-caption">${escape(label)}</p>` : ''}<div class="code-line"><code>${escape(value)}</code><button type="button" class="copy-button" data-copy="${escape(value)}" aria-label="Copy ${escape(company)} code ${escape(value)}">${copyIcon}<span class="copy-label">Copy</span></button></div>`;
}

function card(record) {
  const info = brandInfo.get(record.brand);
  const isHotel = record.kind === 'hotel';
  const source = /^https:\/\//.test(record.source || '') ? record.source : null;
  const sourceLabel = source ? (new URL(source).hostname === 'hotelcorporatecodes.com' ? 'Source linked' : 'Official source') : 'Reference record';
  const details = isHotel
    ? `<p>Confirm that your organisation’s agreement covers your stay, and check the required proof before booking.</p><dl><dt>Recorded discount</dt><dd>${escape(record.discount || 'Not recorded')}</dd><dt>Historical ID report</dt><dd>${escape(record.idRequired || 'Not recorded')}</dd></dl>${record.note ? `<p>${escape(record.note)}</p>` : ''}<p>Discounts and ID reports are historical records, not a promise of current availability or eligibility.</p><p><strong>Where to enter the code</strong><br>${escape(info.instructions)}</p>`
    : `<p>These records distinguish business and leisure use. Check your employer’s policy and the rental terms, including insurance.</p>${record.note ? `<p>${escape(record.note)}</p>` : ''}`;
  return `<article class="code-card" data-record="${record.id}" aria-label="${escape(record.company)} · ${escape(record.brandName)}">
    <div class="card-top"><span class="brand-name">${escape(record.brandName)}</span><span class="source-label">${isHotel ? sourceLabel : 'Car rental'}</span></div>
    <h3>${escape(record.company)}</h3>
    ${isHotel ? codeLine(record.code, record.company) : codeLine(record.businessCode, record.company, 'Business') + codeLine(record.leisureCode, record.company, 'Leisure')}
    <div class="record-meta"><span>${escape(record.region || (isHotel ? 'Region not recorded' : record.note || 'Employer agreement'))}</span><span>${record.verified ? `Recorded ${escape(record.verified)}` : 'Date not recorded'}</span></div>
    <details class="card-details"><summary>Details &amp; booking link</summary><div class="detail-body">${details}${source ? `<a href="${escape(source)}" target="_blank" rel="noopener noreferrer">View record source ↗</a>` : `<a href="${gitHub}/blob/main/data/${isHotel ? record.brand : 'car-rental'}.json">View source data ↗</a>`}<a class="book-link" href="${info.url}" target="_blank" rel="noopener noreferrer">Visit ${escape(info.name)} <span aria-hidden="true">↗</span></a></div></details>
  </article>`;
}

function wordmark() {
  return '<span class="monogram" aria-hidden="true">H</span><span><strong>Hotel Corporate Codes</strong><small>A reference for better travel</small></span>';
}

export async function build(output = join(root, '_site')) {
  const model = await loadData();
  const hotels = model.records.filter(record => record.kind === 'hotel').length;
  const rentals = model.records.length - hotels;
  const zenodo = JSON.parse(await readFile(join(root, '.zenodo.json'), 'utf8'));
  const papers = zenodo.related_identifiers.filter(item => item.identifier.startsWith('10.'));
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const schema = {
    '@context': 'https://schema.org', '@type': 'Dataset',
    name: zenodo.title, description: `An open collection of ${hotels} hotel corporate-rate code records across ${hotelBrands.length} hotel groups, with ${rentals} car-rental records. Source fields and historical reports are preserved in the repository.`,
    url: siteUrl, identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: conceptDoi },
    sameAs: ['https://hotelcorporatecodes.com/', 'https://zenodo.org/records/24061854', gitHub, 'https://www.npmjs.com/package/@adsorgcn/hotel-corporate-codes'],
    license: 'https://spdx.org/licenses/MIT.html', inLanguage: 'en',
    creator: { '@type': 'Person', name: 'Long Quan Zhu', sameAs: 'https://orcid.org/0009-0004-4540-8082' },
    citation: papers.map(paper => 'https://doi.org/' + paper.identifier),
    distribution: (await readdir(join(root, 'data'))).filter(file => file.endsWith('.json')).sort().map(file => ({ '@type': 'DataDownload', name: file, contentUrl: `https://raw.githubusercontent.com/adsorgcn/hotel-corporate-codes/${sourceCommit}/data/${file}`, encodingFormat: 'application/json' })),
  };
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hotel Corporate Codes — Find your next stay’s starting point</title>
<meta name="description" content="Explore ${hotels} hotel corporate-rate code records across ${hotelBrands.length} hotel groups. Find your organisation, check the conditions, and book directly with the hotel.">
<link rel="canonical" href="${siteUrl}"><meta name="theme-color" content="#853e47">
<meta property="og:type" content="website"><meta property="og:title" content="Hotel Corporate Codes"><meta property="og:description" content="Every stay starts with the right code. Explore ${hotels} hotel records across ${hotelBrands.length} groups."><meta property="og:url" content="${siteUrl}"><meta property="og:image" content="${siteUrl}assets/hotel-courtyard.jpg"><meta name="twitter:card" content="summary_large_image">
<meta name="citation_title" content="${escape(zenodo.title)}"><meta name="citation_author" content="Long Quan Zhu"><meta name="citation_doi" content="${conceptDoi}"><meta name="citation_publication_date" content="2026-11-08"><meta name="citation_public_url" content="${siteUrl}">
<link rel="icon" href="./assets/favicon.svg" type="image/svg+xml"><link rel="preload" as="image" href="./assets/hotel-courtyard.jpg"><link rel="stylesheet" href="./styles.css">
<script type="application/ld+json">${json(schema)}</script><script type="module" src="./app.mjs"></script>
</head><body>
<a class="skip" href="#directory">Skip to the code directory</a>
<div class="utility"><div class="wrap"><span class="utility-note">A CONSIDERED APPROACH TO BUSINESS TRAVEL</span><a href="${gitHub}">${gitIcon} THE OPEN DATA COLLECTION <span aria-hidden="true">↗</span></a></div></div>
<header class="site-header"><div class="wrap header-inner"><a class="wordmark" href="./" aria-label="Hotel Corporate Codes home">${wordmark()}</a><button type="button" id="menu-toggle" aria-expanded="false" aria-controls="main-nav">MENU ☰</button><nav class="main-nav" id="main-nav" aria-label="Main navigation"><a href="#directory">The directory</a><a href="#brands">Hotel groups</a><a href="#before-you-book">Before you book</a><a href="#cite">The dataset</a><a class="nav-button" href="https://hotelcorporatecodes.com/">Visit our main site ↗</a></nav></div></header>
<main>
<section class="hero" aria-labelledby="hero-title"><img src="./assets/hotel-courtyard.jpg" alt="Palm trees and open-air pavilions around a hotel’s illuminated seaside pools" width="2200" height="685" fetchpriority="high"><div class="wrap hero-content"><div class="hero-copy"><div class="eyebrow">THE CORPORATE TRAVEL COLLECTION</div><h1 id="hero-title">Every stay starts<br>with the right code.</h1><p>Find your organisation’s rate code. Know the conditions. Book directly with the hotel.</p><a class="text-link" href="#directory">Explore the directory</a></div></div><div class="hero-index"><strong>10</strong>HOTEL GROUPS. ONE COLLECTION.</div></section>
<div class="wrap finder-wrap"><form class="finder" id="finder" action="#directory" role="search" aria-label="Search corporate codes"><div class="field"><label for="search">Your organisation or code</label><input id="search" name="q" type="search" placeholder="Company name or corporate code" autocomplete="off"></div><div class="field"><label for="brand">Hotel group</label><select id="brand" name="brand"><option value="">All hotel groups</option>${hotelBrands.map(([key, name]) => `<option value="${key}">${escape(name)}</option>`).join('')}</select></div><button class="primary-button" type="submit">Find a code <span aria-hidden="true">→</span></button></form><div class="snapshot-line"><div class="snapshot-stats"><span><strong>${hotels}</strong> hotel records</span><span><strong>${hotelBrands.length}</strong> hotel groups</span><span><strong>${rentals}</strong> car-rental records</span></div><a href="https://doi.org/${conceptDoi}">Open data. A permanent citation. ↗</a></div></div>
<section class="brands wrap" id="brands" aria-label="Filter by hotel group"><p class="eyebrow">FIND YOUR FAMILIAR STAY</p><div class="brand-list">${hotelBrands.map(([key, name]) => `<button type="button" data-brand-filter="${key}" aria-pressed="false" aria-label="Browse ${escape(name)} codes">${escape(name)}</button>`).join('')}</div></section>
<section class="directory" id="directory" aria-labelledby="directory-title"><div class="wrap"><div class="section-intro"><div><p class="eyebrow">THE DIRECTORY</p><h2 id="directory-title">A starting point for<br>your next stay.</h2></div><p>Search a company or browse a hotel group.<br>Open a record for the conditions, source<br>and the hotel’s own booking website.</p></div><div class="directory-toolbar"><div class="tabs" aria-label="Record category"><button type="button" data-kind="hotel" aria-pressed="true">Hotel codes <small>${hotels}</small></button><button type="button" data-kind="rental" aria-pressed="false">Car rentals <small>${rentals}</small></button></div><div class="result-actions"><span id="result-count" role="status" aria-live="polite">${model.records.length} records</span><button type="button" class="clear-button" id="clear-filters" data-reset hidden>Clear filters</button></div></div><noscript><p>All ${model.records.length} records are listed below. Use your browser’s Find command to search; JavaScript enables filters and copy buttons.</p></noscript><div class="records" id="records">${model.records.map(card).join('\n')}</div><div class="empty-state" id="empty-state" hidden><h3>No matching records.</h3><p>Try a company name, a different hotel group, or the code itself.</p><button type="button" class="outline-button" data-reset>Clear filters</button></div><div class="more-wrap"><button type="button" class="outline-button" id="show-more" hidden>Show more records</button></div><p class="directory-note">A listed code does not establish eligibility. Rates, availability and required proof depend on your organisation’s agreement and the hotel. Historical reports are preserved as reference information.</p></div></section>
<section class="before-booking" id="before-you-book"><div class="wrap guide-layout"><div class="guide-intro"><p class="eyebrow">TRAVEL WITH THE DETAILS IN HAND</p><h2>A little preparation.<br>A smoother arrival.</h2><p>Your code is the beginning of the booking process. These three checks help you understand the complete offer.</p><a class="text-link" href="https://hotelcorporatecodes.com/tips">Read the booking guide</a></div><ol class="guide-steps"><li><div><h3>Know the agreement.</h3><p>Confirm that your employer or membership organisation’s rate covers you, your destination and the purpose of your trip.</p></div></li><li><div><h3>Compare the complete stay.</h3><p>Enter the code on the hotel’s website. Compare the same dates and room with the public rate, including breakfast, taxes and cancellation terms.</p></div></li><li><div><h3>Arrive prepared.</h3><p>Check what proof the hotel requires. Keep the booking terms and bring the identification specified by your agreement.</p></div></li></ol></div></section>
<section class="citation" id="cite"><div class="wrap citation-inner"><div><p class="eyebrow">OPEN BY DESIGN</p><h2>A useful reference.<br>A lasting source.</h2></div><div class="citation-copy"><p>The collection is published as open JSON data under the MIT license, with a permanent Zenodo archive. Use the dataset, inspect the sources, or cite it in your work.</p><div class="citation-links"><a class="text-link" href="https://doi.org/${conceptDoi}">Cite this dataset</a><a href="${gitHub}">Explore on GitHub ↗</a><a href="https://www.npmjs.com/package/@adsorgcn/hotel-corporate-codes">Use the npm package ↗</a></div></div></div></section>
</main><footer class="site-footer"><div class="wrap"><div class="footer-top"><div><a class="wordmark" href="./">${wordmark()}</a><p class="footer-caption">Find the code. Understand the conditions.<br>Make your next booking an informed one.</p></div><div class="footer-links"><div><strong>Explore</strong><a href="#directory">The directory</a><a href="#brands">Hotel groups</a><a href="https://hotelcorporatecodes.com/">HotelCorporateCodes.com</a></div><div><strong>The collection</strong><a href="${gitHub}">GitHub repository</a><a href="https://zenodo.org/records/24061854">Archived dataset</a><a href="${gitHub}/issues">Suggest a correction</a></div><div><strong>Connect</strong><a href="https://www.youtube.com/@hotelcorporatecodes">YouTube</a><a href="https://ilang.ai/">iLang</a><a href="${gitHub}/blob/main/site/ASSETS.md">Photo credits</a></div></div></div><div class="footer-bottom"><span>© 2026 Hotel Corporate Codes · Data &amp; code: MIT</span><a href="https://doi.org/${conceptDoi}">DOI ${conceptDoi} ↗</a></div></div></footer>
<div class="sr-only" id="copy-status" role="status" aria-live="polite"></div><script type="application/json" id="directory-data">${json(model)}</script>
</body></html>\n`;
  await mkdir(output, { recursive: true });
  await writeFile(join(output, 'index.html'), html);
  await writeFile(join(output, '.nojekyll'), '');
  await writeFile(join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}sitemap.xml\n`);
  await writeFile(join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}</loc></url></urlset>\n`);
  await writeFile(join(output, 'dataset.json'), JSON.stringify(model, null, 2) + '\n');
  await writeFile(join(output, 'build.json'), JSON.stringify({ repository: gitHub, sourceCommit, hotelRecords: hotels, hotelGroups: hotelBrands.length, rentalRecords: rentals, conceptDoi, files: { 'index.html': createHash('sha256').update(html).digest('hex') } }, null, 2) + '\n');
  for (const name of ['styles.css', 'app.mjs', 'directory.mjs']) await cp(join(root, 'site', name), join(output, name));
  await cp(join(root, 'site/assets'), join(output, 'assets'), { recursive: true });
  return { output, hotelRecords: hotels, rentalRecords: rentals, sourceCommit };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(await build(process.argv[2] ? resolve(process.argv[2]) : undefined), null, 2));
}
