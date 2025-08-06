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
}

.sidebar {
    height: 100%;
    z-index: 100;
    transition: width 0.3s;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.header {
    height: 60px;
    width: 100%;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    z-index: 99;
}

.main-content {
    flex: 1;
    padding: 20px;
    background-color: #f5f7fa;
    overflow: auto;
}
</style>
