export function normalize(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function selectRecords(records, { query = '', brand = '', kind = 'hotel' } = {}) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return records.filter(record => record.kind === kind && (!brand || record.brand === brand)
    && terms.every(term => normalize([record.company, record.brandName, record.code, record.businessCode,
      record.leisureCode, record.region].filter(Boolean).join(' ')).includes(term)));
}

export function pageRecords(records, limit = 12) {
  return records.slice(0, Math.max(0, Number.isFinite(limit) ? Math.trunc(limit) : 12));
}
