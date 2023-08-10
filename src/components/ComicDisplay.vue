<script setup lang="ts">
import { onMounted, watch, ref } from "vue";
import { store } from "../store"
import { jImgScroll } from "../tool/imgScroll"


const divRef = ref(<HTMLDivElement>null)
const imgRef = ref(<HTMLImageElement>null)
let imgDom: HTMLImageElement

onMounted(() => {
    imgDom = imgRef.value
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
    jImgScroll.resizeImg()
})

</script>

<template>
    <div class="comic_div" ref="divRef"
        :style="{ 'top': store.divFloatTop + 'px', 'left': store.divFloatLeft + 'px', 'width': store.divFloatW + 'px', 'height': store.divFloatH + 'px' }">
        <img class="comic_img" ref="imgRef" :src="store.canvasB64"
            :style="{ 'left': '0px', 'top': '0px', 'width': store.imgDomW + 'px', 'height': store.imgDomH + 'px', 'transform': 'translate3d(' + (store.curCanvasX + store.imgDomX) + 'px,' + (store.curCanvasY + store.imgDomY) + 'px,0)', 'transition': 'transform ' + store.transitionMS + 'ms ease-out' }"
            draggable="false" ondragstart="return false;">
        <div class="bottom_div">
            <div class="vintage2" v-if="store.isDisplayImgNum">{{ store.curNo }}/{{ store.imgCount }}</div>
            <div class="vintage2" v-if="store.isDisplayFileName">{{ store.fileName }}</div>
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

.comic_img {
    position: absolute;
    user-select: none;
    pointer-events: all;
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
