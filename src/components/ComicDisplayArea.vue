<script setup lang="ts">
import { mediaStore } from "../mediaStore"
import { jaction } from "../tool/action";
</script>
<template>
    <div class="displayArea"
        :style="{ 'top': mediaStore.divFloatTop + 'px', 'left': mediaStore.divFloatLeft + 'px', 'width': mediaStore.divFloatW + 'px', 'height': mediaStore.divFloatH + 'px' }">
        <div class="displayArea_list" v-for="item in mediaStore.areaTouch" :style="jaction.getAreaCss(item)"></div>
    </div>
</template>
<style scoped>
.displayArea {
    pointer-events: none;
    position: absolute;

}

.displayArea_list {
    position: absolute;
}
</style>../mediaStore