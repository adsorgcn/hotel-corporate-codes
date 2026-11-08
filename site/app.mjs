import { selectRecords, pageRecords } from './directory.mjs';

const model = JSON.parse(document.querySelector('#directory-data').textContent);
const form = document.querySelector('#finder');
const query = document.querySelector('#search');
const brand = document.querySelector('#brand');
const status = document.querySelector('#result-count');
const more = document.querySelector('#show-more');
const empty = document.querySelector('#empty-state');
const cards = new Map([...document.querySelectorAll('[data-record]')].map(card => [card.dataset.record, card]));
const tabs = [...document.querySelectorAll('[data-kind]')];
const parameters = new URLSearchParams(location.search);
let kind = parameters.get('kind') === 'rental' ? 'rental' : 'hotel';
let limit = 12;
query.value = parameters.get('q') || '';

function setBrands(selected = '') {
  document.querySelector('label[for="brand"]').textContent = kind === 'hotel' ? 'Hotel group' : 'Rental brand';
  brand.replaceChildren(new Option(kind === 'hotel' ? 'All hotel groups' : 'All rental brands', ''));
  for (const item of model.brands.filter(item => item.kind === kind)) {
    brand.add(new Option(item.name, item.key));
  }
  brand.value = [...brand.options].some(option => option.value === selected) ? selected : '';
}

function render({ updateUrl = true } = {}) {
  const matches = selectRecords(model.records, { query: query.value, brand: brand.value, kind });
  const visible = new Set(pageRecords(matches, limit).map(record => record.id));
  for (const [id, card] of cards) card.hidden = !visible.has(id);
  status.textContent = `Showing ${visible.size} of ${matches.length} ${kind === 'hotel' ? 'hotel' : 'car-rental'} records`;
  more.hidden = visible.size >= matches.length;
  more.textContent = `Show more records (${matches.length - visible.size} remaining)`;
  empty.hidden = matches.length !== 0;
  tabs.forEach(tab => tab.setAttribute('aria-pressed', String(tab.dataset.kind === kind)));
  document.querySelectorAll('[data-brand-filter]').forEach(button => {
    button.setAttribute('aria-pressed', String(kind === 'hotel' && brand.value === button.dataset.brandFilter));
  });
  document.querySelector('#clear-filters').hidden = !query.value && !brand.value;
  if (updateUrl) {
    const next = new URL(location.href);
    next.search = '';
    if (query.value.trim()) next.searchParams.set('q', query.value.trim());
    if (brand.value) next.searchParams.set('brand', brand.value);
    if (kind !== 'hotel') next.searchParams.set('kind', kind);
    history.replaceState(null, '', next);
  }
}

function scrollToDirectory() {
  document.querySelector('#directory').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

setBrands(parameters.get('brand') || '');
render({ updateUrl: false });
document.documentElement.classList.add('enhanced');
form.addEventListener('submit', event => { event.preventDefault(); limit = 12; render(); scrollToDirectory(); });
query.addEventListener('input', () => { limit = 12; render(); });
brand.addEventListener('change', () => { limit = 12; render(); });
more.addEventListener('click', () => { limit += 12; render(); });
tabs.forEach(tab => tab.addEventListener('click', () => {
  kind = tab.dataset.kind; limit = 12; setBrands(); render();
}));
document.querySelectorAll('[data-brand-filter]').forEach(button => button.addEventListener('click', () => {
  kind = 'hotel'; limit = 12; setBrands(button.dataset.brandFilter); render(); scrollToDirectory();
}));
document.querySelectorAll('[data-reset]').forEach(button => button.addEventListener('click', () => {
  query.value = ''; brand.value = ''; limit = 12; render(); query.focus();
}));

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-copy]');
  if (!button) return;
  const value = button.dataset.copy;
  try {
    await navigator.clipboard.writeText(value);
    button.dataset.copied = 'true';
    button.querySelector('.copy-label').textContent = 'Copied';
    document.querySelector('#copy-status').textContent = `Copied ${value}`;
    setTimeout(() => {
      button.dataset.copied = 'false';
      button.querySelector('.copy-label').textContent = 'Copy';
    }, 2200);
  } catch {
    const code = button.parentElement.querySelector('code');
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
    document.querySelector('#copy-status').textContent = `Code ${value} selected. Use your device's copy command.`;
  }
});

const menu = document.querySelector('#menu-toggle');
const nav = document.querySelector('#main-nav');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
nav.addEventListener('click', event => {
  if (event.target.closest('a')) { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); }
});
