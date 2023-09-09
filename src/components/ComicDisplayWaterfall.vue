<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { imgStore, imgStoreDisplayChildTtype } from '../imgStore'
import { jFileCache } from "../tool/fileCache"
import ComicDisplayBottom from './ComicDisplayBottom.vue'
import { imgCommon } from '../tool/imgCommon';
import { store } from '../store';
import { jaction } from "../tool/action"


const divRef = ref(<HTMLDivElement>null)

onMounted(() => {
    watch([() => store.splitImg], () => {
        console.log("xx")
        for (let i = 0; i < imgStore.children.length; i++) {
            let child = imgStore.children[i]
            child.isLoaded && imgCommon.imgResize(child)
        }
        imgCommon.jumpImg(store.displayIndex)
    })
    imgCommon.setDiv(divRef.value)
})

const imgOnLoad = (e: Event, item: imgStoreDisplayChildTtype) => {
    let cache = jFileCache.imgCache[item.searchIndex]
    let oldH = item.displayH * item.scale * imgStore.domScale
    cache.originW = (<HTMLImageElement>e.target).width
    cache.originH = (<HTMLImageElement>e.target).height
    cache.isComplete = true
    imgCommon.imgResize(item)
    if (item.displayIndex <= store.displayIndex || (item.displayIndex == store.displayIndex && item.splitNum < imgStore.curSplit)) {
        divRef.value.scrollTop += item.displayH * item.scale - oldH
    }
    item.isLoaded = true
}

let _wheelCache: WheelEvent

const onWheel = (e: WheelEvent) => {
    _wheelCache = e

}

const onScroll = (e: Event) => {
    jaction.setTimeFunc(() => {
        let div = <HTMLDivElement>e.target
        let startY = 0
        let index = imgStore.children.findIndex(c => {
            if (!imgCommon.isviewDisplay(c)) {
                return false
            }
            let h = startY + c.displayH * c.scale * imgStore.domScale
            if (h >= div.scrollTop) {
                return true
            }
            startY = h + imgStore.margin
            return false
        })
        if (index == -1) {
            return
        }
        let child = imgStore.children[index]
        let cache = jFileCache.imgCache[child.searchIndex]
        store.displayIndex = child.displayIndex
        store.fileName = cache.fileName
        imgStore.viewChildIndex = index
        imgStore.zipInFileName = cache.zipInFileName
        imgStore.curSplit = child.splitNum
        let screensh = div.scrollTop
        let srceeneh = div.scrollTop + imgStore.divFloatH
        for (let i = index; i < imgStore.children.length; i++) {
            let c = imgStore.children[i]
            if (!imgCommon.isviewDisplay(c)) {
                continue
            }
            let h = startY + c.displayH * c.scale * imgStore.domScale
            if ((screensh <= startY && srceeneh >= startY) ||
                (screensh <= h && srceeneh >= h) ||
                (screensh >= startY && srceeneh <= h)
            ) {
                console.log(c.searchIndex)
                c.isView = true
            }
            startY = h + imgStore.margin
        }
    }, "waterfallScroll", 100)

}


let isDblclick = false
const onDblclick = (e: MouseEvent) => {
    isDblclick = true
    let clientX = e.clientX - imgStore.divFloatLeft
    let clientY = e.clientY - imgStore.divFloatTop
    let div = divRef.value
    let oldSDomScale = imgStore.domScale
    imgStore.domScale = imgStore.domScale == 1 ? 2 : 1
    let left = (div.scrollLeft + clientX) / oldSDomScale * imgStore.domScale - (clientX)
    let top = (div.scrollTop + clientY) / oldSDomScale * imgStore.domScale - (clientY)
    setTimeout(() => {

        div.scrollTo({ left: left, top: top, behavior: 'auto' })
    }, 50);

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
        <div class="display_trans_box" ref="displayRef"
            :style="{ 'width': imgStore.divFloatW + 'px', 'height': imgStore.divFloatH + 'px', 'transform': 'scale(' + imgStore.domScale + ')' }">
            <!-- 展开列表 -->
            <div class="display_list" v-for="(item, index) in imgStore.children" :key="item.searchIndex">
                <div v-if="imgCommon.isviewDisplay(item)"
                    :style="{ 'width': (item.scale * item.displayW) + 'px', 'height': (item.scale * item.displayH) + 'px', 'margin': '0px 0px ' + ((index + 1 < imgStore.children.length) ? imgStore.margin : 0) + 'px 0px' }">
                    <!-- 包裹可视部分 -->
                    <div class="display_container" :style="{ 'transform': 'scale(' + item.scale + ')' }">
                        <!-- 标准状态 -->
                        <div class="display_show"
                            :style="{ 'width': item.displayW + 'px', 'height': item.displayH + 'px', }">
                            <!-- 加载 -->
                            <div class="imgLoading" v-if="imgCommon.isViewLoading(item)">
                                <div class="imgLoading_center">
                                    <van-loading vertical type="spinner" size="50" text-size="50">{{ item.displayIndex
                                    }}_{{ item.splitNum }}</van-loading>
                                </div>
                            </div>
                            <!-- 图片 -->
                            <img v-if="imgCommon.isViewImg(item)" class="comic_img" ref="imgRef"
                                :src="jFileCache.imgCache[item.searchIndex].dataUrl" @load="(e) => { imgOnLoad(e, item) }"
                                :style="{ 'transform': 'translate(' + (item.transX) + 'px,' + (item.transY) + 'px)' }"
                                draggable="false" ondragstart="return false;">
                            <!-- 视频 -->
                            <video v-if="imgCommon.isViewVideo(item)" class="comic_img"
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

.comic_img {
    position: absolute;
    top: 0px;
    left: 0px;
}

.imgLoading_center {
    position: absolute;
    width: 100%;
    /* height: 100px; */
    top: 45%
}


.imgLoading {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: green;
}

.display_trans_box {

    transform-origin: left top;
    display: flex;
    flex-direction: column;
    /* position: absolute; */
}

.display_container {
    transform-origin: left top;
}
</style>