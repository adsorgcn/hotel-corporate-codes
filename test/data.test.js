'use strict';

const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const codes = require('../index.js');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BASE_KEYS = ['code', 'company', 'discount', 'region', 'idRequired', 'note', 'verified'];

test('exports every hotel brand file', () => {
  assert.ok(Array.isArray(codes.brands) && codes.brands.length >= 10);
  for (const brand of ['marriott', 'hilton', 'ihg', 'hyatt', 'wyndham', 'bestwestern', 'choice', 'accor', 'radisson', 'omni']) {
    assert.ok(codes.brands.includes(brand), `brands includes ${brand}`);
  }
  assert.ok(!codes.brands.includes('carRental'), 'car rental is not a hotel brand');
});

for (const brand of codes.brands) {
  test(`data/${brand}.json is well-formed`, () => {
    const file = path.join(DATA_DIR, `${brand}.json`);
    const raw = fs.readFileSync(file, 'utf8');
    const records = JSON.parse(raw);

    assert.ok(Array.isArray(records) && records.length > 0, 'non-empty array');
    assert.equal(raw, JSON.stringify(records, null, 2) + '\n', '2-space indented with trailing newline');
    assert.deepEqual(codes[brand], records, `index.js exports data/${brand}.json`);

    const seen = new Set();
    records.forEach((record, i) => {
      const where = `${brand}[${i}] ${JSON.stringify(record.code)}`;
      for (const key of BASE_KEYS) {
        assert.ok(Object.hasOwn(record, key), `${where} has "${key}"`);
      }
      assert.equal(typeof record.code, 'string', `${where} code is a string`);
      assert.ok(record.code.length > 0, `${where} code is non-empty`);
      assert.equal(typeof record.company, 'string', `${where} company is a string`);

      const key = record.code.toLowerCase();
      assert.ok(!seen.has(key), `${where} duplicate code`);
      seen.add(key);

      assert.ok(
        record.verified === null || /^\d{4}-\d{2}$/.test(record.verified),
        `${where} verified is null or YYYY-MM`
      );
      if (Object.hasOwn(record, 'source')) {
        assert.ok(
          typeof record.source === 'string' && record.source.startsWith('https://'),
          `${where} source is an https URL`
        );
      }
    });
  });
}

test('totalCodes sums every hotel brand', () => {
  const expected = codes.brands.reduce((sum, brand) => sum + codes[brand].length, 0);
  assert.equal(codes.totalCodes, expected);
  assert.ok(codes.totalCodes > 123, 'more codes than the 1.0.0 release');
});

test('findByCode matches case-insensitively across brands', () => {
  const ibm = codes.findByCode('000243132');
  assert.equal(ibm.length, 1);
  assert.equal(ibm[0].brand, 'ihg');
  assert.equal(ibm[0].company, 'IBM');
  assert.equal(ibm[0].code, '000243132');

  assert.deepEqual(codes.findByCode('sie'), codes.findByCode('SIE'));
  assert.equal(codes.findByCode('sie')[0].brand, 'marriott');
  assert.ok(codes.findByCode('AAA').length >= 5, 'AAA exists at several brands');
  assert.deepEqual(codes.findByCode('definitely-not-a-code'), []);
});

test('searchByCompany finds Siemens at most brands', () => {
  const siemens = codes.searchByCompany('siemens');
  assert.ok(siemens.length >= 8, `expected >= 8 Siemens codes, got ${siemens.length}`);
  for (const record of siemens) {
    assert.ok(codes.brands.includes(record.brand));
    assert.match(record.company.toLowerCase(), /siemens/);
  }
});

test('getSafeCodes only returns No/Rarely ID checks', () => {
  const safe = codes.getSafeCodes();
  assert.ok(safe.length > 0);
  for (const record of safe) {
    assert.ok(['No', 'Rarely'].includes(record.idRequired), `${record.brand} ${record.code}`);
  }
});

test('getBrand and carRental keep their 1.0 behaviour', () => {
  assert.equal(codes.getBrand('marriott'), codes.marriott);
  assert.deepEqual(codes.getBrand('not-a-brand'), []);
  assert.equal(codes.marriott[0].code, 'SIE');
  assert.equal(codes.carRental.length, 5);
});
