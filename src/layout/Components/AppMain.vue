<template>
  <div class="app-main-container">
    <transition name="fade-page" mode="out-in">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </transition>
  </div>
</template>

<script lang="ts" setup>
// AppMain 组件不需要额外的逻辑
</script>

<style scoped>
.app-main-container {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: auto;
  padding: 20px;
  box-sizing: border-box;
  background: transparent;
}

.app-main-container::-webkit-scrollbar {
  width: 8px;
  background: transparent;
}

.app-main-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  margin: 4px 0;
}

.app-main-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.app-main-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%);
  transform: scaleY(1.1);
}

/* 页面过渡动画 */
.fade-page-enter-active,
.fade-page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-page-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.98);
  filter: blur(4px);
}

.fade-page-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(1.02);
  filter: blur(2px);
}

.fade-page-enter-active {
  transition-delay: 0.1s;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .app-main-container {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .app-main-container {
    padding: 12px;
  }

  .fade-page-enter-from {
    transform: translateY(20px) scale(0.99);
    filter: blur(2px);
  }

  .fade-page-leave-to {
    transform: translateY(-10px) scale(1.01);
    filter: blur(1px);
  }
}

/* 内容区域优化 */
.app-main-container>* {
  position: relative;
  z-index: 1;
}

/* 为内容添加柔和的进入动画 */
.app-main-container>*:first-child {
  animation: contentSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  animation-fill-mode: both;
}

@keyframes contentSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>