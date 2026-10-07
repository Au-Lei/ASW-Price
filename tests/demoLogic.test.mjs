import test from 'node:test'
import assert from 'node:assert/strict'
import { getQuoteOptions, getTodos, addDays, validDate } from '../src/demoLogic.js'
import { routes, loadDemo } from '../src/demoData.js'

const form = { origin: '上海', destination: '洛杉矶', container: '40HQ', quantity: 2, date: '2026-10-18', preference: 'balanced' }
test('supported routes use only verified matching contracts', () => {
  const data = loadDemo()
  assert.equal(getQuoteOptions(routes, data, form).length, 3)
  assert.equal(getQuoteOptions(routes, data, { ...form, origin:'宁波', destination:'长滩' }).length, 2)
  assert.equal(getQuoteOptions(routes, data, { ...form, origin:'深圳', destination:'汉堡' }).length, 2)
  assert.deepEqual(getQuoteOptions(routes, data, { ...form, destination:'汉堡' }), [])
})
test('preferences choose cheapest, fastest and highest scored independently', () => {
  const data = loadDemo()
  assert.equal(getQuoteOptions(routes, data, form)[0].carrier, 'COSCO')
  assert.equal(getQuoteOptions(routes, data, { ...form, preference:'price' })[0].carrier, 'ONE')
  assert.equal(getQuoteOptions(routes, data, { ...form, preference:'speed' })[0].carrier, 'EMC')
})
test('totals and schedule dates follow customer conditions', () => {
  const data = loadDemo()
  const q = getQuoteOptions(routes, data, form)[0]
  assert.equal(q.total, 4816)
  assert.equal(q.etd, '2026-10-18')
  assert.equal(q.eta, '2026-11-02')
  assert.ok(getQuoteOptions(routes, data, { ...form, container:'20GP' })[0].price < q.price)
})
test('disabled, unverified and expired contracts are excluded', () => {
  const data = loadDemo()
  data.contracts.find(c=>c.id===1).enabled = false
  assert.ok(!getQuoteOptions(routes,data,form).some(q=>q.carrier==='COSCO'))
  assert.ok(!getQuoteOptions(routes,data,{...form,date:'2026-10-26'}).some(q=>q.carrier==='EMC'))
  assert.deepEqual(getQuoteOptions(routes,data,{...form,date:'2027-01-01'}),[])
  const hmm = data.contracts.find(c=>c.id===8)
  assert.ok(!getQuoteOptions(routes,data,form).some(q=>q.carrier==='HMM'))
  hmm.status='已核对'; hmm.enabled=true
  assert.ok(getQuoteOptions(routes,data,form).some(q=>q.carrier==='HMM'))
})
test('completing tasks removes exactly the corresponding pending items', () => {
  const data = loadDemo()
  assert.equal(getTodos(data,'2026-10-07').filter(t=>t.type==='check').length,1)
  data.contracts.find(c=>c.id===8).status='已核对'
  data.records[0].status='已确认'
  assert.equal(getTodos(data,'2026-10-07').filter(t=>t.type==='check'||t.type==='quote').length,0)
  const c=data.contracts.find(c=>c.id===1)
  c.expires='2026-12-31'
  assert.ok(!getTodos(data,'2026-10-07').some(t=>t.type==='expiry'&&t.item.id===1))
})
test('dates reject impossible inputs and handle year transitions', () => {
  assert.equal(validDate('2026-02-30'),false)
  assert.equal(validDate('2026-13-01'),false)
  assert.equal(validDate('2026-10-18'),true)
  assert.equal(addDays('2026-12-30',5),'2027-01-04')
})
