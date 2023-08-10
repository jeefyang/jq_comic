<script setup lang="ts">
import { onMounted, ref } from "vue";
import { store } from "../store"
import { jImgScroll } from "../tool/imgScroll"
import { JHammer as JHammer } from "../tool/util"
import { jFileCache } from "../tool/fileCache";

const bigDivRef = ref(<HTMLDivElement>null)
const leftDivRef = ref(<HTMLDivElement>null)
const rightDivRef = ref(<HTMLDivElement>null)
const topBarDivRef = ref(<HTMLDivElement>null)
const bottomBarDivRef = ref(<HTMLDivElement>null)
const centerOPDivRef = ref(<HTMLDivElement>null)
onMounted(async () => {

    let bigDiv = bigDivRef.value
    let leftDiv = leftDivRef.value
    let rightDiv = rightDivRef.value
    let topBarDiv = topBarDivRef.value
    let bottomBarDiv = bottomBarDivRef.value
    let centerOPDiv = centerOPDivRef.value


    new JHammer(bigDiv).setDirection('pan').setDirection("swipe").on("panstart", (_e) => {
        jImgScroll.setPanStart(_e.deltaX, _e.deltaY)
    }).on("panmove", (e) => {
        jImgScroll.setPanMove(e.deltaX, e.deltaY)
    }).on("swipeleft", (e) => {
        jImgScroll.setPanStart(0, 0, false)
        jImgScroll.setSwipeMove(e.deltaX, 0)
    }).on("swiperight", (e) => {
        jImgScroll.setPanStart(0, 0, false)
        jImgScroll.setSwipeMove(e.deltaX, 0)
    }).on("swipeup", (e) => {
        jImgScroll.setPanStart(0, 0, false)
        jImgScroll.setSwipeMove(0, e.deltaY)
    }).on("swipedown", (e) => {
        jImgScroll.setPanStart(0, 0, false)
        jImgScroll.setSwipeMove(0, e.deltaY)
    })

    new JHammer(leftDiv).on("tap", () => {
        // setLeftClickFunc()
    })

    new JHammer(rightDiv).on("tap", () => {
        // setRightClickFunc()
    })

    new JHammer(topBarDiv).on("tap", (_e) => {
        setTimeout(() => {
            store.displayFileManager = true
        }, 200);
    })

    new JHammer(bottomBarDiv).on("tap", (_e) => {
        setTimeout(() => {
            store.displayBottomBar = true
        }, 200);

    })

    new JHammer(centerOPDiv).on("tap", (_e) => {
        console.log("触发中间配置")
        setTimeout(() => {
            store.displayOPPanel = true
        }, 200);
    })


    // document.body.addEventListener("mousemove", (e) => {
    //     jImgScroll.setMouseMove(e.clientX, e.clientY)
    // })

    // document.body.addEventListener("mouseup", (_e) => {
    //     jImgScroll.setMouseUp()
    // })
})


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
        <!-- 主操控 -->
        <div class='control_big_div' ref="bigDivRef">
            <!-- 左操控 -->
            <div class="control_left_div" ref="leftDivRef">
                <div v-if="store.isControlDebug"></div>
            </div>
            <!-- 右操控 -->
            <div class="control_right_div" ref="rightDivRef">
                <div v-if="store.isControlDebug"></div>
            </div>
            <!-- 顶部工具栏操控 -->
            <div class="control_top_bar_div" ref="topBarDivRef">
                <div v-if="store.isControlDebug"></div>
            </div>
            <!-- 底部工具栏操控 -->
            <div class="control_bottom_bar_div" ref="bottomBarDivRef">
                <div v-if="store.isControlDebug"></div>
            </div>
            <!-- 中间配置操控 -->
            <div class="control_center_op_div" ref="centerOPDivRef">
                <div v-if="store.isControlDebug"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.control_scroll_div {
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: hidden;
    /* background-color: #35a9a982; */
}

.control_left_div {
    position: absolute;
    top: 0px;
    left: 0%;
    width: 50%;
    height: 100%;
}

.control_left_div div {
    width: 100%;
    height: 100%;
    background-color: rgba(255, 0, 0, 0.16);
}

.control_right_div {
    position: absolute;
    top: 0px;
    left: 50%;
    width: 50%;
    height: 100%;

}

.control_right_div div {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 255, 0.16);
}

.control_center_op_div {
    position: absolute;
    top: 42%;
    left: 42%;
    width: 16%;
    height: 16%;
}

.control_center_op_div div {
    width: 100%;
    height: 100%;
    background-color: rgba(4, 251, 127, 0.16);
}

.control_top_bar_div {
    position: absolute;
    top: 0px;
    left: 15%;
    width: 70%;
    height: 10%
}

.control_top_bar_div div {
    width: 100%;
    height: 100%;
    background-color: rgba(243, 12, 139, 0.16);
}

.control_bottom_bar_div {
    position: absolute;
    bottom: 0px;
    left: 15%;
    width: 70%;
    height: 10%
}

.control_bottom_bar_div div {
    width: 100%;
    height: 100%;
    background-color: rgba(243, 12, 139, 0.16);
}

.control_big_div {
    width: 100%;
    height: 100%;
    position: absolute;
    overflow: hidden;
    background-color: #35a9a982;
}
</style>