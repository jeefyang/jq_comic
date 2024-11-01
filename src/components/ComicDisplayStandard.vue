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
import { showToast } from 'vant';
import { preloadMediaCtrl } from '../tool/preloadMediaCtrl';


const divRef = ref(<HTMLDivElement>null)
const target = new ComicDisplayStandard()
const curChildRef = ref(<MediaViewChildType>null)
let viewList: MediaViewChildType[] = []


/** 加载图片数量 */
let loadingImgCount = [4, 5]

onMounted(() => {

    mediaStore.areaTouch = [...areaTouchWaterFall]
    watch([() => store.splitMedia, () => store.readMode], () => {
        mediaStore.domScale = 1
        target.resizeChild(curChildRef.value)
        target.updateChild(curChildRef.value)
        target.jumpMedia(divRef.value, store.displayIndex, 0, viewList, 500)
        mainMediaCtrl.autoSave()
    })
    watch([() => store.directX], () => {
        mediaStore.domScale = 1
        target.resizeChild(curChildRef.value)
        target.updateChild(curChildRef.value)
        mainMediaCtrl.autoSave()
    })

    watch([() => mediaStore.overHead], () => {
        showToast({ message: "已经是首页了,不要再翻", forbidClick: false, duration: 500 })
    })

    watch([() => mediaStore.overEnd], () => {
        showToast({ message: "已经是尾页了,不要再翻", forbidClick: false, duration: 500 })
    })

    watch([() => mediaStore.setNext], () => {
        let index = viewList.findIndex(c => c.displayIndex == curChildRef.value.displayIndex)
        if (index == -1) {
            return
        }
        let c = viewList[index]
        if (!c) {
            return
        }
        if (curChildRef.value.isSplit && curChildRef.value.splitNum == 0) {
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

        console.log("perv")
        let index = viewList.findIndex(c => c.displayIndex == curChildRef.value.displayIndex)
        if (index == -1) {
            return
        }
        let c = viewList[index]
        if (!c) {
            return
        }
        if (curChildRef.value.isSplit && curChildRef.value.splitNum == 1) {
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

    const jumpFunc = () => {
        let arr = mediaStore.jumpPage.split(",")

        let o = viewList.find(c => c.displayIndex == parseInt(arr[0]))
        if (!o) {
            return
        }
        curChildRef.value = cloneAssign(o)
        curChildRef.value.scale = 1
        mediaStore.domScale = 1
        curChildRef.value.splitNum = parseInt(arr[1]) ? 1 : 0
        target.updateChild(curChildRef.value)
        let searchIndex = curChildRef.value.searchIndex
        let cache = jFileCache.getMediaCache(curChildRef.value)

        preloadMediaCtrl.insertLoad(cache.dataUrl, cache.type, () => {
            if (searchIndex == curChildRef.value.searchIndex) {
                curChildRef.value.isLoaded = false
                curChildRef.value.isViewImg = true
            }

        })
        store.displayIndex = curChildRef.value.displayIndex
        mainMediaCtrl.autoSave()

    }

    watch([() => mediaStore.jumpPage], () => {
        jumpFunc()
    })

    watch([() => mediaStore.forceJumpPage], () => {
        jumpFunc()
    })

    watch([() => mediaStore.isRefresh], () => {
        if (!mediaStore.isRefresh) {
            return
        }
        setRefresh()
        mainMediaCtrl.autoSave()
    })

    watch([() => mediaStore.domScale], () => {
        target.resizeChild(curChildRef.value)
    })

    target.eventInit(divRef.value)

    setTimeout(() => {
        window.addEventListener("resize", () => {
            mediaStore.jumpPage = `${store.displayIndex},0`
            mediaStore.forceJumpPage++
        })
        setRefresh()
        mediaStore.jumpPage = `${store.displayIndex},0`
        mediaStore.forceJumpPage++
        mainMediaCtrl.autoSave("store")
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
    if (!viewList || !curChildRef) {
        return
    }
    if (index == -1) {
        index = viewList.findIndex(c => c.displayIndex == curChildRef.value.displayIndex)
    }
    if (index == -1) {
        return
    }
    console.log("count", count)
    for (let i = 1; i <= count; i++) {

        let ii = index + (i * add)
        if (ii < 0 || i >= viewList.length) {
            return
        }

        let c = viewList[ii]
        if (!c) {
            continue
        }
        let cache = jFileCache.getMediaCache(c)

        preloadMediaCtrl.preload(cache.dataUrl, cache.type)
        console.log('preload', cache.dataUrl)
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
        <template v-if="curChildRef">
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
                            :style="{ 'top': (!curChildRef.isLoaded ? 0 : mediaStore.divFloatH > curChildRef.scale * mediaStore.domScale * curChildRef.displayH ? mediaStore.mediaMoveY : 0) + 'px', 'left': (!curChildRef.isLoaded ? 0 : mediaStore.divFloatW > curChildRef.scale * mediaStore.domScale * curChildRef.displayW ? mediaStore.mediaMoveX : 0) + 'px', 'width': (!curChildRef.isLoaded ? mediaStore.divFloatW : (curChildRef.scale * curChildRef.displayW * mediaStore.domScale)) + 'px', 'height': (!curChildRef.isLoaded ? mediaStore.divFloatH : (curChildRef.scale * curChildRef.displayH * mediaStore.domScale)) + 'px' }">
                            <!-- 缩放视图 -->
                            <div class="display_container"
                                :style="{ 'transform': 'scale(' + curChildRef.scale * mediaStore.domScale + ')' }">
                                <!-- 标准状态 -->
                                <div :class="'display_show ' + (curChildRef.isLoaded ? 'loaded' : 'loading')"
                                    :style="{ 'width': (curChildRef.isLoaded ? curChildRef.displayW : mediaStore.divFloatW) + 'px', 'height': (curChildRef.isLoaded ? curChildRef.displayH : mediaStore.divFloatH) + 'px', }">
                                    <!-- 加载状态 -->
                                    <div class="imgLoading" v-if="!curChildRef.isLoaded"
                                        :style="{ 'background-color': mediaStore.mediaLoadingDivColor }">
                                        <div class="imgLoading_center">
                                            <van-loading vertical type="spinner" size="50" text-size="50"
                                                text-color="#fff">{{
                                                    curChildRef.displayIndex
                                                }}_{{ curChildRef.splitNum }}</van-loading>
                                        </div>
                                    </div>
                                    <!-- 图像 -->
                                    <div class="imgLoaded">
                                        <!-- 图片 -->
                                        <img v-if="curChildRef.isViewImg" class="comic_img" ref="imgRef"
                                            :src="jFileCache.mediaCache[curChildRef.searchIndex].dataUrl"
                                            @load="(e) => { imgOnLoad(curChildRef, e) }"
                                            :style="{ 'transform': 'translate(' + (curChildRef.transX) + 'px,' + (curChildRef.transY) + 'px)' }"
                                            draggable="false" ondragstart="return false;">
                                        <!-- 视频 -->
                                        <video v-if="curChildRef.isViewVideo" class="comic_img"
                                            :src="jFileCache.mediaCache[curChildRef.searchIndex].dataUrl" autoplay loop
                                            prevload
                                            :style="{ 'transform': 'translate(' + (curChildRef.transX) + 'px,' + (curChildRef.transY) + 'px)' }">
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