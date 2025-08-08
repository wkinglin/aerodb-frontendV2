<template>
    <div class="app-container">
        <side-bar class="sidebar" :is-collapsed="isCollapsed"></side-bar>
        <div class="main-container">
            <m-header class="header" @toggle-sidebar="toggleSidebar"></m-header>
            <el-main class="main-content">
                <app-main></app-main>
            </el-main>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import SideBar from "./Components/SideBar.vue";
import MHeader from "./Components/MHeader.vue";
import AppMain from "./Components/AppMain.vue";

// 侧边栏折叠状态
const isCollapsed = ref(true);

// 切换侧边栏折叠状态
const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.app-container {
    display: flex;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
}

.app-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 70%);
    pointer-events: none;
}

.sidebar {
    height: 100%;
    z-index: 100;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    backdrop-filter: blur(16px);
    background: rgba(255, 255, 255, 0.95);
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
}

.sidebar::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    pointer-events: none;
}

.main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: 8px 8px 8px 0;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.header {
    height: 70px;
    width: 100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
    backdrop-filter: blur(20px);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
    z-index: 99;
    border-radius: 16px 16px 0 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: relative;
}

.header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%);
}

.main-content {
    flex: 1;
    padding: 24px;
    background: linear-gradient(135deg, #f8faff 0%, #f1f5ff 100%);
    overflow: auto;
    border-radius: 0 0 16px 16px;
    position: relative;
}

.main-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
        radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.03) 0%, transparent 50%);
    pointer-events: none;
    border-radius: 0 0 16px 16px;
}

/* 滚动条样式 */
.main-content::-webkit-scrollbar {
    width: 8px;
}

.main-content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    transition: background 0.3s ease;
}

.main-content::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .main-container {
        margin: 4px 4px 4px 0;
        border-radius: 12px;
    }
    
    .header {
        height: 64px;
        border-radius: 12px 12px 0 0;
    }
    
    .main-content {
        padding: 16px;
        border-radius: 0 0 12px 12px;
    }
}

@media (max-width: 768px) {
    .app-container {
        flex-direction: column;
    }
    
    .sidebar {
        height: auto;
        order: 2;
        box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
    }
    
    .main-container {
        order: 1;
        margin: 4px;
        flex: 1;
    }
}
</style>
