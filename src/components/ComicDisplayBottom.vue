<script setup lang="ts">

import { store } from '../store'
import { imgStore } from '../imgStore'

</script>
<template>
    <div class="bottom_div none_Touch" :style="{ 'bottom': imgStore.msgBottom + 'px' }">
        <!-- 第几页 -->
        <div class="vintage2 none_Touch" v-if="store.isDisplayMediaNum" :style="{ 'color': store.textMsgColor }">
            {{ store.displayIndex + 1 }}/{{ imgStore.len }}</div>
        <!-- 文件信息 -->
        <div class="vintage2 none_Touch" :style="{ 'color': store.textMsgColor }" v-if="store.isDisplayFileName">{{
            store.fileName + (imgStore.zipInFileName ? (' /' + imgStore.zipInFileName) : '')
        }}</div>
        <!-- 测试用的 -->
        <div class="vintage2 none_Touch" :style="{ 'color': store.textMsgColor }"
            v-if="store.isDisplayDebugMsg && store.isControlDebug">{{ imgStore.debugMsg }}</div>

    </div>
</template>
<style scoped>
.none_Touch {
    pointer-events: none;
}

.bottom_div {
    position: absolute;
    text-align: center;
    left: 0px;
    width: 100%;

}
</style>