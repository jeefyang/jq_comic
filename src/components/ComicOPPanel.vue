<script setup lang="ts">
import { onMounted } from 'vue';

import { store } from "../store"
let map: { key: typeof store.readMode, name: string }[] = [
    { key: "fit", name: "适应屏幕" },
    { key: "none", name: "原始" },
    { key: "width", name: "适应宽度" },
    { key: "height", name: "适应高度" }
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
                <van-radio v-for="(item, index) in map" :key="index" :name="item.key">{{ item.name }}</van-radio>
            </van-radio-group>
        </div>
        <div class="br"></div>

        <!-- 左右手对换 -->
        <div class="sort">
            <div class="sort_title">左右对换:</div>
            <van-switch v-model="store.isLRReverse">
                <template #node>
                    <div class="icon-wrapper">
                        <van-icon :name="store.isLRReverse ? 'success' : 'cross'" />
                    </div>
                </template>
            </van-switch>
        </div>
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