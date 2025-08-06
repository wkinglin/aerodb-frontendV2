<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <transition>
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script lang="ts" setup>


</script>

<style>
#app {
  font-family: "微软雅黑";
  text-align: center;
  color: #2c3e50;
}

html,
body,
#app {
  overflow: hidden;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>