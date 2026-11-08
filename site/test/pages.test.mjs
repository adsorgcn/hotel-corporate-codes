import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { build, loadData, root, siteUrl, conceptDoi } from '../build.mjs';
import { selectRecords, pageRecords, normalize } from '../directory.mjs';

test('search matches company, brand and complete string codes without losing leading zeroes', async () => {
  const { records } = await loadData();
  assert.equal(records.filter(record => record.kind === 'hotel').length, 290);
  assert.equal(records.filter(record => record.kind === 'rental').length, 5);
  const ibm = selectRecords(records, { query: 'IBM', brand: 'marriott' });
  assert.equal(ibm.length, 1);
  assert.equal(ibm[0].code, 'IBM');
  const leading = records.find(record => record.code?.startsWith('0'));
  assert.ok(leading, 'Fixture includes a leading-zero code');
  assert.ok(selectRecords(records, { query: leading.code }).some(record => record.id === leading.id));
  assert.ok(selectRecords(records, { query: 'Siemens', kind: 'rental' }).length > 0);
  assert.equal(selectRecords(records, { query: 'unmatched-xyz-9287' }).length, 0);
  assert.equal(normalize('  HÔTEL  '), 'hotel');
  assert.equal(pageRecords(records).length, 12);
  assert.equal(pageRecords(records, 24).length, 24);
});

test('built project site has all records, correct DOI identity and only working relative assets', async () => {
  const output = await mkdtemp(join(tmpdir(), 'hotel-pages-'));
  try {
    const result = await build(output);
    assert.equal(result.hotelRecords, 290);
    const html = await readFile(join(output, 'index.html'), 'utf8');
    assert.equal((html.match(/data-record="/g) || []).length, 295);
    assert.ok(html.includes(`rel="canonical" href="${siteUrl}"`));
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
    assert.equal(schema.identifier.value, conceptDoi);
    assert.equal(schema.citation.length, 5);
    assert.equal(schema.distribution.length, 11);
    assert.ok(schema.distribution.every(item => item.contentUrl.includes(result.sourceCommit)));
    assert.ok(schema.sameAs.includes('https://hotelcorporatecodes.com/'));
    for (const match of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)) {
      assert.ok((await readFile(join(output, match[1]))).length > 0, match[1]);
      assert.ok(new URL('./' + match[1], siteUrl).pathname.startsWith('/hotel-corporate-codes/'));
    }
    assert.equal((await readdir(output)).includes('CNAME'), false);
    assert.doesNotMatch(html, /http-equiv="refresh"|Marriott official|Independent reference/i);
  } finally {
    assert.equal(dirname(resolve(output)), resolve(tmpdir()));
    assert.ok(basename(output).startsWith('hotel-pages-'));
    await rm(output, { recursive: true, force: true });
  }
});

test('Pages workflow confines public deployment to main and has no release trigger', async () => {
  const workflow = await readFile(join(root, '.github/workflows/pages.yml'), 'utf8');
  assert.match(workflow, /push:\s+branches: \[main\]/);
  assert.doesNotMatch(workflow, /^\s+(?:release|pull_request_target):/m);
  assert.match(workflow, /if: github.event_name != 'pull_request' && github.ref == 'refs\/heads\/main'/);
  assert.equal((workflow.match(/uses: actions\/[\w-]+@[a-f0-9]{40}/g) || []).length, 5);
  assert.doesNotMatch(workflow, /ZENODO|secrets\./);
});
