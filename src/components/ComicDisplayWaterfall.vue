<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { imgStore, imgStoreDisplayChildType } from '../imgStore'
import { jFileCache } from "../tool/fileCache"
import ComicDisplayBottom from './ComicDisplayBottom.vue'
import { imgCommon } from '../tool/imgCommon';
import { jImgWaterfall } from '../tool/imgWaterfall';
import { store } from '../store';
import { jaction } from "../tool/action"
import { JTouch } from '../tool/touch';


const divRef = ref(<HTMLDivElement>null)

onMounted(() => {
    watch([() => store.splitMedia, () => imgStore.margin], () => {
        for (let i = 0; i < imgStore.children.length; i++) {
            let child = imgStore.children[i]
            child.isLoaded && imgCommon.imgResize(child)
        }
        imgCommon.jumpImg(store.displayIndex)
    })
    watch([() => store.directX], () => {
        for (let i = 0; i < imgStore.children.length; i++) {
            let child = imgStore.children[i]
            child.isLoaded && imgCommon.imgResize(child)
        }
    })
    imgCommon.setDiv(divRef.value)
    let touch = new JTouch(divRef.value)
    touch.setClick((x, y) => {
        console.log("click")
        jaction.setClickArea(x, y)
    })
    touch.setDblclick((x, y) => {
        console.log('dblclick')
        pointScale(x, y)
    })
})

const imgOnLoad = (e: Event, item: imgStoreDisplayChildType) => {
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


const onScroll = (e: Event) => {
    jaction.continuedFunc(() => {
        let div = <HTMLDivElement>e.target
        let data = jImgWaterfall.scrollView(0, 0, (h) => {
            return h >= div.scrollTop
        })
        let index = data.index
        let startY = data.start
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
        let list = jImgWaterfall.scrollViewList(index, startY, (c) => {
            c.isView = true
            imgCommon.imgUpdateState(c)
        })
        let start = list[list.length - 1]
        for (let i = start; i < start + imgStore.waterfallNextMediaCount; i++) {
            let child = imgStore.children[i]
            if (!child) {
                break
            }
            child.isView = true
            imgCommon.imgUpdateState(child)
            jFileCache.autoSave()
        }
    }, "waterfallScroll", 100)
}


const pointScale = (x: number, y: number) => {
    let clientX = x - imgStore.divFloatLeft
    let clientY = y - imgStore.divFloatTop
    let div = divRef.value
    let oldSDomScale = imgStore.domScale
    imgStore.domScale = imgStore.domScale == 1 ? imgStore.scaling : 1
    let left = (div.scrollLeft + clientX) / oldSDomScale * imgStore.domScale - (clientX)
    let top = (div.scrollTop + clientY) / oldSDomScale * imgStore.domScale - (clientY)
    setTimeout(() => {

        div.scrollTo({ left: left, top: top, behavior: 'auto' })
    }, 50);

}

</script>
<template>
    <div class="comic_div" ref="divRef"
        :style="{ 'top': imgStore.divFloatTop + 'px', 'left': imgStore.divFloatLeft + 'px', 'width': imgStore.divFloatW + 'px', 'height': imgStore.divFloatH + 'px' }"
        @scroll="onScroll">

        <!-- 移动缩放用 -->
        <div class="display_trans_box"
            :style="{ 'width': imgStore.divFloatW + 'px', 'height': imgStore.divFloatH + 'px', 'transform': 'scale(' + imgStore.domScale + ')' }">
            <!-- 展开列表(for循环) -->
            <div :class="'display_list ' + item.displayIndex + '_' + item.splitNum"
                v-for="(item, index) in imgStore.children" :key="item.searchIndex">
                <!-- 分割显示 -->
                <div v-if="item.isViewDisplay"
                    :style="{ 'width': (item.scale * item.displayW) + 'px', 'height': (item.scale * item.displayH) + 'px', 'margin': '0px 0px ' + ((index + 1 < imgStore.children.length) ? imgStore.margin : 0) + 'px 0px' }">
                    <!-- 包裹可视部分 -->
                    <div class="display_container" :style="{ 'transform': 'scale(' + item.scale + ')' }">
                        <!-- 标准状态 -->
                        <div class="display_show"
                            :style="{ 'width': item.displayW + 'px', 'height': item.displayH + 'px', }">
                            <!-- 加载状态 -->
                            <div class="imgLoading" v-if="item.isViewLoading"
                                :style="{ 'background-color': store.mediaLoadingDivColor }">
                                <div class="imgLoading_center">
                                    <van-loading vertical type="spinner" size="50" text-size="50" text-color="#fff">{{
                                        item.displayIndex
                                    }}_{{ item.splitNum }}</van-loading>
                                </div>
                            </div>
                            <!-- 图像 -->
                            <div class="imgLoaded" v-if="item.isViewMedia">
                                <!-- 图片 -->
                                <img v-if="item.isViewImg" class="comic_img" ref="imgRef"
                                    :src="jFileCache.imgCache[item.searchIndex].dataUrl"
                                    @load="(e) => { imgOnLoad(e, item) }"
                                    :style="{ 'transform': 'translate(' + (item.transX) + 'px,' + (item.transY) + 'px)' }"
                                    draggable="false" ondragstart="return false;">
                                <!-- 视频 -->
                                <video v-if="item.isViewVideo" class="comic_img"
                                    :src="jFileCache.imgCache[item.searchIndex].dataUrl" autoplay loop prevload
                                    :style="{ 'transform': 'translate(' + (item.transX) + 'px,' + (item.transY) + 'px)' }">
                                </video>
                            </div>

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
    display: flex;
    flex-direction: column;
    /* position: absolute; */
}

.display_container {
    transform-origin: left top;

}

.display_list {
    /* background-color: yellow; */
}
</style>