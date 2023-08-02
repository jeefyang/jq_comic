<script setup lang="ts">
// import { onMounted, watch, ref } from "vue";
import { onMounted } from "vue";
import { store } from "../store"
import { jserver } from "../tool/serverLink"
import { jImgScroll } from "../tool/imgScroll"


onMounted(async () => {

    document.body.addEventListener("mousemove", (e) => {
        jImgScroll.setMouseMove(e.clientX, e.clientY)
    })

    document.body.addEventListener("mouseup", (_e) => {
        jImgScroll.setMouseUp()
    })
})

let setNext = () => {
    console.log("next")
    jserver.setNextImg()
}

let setMouseDown = (e: MouseEvent) => {
    jImgScroll.setMouseDown(e.clientX, e.clientY)
}

let setWheel = (e: WheelEvent) => {
    jImgScroll.setMouseWheel(e.deltaY, e.altKey)
}





</script>

<template>
    <div class="control_scroll_div"
        :style="{ 'top': store.divFloatTop + 'px', 'left': store.divFloatLeft + 'px', 'width': store.divFloatW + 'px', 'height': store.divFloatH + 'px' }"
        @mousedown="setMouseDown" draggable="false" @wheel="setWheel" ondragstart="return false;">
        <div class='control_click_div' @click="setNext"></div>
    </div>
</template>

<style scoped>
.control_scroll_div {
    /* width: 100%;
    height: 100%; */
    position: absolute;
    overflow: hidden;
    /* background-color: #35a9a982; */
}

.control_click_div {
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: hidden;
    background-color: #35a9a982;
}
</style>
