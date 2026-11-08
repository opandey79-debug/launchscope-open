import test from 'node:test';
import assert from 'node:assert/strict';
import launchscope from '../netlify/functions/launchscope.mjs';
import {assess} from '../server.js';

test('Netlify adapter preserves health responses and security headers', async () => {
  const response = await launchscope(new Request('https://deployment.example/health?check=1'), {ip:'test-health'});
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {status:'ok'});
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
});

test('Netlify adapter keeps audit body validation and private-host rejection', async () => {
  for (const body of ['{', JSON.stringify({url:'http://127.0.0.1/'})]) {
    const response = await launchscope(new Request('https://deployment.example/api/audit', {method:'POST', body}), {ip:'test-invalid'});
    assert.equal(response.status, 400);
    assert.ok((await response.json()).error);
  }
});

test('Netlify adapter returns binary PDFs with attachment headers', async () => {
  const site = {url:'https://example.com/', status:200, headers:{}, body:'<html><title>Example</title></html>'};
  const report = {url:site.url, ...assess(site, false, false)};
  const response = await launchscope(new Request('https://deployment.example/api/report/pdf', {
    method:'POST', body:JSON.stringify(report)
  }), {ip:'test-pdf'});
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/pdf');
  assert.match(response.headers.get('content-disposition'), /attachment/);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.subarray(0,5).toString(), '%PDF-');
  assert.match(bytes.toString('latin1'), /%%EOF/);
});

test('Netlify per-instance throttling uses trusted context, ignoring spoofed headers', async () => {
  for (let i=0; i<13; i++) {
    const response = await launchscope(new Request('https://deployment.example/api/audit', {
      method:'POST', headers:{'x-forwarded-for':String(i)}, body:'{}'
    }), {ip:'test-rate-limit'});
    assert.equal(response.status, i===12 ? 429 : 400);
  }
});
