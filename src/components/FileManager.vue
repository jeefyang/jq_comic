<script setup lang="ts">
import { store } from "../store"
import { jFileCache } from "../tool/fileCache";
import { onMounted, ref } from "vue";
import type { ConfigProviderThemeVars } from 'vant';

const themeVars: ConfigProviderThemeVars = {
    gridItemContentBackground: "rgba(0,0,0,0)",
    gridItemTextColor: "#8cdcf0"
    // background2: "rgba(0,0,0,0)"
};

const urlList = ref(<string[]>["."])
// urlList.value = [...urlList.value, ...store.curDirUrl.split('/')]
const fileList = ref(<{ className: string, name: string, title: string }[]>[])
const sliceCount = 10

onMounted(async () => {
    let url = "115Trans"
    let obj = await jFileCache.getFolder(url)
    console.log(obj)
    urlList.value = ['.', ...store.curDirUrl.split('/')]
    let list: typeof fileList.value = []
    for (let i = 0; i < obj.folders.length; i++) {
        list.push({ name: obj.folders[i].name.slice(0, sliceCount), className: "iconfont icon-wenjianjia", title: obj.folders[i].name })
    }
    let map: { [propName: string]: string } = {
        "zip": "icon-zip",
        "gif": "icon-GIF",
        "bmp": "icon-BMP",
        "jpg": "icon-JPG",
        "jpeg": "icon-JPG",
        "png": "icon-PNG",
        "avi": "icon-AVItubiao",
        "webp": "icon-webm",
        "apng": "icon-PNG",
    }

    for (let i = 0; i < obj.files.length; i++) {
        let file = obj.files[i]
        let className = map[file.exName]
        if (!className) {
            className = "icon-wenjian"
        }
        list.push({ name: file.name.slice(0, sliceCount), className: `iconfont ${className}`, title: file.name })
    }
    fileList.value = list
})

</script>

<template>
    <div class="file_big_div"
        :style="{ 'top': '0px', 'left': '0px', 'width': store.screenW + 'px', 'height': store.screenH + 'px' }"
        draggable="false" ondragstart="return false;">
        <!-- <div class='file_back_div'></div> -->
        <!-- 浮动层 -->
        <van-overlay class="file_back_div" :show="true">
            <div class="wrapper" @click.stop>
                <div class="block">
                    <!-- 路径展示 -->
                    <div class="file_path_div">
                        <van-row gutter="5" class="pathList">
                            <van-col v-for="item in urlList" span="1">
                                <van-Button type="default">{{ item }}</van-Button>
                            </van-col>
                        </van-row>
                    </div>

                    <!-- 文件显示大框 -->
                    <div class="file_display_box_div">
                        <van-config-provider :theme-vars="themeVars">
                            <!-- 文件显示 -->
                            <van-grid icon-size="50px" column-num="8" :border="false" square gutter="5px">
                                <van-grid-item :theme-vars="themeVars" v-for="(item) in fileList" :key="item.name"
                                    :icon="item.className" :text="item.name" :title="item.title">
                                </van-grid-item>
                            </van-grid>
                        </van-config-provider>
                    </div>
                </div>
            </div>
        </van-overlay>
        <div class="file_box_div"></div>
    </div>
</template>

<style scoped>
.file_big_div {
    position: absolute;
    overflow: hidden;
}

.file_back_div {
    position: absolute;
    overflow: hidden;
    width: 100%;
    height: 100%;
    /* backdrop-filter: blur(10px);
    background-color: rgba(109, 113, 104, 0.397); */
}

.file_box_div {

    /* width */
}

.file_grid {
    /* display: flex; */
}


.wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    backdrop-filter: blur(10px);
}

.block {
    width: 90%;
    height: 90%;
    background-color: #6e1e1e6e;
}

.pathList {
    display: flex;
    /* width: 100%; */
}

.file_path_div {
    height: 15%;
}

.file_display_box_div {

    overflow: auto;
    width: 100%;
    height: 85%;
}

:root:root {
    --van-tabbar-item-active-background: rgba(0, 0, 0, 0)
}
</style>
