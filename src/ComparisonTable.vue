<script setup>
import { ref } from 'vue'
defineProps({ options: Array, form: Object })
defineEmits(['select'])
const expanded = ref(null)
</script>

<template>
  <section class="panel comparison-panel" aria-label="海运方案对比">
    <div class="comparison-heading"><div><h3>方案对比</h3><p>价格统一以 USD 展示；开船、到港时间均为模拟计划。</p></div><span class="subtle-label">按当前偏好排序</span></div>
    <div class="comparison-scroll"><table class="comparison-table"><thead><tr><th>船公司 / 航次</th><th>客户报价</th><th>航程 / 路线</th><th>开船 ETD</th><th>到港 ETA</th><th>报价有效至</th><th>操作</th></tr></thead><tbody>
      <template v-for="(q,i) in options" :key="q.carrier"><tr :class="{ 'first-choice': i===0 }"><td><b>{{ q.carrier }}</b><span v-if="i===0" class="preferred-label">首选</span><small>{{ q.vessel }}</small></td><td><strong class="compare-price">${{ q.total.toLocaleString() }}</strong><small>${{ q.price.toLocaleString() }} / {{ form.container }} × {{ form.quantity }}</small></td><td><b>{{ q.days }} 天</b><small>{{ q.direct ? '直航' : '中转一次' }}</small></td><td>{{ q.etd }}</td><td>{{ q.eta }}</td><td>{{ q.validUntil }}</td><td><div class="compare-actions"><button class="primary-btn" @click="$emit('select',q)">选择方案</button><button class="text-btn" :aria-expanded="expanded===q.carrier" @click="expanded=expanded===q.carrier?null:q.carrier">{{ expanded===q.carrier?'收起详情':'方案详情' }}</button></div></td></tr>
      <tr v-if="expanded===q.carrier" class="comparison-detail"><td colspan="7"><div><b>推荐说明</b><p>{{ form.preference==='price'?'按客户总价从低到高排序，方便控制运输预算。':form.preference==='speed'?'按航程从短到长排序，优先考虑交付时间。':'按演示综合评分排序，综合比较价格、时效与中转情况。' }}{{ q.carrier }} {{ q.direct?'直航':'需要一次中转' }}，预计航程 {{ q.days }} 天，综合评分 {{ q.score }} / 100。</p><small>模拟运价来源：{{ q.contractName }}。报价未包含目的港清关、税费和陆运；真实费用需要人工确认。</small></div></td></tr></template>
    </tbody></table></div>
    <div class="comparison-mobile"><article v-for="(q,i) in options" :key="q.carrier"><div class="mobile-option-title"><b>{{ q.carrier }} <span v-if="i===0" class="preferred-label">首选</span></b><strong>${{ q.total.toLocaleString() }}</strong></div><p>{{ q.vessel }}</p><dl><div><dt>航程</dt><dd>{{ q.days }} 天 · {{ q.direct?'直航':'中转' }}</dd></div><div><dt>ETD / ETA</dt><dd>{{ q.etd }} / {{ q.eta }}</dd></div><div><dt>报价有效至</dt><dd>{{ q.validUntil }}</dd></div><div><dt>单价 / 柜量</dt><dd>${{ q.price.toLocaleString() }} × {{ form.quantity }}</dd></div></dl><p class="mobile-reason">综合评分 {{ q.score }} / 100 · {{ q.direct?'减少中转环节':'适合接受中转的运输需求' }}</p><button class="primary-btn" @click="$emit('select',q)">选择方案并生成报价</button></article></div>
  </section>
</template>
