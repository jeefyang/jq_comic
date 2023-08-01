<script setup lang="ts">
import { onMounted, watch, ref } from "vue";
import { store } from "../store"

const divRef = ref(<HTMLDivElement>null)
const imgRef = ref(<HTMLImageElement>null)
let imgDom: HTMLImageElement
let divDom: HTMLDivElement
let prevMouseX: number = null
let prevMouseY: number = null
onMounted(() => {
    imgDom = imgRef.value
    divDom = divRef.value
    watch(() => store.curCanvasY, (y) => {
        imgDom.scrollTop = y
    })
    imgDom.onselectstart
    imgDom.onload = () => {
        setTimeout(() => {
            console.log(divDom)
            // document.scrollingElement.scrollTop = 600
            console.log(store.curCanvasY)
            console.log(divDom.clientWidth, divDom.clientHeight)
        }, 3000);
    }
    document.body.addEventListener("mousemove", (e) => {

        if (prevMouseX == null) {
            return
        }
        let x = e.clientX
        let y = e.clientY
        imgScrollFunc(store.curCanvasX + x-prevMouseX, store.curCanvasY + y-prevMouseY)
        prevMouseX = x
        prevMouseY = y
    })
})

let imgScrollFunc = (x: number, y: number) => {
    console.log(x, y)
    // if(-y+store.)
    store.curCanvasX = x
    store.curCanvasY = y
}

let imgMouseDown = (e: MouseEvent) => {
    prevMouseX = e.clientX
    prevMouseY = e.clientY
    console.log("xx")
}

let imgMouseUp = (_e: MouseEvent) => {
    prevMouseX = null
    prevMouseY = null
    console.log("up")
}


</script>

<template>
    <div class="comic_div" ref="divRef">
        <img class="comic_img" ref="imgRef" :src="store.canvasB64"
            :style="{ 'left': store.curCanvasX + 'px', 'top': store.curCanvasY + 'px' }" @mousedown="imgMouseDown"
            @mouseup="imgMouseUp" draggable="false">
    </div>
</template>

<style scoped>
.comic_div {
    width: 100%;
    height: 100%;
    position: relative;
}

.comic_img {
    position: relative;
    /* overflow: scroll; */
}
</style>
