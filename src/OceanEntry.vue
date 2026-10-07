<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

defineEmits(['customer', 'admin'])
const video = ref(null)
const playing = ref(false)
const failed = ref(false)
const ready = ref(false)
let motionPreference
let wanted = true
async function play() {
  if (!video.value || failed.value) return
  try { await video.value.play() } catch { playing.value = false }
}
function togglePlayback() {
  wanted = !playing.value
  if (wanted) play()
  else video.value?.pause()
}
function syncVisibility() {
  if (document.hidden) video.value?.pause()
  else if (wanted) play()
}
function syncMotion() {
  wanted = !motionPreference.matches
  if (wanted) play()
  else video.value?.pause()
}
onMounted(() => {
  motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncMotion()
  motionPreference.addEventListener('change', syncMotion)
  document.addEventListener('visibilitychange', syncVisibility)
})
onBeforeUnmount(() => {
  video.value?.pause()
  motionPreference?.removeEventListener('change', syncMotion)
  document.removeEventListener('visibilitychange', syncVisibility)
})
</script>

<template>
  <section class="ocean-entry" aria-label="ASW 海运服务入口">
    <div class="ocean-backdrop" aria-hidden="true">
      <video ref="video" class="ocean-video" :class="{ 'is-ready': ready && !failed }"
        muted loop playsinline preload="metadata" poster="/media/ocean-cargo-poster.jpg"
        @playing="playing=true;ready=true" @pause="playing=false"
        @error="failed=true;playing=false">
        <source src="/media/ocean-cargo.mp4" type="video/mp4" @error="failed=true;playing=false">
      </video>
    </div>
    <div class="ocean-shade" aria-hidden="true"></div>
    <header class="ocean-header">
      <div class="ocean-brand" aria-label="ASW Smart Freight">
        <svg viewBox="0 0 64 32" aria-hidden="true"><path d="M2 15c10 0 12-12 22-12s12 12 22 12h16M2 26c10 0 12-12 22-12s12 12 22 12h16" /></svg>
        <div><b>ASW</b><span>SMART FREIGHT</span></div>
      </div>
      <span class="ocean-header-note">智能海运 · 连接全球</span>
      <button class="ocean-header-login" @click="$emit('admin')">管理员登录 <span aria-hidden="true">↗</span></button>
    </header>
    <main class="ocean-content">
      <p class="ocean-kicker">ACROSS THE OCEAN. WITH CLARITY.</p>
      <h1>跨越海洋，<br>让报价更清晰。</h1>
      <p class="ocean-description">从一次询价，到合适的运输方案。<br>为每一票货物，找到更从容的选择。</p>
      <div class="ocean-actions">
        <button class="ocean-customer" @click="$emit('customer')">客户入口 <span aria-hidden="true">→</span></button>
        <button class="ocean-admin" @click="$emit('admin')">管理员登录 <span aria-hidden="true">↗</span></button>
      </div>
      <p class="ocean-service-note">智能询价 <span>／</span> 方案比较 <span>／</span> 报价记录</p>
      <a class="ocean-guide-link" href="/guide.html">使用说明 <span aria-hidden="true">↗</span></a>
    </main>
    <footer class="ocean-footer">
      <button class="ocean-playback" :disabled="failed" :aria-label="failed ? '视频不可用，已显示静态封面' : playing ? '暂停背景视频' : '播放背景视频'"
        :aria-pressed="playing" @click="togglePlayback">
        <span class="ocean-playback-icon" aria-hidden="true">{{ playing ? 'Ⅱ' : '▷' }}</span>
        <span>{{ failed ? '静态海景' : playing ? '暂停海景' : '播放海景' }}</span>
      </button>
      <p>演示版本 · 模拟运价，仅供功能展示</p>
      <span class="ocean-footer-tag">YOUR NEXT VOYAGE STARTS HERE</span>
    </footer>
  </section>
</template>
