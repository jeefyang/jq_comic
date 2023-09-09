<script setup lang="ts">

import { store } from '../store'
import { imgStore } from '../imgStore'

</script>
<template>
    <div class="bottom_div" :style="{ 'bottom': imgStore.msgBottom + 'px' }">
        <!-- 第几页 -->
        <div class="vintage2" v-if="store.isDisplayImgNum" :style="{ 'color': store.textMsgColor }">
            {{ store.displayIndex + 1 }}/{{ imgStore.len }}</div>
        <!-- 文件信息 -->
        <div class="vintage2" :style="{ 'color': store.textMsgColor }" v-if="store.isDisplayFileName">{{
            store.fileName + (imgStore.zipInFileName ? (' /' + imgStore.zipInFileName) : '')
        }}</div>
        <!-- 测试用的 -->
        <div class="vintage2" :style="{ 'color': store.textMsgColor }"
            v-if="store.isDisplayDebugMsg && store.isControlDebug">{{ imgStore.debugMsg }}</div>

    </div>
</template>
<style scoped>
.bottom_div {
    position: absolute;
    text-align: center;
    left: 0px;
    width: 100%;
    pointer-events: none;
}
</style>