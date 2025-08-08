<template>
  <div class="header-container">
    <!-- 左侧区域 -->
    <div class="left-section">
      <el-icon class="menu-toggle icon-btn" @click="toggleSidebar">
        <Menu />
      </el-icon>
      <el-icon class="back-btn icon-btn" @click="returnPage">
        <Back />
      </el-icon>
      <div class="page-title">
        {{ $route.name }}
      </div>
    </div>

    <!-- 右侧区域 -->
    <div class="right-section">
      <!-- 用户信息 -->
      <div class="user-info">
        <el-avatar :size="32" class="user-avatar">
          <el-icon>
            <User />
          </el-icon>
        </el-avatar>
      </div>

      <!-- 窗口控制 -->
      <div class="window-controls">
        <el-icon class="icon-btn" @click="minimizeWin">
          <Minus />
        </el-icon>
        <el-icon class="icon-btn" @click="maximizeWin">
          <FullScreen />
        </el-icon>
        <el-icon class="icon-btn close-btn" @click="closeWin">
          <Close />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import {
  Back,
  Menu,
  Minus,
  FullScreen,
  Close,
  User
} from '@element-plus/icons-vue'

const router = useRouter()

// 定义事件
const emit = defineEmits(['toggleSidebar'])

// 切换侧边栏
const toggleSidebar = () => {
  emit('toggleSidebar')
}

// 返回上一页
const returnPage = () => {
  router.go(-1)
}

// 窗口控制函数
const minimizeWin = () => {
  window.ipcRenderer?.send('window-min')
}

const maximizeWin = () => {
  window.ipcRenderer?.send('window-max')
}

const closeWin = () => {
  window.ipcRenderer?.send('window-close')
}
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 24px;
  background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  -webkit-app-region: drag;
  -webkit-user-select: none;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
  pointer-events: none;
}

.header-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 24px;
  right: 24px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.2) 50%, transparent 100%);
}

/* 左侧区域 */
.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1;
}

.menu-toggle {
  color: #667eea;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 10px;
  padding: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-toggle:hover {
  background: rgba(102, 126, 234, 0.15);
  transform: rotate(90deg);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.back-btn {
  color: #8492a6;
  transition: all 0.3s ease;
}

.back-btn:hover {
  color: #667eea;
  transform: translateX(-2px);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-left: 8px;
  position: relative;
  background: linear-gradient(135deg, #2c3e50 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 30px;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1px;
  animation: titleUnderline 2s ease-in-out infinite;
}

@keyframes titleUnderline {
  0%, 100% { width: 30px; opacity: 0.6; }
  50% { width: 50px; opacity: 1; }
}

/* 右侧区域 */
.right-section {
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 16px;
  background: rgba(102, 126, 234, 0.08);
  -webkit-app-region: no-drag;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.user-info:hover {
  background: rgba(102, 126, 234, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}

.window-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.03);
}

/* 图标按钮 */
.icon-btn {
  -webkit-app-region: no-drag;
  cursor: pointer;
  font-size: 16px;
  width: 36px;
  height: 36px;
  color: #8492a6;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.icon-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.08);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.icon-btn:hover::before {
  opacity: 1;
}

.icon-btn:hover {
  color: #667eea;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.icon-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.close-btn:hover {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%) !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4) !important;
}

.close-btn:hover::before {
  display: none;
}

/* 窗口控制按钮特殊样式 */
.window-controls .icon-btn:first-child:hover {
  background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(254, 202, 87, 0.4);
}

.window-controls .icon-btn:nth-child(2):hover {
  background: linear-gradient(135deg, #48dbfb 0%, #0abde3 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(72, 219, 251, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }
  
  .left-section {
    gap: 12px;
  }
  
  .right-section {
    gap: 12px;
  }
  
  .page-title {
    font-size: 16px;
    margin-left: 4px;
  }
  
  .user-info {
    padding: 6px 12px;
    border-radius: 12px;
  }
  
  .icon-btn {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}

/* 动画效果 */
@keyframes headerGlow {
  0%, 100% { 
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); 
  }
  50% { 
    box-shadow: 0 4px 24px rgba(102, 126, 234, 0.12); 
  }
}

.header-container {
  animation: headerGlow 4s ease-in-out infinite;
}
</style>