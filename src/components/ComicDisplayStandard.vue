<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { mediaMiddleData, mediaStore } from '../mediaStore'
import { MediaViewChildType } from "../media"
import { jFileCache } from "../tool/fileCache"
import ComicDisplayBottom from './ComicDisplayBottom.vue'
import { store } from '../store';
import { ComicDisplayStandard } from "./ComicDisplayStandard"
import { cloneAssign } from '../tool/util';
import { areaTouchWaterFall } from '../const';
import { mainMediaCtrl } from '../tool/mainMediaCtrl';


const divRef = ref(<HTMLDivElement>null)
const target = new ComicDisplayStandard()
let curChild = ref(<MediaViewChildType>null)
let viewList: MediaViewChildType[] = []

/** 加载图片数量 */
let loadingImgCount = [4, 5]

onMounted(() => {

    mediaStore.areaTouch = [...areaTouchWaterFall]
    watch([() => store.splitMedia, () => store.readMode], () => {
        mediaStore.domScale = 1
        target.resizeChild(curChild.value)
        target.updateChild(curChild.value)
        target.jumpMedia(divRef.value, store.displayIndex, 0, viewList, 500)
        mainMediaCtrl.autoSave()
    })
    watch([() => store.directX], () => {
        mediaStore.domScale = 1
        target.resizeChild(curChild.value)
        target.updateChild(curChild.value)
        mainMediaCtrl.autoSave()
    })

    watch([() => mediaStore.setNext], () => {
        let index = viewList.findIndex(c => c.displayIndex == curChild.value.displayIndex)
        if (index == -1) {
            return
        }
        let c = viewList[index]
        if (!c) {
            return
        }
        if (curChild.value.isSplit && curChild.value.splitNum == 0) {
            mediaStore.jumpPage = `${c.displayIndex},1`
            preloadMedia(1, loadingImgCount[1], c.displayIndex)
            return
        }
        if (c.displayIndex + 1 >= viewList.length) {
            mediaStore.overEnd++
            return
        }
        mediaStore.domScale = 1
        mediaStore.jumpPage = `${c.displayIndex + 1},0`
        preloadMedia(1, loadingImgCount[1], c.displayIndex + 1)
        mainMediaCtrl.autoSave()

    })

    watch([() => mediaStore.setPrev], () => {
        let index = viewList.findIndex(c => c.displayIndex == curChild.value.displayIndex)
        if (index == -1) {
            return
        }
        let c = viewList[index]
        if (!c) {
            return
        }
        if (curChild.value.isSplit && curChild.value.splitNum == 1) {
            mediaStore.jumpPage = `${c.displayIndex},0`
            preloadMedia(-1, loadingImgCount[0], c.displayIndex)
            return
        }
        if (c.displayIndex - 1 < 0) {
            mediaStore.overHead++
            return
        }
        mediaStore.domScale = 1
        mediaStore.jumpPage = `${c.displayIndex - 1},1`
        preloadMedia(-1, loadingImgCount[0], c.displayIndex - 1)
        mainMediaCtrl.autoSave()
    })

    watch([() => mediaStore.jumpPage, () => mediaStore.forceJumpPage], () => {
        let arr = mediaStore.jumpPage.split(",")
        let o = viewList.find(c => c.displayIndex == parseInt(arr[0]))
        if (!o) {
            return
        }
        curChild.value = cloneAssign(o)
        curChild.value.splitNum = parseInt(arr[1]) ? 1 : 0
        target.updateChild(curChild.value)
        let searchIndex = curChild.value.searchIndex
        let cache = jFileCache.getMediaCache(curChild.value)
        if (cache.type == "img") {
            let img = new Image()
            img.onload = () => {

                if (curChild.value.searchIndex != searchIndex) {
                    return
                }
                curChild.value.isLoaded = false
                curChild.value.isViewImg = true
            }
            img.src = cache.dataUrl
        }
        else if (cache.type == "video") {

        }
        store.displayIndex = curChild.value.displayIndex
    })

    watch([() => mediaStore.isRefresh], () => {
        if (!mediaStore.isRefresh) {
            return
        }
        setRefresh()
        mainMediaCtrl.autoSave()
    })

    target.eventInit(divRef.value)

    setTimeout(() => {
        window.addEventListener("resize", () => {
            console.log("resize")
            mediaStore.jumpPage = `${store.displayIndex},0`
            mediaStore.forceJumpPage++
        })
        setRefresh()
        mediaStore.jumpPage = `${store.displayIndex},0`
        mediaStore.forceJumpPage++
        mainMediaCtrl.autoSave()
    }, 1000);
})

const setRefresh = () => {
    viewList = []
    viewList = [...mediaMiddleData.list.map(c => {
        let cc = cloneAssign(c)
        cc.isViewDisplay = true
        return cc
    })]
    for (let i = 0; i < viewList.length; i++) {
        let c = viewList[i]
        let cache = jFileCache.getMediaCache(c)
        if (cache.isComplete) {
            // imgOnLoad(c)
        }
    }
    mediaStore.jumpPage = `${store.displayIndex},0`
    mediaStore.forceJumpPage++
    // curChild.value = cloneAssign(viewList.find(c => c.displayIndex == store.displayIndex))
    mediaStore.isRefresh = false
    preloadMedia(1, loadingImgCount[1], store.displayIndex)
}

const preloadMedia = (add: -1 | 1, count: number, index: number = -1) => {
    if (!viewList || !curChild) {
        return
    }
    if (index == -1) {
        index = viewList.findIndex(c => c.displayIndex == curChild.value.displayIndex)
    }
    if (index == -1) {
        return
    }
    for (let i = 1; i <= count; i++) {

        let ii = index + (i * add)
        if (ii < 0 || i >= viewList.length) {
            return
        }

        let c = viewList[ii]
        let cache = jFileCache.getMediaCache(c)
        if (cache.type == "img") {
            let img = new Image()
            img.src = cache.dataUrl
        }
        else if (cache.type == "video") {

        }

    }
}

const imgOnLoad = (item: MediaViewChildType, e?: Event) => {
    let cache = jFileCache.mediaCache[item.searchIndex]
    let oldH = item.displayH * item.scale * mediaStore.domScale
    if (!cache.isComplete) {
        cache.originW = (<HTMLImageElement>e.target).width
        cache.originH = (<HTMLImageElement>e.target).height
        cache.isComplete = true
    }
    target.resizeChild(item)
    if (item.displayIndex <= store.displayIndex || (item.displayIndex == store.displayIndex && item.splitNum < mediaStore.curSplit)) {

        divRef.value && (divRef.value.scrollTop += item.displayH * item.scale - oldH)
    }
    item.isLoaded = true
    target.updateChild(item)
    if (item.displayIndex == store.displayIndex && mediaStore.curSplit == item.splitNum && !item.isViewDisplay && item.splitNum == 1) {
        mediaStore.jumpPage = `${item.displayIndex},0`
    }
}


</script>
<template>
    <!-- 定位 -->
    <div class="comic_div" ref="divRef"
        :style="{ 'top': mediaStore.divFloatTop + 'px', 'left': mediaStore.divFloatLeft + 'px', 'width': mediaStore.divFloatW + 'px', 'height': mediaStore.divFloatH + 'px' }">
        <template v-if="curChild">
            <!-- 显示用的框(撑满固定不动,禁用滚动轴) -->
            <div class="display_trans_box">
                <!-- 整体偏移,用于切换图片 -->
                <div class="diplay_big_trans"
                    :style="{ 'left': mediaStore.domTransX + 'px', 'top': mediaStore.domTransY + 'px' }"
                    onscroll="return false">

                    <!-- 单页显示用的框(撑满固定不动,会有滚动轴) -->
                    <div class="display_overflow"
                        :style="{ 'width': mediaStore.divFloatW + 'px', 'height': mediaStore.divFloatH + 'px' }">
                        <!-- 移动位置,影响滚动轴 -->
                        <div class="display_trans"
                            :style="{ 'top': (mediaStore.divFloatH > curChild.scale * mediaStore.domScale * curChild.displayH ? curChild.parentTransY : 0) + 'px', 'left': (mediaStore.divFloatW > curChild.scale * mediaStore.domScale * curChild.displayW ? curChild.parentTransX : 0) + 'px', 'width': (curChild.scale * curChild.displayW * mediaStore.domScale) + 'px', 'height': (curChild.scale * curChild.displayH * mediaStore.domScale) + 'px' }">
                            <!-- 缩放视图 -->
                            <div class="display_container"
                                :style="{ 'transform': 'scale(' + curChild.scale * mediaStore.domScale + ')' }">
                                <!-- 标准状态 -->
                                <div class="display_show"
                                    :style="{ 'width': curChild.displayW + 'px', 'height': curChild.displayH + 'px', }">
                                    <!-- 加载状态 -->
                                    <div class="imgLoading" v-if="!curChild.isLoaded"
                                        :style="{ 'background-color': store.mediaLoadingDivColor }">
                                        <div class="imgLoading_center">
                                            <van-loading vertical type="spinner" size="50" text-size="50"
                                                text-color="#fff">{{
            curChild.displayIndex
        }}_{{ curChild.splitNum }}</van-loading>
                                        </div>
                                    </div>
                                    <!-- 图像 -->
                                    <div class="imgLoaded">
                                        <!-- 图片 -->
                                        <img v-if="curChild.isViewImg" class="comic_img" ref="imgRef"
                                            :src="jFileCache.mediaCache[curChild.searchIndex].dataUrl"
                                            @load="(e) => { imgOnLoad(curChild, e) }"
                                            :style="{ 'transform': 'translate(' + (curChild.transX) + 'px,' + (curChild.transY) + 'px)' }"
                                            draggable="false" ondragstart="return false;">
                                        <!-- 视频 -->
                                        <video v-if="curChild.isViewVideo" class="comic_img"
                                            :src="jFileCache.mediaCache[curChild.searchIndex].dataUrl" autoplay loop
                                            prevload
                                            :style="{ 'transform': 'translate(' + (curChild.transX) + 'px,' + (curChild.transY) + 'px)' }">
                                        </video>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </template>
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

.display_show {
    position: absolute;
}

.imgLoading {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
}

.imgLoaded {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.display_trans_box {

    transform-origin: left top;

    overflow: hidden;
    width: 100%;
    height: 100%;
    position: absolute;
}

.diplay_big_trans {
    display: flex;
    flex-direction: row;
    position: absolute;
    overflow: hidden;
}

.display_container {
    transform-origin: left top;

}

.display_list {
    background-color: yellow;
}

.display_trans {
    position: relative;
    overflow: hidden;
}

.display_overflow {
    overflow: auto;
}
</style>