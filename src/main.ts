import { createApp } from 'vue'
import './style.css'

import App from './App.vue'
import global from './global.ts'
// @ts-ignore
import router from './router/index.ts'

import 'element-plus/dist/index.css'
import './assets/iconfont/iconfont.css'

import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Pinia
import { createPinia } from 'pinia'

const app = createApp(App)

// 注册全局属性
app.config.globalProperties.global = global

// 初始化全局 WebSocket 连接
global.initGlobalWebSocket()

// 使用插件
app.use(ElementPlus)
app.use(router)
app.use(createPinia())

// 注册图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 挂载应用
app.mount('#app').$nextTick(() => {
  // Use contextBridge
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
})