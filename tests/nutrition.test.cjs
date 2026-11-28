const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
function load(fetch = () => assert.fail('Unexpected network request')) {
  const source = readFileSync(new URL('../src/nutrition.ts', `file://${__filename}`), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, fetch };
  vm.runInNewContext(compiled, context);
  return context.exports;
}
const food = { id: '1', name: 'Milk', basis: '100ml', quantity: 250, calories: 60, protein: 3.2, carbs: 5, fat: 3 };
test('scales grams, milliliters and fractional servings without rounding each entry', () => {
  const { totals } = load();
  const sum = totals([food, { ...food, id: '2', basis: '100g', quantity: 50 }, { ...food, id: '3', basis: 'serving', quantity: 0.5 }]);
  assert.equal(sum.calories, 210);
  assert.ok(Math.abs(sum.protein - 11.2) < 1e-10);
  assert.equal(sum.carbs, 17.5);
  assert.equal(sum.fat, 10.5);
  assert.equal(totals([]).calories, 0);
});
test('scales per-gram, per-milliliter and per-ounce values by the amount eaten', () => {
  const { totals, validFood } = load();
  for (const basis of ['g', 'ml', 'oz']) {
    const item = { ...food, basis, quantity: 3, calories: 2, protein: 0.5 };
    assert.equal(validFood(item), true);
    assert.equal(totals([item]).calories, 6); assert.equal(totals([item]).protein, 1.5);
  }
});
test('estimates the single missing value from the other three with 4/4/9 kcal per gram', () => {
  const { estimateMissing } = load();
  const plain = value => JSON.parse(JSON.stringify(value));
  assert.deepEqual(plain(estimateMissing({ calories: '', protein: '10', carbs: '20', fat: '5' })), { key: 'calories', value: '165' });
  assert.deepEqual(plain(estimateMissing({ calories: '165', protein: '10', carbs: '', fat: '5' })), { key: 'carbs', value: '20' });
  assert.deepEqual(plain(estimateMissing({ calories: '100', protein: '0', carbs: '0', fat: '' })), { key: 'fat', value: '11.1' });
  assert.equal(estimateMissing({ calories: '', protein: '', carbs: '20', fat: '5' }), null);
  assert.equal(estimateMissing({ calories: '50', protein: '10', carbs: '20', fat: '' }), null);
  assert.equal(estimateMissing({ calories: '', protein: '-1', carbs: '20', fat: '5' }), null);
});
test('converts the amount eaten between units of the same kind', () => {
  const { totals } = load();
  const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≉ ${expected}`);
  // Label per 1 oz, weighed in grams: 85 g is just under 3 oz.
  near(totals([{ ...food, basis: 'oz', quantity: 85.048569375, unit: 'g', calories: 100 }]).calories, 300);
  // Label per 100 g, eaten in ounces and pounds.
  near(totals([{ ...food, basis: '100g', quantity: 1, unit: 'lb', calories: 100 }]).calories, 453.59237);
  // Label per 100 ml, drunk in cups and fluid ounces.
  near(totals([{ ...food, basis: '100ml', quantity: 1, unit: 'cup', calories: 40 }]).calories, 94.6352946);
  near(totals([{ ...food, basis: 'floz', quantity: 8, unit: 'floz', calories: 10 }]).calories, 80);
});
test('serving size links servings to grams or milliliters in both directions', () => {
  const { totals, unitsFor, validFood } = load();
  const list = value => [...value];
  // "Per serving, 1 oz (28 g)", weighed 56 g → 2 servings.
  const perServing = { ...food, basis: 'serving', servingSize: 28, servingUnit: 'g', calories: 150 };
  assert.equal(totals([{ ...perServing, quantity: 56, unit: 'g' }]).calories, 300);
  assert.equal(totals([{ ...perServing, quantity: 2, unit: 'oz' }]).calories, 150 * 2 * 28.349523125 / 28);
  // "Per 100 g, serving 30 g", eaten 2 servings → 60 g.
  const per100 = { ...food, basis: '100g', servingSize: 30, servingUnit: 'g', calories: 500 };
  assert.equal(totals([{ ...per100, quantity: 2, unit: 'servings' }]).calories, 300);
  assert.deepEqual(list(unitsFor(per100)), ['servings', 'g', 'oz', 'lb']);
  // Without a matching serving size there is no way to convert, so those entries are rejected.
  assert.deepEqual(list(unitsFor({ basis: '100g' })), ['g', 'oz', 'lb']);
  assert.deepEqual(list(unitsFor({ basis: '100g', servingSize: 250, servingUnit: 'ml' })), ['g', 'oz', 'lb']);
  assert.equal(validFood({ ...food, basis: '100g', quantity: 1, unit: 'servings' }), false);
  assert.equal(validFood({ ...food, basis: '100g', quantity: 1, unit: 'ml' }), false);
  assert.equal(validFood({ ...per100, quantity: 1, unit: 'servings' }), true);
  for (const change of [{ servingSize: 0 }, { servingSize: -5 }, { servingUnit: 'cup' }, { unit: 'stone' }]) assert.equal(validFood({ ...per100, ...change }), false);
});
test('rejects invalid stored entries and accepts zero nutrient values', () => {
  const { validFood } = load();
  assert.equal(validFood(food), true);
  for (const change of [{ quantity: 0 }, { quantity: Infinity }, { protein: -1 }, { calories: null }, { name: ' ' }, { basis: 'cup' }, { basis: 'toString' }]) assert.equal(validFood({ ...food, ...change }), false);
  assert.equal(validFood({ ...food, protein: 0 }), true);
});
test('uses local calendar components rather than UTC conversion', () => {
  const { localDate } = load();
  assert.equal(localDate({ getFullYear: () => 2026, getMonth: () => 0, getDate: () => 2 }), '2026-01-02');
});
test('barcode nutrition preserves missing values for manual completion and retains zero', async () => {
  const { lookupBarcode } = load(async url => {
    assert.match(url, /\/0012345678905.json\?/);
    return { ok: true, json: async () => ({ status: 1, product: { product_name: 'Food', nutriments: { 'energy-kcal_100g': 100, proteins_100g: 0, carbohydrates_100g: -1 } } }) };
  });
  const result = await lookupBarcode('0012345678905', new AbortController().signal);
  assert.equal(result.calories, '100'); assert.equal(result.protein, '0'); assert.equal(result.carbs, ''); assert.equal(result.fat, '');
  assert.equal(result.servingSize, '');
});
test('barcode lookup returns the serving size and its unit when the product lists one', async () => {
  const lookup = product => load(async url => {
    assert.match(url, /serving_quantity,serving_quantity_unit/);
    return { ok: true, json: async () => ({ status: 1, product: { product_name: 'Juice', nutriments: {}, ...product } }) };
  }).lookupBarcode('12345678', new AbortController().signal);
  const juice = await lookup({ serving_quantity: '250', serving_quantity_unit: 'ml' });
  assert.equal(juice.servingSize, '250'); assert.equal(juice.servingUnit, 'ml');
  const chips = await lookup({ serving_quantity: 28 });
  assert.equal(chips.servingSize, '28'); assert.equal(chips.servingUnit, 'g');
  assert.equal((await lookup({ serving_quantity: 'abc' })).servingSize, '');
});
test('invalid barcodes, missing products, and service errors produce actionable errors', async () => {
  await assert.rejects(load().lookupBarcode('abc', new AbortController().signal), /barcode/);
  await assert.rejects(load(async () => ({ ok: true, json: async () => ({ status: 0 }) })).lookupBarcode('12345678', new AbortController().signal), /not found/);
  await assert.rejects(load(async () => ({ ok: false, status: 503 })).lookupBarcode('12345678', new AbortController().signal), /HTTP 503/);
});

test('distinguishes missing products, rate limits, network failures and malformed responses', async () => {
  const signal = new AbortController().signal;
  for (const [status, message] of [[404, /not found/], [429, /Wait a minute/], [403, /HTTP 403/]]) {
    await assert.rejects(load(async () => ({ ok: false, status })).lookupBarcode('12345678', signal), message);
  }
  await assert.rejects(load(async () => { throw new TypeError('Failed to fetch'); }).lookupBarcode('12345678', signal), /Could not connect/);
  await assert.rejects(load(async () => ({ ok: true, json: async () => { throw new SyntaxError('Bad JSON'); } })).lookupBarcode('12345678', signal), /invalid response/);
});

// Exercise the actual form handler with controlled state and browser services.
function saveHarness(overrides = {}) {
  const source = readFileSync(new URL('../src/Nutrition.tsx', `file://${__filename}`), 'utf8');
  const handler = source.slice(source.indexOf('  function save(event: FormEvent)'), source.indexOf('\n  const sum ='));
  const state = { saved: null, lookups: 0, error: '', notice: '' };
  const context = {
    exports: {}, loaded: true, editing: null, barcode: '', foods: [],
    draft: { name: 'Nutella', calories: '539', protein: '6.3', carbs: '57.5', fat: '30.9', quantity: '100', basis: '100g' },
    ...load(), empty: {},
    crypto: { getRandomValues: array => { array.fill(7); return array; } },
    setSaveError: text => { state.error = text; },
    setNotice: text => { state.notice = text; },
    findFood: () => { state.lookups++; },
    persist: foods => { state.saved = foods; return true; },
    setDraft: () => {}, setEditing: () => {}, setBarcode: () => {}, ...overrides,
  };
  context.draft = { unit: context.bases[context.draft.basis].unit, servingSize: '', servingUnit: 'g', ...context.draft };
  vm.runInNewContext(ts.transpileModule(`${handler}\nexports.save = save;`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context);
  context.exports.save({ preventDefault() {} });
  return state;
}
test('Add food with only a barcode starts lookup instead of silently failing', () => {
  const result = saveHarness({ barcode: '3017620422003', draft: { name: '', calories: '', protein: '', carbs: '', fat: '', quantity: '1', basis: 'serving' } });
  assert.equal(result.lookups, 1); assert.equal(result.saved, null);
});
test('Add food saves reviewed nutrition without randomUUID and confirms the save', () => {
  const result = saveHarness();
  assert.equal(result.saved.length, 1); assert.equal(result.saved[0].name, 'Nutella');
  assert.equal(result.saved[0].protein, 6.3); assert.ok(result.saved[0].id);
  assert.match(result.notice, /Nutella added/);
});
test('Add food saves the unit eaten and the serving size', () => {
  const result = saveHarness({ draft: { name: 'Chips', calories: '150', protein: '2', carbs: '15', fat: '10', quantity: '56', unit: 'g', basis: 'serving', servingSize: '28', servingUnit: 'g' } });
  assert.equal(result.saved[0].unit, 'g'); assert.equal(result.saved[0].servingSize, 28); assert.equal(result.saved[0].servingUnit, 'g');
  const plain = saveHarness();
  assert.equal(plain.saved[0].unit, 'g'); assert.equal('servingSize' in plain.saved[0], false);
});
test('Add food reports missing fields and rejects invalid portions', () => {
  const missing = saveHarness({ draft: { name: '', calories: '', protein: '', carbs: '', fat: '', quantity: '1', basis: 'serving' } });
  assert.match(missing.error, /food name, calories, protein, carbs, fat/); assert.equal(missing.saved, null);
  const invalid = saveHarness({ draft: { name: 'Food', calories: '1', protein: '0', carbs: '0', fat: '0', quantity: '-1', basis: 'serving' } });
  assert.match(invalid.error, /positive number/); assert.equal(invalid.saved, null);
});
