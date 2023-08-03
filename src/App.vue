<script setup lang="ts">
import { onMounted } from 'vue';
// import HelloWorld from './components/HelloWorld.vue'
import ComicDisplay from "./components/ComicDisplay.vue"
import ComicControl from "./components/ComicControl.vue"
import FileManager from "./components/FileManager.vue"

import { store } from './store';
import { jserver } from './tool/serverLink'
import { jFileCache } from './tool/fileCache';

// const imgSrc = ref("")

const resizeFunc = () => {
  store.screenW = document.body.clientWidth
  store.screenH = document.body.clientHeight
  console.log(store.screenW, store.screenH)
  store.divFloatLeft = store.screenW * store.divFloatWRatio
  store.divFloatW = store.screenW - (store.divFloatLeft * 2)
  store.divFloatTop = store.screenH * store.divFloatHRatio
  store.divFloatH = store.screenH - (store.divFloatTop * 2)
  store.displayFileCol = Math.floor(store.screenW / 150) + 2
  store.displayFileIconSize = Math.floor(store.screenW / 25) + 20
  store.displayFileTextCount = Math.floor(store.screenW / 100) + 5
}

onMounted(async () => {
  await jserver.init()
  await jserver.test()
  jFileCache.init(jserver)
  // await jserver.testFolder()
  store.isServerCompleted = true
  store.displayFileManager = true
  resizeFunc()
  window.addEventListener("resize", () => {
    resizeFunc()
  })
})

</script>

<template>
  <div v-if="store.isServerCompleted">
    <ComicDisplay></ComicDisplay>
    <ComicControl></ComicControl>
    <FileManager v-if="store.displayFileManager"></FileManager>
  </div>

  <!-- 测试 -->
  <!-- <van-grid :gutter="10" style="{overflow:auto;}">
    <van-grid-item v-for="value in 300" :key="value" icon="photo-o" text="文字" />
  </van-grid> -->
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.trpc {
  color: red;
}
</style>
