<script setup lang="ts">
import { imgStore } from "../imgStore"
import { jaction } from "../tool/action";
</script>
<template>
    <div class="displayArea"
        :style="{ 'top': imgStore.divFloatTop + 'px', 'left': imgStore.divFloatLeft + 'px', 'width': imgStore.divFloatW + 'px', 'height': imgStore.divFloatH + 'px' }">
        <div class="displayArea_list" v-for="item in imgStore.areaTouch" :style="jaction.getAreaCss(item)"></div>
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
</style>