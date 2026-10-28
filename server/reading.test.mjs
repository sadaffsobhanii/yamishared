// Run with: npm test  (no network, no API key, no photos)
import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeReading } from './reading.ts'

const places = ['parkside', 'evk']
const good = { food: true, meal: 'Bowl', place: 'parkside', items: [{ name: 'Rice', usda: 'rice white cooked', grams: 180, size: 'regular', kind: 'refined grain', whole: false }] }

test('passes a valid reading through', () => {
  const r = normalizeReading(good, places)
  assert.equal(r.items[0].grams, 180)
  assert.equal(r.place, 'parkside')
})
test('clamps absurd portions', () => {
  const r = normalizeReading({ ...good, items: [{ ...good.items[0], grams: 90000 }, { ...good.items[0], name: 'Tiny', grams: -4 }] }, places)
  assert.deepEqual(r.items.map(i => i.grams), [1500, 5])
})
test('drops unknown place ids, duplicates, and fixes bad enums', () => {
  const r = normalizeReading({ ...good, place: 'mars', items: [{ ...good.items[0], size: 'huge', kind: 'candy' }, good.items[0]] }, places)
  assert.equal(r.place, null)
  assert.equal(r.items.length, 1)
  assert.equal(r.items[0].size, 'regular')
  assert.equal(r.items[0].kind, 'other')
})
test('not food returns no items', () => {
  assert.deepEqual(normalizeReading({ food: false, meal: 'x', place: null, items: [] }, places).items, [])
})
test('garbage is rejected so the app can say so instead of showing nothing', () => {
  assert.throws(() => normalizeReading(null, places))
  assert.throws(() => normalizeReading({ food: true, items: 'no' }, places))
  assert.throws(() => normalizeReading({ food: true, meal: 'x', items: [{}] }, places), /no-items/)
})
