import test from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../server.js';

async function runGet(url) {
  const result = { status: null, headers: null, body: null };
  const res = {
    writeHead(status, headers) { result.status = status; result.headers = headers; },
    end(body) { result.body = Buffer.isBuffer(body) ? body.toString('utf8') : String(body); }
  };
  await handler({ method: 'GET', url }, res);
  return result;
}

test('homepage tolerates share-tracking query parameters', async () => {
  const response = await runGet('/?utm_source=chat');
  assert.equal(response.status, 200);
  assert.match(response.body, /LaunchScope/);
  assert.match(response.headers['content-type'], /text\/html/);
});

test('static resources tolerate cache-busting query parameters', async () => {
  const response = await runGet('/styles.css?v=2');
  assert.equal(response.status, 200);
  assert.match(response.headers['content-type'], /text\/css/);
});

test('health endpoint tolerates query parameters', async () => {
  const response = await runGet('/health?test=1');
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(response.body), { status: 'ok' });
});

test('unknown routes still return 404', async () => {
  const response = await runGet('/not-a-real-page?utm_source=chat');
  assert.equal(response.status, 404);
});
