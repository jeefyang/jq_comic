<script setup lang="ts">

import { store } from '../store'
import { mediaStore } from '../mediaStore'

</script>
<template>
    <div class="bottom_div none_Touch" :style="{ 'bottom': mediaStore.msgBottom + 'px' }">
        <!-- 第几页 -->
        <div class="vintage2 none_Touch" v-if="store.isDisplayMediaNum" :style="{ 'color': store.textMsgColor }">
            {{ store.displayIndex + 1 }}/{{ mediaStore.len }}</div>
        <!-- 文件信息 -->
        <div class="vintage2 none_Touch" :style="{ 'color': store.textMsgColor }" v-if="store.isDisplayFileName">{{
            store.fileName + (mediaStore.zipInFileName ? (' /' + mediaStore.zipInFileName) : '')
        }}</div>
        <!-- 测试用的 -->
        <div class="vintage2 none_Touch" :style="{ 'color': store.textMsgColor }"
            v-if="store.isDisplayDebugMsg && store.isControlDebug">{{ mediaStore.debugMsg }}</div>

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
</style>../mediaStore