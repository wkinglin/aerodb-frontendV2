import { createApp } from 'vue'
import './style.css'

import App from './App.vue'
import globalWebSocket from './global'
import router from './router/index'

import 'element-plus/dist/index.css'
import './assets/iconfont/iconfont.css'

import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Pinia
import { createPinia } from 'pinia'

// 创建应用实例
const app = createApp(App)

// 注册全局属性 (Vue3 方式)
app.provide('globalWebSocket', globalWebSocket)

// 使用插件
app.use(ElementPlus)
app.use(router)
app.use(createPinia())

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 初始化全局 WebSocket 连接
globalWebSocket.initGlobalWebSocket()

// 挂载应用
app.mount('#app')

// Electron IPC通信 (如果在Electron环境中)
if (window.ipcRenderer) {
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log('收到主进程消息:', message)
  })
}