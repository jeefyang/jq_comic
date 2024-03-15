<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { mediaMiddleData, mediaStore } from '../mediaStore'
import { jFileCache } from "../tool/fileCache"
import ComicDisplayBottom from './ComicDisplayBottom.vue'
// import { mainMediaCtrl } from '../tool/imgCommon';
// import { jImgWaterfall } from '../tool/imgWaterfall';
import { store } from '../store';
// import { jaction } from "../tool/action"
// import { JTouch } from '../tool/touch';
import { MediaViewChildType } from '../media';
import { cloneAssign, everyBetween } from '../tool/util';
import { ComicDisplayWaterfall } from "./ComicDisplayWaterfall"
import { areaTouchWaterFall } from '../const';
import { mainMediaCtrl } from '../tool/mainMediaCtrl';
import { ToastWrapperInstance, showToast } from 'vant';


const divRef = ref(<HTMLDivElement>null)
const viewList = ref(<MediaViewChildType[]>[])
const target = new ComicDisplayWaterfall()


onMounted(() => {
    mediaStore.areaTouch = [...areaTouchWaterFall]

    watch([() => store.splitMedia, () => mediaStore.margin], () => {
        for (let i = 0; i < viewList.value.length; i++) {
            let child = viewList.value[i]
            if (child.isLoaded) {
                target.resizeChild(child)
                target.updateChild(child)
            }
        }
        mediaStore.jumpPage = `${store.displayIndex},0`
        mainMediaCtrl.autoSave()
    })
    watch([() => mediaStore.jumpPage, () => mediaStore.forceJumpPage], () => {
        let arr = mediaStore.jumpPage.split(",")
        let displayIndex = parseInt(arr[0])
        let split = parseInt(arr[1]) ? 1 : 0
        for (let i = 0; i < viewList.value.length; i++) {
            let c = viewList.value[i]
            c.isLoaded = false
            if (c.displayIndex == displayIndex) {
                if (split == 0) {
                    c.isViewDiv = true
                    continue
                }
                if (c.isLoaded && c.isViewDisplay) {
                    c.isViewDiv = true
                }
            }
            else {
                c.isViewDiv = false
            }
        }
        divRef.value.scrollTo({ top: 0 })
        target.scrollTag = 1
        store.displayIndex = displayIndex
        mainMediaCtrl.autoSave()
    })
    watch([() => store.directX], () => {
        for (let i = 0; i < viewList.value.length; i++) {
            let child = viewList.value[i]
            if (child.isLoaded) {
                target.resizeChild(child)
                target.updateChild(child)
            }
        }
        mainMediaCtrl.autoSave()
    })
    watch([() => mediaStore.isRefresh], () => {
        if (!mediaStore.isRefresh) {
            return
        }
        console.log('refresh')
        setRefresh()
        mediaStore.jumpPage = `${store.displayIndex},0`
        mainMediaCtrl.autoSave()
    })

    target.eventInit(divRef.value)
    startLoopFunc()

    setTimeout(() => {
        window.addEventListener("resize", () => {
            for (let i = 0; i < viewList.value.length; i++) {
                let child = viewList.value[i]
                child.isLoaded && target.resizeChild(child)
            }
            mediaStore.jumpPage = `${store.displayIndex},0`
        })
        if (mediaMiddleData.list && mediaMiddleData.list.length > 0) {
            setRefresh()
            mediaStore.jumpPage = `${store.displayIndex},0`
            mediaStore.forceJumpPage++
        }
        mainMediaCtrl.autoSave()
    }, 1000);
})

const looptime = 100

let curLoopTag = 0

/** 显示div数量 */
let displayDivCount = [1, 6]
/** 加载图片数量 */
let loadingImgCount = [4, 5]

const startLoopFunc = () => {
    curLoopTag++
    loopFunc(curLoopTag)
}


const loopFunc = async (loopTag: number) => {
    return new Promise((res, _rej) => {
        if (loopTag != curLoopTag || !divRef.value) {
            return res(undefined)
        }
        if (target.scrollTag == 1) {
            delayLoadDivFunc()
            delayLoadImgFunc()
        }
        else if (target.scrollTag == -1) {
            scrollUpDelayLoadFunc()
        }
        delayScrollFunc()
        setTimeout(() => {
            loopFunc(loopTag)
            res(undefined)
        }, looptime);
    })
}


const scrollUpDelayLoadFunc = async () => {
    if (target.scrollTag != -1 || target.isScrollUp) {
        return
    }
    let curIndex = store.displayIndex * 2
    target.scrollTag = 1
    let len = 1
    let top = 0
    let st: ToastWrapperInstance
    for (let i = 1; i < viewList.value.length; i++) {
        if (len == 0) {
            break
        }
        let index = curIndex - i
        let c = viewList.value[index]
        if (!c) {
            break
        }
        target.isScrollUp = true
        if (!st) {
            st = showToast({ message: "往上加载中", forbidClick: false, position: "top", duration: 0 })
        }
        await mainMediaCtrl.onMediaLoad(c)
        target.resizeChild(c)
        target.updateChild(c)
        if (!c.isViewDisplay) {
            continue
        }
        len--
        if (c.isLoaded) {

            continue
        }

        c.isViewDiv = true
        let cache = jFileCache.getMediaCache(c)
        c.isViewImg = cache.type == "img"
        c.isViewVideo = cache.type == "video"
        top += c.displayH * c.scale
        continue
    }

    // await new Promise(res => {
    //     setTimeout(() => {
    //         divRef.value.scrollTop += top
    //         res(undefined)
    //     }, 100);
    // })
    if (st) {
        st.close()
    }
    target.isScrollUp = false
    return

}

const delayLoadDivFunc = async () => {
    let index = store.displayIndex * 2
    everyBetween(viewList.value, index, [target.scrollTag == -1 ? displayDivCount[0] : 0, target.scrollTag == 1 ? displayDivCount[1] : 0], (c) => {
        if (c)
            c.isViewDiv = true
    })
}

const delayLoadImgFunc = async () => {
    let index = store.displayIndex * 2
    everyBetween(viewList.value, index, [target.scrollTag == -1 ? loadingImgCount[0] : 0, target.scrollTag == 1 ? loadingImgCount[1] : 0], (c, _ci) => {
        let cache = jFileCache.getMediaCache(c)
        c.isViewImg = cache.type == "img"
        c.isViewVideo = cache.type == "video"
    })
}

const delayScrollFunc = async () => {
    let top = 0
    for (let i = 0; i < viewList.value.length; i++) {
        let c = viewList.value[i]
        if (!c.isViewDisplay || !c.isViewDiv) {
            continue
        }
        if (top >= divRef.value.scrollTop) {
            if (store.displayIndex != c.displayIndex) {
                mainMediaCtrl.autoSave()
            }
            store.displayIndex = c.displayIndex
            break
        }
        top += (c.scale || 0) * (c.displayH || 0) + mediaStore.margin
    }
}

const setRefresh = () => {
    let list: MediaViewChildType[] = []
    mediaMiddleData.list.forEach(c => {
        let cc = cloneAssign(c)
        let cache = jFileCache.getMediaCache(cc)
        cc.isViewImg = cache.type == "img"
        cc.isViewVideo = cache.type == "video"
        cc.isViewDiv = false
        cc.isViewDisplay = true
        list.push(cc)
        let ccc = cloneAssign(cc)
        ccc.splitNum = 1
        list.push(ccc)
    })
    viewList.value = list
    // for (let i = 0; i < viewList.value.length; i++) {
    //     let c = viewList.value[i]
    //     let cache = jFileCache.getMediaCache(c)
    //     if (cache.isComplete) {
    //         imgOnLoad(c)
    //     }
    // }
    mediaStore.isRefresh = false
}

const imgOnLoad = (item: MediaViewChildType, e?: Event) => {
    let cache = jFileCache.mediaCache[item.searchIndex]
    // let oldH = item.displayH * item.scale * mediaStore.domScale
    if (!cache.isComplete) {
        cache.originW = (<HTMLImageElement>e.target).width
        cache.originH = (<HTMLImageElement>e.target).height
        cache.isComplete = true
    }
    target.resizeChild(item)
    if (item.displayIndex <= store.displayIndex || (item.displayIndex == store.displayIndex && item.splitNum < mediaStore.curSplit)) {

        // divRef.value.scrollTop += item.displayH * item.scale - oldH
        // divRef.value.scrollTop += item.displayH * item.scale
    }
    item.isLoaded = true
    target.updateChild(item)
}




</script>
<template>
    <div class="comic_div" ref="divRef"
        :style="{ 'top': mediaStore.divFloatTop + 'px', 'left': mediaStore.divFloatLeft + 'px', 'width': mediaStore.divFloatW + 'px', 'height': mediaStore.divFloatH + 'px' }">

        <!-- 移动缩放用 -->
        <div class="display_trans_box"
            :style="{ 'width': mediaStore.divFloatW + 'px', 'height': mediaStore.divFloatH + 'px', 'transform': 'scale(' + mediaStore.domScale + ')' }">
            <!-- 展开列表(for循环) -->
            <template v-for="(item, index) in viewList" :key="item.searchIndex">
                <!-- 分割显示 -->
                <div v-if="item.isViewDiv && item.isViewDisplay"
                    :class="'display_list ' + item.displayIndex + '_' + item.splitNum"
                    :style="{ 'width': (item.scale * item.displayW) + 'px', 'height': (item.scale * item.displayH) + 'px', 'margin': '0px 0px ' + ((index + 1 < viewList.length) ? mediaStore.margin : 0) + 'px 0px' }">
                    <!-- 包裹可视部分 -->
                    <div class="display_container" :style="{ 'transform': 'scale(' + item.scale + ')' }">
                        <!-- 标准状态 -->
                        <div class="display_show"
                            :style="{ 'width': item.displayW + 'px', 'height': item.displayH + 'px', }">
                            <!-- 加载状态 -->
                            <div class="imgLoading" v-if="!item.isLoaded"
                                :style="{ 'background-color': mediaStore.mediaLoadingDivColor }">
                                <div class="imgLoading_center">
                                    <van-loading vertical type="spinner" size="50" text-size="50" text-color="#fff">{{
            item.displayIndex
        }}_{{ item.splitNum }}</van-loading>
                                </div>
                            </div>
                            <!-- 图像 -->
                            <div class="imgLoaded">
                                <!-- 图片 -->
                                <img v-if="item.isViewImg" class="comic_img" ref="imgRef"
                                    :src="jFileCache.mediaCache[item.searchIndex].dataUrl"
                                    @load="(e) => { imgOnLoad(item, e) }"
                                    :style="{ 'transform': 'translate(' + (item.transX) + 'px,' + (item.transY) + 'px)' }"
                                    draggable="false" ondragstart="return false;">
                                <!-- 视频 -->
                                <video v-if="item.isViewVideo" class="comic_img"
                                    :src="jFileCache.mediaCache[item.searchIndex].dataUrl" autoplay loop prevload
                                    :style="{ 'transform': 'translate(' + (item.transX) + 'px,' + (item.transY) + 'px)' }">
                                </video>
                            </div>

                        </div>
                    </div>
                </div>
            </template>
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
    /* display: flex;
    flex-direction: column; */
    /* position: absolute; */
}

.display_container {
    transform-origin: left top;

}
</style>../mediaStore./ComicDisplayWaterfall