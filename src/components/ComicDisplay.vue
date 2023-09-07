<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { store } from "../store"
import { imgStore, imgStoreDisplayChildTtype } from "../imgStore"
import { jImgScroll } from "../tool/imgScroll";
import { jDisplayAnime } from "../tool/anime";
import { jFileCache } from "../tool/fileCache";



const divRef = ref(<HTMLDivElement>null)
const displayRef = ref(<HTMLDivElement>null)


onMounted(() => {
    jDisplayAnime.init(displayRef.value)
    watch([() => store.readMode, () => store.splitImg], () => {
        jImgScroll.resizeImg()
    })

})

const imgOnLoad = (e: Event, item: imgStoreDisplayChildTtype, index: number) => {

    let obj = jFileCache.imgCache[item.searchIndex]
    if (!obj.isComplete) {
        obj.originW = (<any>e.target).width
        obj.originH = (<any>e.target).height
        obj.isComplete = true
    }
    jImgScroll.resizeOneImg(index)
    item.isLoaded = true
    jImgScroll.resizeImg()
    jImgScroll.setDomMatrix3d()
    imgStore.isImgPrepareLoading = false
    imgStore.isImgLoading = false
    console.log("loaded")

}



</script>

<template>
    <div class="comic_div" ref="divRef"
        :style="{ 'top': imgStore.divFloatTop + 'px', 'left': imgStore.divFloatLeft + 'px', 'width': imgStore.divFloatW + 'px', 'height': imgStore.divFloatH + 'px' }">


        <div class="bottom_div">
            <!-- 第几页 -->
            <div class="vintage2" v-if="store.isDisplayImgNum" :style="{ 'color': store.textMsgColor }">
                {{ store.curNo + 1 }}/{{ imgStore.len }}</div>
            <!-- 文件信息 -->
            <div class="vintage2" :style="{ 'color': store.textMsgColor }" v-if="store.isDisplayFileName">{{
                store.fileName + (store.zipInFileName ? (' /' + store.zipInFileName) : '')
            }}</div>
            <!-- 测试用的 -->
            <div class="vintage2" :style="{ 'color': store.textMsgColor }"
                v-if="store.isDisplayDebugMsg && store.isControlDebug">{{ store.debugMsg }}</div>

        </div>
    </div>
</template>

<style scoped>
.comic_div {
    /* width: 100%;
    height: 100%; */
    position: absolute;
    overflow: hidden;
    pointer-events: all;
}

.display_show {
    position: absolute;
    /* display: flex; */
}

.display_box_div {
    position: absolute;
    top: 0px;
    left: 0px;
    overflow: hidden;
    user-select: none;
    pointer-events: all;
    transform-origin: left top;
}

.display_trans_box {

    transform-origin: left top;
    display: flex;
    flex-direction: column;
}

.display_container {
    transform-origin: left top;
}

.display_show {
    transform-origin: left top;
}

.comic_img {
    position: relative;
    user-select: none;
    pointer-events: all;
    top: 0px;
    left: 0px;
    /* transition: transform 300ms ease-out; */
    /* overflow: scroll; */
}

.bottom_div {
    position: absolute;
    text-align: center;
    left: 0px;
    bottom: 0px;
    width: 100%;
    pointer-events: none;
}
</style>
