<script setup lang="ts">

import { store } from '../store'
import { mediaMiddleData, mediaStore } from '../mediaStore'
import { onMounted, watch } from 'vue';
import { jFileCache } from '../tool/fileCache';

onMounted(() => {

    watch([() => store.displayIndex, () => store.dirUrl, () => store.fileName, () => store.isDisplayFileName], () => {
        if (mediaStore.isZip) {
            let c = mediaMiddleData?.list?.find(c => c.displayIndex == store.displayIndex)
            if (!c) {
                mediaStore.zipInFileName = ""
                return
            }
            let cc = jFileCache.getMediaCache(c)
            if (!cc) {
                mediaStore.zipInFileName = ""
                return
            }
            mediaStore.zipInFileName = cc?.zipInFileName || ""
            return
        }
        mediaStore.zipInFileName = ""

    })
})

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