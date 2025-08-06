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
  padding: 16px;
  box-sizing: border-box;
}

/* 页面过渡动画 */
.fade-page-enter-active,
.fade-page-leave-active {
  transition: all 0.3s ease;
}

.fade-page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>