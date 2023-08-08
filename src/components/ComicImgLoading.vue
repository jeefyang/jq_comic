<script setup lang="ts">

</script>
<template>
    <div class="parent">
        <van-overlay>
            <div class="wrapper">
                <div class="block">
                    <div class="positon">

                    </div>
                    <van-loading size="24px" vertical color="#1989fa">加载中...</van-loading>
                </div>

            </div>
        </van-overlay>
    </div>
</template>
<style scoped>
.parent {
    width: 100%;
    height: 100%;
    position: absolute;
}

.wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.block {
    width: 120px;
    height: 120px;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
</style>