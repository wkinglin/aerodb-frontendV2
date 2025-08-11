<template>
  <div>
    <el-aside width="auto">
      <el-menu :collapse="isCollapse" default-active="$route.path" router class="el-menu-vertical-demo"
        background-color="#FFFFFF">
        <div class="logo-container" :class="{ 'collapsed': isCollapse }">
          <div class="logo-wrapper">
            <el-avatar :size="40" class="logo-avatar">
              <img src="@/assets/icon.png" alt="logo" />
            </el-avatar>
            <div v-if="!isCollapse" class="app-info">
              <h3 class="app-title">可靠性评估</h3>
              <p class="app-subtitle">智能分析系统</p>
            </div>
          </div>
        </div>
        <el-menu-item index="/dashboard">
          <el-icon>
            <House />
          </el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <el-menu-item index="/algTable">
          <el-icon>
            <List />
          </el-icon>
          <template #title>查看算法</template>
        </el-menu-item>

        <el-menu-item index="/newTable">
          <el-icon>
            <Plus />
          </el-icon>
          <template #title>查看数据库</template>
        </el-menu-item>

        <el-menu-item index="/create">
          <el-icon>
            <Edit />
          </el-icon>
          <template #title>创建算法</template>
        </el-menu-item>

        <el-menu-item index="/flowChart">
          <el-icon>
            <View />
          </el-icon>
          <template #title>查看产品树</template>
        </el-menu-item>

        <el-menu-item index="/upLoad">
          <el-icon>
            <Top />
          </el-icon>
          <template #title>上传文件</template>
        </el-menu-item>

        <el-menu-item index="/seeRect">
          <el-icon>
            <Edit />
          </el-icon>
          <template #title>自定义框图</template>
        </el-menu-item>

        <el-menu-item index="/calHotAndCold">
          <el-icon>
            <Place />
          </el-icon>
          <template #title>计算冷热备份可靠度</template>
        </el-menu-item>

        <el-menu-item index="/document">
          <el-icon>
            <Document />
          </el-icon>
          <template #title>文档</template>
        </el-menu-item>

      </el-menu>
    </el-aside>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// 接收父组件传递的折叠状态
const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: true
  }
})

// 使用父组件传递的折叠状态
const isCollapse = ref(props.isCollapsed)

// 监听属性变化
watch(() => props.isCollapsed, (newVal: boolean) => {
  isCollapse.value = newVal
})
</script>

<style>
/* Logo 容器样式 */
.logo-container {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.logo-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%);
}

.logo-container.collapsed {
  padding: 20px 12px;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  position: relative;
}

.logo-avatar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.logo-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-info {
  flex: 1;
  text-align: left;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.app-title {
  color: #2c3e50;
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  margin-bottom: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.app-subtitle {
  color: #8492a6;
  font-size: 12px;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.5px;
}

/* 菜单样式 */
.el-menu {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: none;
  background: transparent !important;
  padding: 8px 0;
}

.el-menu::-webkit-scrollbar {
  width: 4px;
}

.el-menu::-webkit-scrollbar-track {
  background: transparent;
}

.el-menu::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.el-menu-item {
  font-size: 14px !important;
  height: 56px !important;
  line-height: 56px !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 4px 12px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: transparent;
  border: none;
  color: #5a6c7d;
  font-weight: 500;
  display: flex;
  /* 设置为flex布局，以便在展开时对齐图标和文字 */
  align-items: center;
  /* 垂直居中对齐 */
}

.el-menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px;
}

.el-menu-item:hover::before {
  opacity: 1;
}

.el-menu-item:hover {
  background: transparent !important;
  color: #667eea;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.el-menu-item.is-active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%) !important;
  color: #667eea !important;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.el-menu-item .el-icon {
  margin-right: 12px;
  font-size: 18px;
  transition: all 0.3s ease;
}

.el-menu-item:hover .el-icon {
  transform: scale(1.1);
}

.el-menu-item.is-active .el-icon {
  color: #667eea;
  transform: scale(1.1);
}

/* --- 修改开始：折叠状态下的样式 --- */
.el-menu--collapse .el-menu-item {
  /*
    使用 Flexbox 实现完美的水平和垂直居中
    这会覆盖上面 .el-menu-item 的 align-items 设置
  */
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */

  /* 调整折叠后的边距和内边距 */
  margin: 4px 8px;
  padding: 0 !important;
  /* 清除可能存在的内边距干扰 */
}

.el-menu--collapse .el-menu-item .el-icon {
  /* 清除展开状态下的右边距，以确保图标完全居中 */
  margin-right: 0;
  font-size: 20px;
  /* 可以在这里微调图标大小 */
}

/*
  当菜单折叠时，Element Plus 会用一个 tooltip 包裹内容。
  我们需要确保这个包裹容器也居中显示。
*/
.el-menu--collapse .el-menu-item .el-tooltip__trigger {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  /* 确保触发器占满整个菜单项宽度 */
  height: 100%;
}

/* --- 修改结束 --- */

/* 容器样式 */
.el-aside {
  text-align: left;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.el-aside::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
  backdrop-filter: blur(10px);
  z-index: -1;
}

/* 隐藏滚动条但保留滚动功能 */
div::-webkit-scrollbar {
  width: 4px;
}

div::-webkit-scrollbar-track {
  background: transparent;
}

div::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  border-radius: 2px;
}

div::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .logo-container {
    padding: 16px 12px;
  }

  .el-menu-item {
    height: 48px !important;
    line-height: 48px !important;
    font-size: 13px !important;
    margin: 2px 8px;
    border-radius: 10px;
  }

  .app-title {
    font-size: 14px;
  }

  .app-subtitle {
    font-size: 11px;
  }
}

/* 动画效果 */
.el-menu-item {
  animation: fadeInLeft 0.3s ease;
  animation-fill-mode: both;
}

.el-menu-item:nth-child(2) {
  animation-delay: 0.1s;
}

.el-menu-item:nth-child(3) {
  animation-delay: 0.15s;
}

.el-menu-item:nth-child(4) {
  animation-delay: 0.2s;
}

.el-menu-item:nth-child(5) {
  animation-delay: 0.25s;
}

.el-menu-item:nth-child(6) {
  animation-delay: 0.3s;
}

.el-menu-item:nth-child(7) {
  animation-delay: 0.35s;
}

.el-menu-item:nth-child(8) {
  animation-delay: 0.4s;
}

.el-menu-item:nth-child(9) {
  animation-delay: 0.45s;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>