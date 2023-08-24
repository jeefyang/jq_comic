<script setup lang="ts">
import { onMounted, ref } from "vue";
import { store } from "../store"
import { imgStore } from "../imgStore"
// import { jImgScroll } from "../tool/imgScroll"


const divRef = ref(<HTMLDivElement>null)



onMounted(() => {


})

const imgOnLoad = () => {
    imgStore.isImgPrepareLoading = false
    imgStore.isImgLoading = false
}



</script>

<template>
    <div class="comic_div" ref="divRef"
        :style="{ 'top': imgStore.divFloatTop + 'px', 'left': imgStore.divFloatLeft + 'px', 'width': imgStore.divFloatW + 'px', 'height': imgStore.divFloatH + 'px' }">
        <!-- 移动缩放用 -->
        <div class="display_trans_box"
            :style="{ 'transform': 'translate3d(' + (imgStore.domTransX) + 'px,' + (imgStore.domTransY) + 'px,0) scale(' + imgStore.domScale + ')', 'transition': 'transform ' + imgStore.transitionMS + 'ms ease-out' }">
            <!-- 展开列表 -->
            <div class="display_list" v-for="item in imgStore.children">
                <!-- 标准状态 -->
                <div class="display_show"
                    :style="{ 'top': item.parentTransY + 'px', 'left': item.parentTransX, 'width': item.displayImgW + 'px', 'height': item.displayImgH + 'px', 'transform': 'scale(' + item.imgScale + ')' }">
                    <img v-show="!item.isVideo" class="comic_img" ref="imgRef" :src="item.canvasB64" @load="imgOnLoad"
                        :style="{ 'transform': 'translate(' + (item.imgTransX) + 'px,' + (item.imgTransY) + 'px)' }"
                        draggable="false" ondragstart="return false;">
                    <video v-show="item.isVideo" class="comic_img" :src="item.canvasB64" autoplay loop prevload
                        :style="{ 'transform': 'translate(' + (item.imgTransX) + 'px,' + (item.imgTransY) + 'px)' }">

                    </video>
                </div>
            </div>
        </div>

        <div class="bottom_div">
            <!-- 第几页 -->
            <div class="vintage2" v-if="store.isDisplayImgNum" :style="{ 'color': store.textMsgColor }">
                {{ store.curNo + 1 }}/{{ store.imgCount }}</div>
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
}
</style>
