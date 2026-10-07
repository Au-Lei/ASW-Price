import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs'
import { compileScript, parse } from '@vue/compiler-sfc'

mkdirSync('.preview-build', { recursive: true })
mkdirSync('dist/assets', { recursive: true })
cpSync('public', 'dist', { recursive: true })
for (const name of ['DemoApp', 'ComparisonTable', 'TodoCenter', 'OceanEntry']) {
  const source = readFileSync(`src/${name}.vue`, 'utf8')
  const { descriptor, errors } = parse(source, { filename: `src/${name}.vue` })
  if (errors.length) throw errors[0]
  const component = compileScript(descriptor, { id: `asw-${name}`, inlineTemplate: true })
  writeFileSync(`.preview-build/${name}.js`, component.content.replaceAll('.vue\'', '.js\''))
}
for (const name of ['demoData', 'demoLogic']) writeFileSync(`.preview-build/${name}.js`, readFileSync(`src/${name}.js`, 'utf8'))
writeFileSync('.preview-build/main.js', `import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '../src/styles.css'
import '../src/demo.css'
import '../src/marine.css'
import '../src/ocean-entry.css'
import '../src/customer.css'
import App from './DemoApp.js'
createApp(App).use(ElementPlus).mount('#app')
`)
writeFileSync('dist/index.html', `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ASW Smart Freight</title><link rel="stylesheet" href="/assets/main.css"></head><body><div id="app"></div><script type="module" src="/assets/main.js"></script></body></html>`)
console.log('Preview source prepared')
