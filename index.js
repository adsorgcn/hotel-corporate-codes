/**
 * Hotel Corporate Codes Database
 * https://hotelcorporatecodes.com
 *
 * 290 corporate discount codes across 10 hotel groups: Marriott, Hilton, IHG, Hyatt,
 * Wyndham, Radisson, Best Western, Choice, Accor and Omni (plus car-rental codes).
 * Data structured with I-Lang Protocol (https://ilang.ai)
 */
'use strict';

const marriott = require('./data/marriott.json');
const hilton = require('./data/hilton.json');
const ihg = require('./data/ihg.json');
const hyatt = require('./data/hyatt.json');
const wyndham = require('./data/wyndham.json');
const bestwestern = require('./data/bestwestern.json');
const choice = require('./data/choice.json');
const accor = require('./data/accor.json');
const radisson = require('./data/radisson.json');
const omni = require('./data/omni.json');
const carRental = require('./data/car-rental.json');

/** Hotel brand keys (car rental excluded), in the order searches walk them. */
const BRANDS = Object.freeze([
  'marriott', 'hilton', 'ihg', 'hyatt', 'wyndham', 'bestwestern', 'choice', 'accor', 'radisson', 'omni'
]);

const data = { marriott, hilton, ihg, hyatt, wyndham, bestwestern, choice, accor, radisson, omni, carRental };

/** Collect `{ brand, ...record }` for every hotel record that satisfies `predicate`. */
function collect(predicate) {
  const results = [];
  for (const brand of BRANDS) {
    for (const code of data[brand]) {
      if (predicate(code)) results.push({ brand, ...code });
    }
  }
  return results;
}

module.exports = {
  ...data,

  /** Hotel brand keys, e.g. `['marriott', 'hilton', ...]` */
  brands: BRANDS,

  /** Get all codes for a specific brand (`[]` for an unknown brand) */
  getBrand(brand) {
    return data[brand] || [];
  },

  /** Search hotel codes by (partial, case-insensitive) company name */
  searchByCompany(name) {
    const needle = String(name).toLowerCase();
    return collect((code) => code.company.toLowerCase().includes(needle));
  },

  /** Find every hotel record whose code matches (case-insensitive), across all brands */
  findByCode(code) {
    const needle = String(code).toLowerCase();
    return collect((record) => record.code.toLowerCase() === needle);
  },

  /**
   * Hotel codes whose `idRequired` traveller report is "No" or "Rarely".
   * A report, not a guarantee: hotels may still ask for proof, and eligibility comes from your organisation's agreement.
   */
  getSafeCodes() {
    return collect((code) => code.idRequired === 'No' || code.idRequired === 'Rarely');
  },

  /** Total number of hotel codes across all brands */
  get totalCodes() {
    return BRANDS.reduce((sum, brand) => sum + data[brand].length, 0);
  }
};
