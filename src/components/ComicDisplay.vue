<script setup lang="ts">
import { onMounted, watch, ref } from "vue";
import { store } from "../store"
import { jImgScroll } from "../tool/imgScroll"

const divRef = ref(<HTMLDivElement>null)
const imgRef = ref(<HTMLImageElement>null)
let imgDom: HTMLImageElement

onMounted(() => {
    imgDom = imgRef.value
    jImgScroll.imgDom = imgDom
    // divDom = divRef.value
    watch([() => store.divFloatW, () => store.divFloatH], (_a, _b) => {
        jImgScroll.resizeImg()
    })
    imgDom.onselectstart = () => { return false }
    imgDom.onload = () => {
        setTimeout(() => {
            jImgScroll.resizeImg()
        }, 100);
    }

})

</script>

<template>
    <div class="comic_div" ref="divRef"
        :style="{ 'top': store.divFloatTop + 'px', 'left': store.divFloatLeft + 'px', 'width': store.divFloatW + 'px', 'height': store.divFloatH + 'px' }">
        <img class="comic_img" ref="imgRef" :src="store.canvasB64"
            :style="{ 'left': store.curCanvasX + 'px', 'top': store.curCanvasY + 'px', 'width': store.displayImgW + 'px', 'height': store.displayImgH + 'px' }"
            draggable="false" ondragstart="return false;">
    </div>
</template>

<style scoped>
.comic_div {
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: hidden;
    pointer-events: all;

}

.comic_img {
    position: absolute;
    user-select: none;
    pointer-events: all;
    /* overflow: scroll; */
}
</style>
