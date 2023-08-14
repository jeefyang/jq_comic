<script setup lang="ts">
import { onMounted, watch, ref } from "vue";
import { store } from "../store"
import { jImgScroll } from "../tool/imgScroll"


const divRef = ref(<HTMLDivElement>null)
const imgRef = ref(<HTMLImageElement>null)
const videoRef = ref(<HTMLVideoElement>null)
let imgDom: HTMLImageElement
let videoDom: HTMLVideoElement

onMounted(() => {
    imgDom = imgRef.value
    videoDom = videoRef.value
    jImgScroll.videoDom = videoDom
    // divDom = divRef.value
    watch([() => store.readMode], (_a, _b) => {
        jImgScroll.resizeImg()
    })
    imgDom.onselectstart = () => { return false }
    imgDom.onload = () => {
        store.isImgPrepareLoading = false
        store.isImgLoading = false
        setTimeout(() => {
            jImgScroll.resizeImg()
        }, 100);
    }
    videoDom.oncanplay = () => {
        store.isImgPrepareLoading = false
        store.isImgLoading = false
        if (store.isPlayedVideo) {
            return
        }
        console.log("can", videoDom.paused)
        jImgScroll.setVideoPlay(true)
        store.isPlayedVideo = true
        jImgScroll.resizeImg()

    }
    jImgScroll.resizeImg()

})



</script>

<template>
    <div class="comic_div" ref="divRef"
        :style="{ 'top': store.divFloatTop + 'px', 'left': store.divFloatLeft + 'px', 'width': store.divFloatW + 'px', 'height': store.divFloatH + 'px' }">
        <div class="display_box_div"
            :style="{ 'width': store.displayImgW + 'px', 'height': store.displayImgH + 'px', 'transform': 'translate3d(' + (store.domTransX) + 'px,' + (store.domTransY) + 'px,0) scale(' + store.domScale + ')', 'transition': 'transform ' + store.transitionMS + 'ms ease-out' }">
            <img v-show="!store.isVideo" class="comic_img" ref="imgRef" :src="store.canvasB64"
                :style="{ 'transform': 'translate(' + (store.imgTransX) + 'px,' + (store.imgTransY) + 'px)' }"
                draggable="false" ondragstart="return false;">
            <video v-show="store.isVideo" class="comic_img" ref="videoRef" :src="store.canvasB64" autoplay loop prevload
                :style="{ 'transform': 'translate(' + (store.imgTransX) + 'px,' + (store.imgTransY) + 'px)' }">

            </video>

        </div>

        <div class="bottom_div">
            <div class="vintage2" v-if="store.isDisplayImgNum">{{ store.curNo + 1 }}/{{ store.imgCount }}</div>
            <div class="vintage2" v-if="store.isDisplayFileName">{{ store.fileName }}</div>
            <!-- 测试用的 -->
            <div class="vintage2" v-if="store.isDisplayDebugMsg && store.isControlDebug">{{ store.debugMsg }}</div>

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

.display_box_div {
    position: absolute;
    top: 0px;
    left: 0px;
    overflow: hidden;
    user-select: none;
    pointer-events: all;
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
}
</style>
