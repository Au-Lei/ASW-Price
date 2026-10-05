<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ArrowRight, Box, Calendar, Check, Clock, Collection, DataAnalysis,
  Document, Files, House, MagicStick, Menu, Plus, Search, Ship,
  Tickets, UploadFilled, UserFilled, Warning,
} from '@element-plus/icons-vue'

const activePage = ref('dashboard')
const sidebarCollapsed = ref(false)
const parsing = ref(false)
const showImport = ref(false)
const quoteLoading = ref(false)
const searched = ref(false)
const preference = ref('balanced')
const searchForm = reactive({ origin: '上海 SHANGHAI', destination: '洛杉矶 LOS ANGELES', container: '40HQ', date: '2026-10-18' })

const pageMeta = {
  dashboard: ['工作台', '业务数据与系统概览'],
  contracts: ['合同管理', '集中管理船公司运价合同'],
  quote: ['智能询价', '根据合同运价与船期快速匹配最优方案'],
  history: ['询价记录', '查看和追踪历史询价'],
}

const contracts = ref([
  { carrier: 'COSCO', name: 'COSCO_美西_202610.xlsx', route: '中国 - 美西', validity: '2026/10/01 - 10/31', rows: 48, status: '生效中', color: '#1259c3' },
  { carrier: 'ONE', name: 'ONE_TPEB_2026_OCT.xlsx', route: '中国 - 北美', validity: '2026/10/01 - 10/31', rows: 36, status: '生效中', color: '#e82c78' },
  { carrier: 'EMC', name: 'EMC_USWC_202610.xlsx', route: '中国 - 美西', validity: '2026/10/01 - 10/25', rows: 42, status: '即将到期', color: '#13875d' },
  { carrier: 'OOCL', name: 'OOCL_TPEB_Q4.xlsx', route: '亚洲 - 北美', validity: '2026/10/01 - 12/31', rows: 62, status: '生效中', color: '#d23632' },
])

const quotes = [
  { carrier: 'COSCO', vessel: 'OOCL POLAND / 062E', price: 2150, days: 15, etd: '10/18', eta: '11/02', score: 92, badge: '综合推荐', tone: 'primary', tags: ['直航', '船期匹配', '舱位充足'], reason: '虽然比最低价方案贵 $170，但可节约 6 天运输时间，且为直航，综合考虑价格、时效与中转风险，该航次性价比最高。' },
  { carrier: 'ONE', vessel: 'ONE HARMONY / 119E', price: 1980, days: 21, etd: '10/20', eta: '11/10', score: 85, badge: '最低价格', tone: 'success', tags: ['价格最优', '中转一次', '普通舱位'], reason: '当前价格最低，适合预算优先且交付时间宽松的货物；需在釜山中转，整体运输时间较长。' },
  { carrier: 'EMC', vessel: 'EVER MAX / 031E', price: 2320, days: 14, etd: '10/17', eta: '10/31', score: 87, badge: '最快方案', tone: 'warning', tags: ['时效最快', '直航', '舱位紧张'], reason: '全程仅 14 天，是当前最快方案。适合交付时间敏感的货物，但价格较最高且舱位相对紧张。' },
]

const historyRows = [
  { no: 'RFQ202610060023', route: '上海 → 洛杉矶', container: '40HQ × 2', preference: '综合推荐', result: 'COSCO · $2,150', time: '今天 14:32', user: 'Amy Chen' },
  { no: 'RFQ202610060022', route: '宁波 → 长滩', container: '40GP × 1', preference: '价格优先', result: 'ONE · $1,920', time: '今天 13:08', user: 'Leo Wang' },
  { no: 'RFQ202610060021', route: '深圳 → 汉堡', container: '20GP × 3', preference: '时效优先', result: 'CMA · $1,780', time: '今天 10:41', user: 'Amy Chen' },
  { no: 'RFQ202610050020', route: '上海 → 鹿特丹', container: '40HQ × 1', preference: '综合推荐', result: 'COSCO · $2,420', time: '昨天 17:19', user: 'Jason Liu' },
]

const title = computed(() => pageMeta[activePage.value][0])
const subtitle = computed(() => pageMeta[activePage.value][1])

function openUpload() { showImport.value = true }
function simulateParse() {
  parsing.value = true
  setTimeout(() => { parsing.value = false }, 1500)
}
function confirmImport() {
  contracts.value.unshift({ carrier: 'HMM', name: 'HMM_USWC_OCT_2026.xlsx', route: '中国 - 美西', validity: '2026/10/06 - 10/31', rows: 32, status: '生效中', color: '#6236b5' })
  showImport.value = false
  ElMessage.success('合同已导入，32 条运价可用于询价')
}
function doSearch() {
  quoteLoading.value = true
  searched.value = false
  setTimeout(() => { quoteLoading.value = false; searched.value = true }, 900)
}
function gotoQuote() { activePage.value = 'quote'; searched.value = false }
</script>

<template>
  <el-container class="app-shell">
    <el-aside :width="sidebarCollapsed ? '78px' : '244px'" class="sidebar">
      <div class="brand">
        <div class="brand-mark"><el-icon><Ship /></el-icon></div>
        <div v-if="!sidebarCollapsed" class="brand-copy"><b>ASW</b><span>SMART FREIGHT</span></div>
      </div>
      <nav class="nav-list">
        <button v-for="item in [
          ['dashboard','工作台',House],['contracts','合同管理',Files],['quote','智能询价',MagicStick],['history','询价记录',Tickets]
        ]" :key="item[0]" :class="['nav-item', { active: activePage === item[0] }]" @click="activePage = item[0]">
          <el-icon><component :is="item[2]" /></el-icon><span v-if="!sidebarCollapsed">{{ item[1] }}</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <div v-if="!sidebarCollapsed" class="support"><el-icon><Warning /></el-icon><div><b>需要帮助？</b><span>联系系统管理员</span></div></div>
        <button class="collapse" @click="sidebarCollapsed = !sidebarCollapsed"><el-icon><Menu /></el-icon></button>
      </div>
    </el-aside>

    <el-container>
      <el-header class="topbar">
        <div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>
        <div class="top-actions"><span class="system-status"><i></i>系统运行正常</span><div class="avatar">AC</div><div class="user"><b>Amy Chen</b><span>销售经理</span></div></div>
      </el-header>

      <el-main class="main-area">
        <template v-if="activePage === 'dashboard'">
          <section class="hero">
            <div><span class="eyebrow">ASW INTELLIGENT PRICING</span><h2>下午好，Amy 👋</h2><p>今天已有 <b>23</b> 次询价，系统为团队预计节省 <b>4.6 小时</b>。</p></div>
            <button class="primary-btn" @click="gotoQuote"><el-icon><MagicStick /></el-icon>发起智能询价</button>
          </section>
          <section class="stats-grid">
            <article v-for="stat in [
              ['本月有效合同','12','较上月 +2',Collection,'blue'],['合作船公司','6','覆盖主流航线',Ship,'purple'],['可报价航线','128','本周新增 16',DataAnalysis,'green'],['今日询价','23','较昨日 +18%',Search,'orange']
            ]" :key="stat[0]" class="stat-card"><div :class="['stat-icon',stat[4]]"><el-icon><component :is="stat[3]" /></el-icon></div><div><span>{{ stat[0] }}</span><strong>{{ stat[1] }}</strong><small>{{ stat[2] }}</small></div></article>
          </section>
          <section class="dashboard-grid">
            <article class="panel activity-panel"><div class="panel-head"><div><h3>最近询价</h3><p>团队最新报价动态</p></div><button class="text-btn" @click="activePage='history'">查看全部 <el-icon><ArrowRight /></el-icon></button></div>
              <div class="activity" v-for="row in historyRows.slice(0,3)" :key="row.no"><div class="route-icon"><el-icon><Ship /></el-icon></div><div class="activity-main"><b>{{ row.route }}</b><span>{{ row.container }} · {{ row.user }}</span></div><div><b>{{ row.result }}</b><span>{{ row.time }}</span></div></div>
            </article>
            <article class="panel quick-panel"><div class="panel-head"><div><h3>快捷操作</h3><p>高频业务入口</p></div></div>
              <button @click="gotoQuote"><span class="quick-icon blue"><el-icon><MagicStick /></el-icon></span><div><b>智能询价</b><small>多方案实时比价与推荐</small></div><el-icon><ArrowRight /></el-icon></button>
              <button @click="activePage='contracts';openUpload()"><span class="quick-icon green"><el-icon><UploadFilled /></el-icon></span><div><b>上传合同</b><small>AI 识别船公司运价表</small></div><el-icon><ArrowRight /></el-icon></button>
            </article>
          </section>
          <section class="panel contract-health"><div class="panel-head"><div><h3>合同概览</h3><p>重点合同状态与数据质量</p></div><button class="text-btn" @click="activePage='contracts'">管理合同 <el-icon><ArrowRight /></el-icon></button></div>
            <div class="health-grid"><div v-for="c in contracts.slice(0,4)" :key="c.carrier" class="health-item"><span class="carrier-logo" :style="{background:c.color}">{{ c.carrier }}</span><div><b>{{ c.carrier }} 美西航线</b><span>{{ c.validity }}</span></div><el-tag :type="c.status==='即将到期'?'warning':'success'" effect="light">{{ c.status }}</el-tag></div></div>
          </section>
        </template>

        <template v-else-if="activePage === 'contracts'">
          <div class="toolbar"><div class="filter-input"><el-icon><Search /></el-icon><input placeholder="搜索合同名称、船公司或航线" /></div><button class="primary-btn" @click="openUpload"><el-icon><Plus /></el-icon>上传报价合同</button></div>
          <div class="notice"><el-icon><MagicStick /></el-icon><div><b>AI 合同解析已启用</b><span>支持 Excel / CSV，自动识别船公司、港口、柜型、运价及有效期。</span></div></div>
          <div class="panel table-panel">
            <table><thead><tr><th>船公司</th><th>合同文件</th><th>适用航线</th><th>有效期</th><th>运价条目</th><th>状态</th><th></th></tr></thead>
              <tbody><tr v-for="c in contracts" :key="c.name"><td><span class="carrier-logo" :style="{background:c.color}">{{ c.carrier }}</span></td><td><b>{{ c.name }}</b><small>Excel · 已解析</small></td><td>{{ c.route }}</td><td>{{ c.validity }}</td><td>{{ c.rows }} 条</td><td><el-tag :type="c.status==='即将到期'?'warning':'success'">{{ c.status }}</el-tag></td><td><button class="dots">•••</button></td></tr></tbody>
            </table>
          </div>
        </template>

        <template v-else-if="activePage === 'quote'">
          <div v-if="!searched" class="quote-layout">
            <section class="panel quote-form-panel"><div class="form-heading"><span><el-icon><MagicStick /></el-icon></span><div><h2>开始智能询价</h2><p>填写运输需求，系统将从有效合同中匹配最优方案</p></div></div>
              <div class="route-fields"><label>起运港（POL）<el-select v-model="searchForm.origin" size="large"><el-option label="上海 SHANGHAI" value="上海 SHANGHAI"/><el-option label="宁波 NINGBO" value="宁波 NINGBO"/><el-option label="深圳 SHENZHEN" value="深圳 SHENZHEN"/></el-select></label><div class="route-arrow"><el-icon><ArrowRight /></el-icon></div><label>目的港（POD）<el-select v-model="searchForm.destination" size="large"><el-option label="洛杉矶 LOS ANGELES" value="洛杉矶 LOS ANGELES"/><el-option label="长滩 LONG BEACH" value="长滩 LONG BEACH"/><el-option label="汉堡 HAMBURG" value="汉堡 HAMBURG"/></el-select></label></div>
              <div class="two-cols"><label>柜型<el-select v-model="searchForm.container" size="large"><el-option label="40HQ" value="40HQ"/><el-option label="40GP" value="40GP"/><el-option label="20GP" value="20GP"/></el-select></label><label>预计出货日期<el-date-picker v-model="searchForm.date" type="date" value-format="YYYY-MM-DD" size="large" style="width:100%"/></label></div>
              <div class="preference"><label class="label-title">方案偏好</label><div class="preference-grid"><button v-for="p in [['price','价格优先','优先选择最低运价'],['balanced','综合推荐','平衡价格、时效与风险'],['speed','时效优先','优先选择最快航程']]" :key="p[0]" :class="{active:preference===p[0]}" @click="preference=p[0]"><i></i><div><b>{{p[1]}}</b><span>{{p[2]}}</span></div></button></div></div>
              <button class="search-btn" :disabled="quoteLoading" @click="doSearch"><el-icon v-if="!quoteLoading"><Search /></el-icon><span>{{ quoteLoading ? '正在匹配合同与船期…' : '查询最优方案' }}</span></button>
            </section>
            <aside class="quote-tip"><el-icon><MagicStick /></el-icon><h3>AI 智能推荐</h3><p>系统会综合分析合同价格、航程时效、直航情况、船期匹配度与舱位风险。</p><ul><li><el-icon><Check /></el-icon>自动匹配有效合同</li><li><el-icon><Check /></el-icon>多维度评分排序</li><li><el-icon><Check /></el-icon>生成可解释推荐理由</li></ul></aside>
          </div>

          <template v-else>
            <section class="result-head"><div><button class="back-link" @click="searched=false">← 修改询价条件</button><h2>{{ searchForm.origin.split(' ')[0] }} <span>→</span> {{ searchForm.destination.split(' ')[0] }}</h2><p>{{ searchForm.container }} · 预计 {{ searchForm.date }} 出货 · 共匹配 3 个方案</p></div><button class="outline-btn"><el-icon><Document /></el-icon>导出报价单</button></section>
            <div class="result-summary"><el-icon><MagicStick /></el-icon><div><b>AI 已完成方案分析</b><span>基于 4 份有效合同、12 个可用船期，为你推荐以下方案。综合推荐方案可比最低价节省 6 天。</span></div></div>
            <section class="quote-cards"><article v-for="(q,i) in quotes" :key="q.carrier" :class="['quote-card',q.tone,{recommended:i===0}]">
              <div v-if="i===0" class="recommend-ribbon">⭐ AI 综合推荐</div><div class="quote-top"><div><span class="carrier-logo" :class="q.tone">{{q.carrier}}</span><div><h3>{{q.carrier}}</h3><p>{{q.vessel}}</p></div></div><span :class="['badge',q.tone]">{{q.badge}}</span></div>
              <div class="sailing"><div><b>{{q.etd}}</b><span>ETD 上海</span></div><div class="sailing-line"><span>{{q.days}} 天 · {{i===1?'中转':'直航'}}</span><i></i></div><div><b>{{q.eta}}</b><span>ETA 洛杉矶</span></div></div>
              <div class="price-row"><div><small>合同运价</small><strong><sup>$</sup>{{q.price.toLocaleString()}}</strong><span>/ {{searchForm.container}}</span></div><div class="score"><b>{{q.score}}</b><span>综合评分</span></div></div>
              <div class="tags"><span v-for="tag in q.tags" :key="tag"><el-icon><Check /></el-icon>{{tag}}</span></div>
              <div class="reason"><b><el-icon><MagicStick /></el-icon>推荐分析</b><p>{{q.reason}}</p></div><button :class="['select-btn',q.tone]">选择此方案</button>
            </article></section>
          </template>
        </template>

        <template v-else>
          <div class="toolbar"><div class="filter-input"><el-icon><Search /></el-icon><input placeholder="搜索询价单号、航线或客户" /></div><button class="outline-btn"><el-icon><Calendar /></el-icon>最近 30 天</button></div>
          <div class="panel table-panel"><table><thead><tr><th>询价单号</th><th>航线</th><th>柜型/数量</th><th>偏好</th><th>推荐结果</th><th>询价时间</th><th>操作人</th></tr></thead><tbody><tr v-for="row in historyRows" :key="row.no"><td><a>{{row.no}}</a></td><td><b>{{row.route}}</b></td><td>{{row.container}}</td><td>{{row.preference}}</td><td><span class="result-pill">{{row.result}}</span></td><td>{{row.time}}</td><td><span class="mini-avatar">{{row.user[0]}}</span>{{row.user}}</td></tr></tbody></table></div>
        </template>
      </el-main>
    </el-container>
  </el-container>

  <el-dialog v-model="showImport" title="上传报价合同" width="660px" class="upload-dialog">
    <div v-if="!parsing" class="upload-zone" @click="simulateParse"><el-icon><UploadFilled /></el-icon><h3>拖拽文件到这里，或点击上传</h3><p>支持 .xlsx、.xls、.csv 格式，单个文件不超过 20MB</p><el-button type="primary">选择演示合同</el-button></div>
    <div v-else class="parsing"><span class="spinner"></span><h3>AI 正在解析合同…</h3><p>正在识别船公司、港口、柜型、运价与有效期</p><div class="progress"><i></i></div></div>
    <div v-if="!parsing" class="parsed-preview"><div class="preview-title"><span><el-icon><Check /></el-icon></span><div><b>演示合同已准备</b><small>HMM_USWC_OCT_2026.xlsx · 识别置信度 98%</small></div></div><div class="preview-grid"><div><span>船公司</span><b>HMM</b></div><div><span>有效期</span><b>2026/10/06 - 10/31</b></div><div><span>航线</span><b>上海 → 洛杉矶</b></div><div><span>识别条目</span><b>32 条</b></div><div><span>20GP</span><b>$1,860</b></div><div><span>40HQ</span><b>$2,180</b></div></div></div>
    <template #footer><el-button @click="showImport=false">取消</el-button><el-button type="primary" :disabled="parsing" @click="confirmImport">确认导入</el-button></template>
  </el-dialog>
</template>
