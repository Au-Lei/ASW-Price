<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight, Clock, Collection, DataAnalysis, Files, House, Lock, MagicStick, Search, Ship, Tickets, UploadFilled, UserFilled, Setting, SwitchButton } from '@element-plus/icons-vue'
import { loadDemo, routes, saveDemo } from './demoData.js'
import ComparisonTable from './ComparisonTable.vue'
import TodoCenter from './TodoCenter.vue'
import OceanEntry from './OceanEntry.vue'
import { addDays, dateOnly, validDate, getQuoteOptions, getTodos } from './demoLogic.js'

const data = reactive(loadDemo())
const mode = ref('entry')
const customerPage = ref('quote')
const adminPage = ref('dashboard')
const login = reactive({ username: '', password: '' })
const loginError = ref('')
const form = reactive({ origin: '上海', destination: '洛杉矶', container: '40HQ', quantity: 1, date: '2026-10-18', preference: 'balanced' })
const searched = ref(false)
const selected = ref(null)
const quoteDialog = ref(false)
const customerName = ref('')
const remarks = ref('')
const activeRecord = ref(null)
const contractDialog = ref(false)
const importReady = ref(false)
const accountDialog = ref(false)
const accountForm = reactive({ name: '', role: '业务员' })
const contractQuery = ref('')
const historyQuery = ref('')

const adminNav = [['dashboard', '数据工作台', House], ['contracts', '合同管理', Files], ['validity', '有效期管理', Clock], ['accounts', '账号与权限', UserFilled], ['rules', '报价规则', Setting], ['logs', '操作记录', Collection]]
const customerNav = [['quote', '智能询价', MagicStick], ['history', '我的询价', Tickets]]
const nav = computed(() => mode.value === 'admin' ? adminNav : customerNav)
const page = computed(() => mode.value === 'admin' ? adminPage.value : customerPage.value)
const title = computed(() => nav.value.find(item => item[0] === page.value)?.[1] || 'ASW Smart Freight')
const route = computed(() => routes.find(r => r.origin === form.origin && r.destination === form.destination))
const options = computed(() => getQuoteOptions(routes, data, form))
const visibleContracts = computed(() => data.contracts.filter(c => `${c.carrier} ${c.name} ${c.route}`.toLowerCase().includes(contractQuery.value.toLowerCase())))
const visibleRecords = computed(() => data.records.filter(r => `${r.id} ${r.route} ${r.customer} ${r.carrier}`.toLowerCase().includes(historyQuery.value.toLowerCase())))
const expiring = computed(() => getTodos(data).filter(t => t.type === 'expiry'))

function stamp() { return new Date().toLocaleString('zh-CN', { hour12: false }) }
function save() { saveDemo(data) }
function log(action, detail) { data.logs.unshift({ id: Date.now() + Math.random(), action, detail, time: stamp() }); save() }
function enterCustomer() { mode.value = 'customer'; customerPage.value = 'quote'; searched.value = false }
function enterAdmin() {
  if (login.username.trim() !== 'demo' || login.password !== 'ASW2026') { loginError.value = '演示账号或密码不正确'; return }
  loginError.value = ''; login.password = ''; mode.value = 'admin'; adminPage.value = 'dashboard'; ElMessage.success('已进入管理员演示界面')
}
function leave() { mode.value = 'entry'; searched.value = false; selected.value = null; login.password = '' }
function navigate(to) { mode.value === 'admin' ? adminPage.value = to : customerPage.value = to; if (to === 'quote') { searched.value = false; selected.value = null } }
function doSearch() {
  if (!form.date || form.quantity < 1) { ElMessage.warning('请填写出货日期和柜量'); return }
  searched.value = true
  if (!route.value) ElMessage.warning('暂无这条航线的演示运价，请选择页面提示的三条航线')
  else if (!options.value.length) ElMessage.warning('该日期暂无有效合同，请调整日期')
}
function selectQuote(q) { selected.value = q; customerName.value = ''; remarks.value = ''; quoteDialog.value = true }
function createQuote() {
  if (!customerName.value.trim()) { ElMessage.warning('请填写客户名称'); return }
  const q = selected.value
  const id = `RFQ${new Date().toISOString().slice(0, 10).replaceAll('-', '')}${String(Date.now()).slice(-5)}`
  const validUntil = q.validUntil
  const record = { id, customer: customerName.value.trim(), route: `${form.origin} → ${form.destination}`, container: form.container, quantity: form.quantity, date: form.date, carrier: q.carrier, vessel: q.vessel, days: q.days, unitPrice: q.price, total: q.price * form.quantity, validUntil, etd: q.etd, eta: q.eta, status: '待确认', remarks: remarks.value.trim(), created: stamp() }
  data.records.unshift(record); log('生成报价单', `${id} · ${record.route} · ${q.carrier}`)
  quoteDialog.value = false; customerPage.value = 'history'; activeRecord.value = record; ElMessage.success('报价单已生成')
}
function printRecord(record) { activeRecord.value = record; setTimeout(() => window.print(), 80) }
function openImport() { importReady.value = false; contractDialog.value = true }
function confirmImport() {
  if (!importReady.value) { ElMessage.warning('请先点击解析演示合同'); return }
  const name = `HMM_USWC_${String(Date.now()).slice(-5)}.xlsx`
  data.contracts.unshift({ id: Date.now(), carrier: 'HMM', name, route: '上海 → 洛杉矶', expires: '2026-10-31', rows: 32, enabled: false, status: '待核对' })
  contractDialog.value = false; log('导入演示合同', name); ElMessage.success('已加入待核对合同')
}
function verify(c) { c.status = '已核对'; c.enabled = true; log('核对并启用合同', c.name); ElMessage.success('合同已启用') }
function toggleContract(c) { c.enabled = !c.enabled; log(c.enabled ? '启用合同' : '停用合同', c.name); ElMessage.success('合同状态已更新') }
function changeExpiry(c) {
  ElMessageBox.prompt('请输入新到期日（YYYY-MM-DD）', '调整有效期', { inputValue: c.expires, inputValidator: value => validDate(value) || '请输入真实日期，例如 2026-11-30', inputErrorMessage: '请使用 YYYY-MM-DD 格式' })
    .then(({ value }) => { c.expires = value; log('调整有效期', `${c.name} → ${value}`); ElMessage.success('有效期已更新') }).catch(() => {})
}
function addAccount() {
  if (!accountForm.name.trim()) { ElMessage.warning('请输入姓名'); return }
  data.accounts.push({ id: Date.now(), name: accountForm.name.trim(), role: accountForm.role, enabled: true }); log('新增演示账号', accountForm.name.trim()); accountForm.name = ''; accountDialog.value = false; ElMessage.success('演示账号已添加')
}
function toggleAccount(a) { a.enabled = !a.enabled; log(a.enabled ? '启用账号' : '停用账号', a.name); ElMessage.success('演示账号状态已更新') }
function handleTodo(todo) {
  if (todo.type === 'check') { contractQuery.value = todo.item.name; adminPage.value = 'contracts' }
  else if (todo.type === 'expiry') changeExpiry(todo.item)
  else activeRecord.value = todo.item
}
function confirmRecord(record) { record.status = '已确认'; log('确认演示报价', record.id); ElMessage.success('报价已确认，已从待办中移除') }
function saveRules() {
  if (Number(data.rules.markup) < 0 || Number(data.rules.validityDays) < 1) { ElMessage.warning('请输入有效规则'); return }
  log('更新报价规则', `加价 ${data.rules.markup}% · 有效期 ${data.rules.validityDays} 天`); ElMessage.success('规则已保存，请重新询价查看效果')
}
</script>

<template>
  <OceanEntry v-if="mode === 'entry'" @customer="enterCustomer" @admin="mode='login'" />

  <div v-else-if="mode === 'login'" class="login-screen admin-ocean-login">
    <button class="admin-return" @click="mode='entry';loginError=''">← 返回海运入口</button>
    <main class="login-card admin-login-card">
      <div class="entry-logo"><span><el-icon><Ship /></el-icon></span><div><b>ASW</b><small>SMART FREIGHT</small></div></div>
      <div class="admin-login-heading"><span>ADMIN PORTAL</span><h1>管理员登录</h1><p>让每一份合同与报价，都有序可循。</p></div>
      <form @submit.prevent="enterAdmin">
        <div class="admin-login-field"><label for="admin-username">管理员账号</label><el-input id="admin-username" v-model="login.username" placeholder="请输入管理员账号" size="large" autocomplete="username" :prefix-icon="UserFilled" /></div>
        <div class="admin-login-field"><label for="admin-password">登录密码</label><el-input id="admin-password" v-model="login.password" placeholder="请输入登录密码" type="password" show-password size="large" autocomplete="current-password" :prefix-icon="Lock" /></div>
        <div v-if="loginError" class="admin-login-error" role="alert">{{ loginError }}</div>
        <button class="primary-btn login-submit" type="submit"><span>登录管理工作台</span><span aria-hidden="true">→</span></button>
      </form>
      <div class="admin-login-demo"><span class="admin-demo-label">演示账号</span><div><span>账号 <b>demo</b></span><span>密码 <b>ASW2026</b></span></div><p>仅展示登录流程，不提供真实访问控制。</p></div>
      <div class="admin-login-bottom">合同管理 <span>·</span> 报价规则 <span>·</span> 数据工作台</div>
    </main>
    <div class="admin-ocean-caption" aria-hidden="true"><span>ACROSS THE OCEAN</span><p>连接全球，让海运更从容。</p></div>
  </div>

  <el-container v-else :class="['app-shell',{'customer-shell':mode==='customer'}]"><el-aside v-if="mode==='admin'" width="236px" class="sidebar"><div class="brand"><div class="brand-mark"><el-icon><Ship /></el-icon></div><div class="brand-copy"><b>ASW</b><span>SMART FREIGHT</span></div></div><div class="nav-heading">管理员工作台</div><nav class="nav-list"><button v-for="item in nav" :key="item[0]" :class="['nav-item',{active:page===item[0]}]" @click="navigate(item[0])"><el-icon><component :is="item[2]" /></el-icon><span>{{ item[1] }}</span></button></nav><div class="sidebar-footer"><p class="sidebar-hint">演示数据保存在本机浏览器</p><button class="exit-btn" @click="leave"><el-icon><SwitchButton /></el-icon>返回角色选择</button></div></el-aside>
    <el-container>
      <header v-if="mode==='customer'" class="customer-header"><div class="customer-brand"><el-icon><Ship /></el-icon><div><b>ASW</b><small>SMART FREIGHT</small></div></div><nav aria-label="客户导航"><button :class="{active:customerPage==='quote'}" @click="navigate('quote')">智能询价</button><button :class="{active:customerPage==='history'}" @click="navigate('history')">我的报价 <span>{{ data.records.length }}</span></button></nav><button class="customer-exit" @click="leave">返回入口 <span aria-hidden="true">↗</span></button></header>
      <el-header v-else class="topbar"><div><div class="top-kicker">ASW SMART FREIGHT / ADMIN</div><h1>{{ title }}</h1></div><div class="top-actions"><span class="demo-pill">DEMO MODE</span><div class="avatar">AD</div><div class="user"><b>演示管理员</b><span>管理员</span></div></div></el-header>
      <el-main class="main-area">
        <template v-if="mode==='customer' && customerPage==='quote'">
          <div class="customer-intro"><span class="customer-intro-label"><i></i> 为每一票货物，找到合适的航线</span><h1>{{ searched?'好方案，清晰比较。':'这次，您的货物要去哪里？' }}</h1><p>清楚比较价格与时效，让下一程更从容。</p><ol class="customer-steps"><li :class="{current:!searched}"><span>1</span>填写需求</li><li :class="{current:searched}"><span>2</span>比较方案</li><li><span>3</span>生成报价</li></ol></div>
          <div v-if="!searched" class="quote-layout"><section class="panel quote-form-panel">
            <div class="form-heading"><div><h2>规划这一次运输</h2><p>选择港口与货柜，其他交给我们。</p></div><span class="customer-form-badge">海运整柜 · FCL</span></div>
            <div class="customer-route-fields"><label>起运港 <small>POL</small><el-select v-model="form.origin" aria-label="起运港" size="large"><el-option v-for="p in ['上海','宁波','深圳']" :key="p" :label="p" :value="p" /></el-select></label><div class="customer-route-link" aria-hidden="true"><i></i><el-icon><Ship /></el-icon><i></i><span>→</span></div><label>目的港 <small>POD</small><el-select v-model="form.destination" aria-label="目的港" size="large"><el-option v-for="p in ['洛杉矶','长滩','汉堡']" :key="p" :label="p" :value="p" /></el-select></label></div>
            <div class="demo-fields"><label>柜型<el-select v-model="form.container" aria-label="柜型" size="large"><el-option v-for="p in ['20GP','40GP','40HQ']" :key="p" :label="p" :value="p" /></el-select></label><label>柜量<el-input-number v-model="form.quantity" aria-label="柜量" :min="1" :max="50" size="large" style="width:100%" /></label><label>预计出货日期<el-date-picker v-model="form.date" aria-label="预计出货日期" type="date" value-format="YYYY-MM-DD" size="large" style="width:100%" /></label></div>
            <div class="customer-preference"><div><label class="label-title">您更看重什么？</label><p>{{ form.preference==='price'?'优先找到更低的运输报价。':form.preference==='speed'?'优先考虑更短的预计航程。':'兼顾运输预算、航程与中转情况。' }}</p></div><div class="preference-grid" role="group" aria-label="方案偏好"><button v-for="p in [['balanced','综合推荐'],['price','价格优先'],['speed','时效优先']]" :key="p[0]" :class="{active:form.preference===p[0]}" :aria-pressed="form.preference===p[0]" @click="form.preference=p[0]"><b>{{ p[1] }}</b></button></div></div>
            <div class="customer-form-footer"><p><el-icon><Collection /></el-icon> 模拟运价 · 仅供功能展示</p><button class="search-btn" @click="doSearch">查看运输方案 <el-icon><ArrowRight /></el-icon></button></div>
          </section><div class="customer-route-note"><span>演示航线</span><span>上海 → 洛杉矶</span><span>宁波 → 长滩</span><span>深圳 → 汉堡</span></div></div>
          <div v-else><button class="back-link" @click="searched=false">← 修改询价条件</button><div class="result-head"><div><h2>{{ form.origin }} → {{ form.destination }}</h2><p>{{ form.container }} × {{ form.quantity }} · {{ form.date }} 出货 · {{ options.length }} 个可用演示方案</p></div><el-tag type="warning">模拟运价，非正式报价</el-tag></div><div v-if="!options.length" class="demo-empty"><el-icon><Search /></el-icon><h3>暂无匹配方案</h3><p>请调整航线或日期，或联系管理员检查合同状态。</p><button class="outline-btn" @click="searched=false">返回修改条件</button></div><ComparisonTable v-else :options="options" :form="form" @select="selectQuote" /></div>
        </template>

        <template v-else-if="mode==='customer' && customerPage==='history'"><div class="page-intro"><div><span class="eyebrow">MY QUOTATIONS</span><h2>我的询价记录</h2><p>本机浏览器生成的演示报价，点击记录可以查看或打印。</p></div><button class="primary-btn" @click="navigate('quote')">发起新询价</button></div><div class="toolbar"><el-input v-model="historyQuery" placeholder="搜索单号、航线或客户" clearable style="max-width:320px" /><el-tag type="info">{{ visibleRecords.length }} 条记录</el-tag></div><div v-if="!visibleRecords.length" class="demo-empty"><el-icon><Tickets /></el-icon><h3>还没有匹配的询价记录</h3><p>完成询价并选择方案后，记录会出现在这里。</p><button class="outline-btn" @click="navigate('quote')">开始询价</button></div><div v-else class="panel table-panel"><table><thead><tr><th>报价单号</th><th>客户</th><th>航线</th><th>方案</th><th>总价</th><th>时间</th><th>操作</th></tr></thead><tbody><tr v-for="r in visibleRecords" :key="r.id"><td><b>{{ r.id }}</b></td><td>{{ r.customer }}</td><td>{{ r.route }}</td><td>{{ r.carrier }} · {{ r.container }} × {{ r.quantity }}</td><td>${{ r.total.toLocaleString() }}</td><td>{{ r.created }}</td><td><button class="text-btn" @click="activeRecord=r">查看报价单</button></td></tr></tbody></table></div></template>

        <template v-else-if="mode==='admin' && adminPage==='dashboard'">
          <div class="page-intro"><div><span class="eyebrow">OPERATIONS OVERVIEW</span><h2>业务数据工作台</h2><p>跟进待办事项，查看合同和报价动态。</p></div><button class="primary-btn" @click="adminPage='contracts';openImport()">导入演示合同</button></div>
          <div class="stats-grid"><div v-for="s in [['合同总数',data.contracts.length,'份合同',Files],['临期 / 过期',expiring.length,'未来 30 天需关注',Clock],['演示报价单',data.records.length,'本机浏览器记录',Tickets],['待确认报价',data.records.filter(r=>(r.status||'待确认')==='待确认').length,'等待人工确认',Collection]]" :key="s[0]" class="stat-card"><div class="stat-icon blue"><el-icon><component :is="s[3]" /></el-icon></div><div><span>{{ s[0] }}</span><strong>{{ s[1] }}</strong><small>{{ s[2] }}</small></div></div></div>
          <TodoCenter :data="data" @handle="handleTodo" />
          <div class="panel recent-quotes"><div class="panel-head"><div><h3>最近报价动态</h3><p>打开报价单查看详情</p></div><button class="text-btn" @click="adminPage='logs'">查看操作记录 →</button></div><div v-if="!data.records.length" class="dash-empty">暂无报价单，可从客户入口生成一份。</div><button v-for="r in data.records.slice(0,4)" :key="r.id" class="activity quote-activity" @click="activeRecord=r"><div class="route-icon"><el-icon><Ship /></el-icon></div><div class="activity-main"><b>{{ r.route }}</b><span>{{ r.customer }} · {{ r.carrier }}</span></div><el-tag :type="r.status==='已确认'?'success':'warning'">{{ r.status || '待确认' }}</el-tag><b>${{ r.total.toLocaleString() }}</b></button></div>
        </template>

        <template v-else-if="mode==='admin' && adminPage==='contracts'"><div class="page-intro"><div><span class="eyebrow">CONTRACTS</span><h2>合同上传与核对</h2><p>演示合同先进入待核对状态，确认后才能用于报价。</p></div><button class="primary-btn" @click="openImport"><el-icon><UploadFilled /></el-icon>上传演示合同</button></div><div class="toolbar"><el-input v-model="contractQuery" placeholder="搜索船公司、文件或航线" clearable style="max-width:340px" /><el-tag type="warning">{{ data.contracts.filter(c=>c.status==='待核对').length }} 份待核对</el-tag></div><div class="panel table-panel"><table><thead><tr><th>船公司 / 文件</th><th>适用航线</th><th>有效期至</th><th>条目</th><th>状态</th><th>操作</th></tr></thead><tbody><tr v-for="c in visibleContracts" :key="c.id"><td><b>{{ c.carrier }}</b><small>{{ c.name }}</small></td><td>{{ c.route }}</td><td>{{ c.expires }}</td><td>{{ c.rows }} 条</td><td><el-tag :type="c.status==='待核对'?'warning':c.enabled?'success':'info'">{{ c.status==='待核对'?'待核对':c.enabled?'已启用':'已停用' }}</el-tag></td><td><button v-if="c.status==='待核对'" class="text-btn" @click="verify(c)">核对并启用</button><button v-else class="text-btn" @click="toggleContract(c)">{{ c.enabled?'停用':'启用' }}</button><button class="text-btn" @click="changeExpiry(c)">改有效期</button></td></tr></tbody></table></div></template>

        <template v-else-if="mode==='admin' && adminPage==='validity'"><div class="page-intro"><div><span class="eyebrow">VALIDITY CONTROL</span><h2>运价有效期管理</h2><p>检查合同到期日，点击“调整”即可更新演示数据。</p></div></div><div class="panel table-panel"><table><thead><tr><th>合同</th><th>船公司</th><th>到期日</th><th>状态</th><th>操作</th></tr></thead><tbody><tr v-for="c in [...data.contracts].sort((a,b)=>a.expires.localeCompare(b.expires))" :key="c.id"><td><b>{{ c.name }}</b></td><td>{{ c.carrier }}</td><td>{{ c.expires }}</td><td><el-tag :type="c.expires<'2026-10-07'?'danger':c.expires<='2026-10-31'?'warning':'success'">{{ c.expires<'2026-10-07'?'已过期':c.expires<='2026-10-31'?'本月到期':'有效' }}</el-tag></td><td><button class="text-btn" @click="changeExpiry(c)">调整有效期</button></td></tr></tbody></table></div></template>

        <template v-else-if="mode==='admin' && adminPage==='accounts'"><div class="page-intro"><div><span class="eyebrow">ACCESS</span><h2>用户账号与权限</h2><p>账号增减和状态为界面演示，正式权限需要后端校验。</p></div><button class="primary-btn" @click="accountDialog=true">新增演示账号</button></div><div class="panel table-panel"><table><thead><tr><th>姓名</th><th>角色</th><th>状态</th><th>操作</th></tr></thead><tbody><tr v-for="a in data.accounts" :key="a.id"><td><b>{{ a.name }}</b></td><td>{{ a.role }}</td><td><el-tag :type="a.enabled?'success':'info'">{{ a.enabled?'启用':'停用' }}</el-tag></td><td><button class="text-btn" @click="toggleAccount(a)">{{ a.enabled?'停用账号':'启用账号' }}</button></td></tr></tbody></table></div></template>

        <template v-else-if="mode==='admin' && adminPage==='rules'"><div class="page-intro"><div><span class="eyebrow">PRICING RULES</span><h2>报价规则</h2><p>调整后重新进行客户询价，即可看到演示价格变化。</p></div></div><div class="panel rules-panel"><div class="rules-grid"><label>演示加价比例（%）<el-input-number v-model="data.rules.markup" :min="0" :max="100" style="width:100%" /></label><label>报价有效天数<el-input-number v-model="data.rules.validityDays" :min="1" :max="90" style="width:100%" /></label></div><div class="rule-example">示例：模拟合同价 $2,150，按当前比例展示的客户单价约为 <b>${{ Math.round(2150*(1+Number(data.rules.markup||0)/100)).toLocaleString() }}</b>。</div><button class="primary-btn" @click="saveRules">保存演示规则</button></div></template>

        <template v-else-if="mode==='admin' && adminPage==='logs'"><div class="page-intro"><div><span class="eyebrow">ACTIVITY</span><h2>操作记录</h2><p>本机演示期间的合同、账号、规则和报价操作。</p></div><el-tag type="info">{{ data.logs.length }} 条记录</el-tag></div><div class="panel table-panel"><table><thead><tr><th>时间</th><th>操作</th><th>内容</th></tr></thead><tbody><tr v-for="l in data.logs" :key="l.id"><td>{{ l.time }}</td><td><b>{{ l.action }}</b></td><td>{{ l.detail }}</td></tr></tbody></table></div></template>
      </el-main></el-container></el-container>

  <el-dialog v-model="quoteDialog" title="生成演示报价单" width="520px"><div v-if="selected" class="dialog-summary"><b>{{ form.origin }} → {{ form.destination }}</b><span>{{ selected.carrier }} · {{ form.container }} × {{ form.quantity }} · 合计 ${{ (selected.price*form.quantity).toLocaleString() }}</span></div><el-form label-position="top"><el-form-item label="客户名称（必填）"><el-input v-model="customerName" placeholder="例如：示例贸易有限公司" maxlength="40" /></el-form-item><el-form-item label="报价备注"><el-input v-model="remarks" type="textarea" :rows="2" placeholder="例如：运价以最终订舱确认为准" maxlength="120" /></el-form-item></el-form><template #footer><el-button @click="quoteDialog=false">取消</el-button><el-button type="primary" @click="createQuote">生成报价单</el-button></template></el-dialog>
  <el-dialog v-model="activeRecord" title="演示报价单" width="650px"><div v-if="activeRecord" id="printable-quote"><div class="record-brand">ASW SMART FREIGHT <span>QUOTATION</span></div><h2>海运报价单</h2><p>报价单号：{{ activeRecord.id }}　·　生成时间：{{ activeRecord.created }}</p><div class="record-grid"><div><small>客户</small><b>{{ activeRecord.customer }}</b></div><div><small>航线</small><b>{{ activeRecord.route }}</b></div><div><small>柜型与数量</small><b>{{ activeRecord.container }} × {{ activeRecord.quantity }}</b></div><div><small>预计出货</small><b>{{ activeRecord.date }}</b></div><div><small>船公司 / 航次</small><b>{{ activeRecord.carrier }} · {{ activeRecord.vessel }}</b></div><div><small>预计航程</small><b>{{ activeRecord.days }} 天</b></div><div><small>报价有效至</small><b>{{ activeRecord.validUntil || '演示数据' }}</b></div><div><small>处理状态</small><b>{{ activeRecord.status || '待确认' }}</b></div></div><div class="record-total"><span>演示报价合计</span><strong>USD ${{ activeRecord.total.toLocaleString() }}</strong></div><p v-if="activeRecord.remarks">备注：{{ activeRecord.remarks }}</p><p class="record-disclaimer">本报价单使用模拟运价，仅供产品功能演示，不可用于真实交易或订舱。</p></div><template #footer><el-button @click="activeRecord=null">关闭</el-button><el-button v-if="mode==='admin' && activeRecord && activeRecord.status!=='已确认'" type="success" @click="confirmRecord(activeRecord)">确认演示报价</el-button><el-button type="primary" @click="printRecord(activeRecord)">打印 / 另存为 PDF</el-button></template></el-dialog>
  <el-dialog v-model="contractDialog" title="上传与核对演示合同" width="560px"><div class="import-box" @click="importReady=true;ElMessage.success('演示合同已解析')"><el-icon><UploadFilled /></el-icon><b>{{ importReady?'演示合同解析完成':'点击解析演示合同' }}</b><span>HMM_USWC_OCT_2026.xlsx · 模拟 32 条运价</span></div><div v-if="importReady" class="import-details"><div>船公司 <b>HMM</b></div><div>适用航线 <b>上海 → 洛杉矶</b></div><div>有效期至 <b>2026-10-31</b></div><div>处理方式 <b>导入后人工核对</b></div></div><p class="dialog-note">此处不会读取真实文件；Excel / CSV 导入将在后续版本接入。</p><template #footer><el-button @click="contractDialog=false">取消</el-button><el-button type="primary" @click="confirmImport">确认导入演示数据</el-button></template></el-dialog>
  <el-dialog v-model="accountDialog" title="新增演示账号" width="460px"><el-form label-position="top"><el-form-item label="姓名"><el-input v-model="accountForm.name" placeholder="请输入姓名" maxlength="30" /></el-form-item><el-form-item label="角色"><el-select v-model="accountForm.role" style="width:100%"><el-option label="业务员" value="业务员" /><el-option label="管理员" value="管理员" /></el-select></el-form-item></el-form><p class="dialog-note">仅展示在演示列表，暂不提供真实登录权限。</p><template #footer><el-button @click="accountDialog=false">取消</el-button><el-button type="primary" @click="addAccount">添加账号</el-button></template></el-dialog>
</template>
