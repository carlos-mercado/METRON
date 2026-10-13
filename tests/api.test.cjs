const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function loadApi(user, fetchImpl) {
    const source = readFileSync(new URL('../src/api.ts', `file://${__filename}`), 'utf8');
    const compiled = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const context = {
        exports: {}, Headers, fetch: fetchImpl,
        require: (name) => {
            if (name === 'firebase/auth') return { getAuth: () => ({ currentUser: user }) };
            if (name === './firebaseConfig') return { default: {} };
            throw new Error(`Unexpected import: ${name}`);
        },
    };
    vm.runInNewContext(compiled, context);
    return context.exports.apiFetch;
}

test('adds current Firebase token while preserving request headers and body', async () => {
    let calls = 0;
    const apiFetch = loadApi({ getIdToken: async () => 'firebase-token' }, async (url, options) => {
        calls++;
        assert.equal(url, 'https://metron-api.duckdns.org/workouts/edit');
        assert.equal(options.headers.get('Authorization'), 'Bearer firebase-token');
        assert.equal(options.headers.get('Content-Type'), 'application/json');
        assert.equal(options.method, 'PUT');
        assert.equal(options.body, '{}');
        return { status: 200 };
    });
    await apiFetch('/workouts/edit', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'untrusted' }, body: '{}',
    });
    assert.equal(calls, 1);
});

test('signed-out requests never reach the network', async () => {
    const apiFetch = loadApi(null, () => assert.fail('Unexpected fetch'));
    await assert.rejects(apiFetch('/'), /Please sign in first/);
});

test('token acquisition failures never reach the network', async () => {
    const apiFetch = loadApi({ getIdToken: async () => { throw new Error('Token unavailable'); } },
        () => assert.fail('Unexpected fetch'));
    await assert.rejects(apiFetch('/'), /Token unavailable/);
});

test('obtains a token for each request instead of caching it in application state', async () => {
    let tokenCalls = 0;
    const tokens = [];
    const apiFetch = loadApi({ getIdToken: async () => `token-${++tokenCalls}` }, async (_url, options) => {
        tokens.push(options.headers.get('Authorization'));
        return { status: 200 };
    });
    await apiFetch('/');
    await apiFetch('/activity');
    assert.deepEqual(tokens, ['Bearer token-1', 'Bearer token-2']);
});
