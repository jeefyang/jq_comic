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
    let c=mediaMiddleData.list[arr[0]]
    let cache=jFileCache.mediaCache[c.searchIndex]
    let size=await loadImgCache(cache.dataUrl)
    cache.originH=size.height
    cache.originW=size.width
    let list=[c]
    if(store.splitMedia=="split" || (store.splitMedia=="auto" && cache.originW>cache.originH)){
        list.push(cloneAssign(list[0]))
    }
    list.forEach(cc=>{
        target.resizeChild(cc)
    })
    viewList.value=list
   



    for (let i = 0; i < viewList.value.length; i++) {
        let c = viewList.value[i]
        target.resizeChild(c)
    }



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
    startLoopFunc()

    setTimeout(() => {
        window.addEventListener("resize", () => {

            mediaStore.jumpPage = `${store.displayIndex},0`
        })
        mediaStore.jumpPage = `${store.displayIndex},0`
        mediaStore.forceJumpPage++
        console.log(1111, mediaMiddleData.list.length)
        mainMediaCtrl.autoSave("store")
        console.log(4444, mediaMiddleData.list)
    }, 1000);
})

const setRefresh = () => {
    mediaStore.jumpPage = `${store.displayIndex},0`
    mediaStore.forceJumpPage++
    // curChild.value = cloneAssign(viewList.find(c => c.displayIndex == store.displayIndex))
    mediaStore.isRefresh = false
    // preloadMedia(1, loadingImgCount[1], store.displayIndex)
}


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

        }
        else if (target.scrollTag == -1) {

        }

        setTimeout(() => {
            loopFunc(loopTag)
            res(undefined)
        }, looptime);
    })
}







</script>
<template>
    <div class="comic_div" ref="divRef"
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
                <div class="imgLoaded">
                    <!-- 图片 -->
                    <img v-if="item.isViewImg" class="img" ref="imgRef"
                        :src="jFileCache.mediaCache[item.searchIndex].dataUrl"
                        :style="{ 'width': item.displayW + 'px', height: item.displayH }" draggable="false"
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

.imgLoaded {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.display_trans_box {

    /* transform-origin: left top; */
    display: flex;
    flex-direction: column;
    /* position: absolute; */
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

    div {
        font-size: 3vw;
        margin: 1vh;
    }
}

.half-bottom {
    background: yellow;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    div {
        font-size: 3vw;
        margin: 1vh;
    }
}

.img {
    object-fit: cover;
}
</style>