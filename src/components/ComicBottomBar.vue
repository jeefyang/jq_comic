<script setup lang="ts">
import { onMounted, ref } from "vue";
import { store } from "../store"
import { jFileCache } from "../tool/fileCache";

let curNo = ref(<number>store.curNo + 1)
onMounted(() => {
    console.log(store.curNo, store.imgCount)

})

let setCloseFunc = () => {
    console.log("close")
    store.displayBottomBar = false
}

let setCurNoFunc = () => {

    jFileCache.openZip(store.fileUrl, curNo.value - 1)
    store.curNo = curNo.value - 1
}

</script>

<template>
    <div class="bottom_Big_Div">
        <div class="bottom_back_Div" @click="setCloseFunc"></div>
        <div class="slider_div">
            <van-slider v-model="curNo" :min="1" :max="store.imgCount" @change="setCurNoFunc">
                <template #button>
                    <div class="custom-button">{{ curNo }}</div>
                </template>
            </van-slider>
        </div>


    </div>
</template>

<style scoped>
.bottom_Big_Div {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
}

.bottom_back_Div {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 0, 0, 0.338);
}

.slider_div {
    position: absolute;
    left: 15%;
    bottom: 5%;
    width: 70%;
}

.custom-button {
    width: 100%;
    color: #fff;
    font-size: 10px;
    line-height: 18px;
    text-align: center;
    background-color: var(--van-primary-color);
    border-radius: 100px;
}
</style>
