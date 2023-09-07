<script setup lang="ts">
import { onMounted } from 'vue';

import { store } from "../store"
import { jFileCache } from '../tool/fileCache';
import { NameSortType } from '../type';
import { showToast } from 'vant';
import { staticData } from '../const';
import { imgStore } from '../imgStore';
import { imgCommon } from '../tool/imgCommon';
const readModeMap: { key: typeof store.readMode, name: string }[] = [
    { key: "fit", name: "适应屏幕" },
    { key: "none", name: "原始" },
    { key: "width", name: "适应宽度" },
    { key: "height", name: "适应高度" },
    { key: "udWaterfall", name: "上下瀑布" }
]

const splitImgMap: { key: typeof store.splitImg, name: string }[] = [
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
    { text: "数字", value: "数字" }
]

onMounted(() => {
})

const setAutoSave = (v: boolean) => {
    if (v) {
        jFileCache.autoSave()
        showToast({ message: "保存成功", forbidClick: false, duration: 500 })
    }
    else {
        jFileCache.clearSave()
    }
}

const setRefresh = () => {
    let check = window.confirm("是否刷新")
    if (check) {
        window.location.reload()
    }
}

const freshImg = async () => {
    // await jFileCache.openFile(store.dirUrl, store.fileName, store.curNo)
    // return
}


const dispatchTest = () => {
    console.log(imgStore)
}

</script>
<template>
    <van-action-sheet v-model:show="store.displayOPPanel" title="设置" :closeable="false">
        <!-- 观看模式 -->
        <div class="sort">
            <div class="sort_title">观看:</div>
            <van-radio-group v-model="store.readMode" direction="horizontal">
                <van-radio v-for="(item, index) in readModeMap" :key="index" :name="item.key">{{ item.name }}</van-radio>
            </van-radio-group>
        </div>
        <!-- 空行 -->
        <div class="br"></div>

        <!-- 分割模式 -->
        <div class="sort">
            <div class="sort_title">分割:</div>
            <van-radio-group v-model="store.splitImg" direction="horizontal" @change="imgCommon.screenResize()">
                <van-radio v-for="(item, index) in splitImgMap" :key="index" :name="item.key">{{ item.name }}</van-radio>
            </van-radio-group>
        </div>
        <!-- 空行 -->
        <div class="br"></div>

        <!-- 方向 -->
        <div class="sort">
            <div class="sort_title">排列:</div>
            <van-dropdown-menu>
                <van-dropdown-item v-model="store.imgSortType" :options="sortMap" @change="freshImg()" />
            </van-dropdown-menu>
        </div>
        <!-- 空行 -->
        <div class="br"></div>

        <!-- 方向 -->
        <div class="sort">
            <div class="sort_title">方向:</div>
            <van-dropdown-menu>
                <van-dropdown-item v-model="store.directX" :options="directXMap" @change="imgCommon.screenResize()" />
            </van-dropdown-menu>
        </div>
        <!-- 空行 -->
        <div class="br"></div>

        <!-- 颜色 -->
        <div class="sort">
            <div class="sort_title">颜色:</div>
            <van-button color="#ffffff" plain @click="store.textMsgColor = '#ffffff'">白色</van-button>
            <van-button color="#000000" @click="store.textMsgColor = '#000000'">黑色</van-button>
            <van-button color="#ff0000" @click="store.textMsgColor = '#ff0000'">红色</van-button>
            <input type="color" v-model="store.textMsgColor">
        </div>
        <!-- 空行 -->
        <div class="br"></div>

        <!-- 显示数目 -->
        <div class="sort">
            <div class="sort_title">显示数目:</div>
            <van-switch v-model="store.isDisplayImgNum">
                <template #node>
                    <div class="icon-wrapper">
                        <van-icon :name="store.isDisplayImgNum ? 'success' : 'cross'" />
                    </div>
                </template>
            </van-switch>
        </div>
        <!-- 空行 -->
        <div class="br"></div>

        <!-- 显示名称 -->
        <div class="sort">
            <div class="sort_title">显示名称:</div>
            <van-switch v-model="store.isDisplayFileName">
                <template #node>
                    <div class="icon-wrapper">
                        <van-icon :name="store.isDisplayFileName ? 'success' : 'cross'" />
                    </div>
                </template>
            </van-switch>
        </div>
        <!-- 空行 -->
        <div class="br"></div>

        <!-- 显示测试数据 -->
        <div class="sort" v-if="store.isControlDebug">
            <div class="sort_title">显示测试:</div>
            <van-switch v-model="store.isDisplayDebugMsg">
                <template #node>
                    <div class="icon-wrapper">
                        <van-icon :name="store.isDisplayDebugMsg ? 'success' : 'cross'" />
                    </div>
                </template>
            </van-switch>
        </div>
        <!-- 空行 -->
        <div class="br" v-if="store.isControlDebug"></div>

        <!-- 反转操作 -->
        <div class="sort">
            <div class="sort_title">反转操作:</div>
            <van-switch v-model="store.isCtrlReverse">
                <template #node>
                    <div class="icon-wrapper">
                        <van-icon :name="store.isCtrlReverse ? 'success' : 'cross'" />
                    </div>
                </template>
            </van-switch>
        </div>
        <!-- 空行 -->
        <div class="br"></div>

        <!-- 自动保存 -->
        <div class="sort">
            <div class="sort_title">自动保存:</div>
            <van-switch v-model="store.isAutoSave" @change="setAutoSave">
                <template #node>
                    <div class="icon-wrapper">
                        <van-icon :name="store.isAutoSave ? 'success' : 'cross'" />
                    </div>
                </template>
            </van-switch>
        </div>
        <!-- 空行 -->
        <div class="br"></div>

        <!-- 自动保存 -->
        <div class="sort" v-if="store.isControlDebug">
            <div class="sort_title">调试:</div>
            <van-switch v-model="store.isControlDebug">
                <template #node>
                    <div class="icon-wrapper">
                        <van-icon :name="store.isControlDebug ? 'success' : 'cross'" />
                    </div>
                </template>
            </van-switch>
        </div>
        <!-- 空行 -->
        <div class="br" v-if="store.isControlDebug"></div>

        <!-- 背景 -->
        <div class="sort">
            <div class="sort_title">背景:</div>
            <van-button color="#ffffff" plain @click="store.background = staticData.defaultBackground">默认</van-button>
            <input type="color" v-model="store.background">
        </div>
        <!-- 空行 -->
        <div class="br" v-if="store.isControlDebug"></div>

        <!-- 常规按钮功能 -->
        <div class="sort">
            <van-button type="default" @click="setRefresh">刷新</van-button>
            <van-button type="default" :disabled="!store.isAutoSave" @click="dispatchTest">测试</van-button>
            <van-button type="default" :disabled="!store.isAutoSave" @click="setAutoSave(true)">保存</van-button>
        </div>
        <!-- 空行 -->
        <div class="br"></div>


    </van-action-sheet>
</template>
<style scoped>
.br {
    height: 10px;
}

.sort {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.sort_title {
    flex-shrink: 0;
}

.content {
    padding: 16px 16px 160px;
}

.op_big_div {
    position: absolute;
    overflow: hidden;
}

.op_back_div {
    position: absolute;
    overflow: hidden;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(10px);
    background-color: rgba(109, 113, 104, 0.397);
}

.file_box_div {
    position: absolute;
    top: 5%;
    left: 5%;
    width: 90%;
    height: 90%;
    background-color: #6e1e1e6e;
    display: flex;
    flex-direction: column;
}

.icon-wrapper {
    display: flex;
    width: 100%;
    justify-content: center;
    font-size: 18px;
}

.icon-wrapper .van-icon-success {
    line-height: 32px;
    color: var(--van-blue);
}

.icon-wrapper .van-icon-cross {
    line-height: 32px;
    color: var(--van-gray-5);
}
</style>