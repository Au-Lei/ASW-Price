import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { compileScript, parse } from '@vue/compiler-sfc'

const source = readFileSync('src/App.vue', 'utf8')
const { descriptor, errors } = parse(source, { filename: 'src/App.vue' })
if (errors.length) throw errors[0]
const component = compileScript(descriptor, { id: 'asw-preview', inlineTemplate: true })

mkdirSync('.preview-build', { recursive: true })
mkdirSync('dist/assets', { recursive: true })
writeFileSync('.preview-build/App.js', component.content)
writeFileSync('.preview-build/main.js', `import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '../src/styles.css'
import App from './App.js'
createApp(App).use(ElementPlus).mount('#app')
`)
writeFileSync('dist/index.html', `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ASW Smart Freight</title><link rel="stylesheet" href="/assets/main.css"></head><body><div id="app"></div><script type="module" src="/assets/main.js"></script></body></html>`)
console.log('Preview source prepared')
