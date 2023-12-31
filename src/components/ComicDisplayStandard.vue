<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { imgStore, imgStoreDisplayChildType } from '../imgStore'
import { jFileCache } from "../tool/fileCache"
import ComicDisplayBottom from './ComicDisplayBottom.vue'
import { imgCommon } from '../tool/imgCommon';
import { store } from '../store';
import { jaction } from "../tool/action"
import { JTouch } from '../tool/touch';
import { jImgStandard } from '../tool/imgStandard';


const divRef = ref(<HTMLDivElement>null)

onMounted(() => {
    watch([() => store.splitMedia, () => store.readMode], () => {
        imgStore.domScale = 1
        for (let i = 0; i < imgStore.children.length; i++) {
            let child = imgStore.children[i]
            child.isLoaded && imgCommon.MediaResize(child)
        }
        imgCommon.jumpMedia(store.displayIndex, 0)
    })
    watch([() => store.directX], () => {
        imgStore.domScale = 1
        for (let i = 0; i < imgStore.children.length; i++) {
            let child = imgStore.children[i]
            child.isLoaded && imgCommon.MediaResize(child)
        }
    })
    imgCommon.setDiv(divRef.value)
    let touch = new JTouch(divRef.value)
    touch.swipeTouchDelta = 100
    touch.setClick((x, y) => {
        console.log("click")
        jaction.setClickArea(x, y)
    })
    touch.setDblclick((x, y) => {
        console.log('dblclick')
        pointScale(x, y)
    })

    touch.setSiwpe(() => {
        console.log("swipe")
    })
})

const imgOnLoad = (e: Event, item: imgStoreDisplayChildType) => {
    let cache = jFileCache.imgCache[item.searchIndex]
    let oldH = item.displayH * item.scale * imgStore.domScale
    cache.originW = (<HTMLImageElement>e.target).width
    cache.originH = (<HTMLImageElement>e.target).height
    cache.isComplete = true
    imgCommon.MediaResize(item)
    if (item.displayIndex <= store.displayIndex || (item.displayIndex == store.displayIndex && item.splitNum < imgStore.curSplit)) {

        divRef.value && (divRef.value.scrollTop += item.displayH * item.scale - oldH)
    }
    item.isLoaded = true
    imgCommon.mediaUpdateState(item)
    if (item.displayIndex == store.displayIndex && imgStore.curSplit == item.splitNum && !item.isViewDisplay && item.splitNum == 1) {
        imgCommon.jumpMedia(item.displayIndex, 0)
    }
}


const pointScale = (x: number, y: number) => {
    let overflowDiv = jImgStandard.getOverFlowDiv()
    let clientX = x - imgStore.divFloatLeft
    let clientY = y - imgStore.divFloatTop
    let child = jImgStandard.getCurChild().o
    let rectX = -overflowDiv.scrollLeft + child.parentTransX
    let rectY = -overflowDiv.scrollTop + child.parentTransY
    if (clientX < rectX || clientX > rectX + (child.scale * child.displayW * imgStore.domScale) || clientY < rectY || clientY > rectY + (child.scale * child.displayH * imgStore.domScale)) {
        return
    }
    let oldSDomScale = imgStore.domScale
    imgStore.domScale = imgStore.domScale == 1 ? imgStore.scaling : 1
    imgCommon.MediaResize(child)
    let left = (overflowDiv.scrollLeft + clientX) / oldSDomScale * imgStore.domScale * child.scale - (clientX)
    let top = (overflowDiv.scrollTop + clientY) / oldSDomScale * imgStore.domScale * child.scale - (clientY)

    setTimeout(() => {
        console.log(overflowDiv)
        overflowDiv.scrollTo({ left: left, top: top, behavior: 'auto' })
    }, 50);

}

</script>
<template>
    <!-- 定位 -->
    <div class="comic_div" ref="divRef"
        :style="{ 'top': imgStore.divFloatTop + 'px', 'left': imgStore.divFloatLeft + 'px', 'width': imgStore.divFloatW + 'px', 'height': imgStore.divFloatH + 'px' }">
        <!-- 显示用的框(撑满固定不动,禁用滚动轴) -->
        <div class="display_trans_box">
            <!-- 整体偏移,用于切换图片 -->
            <div class="diplay_big_trans" :style="{ 'left': imgStore.domTransX + 'px', 'top': imgStore.domTransY + 'px' }"
                onscroll="return false">
                <!-- 展开列表(for循环) -->
                <div :class="'display_list ' + item.displayIndex + '_' + item.splitNum" v-for="(item) in imgStore.children"
                    :key="item.searchIndex">

                    <!-- 单页显示用的框(撑满固定不动,会有滚动轴) -->
                    <div class="display_overflow"
                        :style="{ 'width': imgStore.divFloatW + 'px', 'height': imgStore.divFloatH + 'px' }">
                        <!-- 移动位置,影响滚动轴 -->
                        <div class="display_trans"
                            :style="{ 'top': item.parentTransY + 'px', 'left': item.parentTransX + 'px', 'width': (item.scale * item.displayW * imgStore.domScale) + 'px', 'height': (item.scale * item.displayH * imgStore.domScale) + 'px' }">
                            <!-- 缩放视图 -->
                            <div class="display_container"
                                :style="{ 'transform': 'scale(' + item.scale * imgStore.domScale + ')' }">
                                <!-- 标准状态 -->
                                <div class="display_show"
                                    :style="{ 'width': item.displayW + 'px', 'height': item.displayH + 'px', }">
                                    <!-- 加载状态 -->
                                    <div class="imgLoading" v-if="item.isViewLoading"
                                        :style="{ 'background-color': store.mediaLoadingDivColor }">
                                        <div class="imgLoading_center">
                                            <van-loading vertical type="spinner" size="50" text-size="50"
                                                text-color="#fff">{{
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