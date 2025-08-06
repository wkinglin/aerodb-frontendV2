<template>
  <div>
    <el-aside width="auto">
      <el-menu :collapse="isCollapse" default-active="$route.path" router class="el-menu-vertical-demo"
        background-color="#FFFFFF">
        <el-menu-item style="margin-top:10px">
          <el-avatar class="imgLogo">
            <img src="@/assets/icon.png" alt="logo" />
          </el-avatar>
          <span v-if="!isCollapse" class="app-title">可靠性评估软件</span>
        </el-menu-item>
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
          <template #title>新建数据库</template>
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
watch(() => props.isCollapsed, (newVal) => {
  isCollapse.value = newVal
})
</script>

<style>
.logoLink {
  color: white !important;
  font-size: 15px;
  margin-left: 18px;
  display: inline-block;
  font-weight: bold;
  height: 100%;
  line-height: 50px;
}

.imgLogo {
  height: 45px;
  vertical-align: middle;
  float: left;
  margin-right: 5px;
  position: relative;
  margin-top: 5px;
}

.el-menu {
  height: 100%;
  overflow: hidden;
  /* 防止菜单内容溢出 */
}

.el-menu-item {
  font-size: 15px !important;
  height: 75px !important;
  /* 修复高度单位 */
  font-family: 微软雅黑 !important;
}

.el-menu-vertical-demo {
  height: 100%;
  vertical-align: middle;
  border-right: none;
  /* 移除右侧边框 */
}

.el-container {
  height: 100%;
}

.el-aside {
  /* background-color: #D3DCE6; */
  text-align: center;
  line-height: 200px;
  height: 100%;
  overflow: hidden;
  /* 隐藏滚动条 */
}

/* 隐藏滚动条但保留滚动功能 */
div::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
  width: 0;
}

div {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

/* 侧边栏包装器 */
.sidebar-wrapper {
  height: 100%;
  overflow: hidden;
}

/* 侧边栏容器 */
.sidebar-aside {
  transition: width 0.3s;
  overflow: hidden;
}

/* Logo 容器样式 */
.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  overflow: hidden;
}

/* 应用标题 */
.app-title {
  color: #000;
  font-size: 16px;
  font-weight: 600;
  margin-left: 10px;
  white-space: nowrap;
}
</style>