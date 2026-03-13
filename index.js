/**
 * Hotel Corporate Codes Database
 * https://hotelcorporatecodes.com
 * 
 * 123+ verified corporate discount codes for Marriott, Hilton, IHG, Hyatt & more
 * Data structured with I-Lang Protocol (https://ilang.ai)
 */

const marriott = require('./data/marriott.json');
const hilton = require('./data/hilton.json');
const ihg = require('./data/ihg.json');
const hyatt = require('./data/hyatt.json');
const wyndham = require('./data/wyndham.json');
const bestwestern = require('./data/bestwestern.json');
const choice = require('./data/choice.json');
const accor = require('./data/accor.json');
const carRental = require('./data/car-rental.json');

module.exports = {
  marriott,
  hilton,
  ihg,
  hyatt,
  wyndham,
  bestwestern,
  choice,
  accor,
  carRental,
  
  /** Get all codes for a specific brand */
  getBrand(brand) {
    return this[brand] || [];
  },

  /** Search codes by company name */
  searchByCompany(name) {
    const results = [];
    const brands = ['marriott', 'hilton', 'ihg', 'hyatt', 'wyndham', 'bestwestern', 'choice', 'accor'];
    for (const brand of brands) {
      for (const code of this[brand]) {
        if (code.company.toLowerCase().includes(name.toLowerCase())) {
          results.push({ brand, ...code });
        }
      }
    }
    return results;
  },

  /** Get all codes with no ID verification risk */
  getSafeCodes() {
    const results = [];
    const brands = ['marriott', 'hilton', 'ihg', 'hyatt', 'wyndham', 'bestwestern', 'choice', 'accor'];
    for (const brand of brands) {
      for (const code of this[brand]) {
        if (code.idRequired === 'No' || code.idRequired === 'Rarely') {
          results.push({ brand, ...code });
        }
      }
    }
    return results;
  },

  /** Total number of codes */
  get totalCodes() {
    return this.marriott.length + this.hilton.length + this.ihg.length + 
           this.hyatt.length + this.wyndham.length + this.bestwestern.length + 
           this.choice.length + this.accor.length;
  }
};
