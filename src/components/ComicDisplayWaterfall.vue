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
import { cloneAssign } from '../tool/util';
import { ComicDisplayWaterfall } from "./ComicDisplayWaterfall"
import { areaTouchWaterFall } from '../const';
import { mainMediaCtrl } from '../tool/mainMediaCtrl';
import { showToast } from 'vant';


const divRef = ref(<HTMLDivElement>null)
const halfTopRef = ref(<HTMLDivElement>null)
const halfBottomRef = ref(<HTMLDivElement>null)
/** 可视的列表 */
const viewList = ref(<MediaViewChildType[]>[])
const target = new ComicDisplayWaterfall()
/** 加载状态 */
const loading = ref(0)
/** 轮询时间 */
const looptime = 100

let loadImgCache = async (src: string): Promise<{ width: number, height: number }> => {
    let img = new Image()
    return new Promise(res => {
        img.onload = () => {
            res({ width: img.width, height: img.height })
        }
        img.src = src

    })
}


const jumpFunc = async () => {

    let arr = mediaStore.jumpPage.split(",")
    mediaStore.domScale = 1
    mainMediaCtrl.autoSave()
    if (mediaMiddleData.list.length == 0) {
        return
    }
   await addView(1,Number(arr[0]))

   await addView(1)
   await addView(1)
   await addView(1)

}

onMounted(() => {
    mediaStore.areaTouch = [...areaTouchWaterFall]

    watch([() => store.splitMedia, () => mediaStore.margin], () => {
        jumpFunc()
    })
    watch([() => mediaStore.jumpPage, () => mediaStore.forceJumpPage], () => {
        jumpFunc()
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

        setRefresh()
        mainMediaCtrl.autoSave()
    })

    watch([() => mediaStore.overHead], () => {
        showToast({ message: "已经是首页了,不要再滚", forbidClick: false, duration: 500 })
    })

    watch([() => mediaStore.overEnd], () => {
        showToast({ message: "已经是尾页了,不要再滚", forbidClick: false, duration: 500 })
    })

    target.eventInit(divRef.value)


    setTimeout(() => {
        window.addEventListener("resize", () => {

            mediaStore.jumpPage = `${store.displayIndex},0`
        })
        mediaStore.jumpPage = `${store.displayIndex},0`
        mediaStore.forceJumpPage++
        mainMediaCtrl.autoSave("store")
    }, 1000);
})

const setRefresh = () => {
    mediaStore.jumpPage = `${store.displayIndex},0`
    mediaStore.forceJumpPage++
    // curChild.value = cloneAssign(viewList.find(c => c.displayIndex == store.displayIndex))
    mediaStore.isRefresh = false
    // preloadMedia(1, loadingImgCount[1], store.displayIndex)
}

const loadedImg = async (index: number) => {
    let c = mediaMiddleData.list[index]
    c.isViewImg = true
    let cache = jFileCache.mediaCache[c.searchIndex]
    let size = await loadImgCache(cache.dataUrl)
    cache.originH = size.height
    cache.originW = size.width
    let list = [cloneAssign(c)]

    if (store.splitMedia == "split" || (store.splitMedia == "auto" && cache.originW > cache.originH)) {
        list.push(cloneAssign(c))
    }
    list.forEach(cc => {
        target.resizeChild(cc)
    })
    return list
}


const addView = async (add: -1 | 1, jump: number = -1) => {
    if (jump != -1) {
        let list = await loadedImg(jump)
        viewList.value = [...list]
        for (let i = 0; i < viewList.value.length; i++) {
            let c = viewList.value[i]
            target.resizeChild(c)
        }
        startLoopFunc()
        return true
    }
    let c = add == -1 ? viewList.value[0] : viewList.value[viewList.value.length - 1]
    if (!c) {
        return false
    }
    let index = c.displayIndex + add
    if (index == -1) {
        return false
    }
    let list = await loadedImg(index)
    if (add == -1) {
        viewList.value = [...list, ...viewList.value]
    }
    else {
        viewList.value = [...viewList.value, ...list]
    }

}

/** 循环遍历,用于切换漫画用的 */
let curLoopTag = 0



const startLoopFunc = () => {
    curLoopTag++
    loopFunc(curLoopTag)
}


const loopFunc = async (loopTag: number) => {
    return new Promise((res, _rej) => {
        if (loopTag != curLoopTag || !divRef.value) {
            return res(undefined)
        }
        // 往下
        if (target.scrollTag == 1) {
            console.log()
        }
        // 往上
        else if (target.scrollTag == -1) {
            console.log("-1")

        }

        setTimeout(() => {
            loopFunc(loopTag)
            res(undefined)
        }, looptime);
    })
}

const onScroll = (e) => {
    console.log('scroll', e)
}

</script>

<template>
    <div class="comic_div" ref="divRef" @scroll="onScroll"
        :style="{ 'top': mediaStore.divFloatTop + 'px', 'left': mediaStore.divFloatLeft + 'px', 'width': mediaStore.divFloatW + 'px', 'height': mediaStore.divFloatH + 'px' }">

        <div class="scroll-view">
            <!-- 头部 -->
            <div class="half-top" ref="halfTopRef"
                :style="{ height: (mediaStore.divFloatH / 2 - mediaStore.margin) + 'px', marginBottom: mediaStore.margin + 'px' }">
                <div>已经触碰到页首</div>
                <van-loading v-if="loading == -1" />
                <div>正在加载页面</div>
            </div>
            <template v-for="(item) in viewList" :key="item.searchIndex+item.splitNum">
                <div class="imgLoaded"
                    :style="{ textAlign: item.isSplit ? item.splitNum == 1 ? 'right' : 'left' : 'center', 'width': item.displayW + 'px', height: item.displayH + 'px',marginBottom: mediaStore.margin + 'px' }">
                    <!-- 图片 -->
                    <img v-if="item.isViewImg" class="img" ref="imgRef"
                        :src="jFileCache.mediaCache[item.searchIndex].dataUrl"
                        :style="{ 'width': item.displayW + 'px', height: item.displayH + 'px' }" draggable="false"
                        ondragstart="return false;">
                    <!-- 视频 -->
                    <video v-if="item.isViewVideo" :src="jFileCache.mediaCache[item.searchIndex].dataUrl" autoplay loop
                        prevload :style="{ 'width': item.displayW + 'px', height: item.displayH }">
                    </video>
                </div>
            </template>
            <!-- 底部 -->
            <div class="half-bottom" ref="halfBottomRef"
                :style="{ height: (mediaStore.divFloatH / 2 - mediaStore.margin) + 'px', marginBottom: mediaStore.margin + 'px' }">
                <div>已经触碰到页尾</div>
                <van-loading v-if="loading == 1" />
                <div>正在加载页面</div>
            </div>
        </div>

    </div>
    <ComicDisplayBottom></ComicDisplayBottom>
</template>
<style scoped>
.comic_div {
    overflow: auto;
    position: absolute;
    background: red;
}

::-webkit-scrollbar {
    display: none;
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


.display_trans_box {

    /* transform-origin: left top; */
    display: flex;
    flex-direction: column;
    /* position: absolute; */
}

.scroll-view {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.display_container {
    transform-origin: left top;

}

.half-top {
    background: green;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;

    div {
        font-size: 3vw;
        margin: 1vh;
    }
}

.half-bottom {
    background: rgb(42, 36, 194);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;

    div {
        font-size: 3vw;
        margin: 1vh;
    }
}

.img {
    object-fit: cover;
}
</style>