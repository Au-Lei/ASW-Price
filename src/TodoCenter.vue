<script setup>
import { computed, ref } from 'vue'
import { getTodos } from './demoLogic.js'
const props = defineProps({ data: Object })
defineEmits(['handle'])
const filter = ref('all')
const todos = computed(() => getTodos(props.data))
const tabs = [['all','全部'],['check','待核对合同'],['expiry','临期 / 过期'],['quote','待确认报价']]
const visible = computed(() => todos.value.filter(t => filter.value==='all' || t.type===filter.value))
</script>

<template>
  <section class="panel todo-center"><div class="panel-head"><div><h3>待办中心</h3><p>点击具体事项处理，完成后数量自动更新。</p></div><span class="todo-total">{{ todos.length }} 项待处理</span></div><div class="todo-tabs"><button v-for="tab in tabs" :key="tab[0]" :class="{active:filter===tab[0]}" @click="filter=tab[0]">{{ tab[1] }} <span>{{ tab[0]==='all'?todos.length:todos.filter(t=>t.type===tab[0]).length }}</span></button></div><div v-if="!visible.length" class="todo-empty">当前分类没有待办事项</div><div v-for="todo in visible" :key="todo.key" class="todo-row"><span :class="['todo-type',todo.type]">{{ todo.type==='check'?'核对':todo.type==='expiry'?'有效期':'报价' }}</span><div class="todo-copy"><b>{{ todo.title }}</b><small>{{ todo.detail }}</small></div><div class="todo-date"><small>{{ todo.type==='quote'?'报价有效至':'合同有效至' }}</small><span>{{ todo.date }}</span></div><button class="outline-btn" @click="$emit('handle',todo)">{{ todo.action }}</button></div></section>
</template>
