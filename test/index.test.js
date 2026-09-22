import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  debounce, throttle, deepClone, groupBy, pick, omit, chunk,
} from '../src/utils.js';
import {
  formatDate, relativeTime, addDays, isBefore, isSameDay,
} from '../src/dates.js';
import { get, createClient, fetchWithRetry } from '../src/http.js';
import { uuid, nanoId, isEqual, simpleHash } from '../src/ids.js';
import { validate, emailPattern } from '../src/validation.js';

// --- Chapter 2: Utility Functions ---

test('groupBy groups items by key', () => {
  const result = groupBy(
    [{ type: 'a', v: 1 }, { type: 'b', v: 2 }, { type: 'a', v: 3 }],
    'type'
  );
  assert.deepEqual(result, { a: [{ type: 'a', v: 1 }, { type: 'a', v: 3 }], b: [{ type: 'b', v: 2 }] });
});

test('deepClone produces an independent copy', () => {
  const original = { a: { b: 1 } };
  const clone = deepClone(original);
  clone.a.b = 2;
  assert.equal(original.a.b, 1);
});

test('pick and omit work as expected', () => {
  const obj = { a: 1, b: 2, c: 3 };
  assert.deepEqual(pick(obj, ['a', 'c']), { a: 1, c: 3 });
  assert.deepEqual(omit(obj, ['a', 'c']), { b: 2 });
});

test('chunk splits an array into groups', () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
});

test('debounce delays execution', async () => {
  let calls = 0;
  const fn = debounce(() => calls++, 20);
  fn(); fn(); fn();
  assert.equal(calls, 0);
  await new Promise(r => setTimeout(r, 40));
  assert.equal(calls, 1);
});

test('throttle limits execution rate', async () => {
  let calls = 0;
  const fn = throttle(() => calls++, 50);
  fn(); fn(); fn();
  assert.equal(calls, 1);
});

// --- Chapter 3: Dates ---

test('formatDate produces a readable string', () => {
  const result = formatDate(new Date('2026-09-22'));
  assert.match(result, /September 22, 2026/);
});

test('relativeTime describes past days', () => {
  const now = new Date('2026-09-22');
  const past = new Date('2026-09-20');
  assert.equal(relativeTime(past, now), '2 days ago');
});

test('addDays adds correctly, including month rollover', () => {
  const result = addDays(new Date('2026-09-29'), 3);
  assert.equal(result.getMonth(), 9); // October (0-indexed)
  assert.equal(result.getDate(), 2);
});

test('isBefore and isSameDay compare correctly', () => {
  const a = new Date('2026-09-20');
  const b = new Date('2026-09-22');
  assert.equal(isBefore(a, b), true);
  assert.equal(isSameDay(a, a), true);
  assert.equal(isSameDay(a, b), false);
});

// --- Chapter 4: HTTP (against a local mock server) ---

test('get() parses JSON and throws on non-2xx', async () => {
  const server = await startMockServer();
  try {
    const data = await get(`${server.url}/ok`);
    assert.deepEqual(data, { ok: true });
    await assert.rejects(() => get(`${server.url}/fail`));
  } finally {
    server.close();
  }
});

test('createClient prepends baseURL and merges headers', async () => {
  const server = await startMockServer();
  try {
    const api = createClient(server.url, { 'X-Test': '1' });
    const data = await api('/ok');
    assert.deepEqual(data, { ok: true });
  } finally {
    server.close();
  }
});

test('fetchWithRetry eventually succeeds after failures', async () => {
  let attempts = 0;
  const server = await startMockServer((req, res) => {
    attempts++;
    if (attempts < 3) { res.writeHead(500); res.end(); return true; }
    return false; // fall through to default routing
  });
  try {
    const data = await fetchWithRetry(`${server.url}/ok`, {}, 5, 5);
    assert.deepEqual(data, { ok: true });
    assert.equal(attempts, 3);
  } finally {
    server.close();
  }
});

// --- Chapter 6: IDs & Data ---

test('uuid generates a valid v4 UUID', () => {
  const id = uuid();
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test('nanoId generates a string of the requested length', () => {
  assert.equal(nanoId(10).length, 10);
  assert.equal(nanoId().length, 21);
});

test('isEqual performs deep comparison', () => {
  assert.equal(isEqual({ a: [1, 2] }, { a: [1, 2] }), true);
  assert.equal(isEqual({ a: [1, 2] }, { a: [1, 3] }), false);
});

test('simpleHash is deterministic', () => {
  assert.equal(simpleHash('hello'), simpleHash('hello'));
  assert.notEqual(simpleHash('hello'), simpleHash('world'));
});

// --- Chapter 7: Forms & Validation ---

test('validate catches required and pattern errors', () => {
  const errors = validate(
    { email: 'not-an-email', password: '123' },
    {
      email: { required: true, pattern: emailPattern, message: 'Invalid email' },
      password: { required: true, minLength: 8 },
    }
  );
  assert.equal(errors.email, 'Invalid email');
  assert.match(errors.password, /at least 8/);
});

test('validate passes on valid input', () => {
  const errors = validate(
    { email: 'a@b.com', password: 'longenoughpassword' },
    {
      email: { required: true, pattern: emailPattern },
      password: { required: true, minLength: 8 },
    }
  );
  assert.deepEqual(errors, {});
});

// --- tiny built-in mock HTTP server, no dependency needed ---
import http from 'node:http';

function startMockServer(intercept) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      if (intercept && intercept(req, res)) return;
      if (req.url === '/ok') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } else {
        res.writeHead(500);
        res.end();
      }
    });
    server.listen(0, () => {
      const { port } = server.address();
      resolve({ url: `http://localhost:${port}`, close: () => server.close() });
    });
  });
}
