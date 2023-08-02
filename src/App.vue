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
  store.screenW = window.innerWidth
  store.screenH = window.innerHeight
  store.divFloatLeft = store.screenW * store.divFloatWRatio
  store.divFloatW = store.screenW - (store.divFloatLeft * 2)
  store.divFloatTop = store.screenH * store.divFloatHRatio
  store.divFloatH = store.screenH - (store.divFloatTop * 2)

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
  <!-- <div>hello</div>
  <icon class="iconfont icon-zip" type="success|success_no_circle|info|warn|waiting|cancel|download|search|clear"
    size="23" color="">
  </icon> -->
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
