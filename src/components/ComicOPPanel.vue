<script setup lang="ts">
import { onMounted } from 'vue';

import { store } from "../store"
import { NameSortType, StoreReadMode } from '../type';
import { showToast } from 'vant';
import { staticData } from '../const';
import { mediaStore } from '../mediaStore';
import { mainMediaCtrl } from '../tool/mainMediaCtrl';
import { cloneAssign } from '../tool/util';
import { JFlex } from "../components/JFlex"
const readModeMap: { key: StoreReadMode, name: string }[] = [
    { key: "none", name: "原始" },
    { key: "fit", name: "适应屏幕" },
    { key: "width", name: "适应宽度" },
    { key: "height", name: "适应高度" },
    { key: "udWaterfall-width", name: "上下瀑布(铺满)" },
    { key: "udWaterfall-fit", name: "上下瀑布(适应)" },
]

const splitImgMap: { key: typeof store.splitMedia, name: string }[] = [
    { key: "auto", name: "自动" },
    { key: "none", name: "无" },
    { key: "split", name: "二分" }
]
const directXMap: { text: string, value: -1 | 1 }[] = [
    { text: "从左到右", value: -1 },
    { text: "从右到左", value: 1 }
]

const sortMap: { text: NameSortType, value: NameSortType }[] = [
    { text: "名称", value: "名称" },
    { text: "数字", value: "数字" },
    { text: "日期", value: "日期" }
]

onMounted(() => {
})

const setAutoSaveStore = (v: boolean) => {
    if (v) {
        mainMediaCtrl.autoSave()
        showToast({ message: "自动保存启动", forbidClick: false, duration: 500 })
    }
    else {
        showToast({ message: "取消自动保存", forbidClick: false, duration: 500 })
        mainMediaCtrl.clearSaveStore()
    }
}

const setAutoSaveGlance = (v: boolean) => {
    if (v) {
        mainMediaCtrl.autoSave()
        if (!store.isAutoSaveStore) {
            let o = cloneAssign(store)
            o.dirUrl = ""
            o.fileName = ""
            o.displayIndex = 0
            mainMediaCtrl.saveStoreByLocalStorage(o)
        }
        showToast({ message: "自动保存启动", forbidClick: false, duration: 500 })
    }
    else {
        showToast({ message: "取消自动保存", forbidClick: false, duration: 500 })
        mainMediaCtrl.clearSaveStore()
    }
}

const setNoSleep = (v: boolean) => {
    console.log("亮屏", v)
    if (v) {
        mediaStore.noSleep = Math.abs(mediaStore.noSleep) + 1
    }
    else {
        mediaStore.noSleep = -Math.abs(mediaStore.noSleep) - 1
    }

}

const setRefresh = () => {
    let check = window.confirm("是否刷新")
    if (check) {
        window.location.reload()
    }
}

const freshImg = async () => {
    await mainMediaCtrl.openMedia(store.dirUrl, store.fileName, store.displayIndex)
    // console.log(mediaMiddleData.list.map(c => jFileCache.getMediaCache(c).dataUrl))
    mediaStore.isRefresh = true
    // await jFileCache.openFile(store.dirUrl, store.fileName, store.curNo)
    // return
}

/** 测试操作 */
const dispatchTest = () => {
    console.time("test")
    let img = new Image()
    img.onload = () => {
        console.log(img.src, img.width, img.height)
        console.timeEnd("test")
    }
    img.src = "http://localhost:3006/getZipInFileByName?key=normal&url=comic%2FY-%E5%8C%BBl%E9%BE%99%2F%5BMox.moe%5D%5B%E9%86%AB%E9%BE%8D%5D%E5%8D%B724.zip&fileName=createby.png"
    // console.log(imgCommon.displayDiv.scrollLeft, imgStore.divFloatW, imgStore.divFloatH)
}

/** 手动保存 */
const manualSave = () => {
    mainMediaCtrl.saveStoreByLocalStorage()
    showToast({ message: "保存成功", forbidClick: false, duration: 500 })
}

/** 清空保存 */
const clearSave = () => {
    mainMediaCtrl.clearSave()
    showToast({ message: "清空成功", forbidClick: false, duration: 500 })
}

</script>
<template>
    <van-action-sheet v-model:show="mediaStore.displayOPPanel" title="设置" :closeable="false">
        <j-flex direction="vertical">
            <!-- 观看模式 -->
            <j-flex align="center">
                <div style='width:40px;'>观看:</div>
                <van-radio-group v-model="store.readMode" direction="horizontal">
                    <van-radio v-for="(item, index) in readModeMap" :key="index" :name="item.key">{{ item.name
                        }}</van-radio>
                </van-radio-group>
            </j-flex>

            <!-- 分割模式 -->
            <j-flex align="center">
                <div style='width:40px;'>分割:</div>
                <van-radio-group v-model="store.splitMedia" direction="horizontal" @change="mediaStore.setResize++">
                    <van-radio v-for="(item, index) in splitImgMap" :key="index" :name="item.key">{{ item.name
                        }}</van-radio>
                </van-radio-group>
            </j-flex>

            <!-- 排列 -->
            <j-flex align="center">
                <div style='width:40px;'>排列:</div>
                <van-dropdown-menu>
                    <van-dropdown-item v-model="store.mediaSortType" :options="sortMap" @change="freshImg()" />
                </van-dropdown-menu>
            </j-flex>

            <!-- 方向 -->
            <j-flex align="center">
                <div style='width:40px;'>方向:</div>
                <van-dropdown-menu>
                    <van-dropdown-item v-model="store.directX" :options="directXMap" @change="mediaStore.setResize++" />
                </van-dropdown-menu>
            </j-flex>

            <!-- 显示间隔 -->
            <j-flex align="center">
                <div style='width:80px;'>显示间隔:</div>
                <input type="number" v-model="mediaStore.margin">
            </j-flex>

            <!-- 颜色 -->
            <j-flex align="center">
                <div style='width:40px;'>颜色:</div>
                <van-button color="#ffffff" plain @click="store.textMsgColor = '#ffffff'">白色</van-button>
                <van-button color="#000000" @click="store.textMsgColor = '#000000'">黑色</van-button>
                <van-button color="#ff0000" @click="store.textMsgColor = '#ff0000'">红色</van-button>
                <input type="color" v-model="store.textMsgColor">
            </j-flex>

            <!-- 显示数目 -->
            <j-flex align="center">
                <div style='width:80px;'>显示数目:</div>
                <van-switch v-model="store.isDisplayMediaNum"></van-switch>
            </j-flex>

            <!-- 显示名称 -->
            <j-flex align="center">
                <div style='width:80px;'>显示名称:</div>
                <van-switch v-model="store.isDisplayFileName"></van-switch>
            </j-flex>

            <!-- 显示操作图 -->
            <j-flex align="center">
                <div style='width:100px;'>显示操作图:</div>
                <van-switch v-model="mediaStore.displayArea"></van-switch>
            </j-flex>

            <!-- 显示测试数据 -->
            <j-flex align="center">
                <div style='width:80px;'>显示测试:</div>
                <van-switch v-model="store.isDisplayDebugMsg"></van-switch>
            </j-flex>

            <!-- 反转操作 -->
            <j-flex align="center">
                <div style='width:80px;'>反转操作:</div>
                <van-switch v-model="store.isCtrlReverse"></van-switch>
            </j-flex>

            <!-- 允许滑动 -->
            <j-flex align="center">
                <div style='width:80px;'>允许滑动:</div>
                <van-switch v-model="store.isSwipe"></van-switch>
            </j-flex>

            <!-- 自动保存配置 -->
            <j-flex align="center">
                <div style='width:120px;'>自动保存配置:</div>
                <van-switch v-model="store.isAutoSaveStore" @change="setAutoSaveStore"></van-switch>
            </j-flex>

            <!-- 自动保存历史 -->
            <j-flex align="center">
                <div style='width:120px;'>自动保存历史:</div>
                <van-switch v-model="store.isAutoSaveGlance" @change="setAutoSaveGlance"></van-switch>
            </j-flex>

            <!-- 调试 -->
            <j-flex align="center">
                <div style='width:40px;'>调试:</div>
                <van-switch v-model="store.isControlDebug"></van-switch>
            </j-flex>

            <!-- 背景 -->
            <j-flex align="center">
                <div style='width:40px;'>背景:</div>
                <van-button color="#ffffff" plain
                    @click="store.background = staticData.defaultBackground">默认</van-button>
                <input type="color" v-model="store.background">
            </j-flex>

            <!-- 常规按钮功能 -->
            <j-flex wrap>
                <van-button type="default" @click="setRefresh">刷新</van-button>
                <van-button type="default" :disabled="!store.isControlDebug" @click="dispatchTest">测试</van-button>
                <van-button type="default" @click="manualSave">手动保存</van-button>
                <van-button type="default" @click="clearSave">清空保存</van-button>
                <van-button type="default" @click="setNoSleep(true)">长亮屏</van-button>
                <van-button type="default" @click="setNoSleep(false)">取消长亮屏</van-button>
            </j-flex>
            <div style="height: 100px;"></div>

        </j-flex>

    </van-action-sheet>
</template>
<style scoped></style>