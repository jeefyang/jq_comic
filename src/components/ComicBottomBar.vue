<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { store } from "../store"
import { JHammer } from "../tool/util"
import { imgStore } from "../imgStore";
import { imgCommon } from "../tool/imgCommon";

let curNo = ref(<number>store.displayIndex + 1)
let numInputRef = ref(<HTMLInputElement>null)
onMounted(() => {
    let numInput = numInputRef.value
    new JHammer(numInput).on("doubletap", () => {
        numInput.select()
    })

    watch(curNo, (e) => {
        if (e < 1) {
            curNo.value = 1
        }
        if (e > imgStore.len) {
            curNo.value = imgStore.len
        }
    })
})

let setCloseFunc = () => {
    store.displayBottomBar = false
}

let setCurNoFunc = () => {
    imgCommon.jumpImg(curNo.value - 1)
}

</script>

<template>
    <div class="bottom_Big_Div">
        <div class="bottom_back_Div" @click="setCloseFunc"></div>
        <div class="bottom_bar_div">
            <!-- 占位 -->
            <div class="site_div"></div>
            <input type="number" class="bottom_num_input" v-model="curNo" @change="setCurNoFunc" :max="imgStore.len" min="1"
                ref="numInputRef">
            <!-- 占位 -->
            <div class="site_div"></div>
            <div class="slider_div">
                <van-slider v-model="curNo" :min="1" :max="imgStore.len" @change="setCurNoFunc" bar-height="10px">
                    <template #button>
                        <div class="custom-button" draggable="false" ondragstart="return false;">{{ curNo }}</div>
                    </template>
                </van-slider>
            </div>
            <!-- 占位 -->
            <div class="site_div"></div>
            <div>{{ imgStore.len }}</div>
            <!-- 占位 -->
            <div class="site_div"></div>
        </div>



    </div>
</template>

<style scoped>
.site_div {
    width: 7%
}

.bottom_num_input {
    width: 10%;
    max-width: 45px;

}


.bottom_bar_div {
    position: absolute;
    left: 0px;
    bottom: 3.5%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

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
    background-color: rgba(50, 50, 50, 0.5);
}

.slider_div {

    left: 0px;
    width: 60%;
    bottom: 5%;

}

.custom-button {
    width: 120%;
    color: #fff;
    height: 24px;
    font-size: 24px;
    display: table-cell;
    /* line-height: 18px; */
    text-align: center;
    vertical-align: middle;
    background-color: var(--van-primary-color);
    border-radius: 100px;
    user-select: none;
}
</style>
