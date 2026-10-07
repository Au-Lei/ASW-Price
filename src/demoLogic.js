export function dateOnly(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function addDays(value, days) {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + Number(days))
  return dateOnly(date)
}

export function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(new Date(`${value}T12:00:00`).getTime()) && dateOnly(new Date(`${value}T12:00:00`)) === value
}

export function getQuoteOptions(routes, data, form) {
  const route = routes.find(r => r.origin === form.origin && r.destination === form.destination)
  if (!route || !validDate(form.date)) return []
  const factor = form.container === '20GP' ? 0.68 : form.container === '40GP' ? 0.92 : 1
  return route.options.flatMap(q => {
    const contract = data.contracts.find(c => c.carrier === q.carrier && c.route === `${form.origin} → ${form.destination}` && c.enabled && c.status === '已核对' && c.expires >= form.date)
    if (!contract) return []
    const price = Math.round(q.base * factor * (1 + Number(data.rules.markup || 0) / 100))
    return [{ ...q, price, total: price * form.quantity, etd: form.date, eta: addDays(form.date, q.days), validUntil: [contract.expires, addDays(dateOnly(), data.rules.validityDays)].sort()[0], contractName: contract.name }]
  }).sort((a, b) => form.preference === 'price' ? a.price - b.price : form.preference === 'speed' ? a.days - b.days : b.score - a.score)
}

export function getTodos(data, today = dateOnly()) {
  const limit = addDays(today, 30)
  const contracts = data.contracts.filter(c => c.status === '待核对').map(c => ({ key: `check-${c.id}`, type: 'check', title: `${c.carrier} 合同待核对`, detail: c.name, date: c.expires, item: c, action: '核对合同' }))
  const expiry = data.contracts.filter(c => c.enabled && c.status === '已核对' && c.expires <= limit).map(c => ({ key: `expiry-${c.id}`, type: 'expiry', title: `${c.carrier} ${c.expires < today ? '合同已过期' : '合同即将到期'}`, detail: c.route, date: c.expires, item: c, action: '调整有效期' }))
  const quotes = data.records.filter(r => (r.status || '待确认') === '待确认').map(r => ({ key: `quote-${r.id}`, type: 'quote', title: `${r.customer} 报价待确认`, detail: `${r.route} · ${r.carrier} · ${r.id}`, date: r.validUntil || '—', item: r, action: '查看报价' }))
  return [...contracts, ...expiry.sort((a,b) => a.date.localeCompare(b.date)), ...quotes]
}
