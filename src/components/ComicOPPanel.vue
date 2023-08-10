<script setup lang="ts">
import { onMounted } from 'vue';

import { store } from "../store"
import { jImgScroll } from '../tool/imgScroll';
const readModeMap: { key: typeof store.readMode, name: string }[] = [
    { key: "fit", name: "适应屏幕" },
    { key: "none", name: "原始" },
    { key: "width", name: "适应宽度" },
    { key: "height", name: "适应高度" }
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
onMounted(() => {
})
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
            <van-radio-group v-model="store.splitImg" direction="horizontal" @change="jImgScroll.resizeImg()">
                <van-radio v-for="(item, index) in splitImgMap" :key="index" :name="item.key">{{ item.name }}</van-radio>
            </van-radio-group>
        </div>
        <!-- 空行 -->
        <div class="br"></div>

        <!-- 方向 -->
        <div class="sort">
            <div class="sort_title">方向:</div>
            <van-dropdown-menu>
                <van-dropdown-item v-model="store.directX" :options="directXMap" @change="jImgScroll.resizeImg()" />
            </van-dropdown-menu>

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