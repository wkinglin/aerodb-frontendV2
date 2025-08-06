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
  padding: 0 16px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  -webkit-app-region: drag;
  -webkit-user-select: none;
}

/* 左侧区域 */
.left-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-toggle {
  color: #409EFF;
}

.page-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-left: 4px;
}

/* 右侧区域 */
.right-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 8px;
  -webkit-app-region: no-drag;
  cursor: pointer;
}

.user-avatar {
  background-color: #e6f1fc;
  color: #409EFF;
}

.window-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 图标按钮 */
.icon-btn {
  -webkit-app-region: no-drag;
  cursor: pointer;
  font-size: 18px;
  width: 32px;
  height: 32px;
  color: #606266;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background-color: #f5f7fa;
}

.close-btn:hover {
  background-color: #f56c6c;
  color: #fff;
}
</style>