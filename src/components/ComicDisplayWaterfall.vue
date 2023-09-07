<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { imgStore, imgStoreDisplayChildTtype } from '../imgStore'
import { jFileCache } from "../tool/fileCache"
import ComicDisplayBottom from './ComicDisplayBottom.vue'
import { imgCommon } from '../tool/imgCommon';
import { store } from '../store';
import { jaction } from "../tool/action"
import { jImgWaterfall } from '../tool/imgWaterfall'

const divRef = ref(<HTMLDivElement>null)

onMounted(() => {
    jImgWaterfall.displayDiv = divRef.value
})

const imgOnLoad = (e: Event, item: imgStoreDisplayChildTtype) => {
    let cache = jFileCache.imgCache[item.searchIndex]
    cache.originW = (<HTMLImageElement>e.target).width
    cache.originH = (<HTMLImageElement>e.target).height
    cache.isComplete = true
    imgCommon.imgResize(item)
    item.isLoaded = true
}

let wheelCache: WheelEvent

const onWheel = (e: WheelEvent) => {
    wheelCache = e
}

const onScroll = (e: Event) => {
    jaction.setTimeFunc(() => {
        let div = <HTMLDivElement>e.target
        let startY = 0
        let index = imgStore.children.findIndex(c => {
            if (!imgCommon.isImg(c)) {
                return false
            }
            let h = startY + c.displayH * c.scale
            if (h >= div.scrollTop) {
                return true
            }
            startY = h + imgStore.margin
            return false
        })
        if (index == -1) {
            wheelCache = undefined
            return
        }

        let child = imgStore.children[index]
        let cache = jFileCache.imgCache[child.searchIndex]
        store.curNo = child.displayIndex
        store.fileName = cache.fileName
        imgStore.viewChildIndex = index
        imgStore.zipInFileName = cache.zipInFileName
        if (wheelCache == undefined) {
            return
        }
        let last = imgStore.children[imgStore.children.length - 1]
        if (wheelCache.deltaY > 0 && last.displayIndex - imgStore.viewChildIndex < imgStore.waterfallNextImgCount) {
            imgCommon.setNextImg()
        }
        if (wheelCache.deltaY < 0 && imgStore.viewChildIndex < imgStore.waterfallPrevImgCount) {
            imgCommon.setPrevImg()
        }
        wheelCache = undefined
    }, "waterfallScroll", 500)

}

let isDomScale = false
let isDblclick = false
const onDblclick = (e: MouseEvent) => {
    isDblclick = true
    let clientX = e.clientX - imgStore.divFloatLeft
    let clientY = e.clientY - imgStore.divFloatTop
    let div = divRef.value
    let oldSDomScale = imgStore.domScale
    imgStore.domScale = !isDomScale ? 3 : 1
    isDomScale = !isDomScale
    let left = (div.scrollLeft + clientX) / oldSDomScale * imgStore.domScale - (clientX)
    let top = (div.scrollTop + clientY) / oldSDomScale * imgStore.domScale - (clientY)
    setTimeout(() => {
        div.scrollTo({ left: left, top: top, behavior: 'smooth' })
    }, 1000);

    // console.log(div.scrollTop + e.clientY, offsetY)

}

let t: NodeJS.Timeout
const onClick = (e: MouseEvent) => {
    if (t) {
        clearTimeout(t)
    }
    t = setTimeout(() => {
        if (!isDblclick) {
            jaction.setClickArea(e.clientX, e.clientY)
        }
        isDblclick = false
    }, 500);
}

</script>
<template>
    <div class="comic_div" ref="divRef"
        :style="{ 'top': imgStore.divFloatTop + 'px', 'left': imgStore.divFloatLeft + 'px', 'width': imgStore.divFloatW + 'px', 'height': imgStore.divFloatH + 'px' }"
        @scroll="onScroll" @wheel="onWheel" @dblclick="onDblclick" @click="onClick">

        <!-- 移动缩放用 -->
        <div class="display_trans_box" ref="displayRef" :style="{ 'transform': 'scale(' + imgStore.domScale + ')' }">
            <!-- 展开列表 -->
            <div class="display_list" v-for="(item, index) in imgStore.children" :key="item.searchIndex">
                <div v-if="item.isSplit || item.splitNum != 1 || !item.isLoaded"
                    :style="{ 'width': (item.scale * item.displayW) + 'px', 'height': (item.scale * item.displayH) + 'px', 'margin': '0px 0px ' + ((index + 1 < imgStore.children.length) ? imgStore.margin : 0) + 'px 0px' }">
                    <!-- 包裹可视部分 -->
                    <div class="display_container" :style="{ 'transform': 'scale(' + item.scale + ')' }">
                        <!-- 标准状态 -->
                        <div class="display_show"
                            :style="{ 'width': item.displayW + 'px', 'height': item.displayH + 'px', }">
                            <img v-if="jFileCache.imgCache[item.searchIndex].type == 'img'" class="comic_img" ref="imgRef"
                                :src="jFileCache.imgCache[item.searchIndex].dataUrl" @load="(e) => { imgOnLoad(e, item) }"
                                :style="{ 'transform': 'translate(' + (item.transX) + 'px,' + (item.transY) + 'px)' }"
                                draggable="false" ondragstart="return false;">

                            <video v-if="jFileCache.imgCache[item.searchIndex].type == 'video'" class="comic_img"
                                :src="jFileCache.imgCache[item.searchIndex].dataUrl" autoplay loop prevload
                                :style="{ 'transform': 'translate(' + (item.transX) + 'px,' + (item.transY) + 'px)' }">
                            </video>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <ComicDisplayBottom></ComicDisplayBottom>
</template>
<style scoped>
.comic_div {
    overflow: auto;
    position: absolute;
}

::-webkit-scrollbar {
    display: none;
}


.display_trans_box {

    transform-origin: left top;
    display: flex;
    flex-direction: column;
}

.display_container {
    transform-origin: left top;
}
</style>