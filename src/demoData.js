const KEY = 'asw-demo-v2'

export const routes = [
  { origin: '上海', destination: '洛杉矶', options: [
    { carrier: 'COSCO', base: 2150, days: 15, vessel: 'COSCO HOPE / 062E', direct: true, score: 92 },
    { carrier: 'ONE', base: 1980, days: 21, vessel: 'ONE HARMONY / 119E', direct: false, score: 85 },
    { carrier: 'EMC', base: 2320, days: 14, vessel: 'EVER MAX / 031E', direct: true, score: 87 },
    { carrier: 'HMM', base: 2180, days: 16, vessel: 'HMM PACIFIC / 054E', direct: true, score: 86 },
  ] },
  { origin: '宁波', destination: '长滩', options: [
    { carrier: 'ONE', base: 1920, days: 18, vessel: 'ONE TRUST / 088E', direct: true, score: 90 },
    { carrier: 'COSCO', base: 2050, days: 17, vessel: 'COSCO GLORY / 071E', direct: true, score: 88 },
    { carrier: 'EMC', base: 1870, days: 23, vessel: 'EVER APEX / 016E', direct: false, score: 81 },
  ] },
  { origin: '深圳', destination: '汉堡', options: [
    { carrier: 'OOCL', base: 1780, days: 29, vessel: 'OOCL GERMANY / 046W', direct: false, score: 86 },
    { carrier: 'COSCO', base: 1960, days: 25, vessel: 'COSCO EUROPE / 019W', direct: true, score: 91 },
    { carrier: 'ONE', base: 1830, days: 27, vessel: 'ONE DESTINY / 102W', direct: false, score: 84 },
  ] },
]

const defaults = {
  contracts: [
    { id: 1, carrier: 'COSCO', name: 'COSCO_美西_202610.xlsx', route: '上海 → 洛杉矶', expires: '2026-10-31', rows: 48, enabled: true, status: '已核对' },
    { id: 2, carrier: 'ONE', name: 'ONE_TPEB_SHA_202610.xlsx', route: '上海 → 洛杉矶', expires: '2026-10-31', rows: 36, enabled: true, status: '已核对' },
    { id: 3, carrier: 'EMC', name: 'EMC_USWC_202610.xlsx', route: '上海 → 洛杉矶', expires: '2026-10-25', rows: 42, enabled: true, status: '已核对' },
    { id: 4, carrier: 'OOCL', name: 'OOCL_TPEB_Q4.xlsx', route: '深圳 → 汉堡', expires: '2026-12-31', rows: 62, enabled: true, status: '已核对' },
    { id: 5, carrier: 'ONE', name: 'ONE_LGB_202610.xlsx', route: '宁波 → 长滩', expires: '2026-10-31', rows: 31, enabled: true, status: '已核对' },
    { id: 6, carrier: 'COSCO', name: 'COSCO_LGB_202610.xlsx', route: '宁波 → 长滩', expires: '2026-10-31', rows: 28, enabled: true, status: '已核对' },
    { id: 7, carrier: 'COSCO', name: 'COSCO_EU_2026Q4.xlsx', route: '深圳 → 汉堡', expires: '2026-12-31', rows: 40, enabled: true, status: '已核对' },
    { id: 8, carrier: 'HMM', name: 'HMM_USWC_待核对.xlsx', route: '上海 → 洛杉矶', expires: '2026-10-31', rows: 32, enabled: false, status: '待核对' },
  ],
  accounts: [{ id: 1, name: 'Amy Chen', role: '管理员', enabled: true }, { id: 2, name: 'Leo Wang', role: '业务员', enabled: true }],
  rules: { markup: 12, validityDays: 7 },
  records: [{ id: 'RFQ20261007DEMO', customer: '示例贸易公司', route: '上海 → 洛杉矶', container: '40HQ', quantity: 2, date: '2026-10-18', carrier: 'COSCO', vessel: 'COSCO HOPE / 062E', days: 15, unitPrice: 2408, total: 4816, validUntil: '2026-10-14', status: '待确认', remarks: '预置演示报价，用于展示管理员待办流程', created: '2026/10/7 09:00' }],
  logs: [{ id: 1, action: '初始化演示数据', detail: '合同和报价规则已载入', time: '2026-10-07 09:00' }],
}

export function loadDemo() {
  try { return { ...structuredClone(defaults), ...JSON.parse(localStorage.getItem(KEY) || '{}') } }
  catch { return structuredClone(defaults) }
}

export function saveDemo(data) { localStorage.setItem(KEY, JSON.stringify(data)) }
