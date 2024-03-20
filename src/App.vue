<script setup lang="ts">
import { onMounted, watch } from 'vue';

import { store } from './store';
import { jserver } from './tool/serverLink'
import { jFileCache } from './tool/fileCache';
import { mediaStore } from './mediaStore';

import FileManager from "./components/FileManager.vue"
import ComicBottomBar from "./components/ComicBottomBar.vue"
import ComicOPPanel from "./components/ComicOPPanel.vue"
import ComicDisplayWaterfall from './components/ComicDisplayWaterfall.vue'
import ComicDisplayStandard from './components/ComicDisplayStandard.vue'
import ComicDisplayArea from './components/ComicDisplayArea.vue'
import { mainMediaCtrl } from './tool/mainMediaCtrl';
import NoSleep from "nosleep.js"



// const imgSrc = ref("")

const resizeFunc = () => {
  mediaStore.screenW = document.body.clientWidth
  mediaStore.screenH = document.body.clientHeight
  mediaStore.divFloatLeft = mediaStore.screenW * mediaStore.divFloatWRatio
  mediaStore.divFloatW = mediaStore.screenW - (mediaStore.divFloatLeft * 2)
  mediaStore.divFloatTop = mediaStore.screenH * mediaStore.divFloatHRatio
  mediaStore.divFloatH = mediaStore.screenH - (mediaStore.divFloatTop * 2)

  mediaStore.displayFileCol = Math.floor(mediaStore.screenW / 150) + 2
  mediaStore.displayFileIconSize = Math.floor(mediaStore.screenW / 25) + 20
  mediaStore.displayFileTextCount = Math.floor(mediaStore.screenW / 100) + 5
}

onMounted(async () => {

  let noSleep = new NoSleep()

  watch([() => mediaStore.noSleep], () => {
    if (mediaStore.noSleep > 0) {
      noSleep.enable()
    }
    else if (mediaStore.noSleep < 0) {
      noSleep.disable()
    }
  })

  // 禁止浏览器前进后退 另一部本在router的index.js中
  window.addEventListener('popstate', function () {
    history.pushState(null, null, document.URL)
  })

  if (import.meta.env.MODE == "development") {

  }
  else {

  }

  let url = new URL(document.location.href)
  store.urlkey = url.searchParams.get("key") || ""
  store.isControlDebug = url.searchParams.get("isControlDebug") == "1" ? true : false

  resizeFunc()

  await jserver.init()

  await jFileCache.init(jserver)

  mainMediaCtrl.initStorage()
  // let fileUrl = `${store.dirUrl}/${store.fileName}`
  // let v = await jserver.postIsFile(fileUrl)
  // if (v) {
  // }

  mediaStore.isServerCompleted = true
  window.addEventListener("resize", () => {
    resizeFunc()
  })

  setTimeout(() => {
    if (store.fileName) {
      mainMediaCtrl.openMedia(store.dirUrl, store.fileName, store.displayIndex)
    }
  }, 2000);



  //测试




  // watch(()=>[store.readMode],()=>{

  // })
})

</script>

<template>
  <div class="app" :style="{ 'background-color': store.background }">
    <van-config-provider theme="dark">
      <div v-if="mediaStore.isServerCompleted">
        <ComicDisplayWaterfall v-if="store.readMode == 'udWaterfall'"></ComicDisplayWaterfall>
        <ComicDisplayStandard v-if="store.readMode != 'udWaterfall'"></ComicDisplayStandard>
        <ComicDisplayArea v-if="mediaStore.displayArea"></ComicDisplayArea>
        <FileManager v-if="mediaStore.displayFileManager"></FileManager>
        <ComicOPPanel v-if="mediaStore.displayOPPanel"></ComicOPPanel>
        <ComicBottomBar v-if="mediaStore.displayBottomBar"></ComicBottomBar>

      </div>
    </van-config-provider>
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
</style>./mediaStore
./tool/mainMediaCtrl