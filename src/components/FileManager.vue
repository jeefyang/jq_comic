<script setup lang="ts">
import { store } from "../store"
import { jFileCache } from "../tool/fileCache";
import { onMounted, ref } from "vue";
import type { ConfigProviderThemeVars } from 'vant';
import { JFolderDisplayType } from "../type";
import path from "path-browserify"


const themeVars: ConfigProviderThemeVars = {
    gridItemContentBackground: "rgba(0,0,0,0)",
    gridItemTextColor: "#8cdcf0"
    // background2: "rgba(0,0,0,0)"
};

const urlList = ref(<string[]>["."])
// urlList.value = [...urlList.value, ...store.curDirUrl.split('/')]
const fileList = ref(<{ className: string, name: string, title: string, type: "folder" | "file", index: number, originName: string }[]>[])
let folderObj: JFolderDisplayType = null

onMounted(async () => {
    let url = "115Trans"
    await updateFolderFunc(url)
    return
})

let updateFolderFunc = async (url: string) => {
    folderObj = await jFileCache.getFolder(url)
    console.log(folderObj)
    urlList.value = ['.', ...store.curDirUrl.split(path.sep)]
    let folderObjList: typeof fileList.value = []
    for (let i = 0; i < folderObj.folders.length; i++) {
        folderObjList.push({ name: folderObj.folders[i].name.slice(0, store.displayFileTextCount), className: "iconfont icon-wenjianjia", title: folderObj.folders[i].name, type: "folder", index: i, originName: folderObj.folders[i].name })
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
    let fileObjList: typeof fileList.value = []
    for (let i = 0; i < folderObj.files.length; i++) {
        let file = folderObj.files[i]
        let className = map[file.exName]
        if (!className) {
            className = "icon-wenjian"
        }
        fileObjList.push({ name: file.name.slice(0, store.displayFileTextCount), className: `iconfont ${className}`, title: file.name, type: "file", index: i, originName: file.name })
    }
    fileList.value = [...folderObjList, ...fileObjList]
    return
}

let selectFileFunc = async (item: (typeof fileList.value)[number]) => {
    console.log(item.type, item.index)
    if (item.type == "folder") {
        let newUrl: string = path.join(store.curDirUrl, item.originName)
        await updateFolderFunc(newUrl)
    }
    return
}

let selectFolderFunc = async (index: number) => {
    let arr = urlList.value.slice(1, index + 1) || [""]
    console.log(arr)
    let newUrl = path.join(...arr)
    await updateFolderFunc(newUrl)
    return
}

let fallbackSelectFolderFunc = async () => {
    if (urlList.value.length <= 1) {
        console.log('不能再退了')
        return
    }
    await selectFolderFunc(urlList.value.length - 2)
    return
}

let stopBubbleFunc = (e: MouseEvent) => {
    e.stopPropagation()
}

</script>

<template>
    <div class="file_big_div"
        :style="{ 'top': '0px', 'left': '0px', 'width': store.screenW + 'px', 'height': store.screenH + 'px' }"
        draggable="false" ondragstart="return false;">
        <div class='file_back_div'></div>
        <!-- 浮动层 -->

        <div class="file_box_div">
            <div class="file_topbar_box_div">
                <!-- 路径展示 -->
                <div class="file_path_div">
                    <van-Button v-for="(item, index) in urlList" type="default" :title="item"
                        @click="selectFolderFunc(index)">{{
                            item }} </van-Button>
                </div>
                <!-- 功能键 -->
                <div class="file_op_div">
                    <van-Button @click="fallbackSelectFolderFunc">后退</van-Button>
                    <van-Button>图标</van-Button>
                    <van-Button>排序</van-Button>
                    <van-Button @click="store.displayFileManager = false">关闭</van-Button>
                </div>
            </div>
            <!-- 文件显示大框 -->
            <div class="file_display_box_div">
                <van-config-provider :theme-vars="themeVars">
                    <!-- 文件显示 -->
                    <!-- 图标显示 -->
                    <van-grid :icon-size="store.displayFileIconSize + 'px'" :column-num="store.displayFileCol"
                        :border="false" square gutter="5px" v-if="store.displayFileStyleType == 'icon'">
                        <van-grid-item :theme-vars="themeVars" v-for="(item) in fileList" :key="item.originName"
                            :icon="item.className" :text="item.name" :title="item.title" @click="selectFileFunc(item)">
                        </van-grid-item>
                    </van-grid>
                    <!-- 详细显示 -->
                    <van-grid :column-num="1" :border="false" gutter="5px" v-if="store.displayFileStyleType == 'detail'"
                        :center="false">
                        <van-grid-item :theme-vars="themeVars" v-for="(item) in fileList" :key="item.originName">
                            <div class="file_display_icon_detail_div">
                                <van-icon :name="item.className" size="35px"></van-icon>
                                <div class="file_display_icon_detail_text_div">
                                    <div class="file_display_icon_detail_name_div">
                                        <van-text-ellipsis :content="item.originName" expand-text=">" collapse-text="<"
                                            rows="1" @click="selectFileFunc(item)" @click-action="stopBubbleFunc" />
                                    </div>
                                    <div class="file_display_icon_detail_op_div">
                                        <div>xx</div>
                                    </div>
                                </div>

                            </div>
                        </van-grid-item>
                    </van-grid>
                </van-config-provider>
            </div>
        </div>

        <!-- <van-overlay class="file_back_div" :show="true">
            <div class="wrapper">
                
            </div>
        </van-overlay> -->
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
    backdrop-filter: blur(10px);
    background-color: rgba(109, 113, 104, 0.397);
}




.wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    backdrop-filter: blur(10px);
}

.file_box_div {
    position: absolute;
    top: 5%;
    left: 5%;
    width: 90%;
    height: 90%;
    background-color: #6e1e1e6e;
}

.pathList {
    display: flex;
    /* width: 100%; */
}

.file_topbar_box_div {
    height: 15%;
}

.file_path_div {
    display: flex;
    overflow-x: scroll;
    overflow-y: hidden;
}

.file_op_div {
    display: flex;
}

.file_path_div::-webkit-scrollbar {
    display: none;
}

.file_display_box_div {

    overflow: auto;
    width: 100%;
    height: 85%;
}

.file_display_icon_detail_div {
    display: flex;
}

.file_display_icon_detail_name_div {}

.file_display_icon_detail_text_div {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}
</style>
