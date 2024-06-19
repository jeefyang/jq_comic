<script setup lang="ts">
import { store } from "../store"
import { jFileCache } from "../tool/fileCache";
import { onMounted, ref } from "vue";
import { showLoadingToast, showToast, type ConfigProviderThemeVars } from 'vant';
import { JFileFormatType, JFolderDisplayType, NameSortType } from "../type";
import path from "path-browserify"
import { mediaStore } from "../mediaStore"
import { mainMediaCtrl } from "../tool/mainMediaCtrl";
import { MiddleFileType } from "../media";
import { JFlex } from "../components/JFlex"
import { sortABByDate, sortABByName, sortABByNum, sortABBySize } from "../tool/util";


const themeVars: ConfigProviderThemeVars = {
    gridItemContentBackground: "rgba(0,0,0,0)",
    gridItemTextColor: "#fff"
    // background2: "rgba(0,0,0,0)"
};

const floatGap = ref(24)
const floatOffset = ref({ x: floatGap.value, y: -1 })

const showPopup = ref(false)

const fileBoxDivRef = ref(<HTMLDivElement>null)
const urlList = ref(<string[]>["."])
// urlList.value = [...urlList.value, ...store.curDirUrl.split('/')]
const fileList = ref(<MiddleFileType[]>[])
let folderObj: JFolderDisplayType = null
let folderObjList: typeof fileList.value = []
let fileObjList: typeof fileList.value = []
let fileCacheList: typeof fileList.value = []
let fileBoxDiv: HTMLDivElement = null

let searchKey = ref(<string>"")
let scrollCount = 0
let scrollMax = 0


onMounted(async () => {
    let loadding = showLoadingToast({ message: "加载中", overlay: true, forbidClick: true, duration: 0 })
    fileBoxDiv = fileBoxDivRef.value
    await updateFolderFunc(mediaStore.curDirUrl)
    loadding.close()
    if (store.zipThum) {
        thumChecked.value.push('zip')
    }
    if (store.imgThum) {
        thumChecked.value.push('img')
    }
    if (store.folderThum) {
        thumChecked.value.push("folder")
    }
    updateImg()
    return
})

const zipEXList = ['zip']
const imgEXList = ['jpg', 'png', 'webp', 'bmp']


const updateImg = async () => {
    let dirUrl = mediaStore.curDirUrl
    for (let i = 0; i < fileList.value.length; i++) {
        let file = fileList.value[i]
        if (store.switchThum) {
            file.imgb64 = ""
            continue
        }
        if (file.type == "file" && store.zipThum && zipEXList.includes(file.exname)) {
            file.imgb64 = await jFileCache.getFileThum(dirUrl, file.originName)
            continue
        }
        if (file.type == "file" && store.imgThum && imgEXList.includes(file.exname)) {
            file.imgb64 = await jFileCache.getFileThum(dirUrl, file.originName)
            continue
        }
        if (store.folderThum && file.type == "folder") {
            file.imgb64 = await jFileCache.getFileThum(dirUrl, file.originName, true)
            continue
        }
    }
}

/** 设置排序大法 */
const setSortFunc = async () => {
    [folderObjList, fileObjList].forEach(child => {
        switch (store.fileListSortType) {
            case "名称":
                child.sort((a, b) => sortABByName(undefined, undefined, undefined, undefined, a, b))
                break
            case "大小":
                child.sort((a, b) => sortABBySize(undefined, undefined, undefined, undefined, a, b))
                break
            case "日期":
                child.sort((a, b) => sortABByDate(undefined, undefined, undefined, undefined, a, b))
                break
            case "数字":
                child.sort((a, b) => sortABByNum(undefined, undefined, undefined, undefined, a, b))
                break
        }
        if (store.fileListReverse) {
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
    let index = map.indexOf(store.fileListSortType)
    index++
    if (index >= map.length) {
        index = 0
    }
    store.fileListSortType = map[index]
    await setSortFunc()
    return
}

let updateFolderFunc = async (url: string, forceUpdate?: boolean) => {
    mediaStore.curDirUrl = url
    folderObj = await jFileCache.getFolder(url, forceUpdate)
    urlList.value = ['.', ...mediaStore.curDirUrl.split(path.sep)]
    mediaStore.curDirUrl = url
    folderObjList = []
    for (let i = 0; i < folderObj.folders.length; i++) {
        folderObjList.push({
            name: folderObj.folders[i].name.slice(0, mediaStore.displayFileTextCount),
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
            name: file.name.slice(0, mediaStore.displayFileTextCount),
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
        let newUrl: string = path.join(mediaStore.curDirUrl, item.originName)
        mediaStore.isDisplayLoading = true
        await updateFolderFunc(newUrl)
        mediaStore.isDisplayLoading = false
    }
    else if (item.type == "file") {
        mediaStore.isDisplayLoading = true
        let check = await mainMediaCtrl.openMedia(mediaStore.curDirUrl, item.originName, 0)
        if (!check) {
            loadding.close()
            showToast({ message: "没有可观看的文件", duration: 1000, forbidClick: true })
            return
        }
        mediaStore.displayFileManager = false
        mediaStore.isDisplayLoading = false
    }
    loadding.close()
    return
}

/** 
 * 通过序号回退文件夹大法
 * @param index -1为后退一步,-2为刷新
 */
const rebackFolderFuncByIndex = async (index: number) => {
    let loadding = showLoadingToast({ message: "加载中", overlay: true, forbidClick: true, duration: 0 })
    let forceUpdate = index == -2
    if (index == -1) {
        index = urlList.value.length - 2
    }
    else if (index == -2) {
        index = urlList.value.length - 1
    }
    if (index < 0) {
        console.log('不能再退了')
        return
    }

    let arr = urlList.value.slice(1, index + 1) || [""]
    let newUrl = path.join(...arr)
    await updateFolderFunc(newUrl, forceUpdate)
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

const setReverse = () => {
    store.fileListReverse = !store.fileListReverse
    setSortFunc()
}


const thumChecked = ref<string[]>([])

const thumCheckedChangeFunc = () => {
    store.zipThum = thumChecked.value.indexOf("zip") != -1
    store.imgThum = thumChecked.value.indexOf("img") != -1
    store.folderThum = thumChecked.value.indexOf("folder") != -1
    updateImg()
}

</script>

<template>
    <div class="file_big_div"
        :style="{ 'top': '0px', 'left': '0px', 'width': mediaStore.screenW + 'px', 'height': mediaStore.screenH + 'px' }"
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
                <van-Button @click="rebackFolderFuncByIndex(-2)">刷新</van-Button>
                <van-Button @click="setIconTypeFunc">{{ store.displayFileStyleType == "detail" ? '详细' : '图标'
                    }}</van-Button>
                <van-Button @click="setSortTypeFunc">排序:{{ store.fileListSortType }}</van-Button>
                <van-Button @click="setReverse">{{ store.fileListReverse ? '反序' : '正序' }}</van-Button>
                <van-Button @click="rebackCur">当前</van-Button>
                <van-Button @click="mediaStore.displayFileManager = false">关闭</van-Button>
            </div>

            <!-- 文件显示大框 -->
            <div class="file_display_box_div" ref="fileBoxDivRef" @scroll="scrollLazyLoad(50)">
                <van-config-provider :theme-vars="themeVars">
                    <!-- 文件显示 -->
                    <!-- 图标显示 -->
                    <van-grid :icon-size="mediaStore.displayFileIconSize + 'px'" :column-num="mediaStore.displayFileCol"
                        :border="false" square gutter="5px" v-if="store.displayFileStyleType == 'icon'">
                        <van-grid-item v-for="(item) in fileList" :key="item.originName" :title="item.title"
                            @click="selectFileFunc(item)">
                            <img v-if="item.imgb64" class="imgContent" width="60px" height="60px" :src="item.imgb64" />
                            <van-icon v-if="!item.imgb64" :name="item.className" size="35px"></van-icon>
                            <span :class="item.type">{{ item.name }}</span>
                        </van-grid-item>
                    </van-grid>
                    <!-- 详细显示 -->
                    <van-grid :column-num="1" :border="false" gutter="5px" v-if="store.displayFileStyleType == 'detail'"
                        :center="false">
                        <van-grid-item v-for="(item) in fileList" :key="item.originName">
                            <j-flex direction="horizontal" is-last-grow align="center">
                                <img v-if="item.imgb64" class="imgContent" width="60px" height="60px"
                                    :src="item.imgb64" />
                                <van-icon v-if="!item.imgb64" :name="item.className" size="35px"></van-icon>

                                <j-flex direction="vertical" fill>
                                    <van-text-ellipsis :class="item.type" :content="item.originName" expand-text=">"
                                        collapse-text="<" rows="1" @click="selectFileFunc(item)"
                                        @click-action="stopBubbleFunc" />
                                    <j-flex direction="horizontal" split>
                                        <div class="file_display_icon_detail_op_size_div">
                                            {{ item.type == 'file' ? getSizeStrFunc(item.size) : '' }}</div>
                                        <div class="file_display_icon_detail_op_date_div">{{
                                            getDateStrFunc(item.time)
                                            }}
                                        </div>
                                    </j-flex>
                                </j-flex>
                            </j-flex>
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
    <van-floating-bubble icon="bars" axis="xy" magnetic="x" v-model:offset="floatOffset" :gap="floatGap"
        @click="showPopup = !showPopup" />
    <van-popup v-model:show="showPopup" position="top" :style="{ height: '30%' }">
        <JFlex direction="vertical">
            <div>缩略图控制</div>
            <JFlex>
                <div>缩略图切换:</div>
                <van-switch />
            </JFlex>
            <JFlex>
                <div>是否自动:</div>
                <van-switch />
            </JFlex>
            <JFlex>
                <div>缩略图选择:</div>
                <van-checkbox-group v-model="thumChecked" @change="thumCheckedChangeFunc">
                    <van-checkbox name="zip">压缩包</van-checkbox>
                    <van-checkbox name="img">图片</van-checkbox>
                    <van-checkbox name="folder">文件夹</van-checkbox>
                </van-checkbox-group>
            </JFlex>
            <JFlex>
                <van-button type="default">手动刷新</van-button>
                <van-button type="default">强制刷新</van-button>
                <van-button type="default">清空当前</van-button>
            </JFlex>

        </JFlex>
    </van-popup>
</template>

<style scoped>
.imgDiv {
    display: flex;
    justify-content: center;
    align-items: center;
}

.imgContent {
    object-fit: contain;
}

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

/* .file_display_icon_detail_name_div {} */

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

.file {
    color: #fff
}

.folder {
    color: #e8b810
}
</style>
