<script setup lang="ts">
import { store } from "../store"
import { jFileCache } from "../tool/fileCache";
import { onMounted, ref } from "vue";
import { showLoadingToast, showToast, type ConfigProviderThemeVars } from 'vant';
import { JFileFormatType, JFolderDisplayType, NameSortType } from "../type";
import path from "path-browserify"


const themeVars: ConfigProviderThemeVars = {
    gridItemContentBackground: "rgba(0,0,0,0)",
    gridItemTextColor: "#8cdcf0"
    // background2: "rgba(0,0,0,0)"
};
const fileBoxDivRef = ref(<HTMLDivElement>null)
const urlList = ref(<string[]>["."])
// urlList.value = [...urlList.value, ...store.curDirUrl.split('/')]
const fileList = ref(<{ className: string, name: string, title: string, type: "folder" | "file", index: number, originName: string, time: number, size?: number, exname?: string }[]>[])
let folderObj: JFolderDisplayType = null
let folderObjList: typeof fileList.value = []
let fileObjList: typeof fileList.value = []
let fileCacheList: typeof fileList.value = []
let fileBoxDiv: HTMLDivElement = null

let isReveser = false
let sortType = ref(<NameSortType>"名称")
let searchKey = ref(<string>"")
let scrollCount = 0
let scrollMax = 0



onMounted(async () => {
    let loadding = showLoadingToast({ message: "加载中", overlay: true, forbidClick: true, duration: 0 })
    fileBoxDiv = fileBoxDivRef.value
    await updateFolderFunc(store.curDirUrl)
    loadding.close()
    return
})


/** 设置排序大法 */
let setSortFunc = async () => {
    [folderObjList, fileObjList].forEach(child => {
        switch (sortType.value) {
            case "名称":
                child.sort((a, b) => a.name > b.name ? 1 : -1)
                break
            case "大小":
                child.sort((a, b) => {
                    if (!a.size || !b.size) {
                        return a.name > b.name ? 1 : -1
                    }
                    return a.size > b.size ? 1 : -1
                })
                break
            case "日期":
                child.sort((a, b) => a.time > b.time ? 1 : -1)
                break
            case "数字":
                child.sort((a, b) => {
                    let an = a.name.match(/\d+/)?.[0]
                    let bn = b.name.match(/\d+/)?.[0]
                    if (an == null) {
                        an = "0"
                    }
                    if (bn == null) {
                        bn = "0"
                    }
                    return Number(an) - Number(bn)
                })
                break
        }
        if (isReveser) {
            child.reverse()
        }
    })
    fileCacheList = [...folderObjList, ...fileObjList]
    if (searchKey) {
        let reg = new RegExp(searchKey.value, "i")
        fileCacheList = fileCacheList.filter(c => {
            let index = c.originName.search(reg)
            return index != -1
        })
    }
    scrollMax = fileCacheList.length
    scrollCount = 0
    fileList.value = []
    // 为了让ui有时间操作
    await new Promise((res) => {

        setTimeout(() => {

            res(undefined)
        }, 100);
    })
    await scrollLazyLoad(50)
    return
}

/** 设置排序类型大法 */
let setSortTypeFunc = async () => {
    let map: (NameSortType)[] = ["名称", "大小", "日期", "数字"]
    let index = map.indexOf(sortType.value)
    index++
    if (index >= map.length) {
        index = 0
    }
    sortType.value = map[index]
    await setSortFunc()
    return
}


let updateFolderFunc = async (url: string) => {
    store.curDirUrl = url
    folderObj = await jFileCache.getFolder(url)
    urlList.value = ['.', ...store.curDirUrl.split(path.sep)]
    store.curDirUrl = url
    folderObjList = []
    for (let i = 0; i < folderObj.folders.length; i++) {
        folderObjList.push({
            name: folderObj.folders[i].name.slice(0, store.displayFileTextCount),
            className: "iconfont icon-wenjianjia",
            title: folderObj.folders[i].name,
            type: "folder",
            index: i,
            originName: folderObj.folders[i].name,
            time: folderObj.folders[i].mtime
        })
    }
    let mediaMap: { [propName in JFileFormatType]: string }
        = {
        "zip": "icon-zip",
        "gif": "icon-GIF",
        "bmp": "icon-BMP",
        "jpg": "icon-JPG",
        "jpeg": "icon-JPG",
        "png": "icon-PNG",
        "apng": "icon-PNG",
        "webp": "icon-webm",
        "avi": "icon-AVItubiao",
        "mp4": 'icon-mp',
        "mkv": "icon-mkv",
        "webm": "icon-webm",
        "wmv": "icon-wmv"
    }
    fileObjList = []
    for (let i = 0; i < folderObj.files.length; i++) {
        let file = folderObj.files[i]
        let className = mediaMap[file.exName]
        if (!className) {
            className = "icon-wenjian"
        }
        fileObjList.push({
            name: file.name.slice(0, store.displayFileTextCount),
            className: `iconfont ${className}`,
            title: file.name,
            type: "file",
            index: i,
            originName: file.name,
            size: file.size,
            time: file.mtime,
            exname: file.exName
        })
    }
    await setSortFunc()
    return
}

/** 选中文件大法(包括) */
const selectFileFunc = async (item: (typeof fileList.value)[number]) => {
    let loadding = showLoadingToast({ message: "加载中", overlay: true, forbidClick: true, duration: 0 })
    searchKey.value = ""
    if (item.type == "folder") {
        let newUrl: string = path.join(store.curDirUrl, item.originName)
        store.isDisplayLoading = true
        await updateFolderFunc(newUrl)
        store.isDisplayLoading = false
    }
    else if (item.type == "file") {
        store.isDisplayLoading = true
        let check = await jFileCache.openFile(store.curDirUrl, item.originName)
        if (!check) {
            loadding.close()
            showToast({ message: "没有可观看的文件", duration: 1000, forbidClick: true })
            return
        }
        store.displayFileManager = false
        store.isDisplayLoading = false
    }
    loadding.close()
    return
}

/** 通过序号回退文件夹大法 */
const rebackFolderFuncByIndex = async (index: number) => {
    let loadding = showLoadingToast({ message: "加载中", overlay: true, forbidClick: true, duration: 0 })
    if (index == -1) {
        index = urlList.value.length - 2
    }
    if (index < 0) {
        console.log('不能再退了')
        return
    }

    let arr = urlList.value.slice(1, index + 1) || [""]
    let newUrl = path.join(...arr)
    await updateFolderFunc(newUrl)
    loadding.close()
    return
}

const rebackCur = async () => {
    await updateFolderFunc(store.dirUrl)
    return
}



/** 强制停止冒泡 */
const stopBubbleFunc = (e: MouseEvent) => {
    e.stopPropagation()
}

/** 获取文件大小大法 */
const getSizeStrFunc = (size: number) => {
    return (size / 1024 / 1024).toFixed(2) + 'MB'
}

/** 获取时间大法 */
const getDateStrFunc = (ms: number) => {
    let date = new Date(ms)
    let y = date.getFullYear()
    y = y >= 2000 ? (y - 2000) : y
    let m = date.getMonth() + 1
    let mstr = m >= 10 ? m : `0${m}`
    let d = date.getDate()
    let dstr = d >= 10 ? d : `0${d}`
    let h = date.getHours()
    let apm = h >= 12 ? "pm" : "am"
    if (h > 12) {
        h -= 12
    }
    let hstr = h >= 10 ? h : `0${h}`
    let min = date.getMinutes()
    let minstr = min >= 10 ? min : `0${min}`
    return `${y}-${mstr}-${dstr} ${apm}:${hstr}:${minstr}`
}

const setIconTypeFunc = () => {
    let map: (typeof store.displayFileStyleType)[] = ["icon", "detail"]
    let index = map.indexOf(store.displayFileStyleType)
    index++
    if (index >= map.length) {
        index = 0
    }
    let key = map[index]
    store.displayFileStyleType = key
}

/** 滚动懒加载 */
const scrollLazyLoad = async (num: number) => {
    let delta = 200
    if (scrollCount >= scrollMax) {
        return
    }
    let v = fileBoxDiv.clientHeight + fileBoxDiv.scrollTop - fileBoxDiv.scrollHeight
    if (v + delta < 0) {
        return
    }
    fileList.value.push(...fileCacheList.slice(scrollCount, scrollCount + num))
    scrollCount += num
    await new Promise((res, _rej) => {
        setTimeout(() => {
            scrollLazyLoad(num)
            res(undefined)
        }, 100);
    })
    return
}

</script>

<template>
    <div class="file_big_div"
        :style="{ 'top': '0px', 'left': '0px', 'width': store.screenW + 'px', 'height': store.screenH + 'px' }"
        draggable="false" ondragstart="return false;">
        <div class='file_back_div'></div>
        <!-- 浮动层 -->

        <div class="file_box_div">
            <!-- 路径展示 -->
            <div>
                <div class="file_path_div">
                    <input placeholder="搜索" class="file_search_input" @change="setSortFunc" v-model="searchKey" />
                    <button v-for="(item, index) in urlList" :title="item" @click="rebackFolderFuncByIndex(index)">{{
                        item }} </button>
                </div>
            </div>
            <!-- 功能键 -->
            <div class="file_op_div">
                <van-Button @click="rebackFolderFuncByIndex(-1)">后退</van-Button>
                <van-Button @click="setIconTypeFunc">图标</van-Button>
                <van-Button @click="setSortTypeFunc()">排序:{{ sortType }}</van-Button>
                <van-Button @click="isReveser = !isReveser; setSortFunc()">反序</van-Button>
                <van-Button @click="rebackCur">当前</van-Button>
                <van-Button @click="store.displayFileManager = false">关闭</van-Button>
            </div>

            <!-- 文件显示大框 -->
            <div class="file_display_box_div" ref="fileBoxDivRef" @scroll="scrollLazyLoad(50)">
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
                                        <div v-if="item.type == 'file'" class="file_display_icon_detail_op_size_div">
                                            {{ getSizeStrFunc(item.size) }}</div>
                                        <!-- 为了让ui对齐 -->
                                        <div v-if="item.type == 'folder'" class="file_display_icon_detail_op_size_div">
                                        </div>
                                        <div class="file_display_icon_detail_op_date_div">{{ getDateStrFunc(item.time) }}
                                        </div>
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
    display: flex;
    flex-direction: column;
}

.pathList {
    display: flex;
    /* width: 100%; */
}



.file_path_div {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
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
    flex-grow: 1;
}

.file_display_icon_detail_div {
    display: flex;
}

.file_search_input {
    width: 100px;
}

.file_display_icon_detail_name_div {}

.file_display_icon_detail_text_div {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.file_display_icon_detail_op_size_div {
    text-align: start;
    transform: scale(0.8);
    color: #bbbbbb;
}

.file_display_icon_detail_op_date_div {
    text-align: end;
    transform: scale(0.8);
    color: #bbbbbb;
}

.file_display_icon_detail_op_div {
    display: flex;
    justify-content: space-between;
}
</style>
