<script setup lang="ts">
import { onMounted } from 'vue';

import { store } from './store';
import { jserver } from './tool/serverLink'
import { jFileCache } from './tool/fileCache';
import { JConfigType } from './type';
import { imgStore } from './imgStore';
import { imgCommon } from './tool/imgCommon';

import FileManager from "./components/FileManager.vue"
import ComicBottomBar from "./components/ComicBottomBar.vue"
import ComicOPPanel from "./components/ComicOPPanel.vue"
import ComicDisplayWaterfall from './components/ComicDisplayWaterfall.vue'
import ComicDisplayStandard from './components/ComicDisplayStandard.vue'
import ComicDisplayArea from './components/ComicDisplayArea.vue'



// const imgSrc = ref("")

const resizeFunc = () => {
  imgStore.screenW = document.body.clientWidth
  imgStore.screenH = document.body.clientHeight
  imgStore.divFloatLeft = imgStore.screenW * imgStore.divFloatWRatio
  imgStore.divFloatW = imgStore.screenW - (imgStore.divFloatLeft * 2)
  imgStore.divFloatTop = imgStore.screenH * imgStore.divFloatHRatio
  imgStore.divFloatH = imgStore.screenH - (imgStore.divFloatTop * 2)
  store.displayFileCol = Math.floor(imgStore.screenW / 150) + 2
  store.displayFileIconSize = Math.floor(imgStore.screenW / 25) + 20
  store.displayFileTextCount = Math.floor(imgStore.screenW / 100) + 5

}

onMounted(async () => {

  let txt = await fetch("./config.jsonc").then(res => res.text())
  let config: JConfigType = eval(`(${txt})`)
  if (import.meta.env.DEV) {
    if (config.node_dev_domain) {
      jserver.domain = config.node_dev_domain
    }
    if (config.node_dev_port) {
      jserver.port = config.node_dev_port
    }
  }
  else if (import.meta.env.PROD) {
    if (config.node_build_host) {
      jserver.host = config.node_build_host
    }
  }
  let url = new URL(document.location.href)
  if (url.searchParams.get('nodedomain')) {
    let host = `http${url.searchParams.get("nodessl") ? "s" : ''}://` + url.searchParams.get('nodedomain')
    if (url.searchParams.get('nodeport')) {
      host += `:${url.searchParams.get('nodeport')}`
    }
    jserver.host = host
  }
  resizeFunc()

  await jserver.init()

  let v = await jFileCache.init(jserver, config)
  // if (v) {
  await imgCommon.init(v)
  // }
  store.isServerCompleted = true
  window.addEventListener("resize", () => {
    resizeFunc()
  })


  // watch(()=>[store.readMode],()=>{

  // })
})

</script>

<template>
  <div class="app" :style="{ 'background-color': store.background }">
    <van-config-provider theme="dark">
      <div v-if="store.isServerCompleted">
        <ComicDisplayWaterfall v-if="store.readMode == 'udWaterfall'"></ComicDisplayWaterfall>
        <ComicDisplayStandard v-if="store.readMode != 'udWaterfall'"></ComicDisplayStandard>
        <ComicDisplayArea v-if="imgStore.displayArea"></ComicDisplayArea>
        <FileManager v-if="store.displayFileManager"></FileManager>
        <ComicOPPanel v-if="store.displayOPPanel"></ComicOPPanel>
        <ComicBottomBar v-if="store.displayBottomBar"></ComicBottomBar>

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
</style>
