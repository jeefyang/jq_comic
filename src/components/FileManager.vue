<script setup lang="ts">
import { store } from "../store"
import { jFileCache } from "../tool/fileCache";
import { onMounted, ref, onActivated } from "vue";
import { showLoadingToast, showToast, type ConfigProviderThemeVars } from "vant";
import { JFileFormatType, JFolderDisplayType, NameSortType } from "../type";
import path from "path-browserify"
import { mediaStore } from "../mediaStore"
import { mainMediaCtrl } from "../tool/mainMediaCtrl";
import { MiddleFileType } from "../media";
import { JFlex } from "../components/JFlex"
import { sortABByDate, sortABByName, sortABByNum, sortABBySize } from "../tool/util";
import { preloadMediaCtrl } from "../tool/preloadMediaCtrl";


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
// 当前下拉
const curScrollTop = ref(0)

/** 更新缩略图标记 */
let updateThumState = true


onMounted(async () => {
    console.log("loadFile")
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
    updateThum()
    return
})

onActivated(() => {
    setTimeout(() => {
        console.log(curScrollTop)
        if (fileBoxDivRef.value) {
            fileBoxDivRef.value.scrollTo({ top: curScrollTop.value, behavior: "smooth" })
        }
    }, 200);
})

const zipEXList = ['zip']
const imgEXList = ['jpg', 'png', 'webp', 'bmp']

/** 是否继续更新缩略图 */
let isContinueUpdateThum = false
/** 是否正在更新缩略图 */
let isUpdatingThum = false

const loopUpdateThum = async () => {
    if (isUpdatingThum) {
        return
    }
    isUpdatingThum = false
    let dirUrl = mediaStore.curDirUrl

    for (let i = 0; i < fileList.value.length; i++) {
        if (!updateThumState) {
            return
        }
        let file = fileList.value[i]
        if (!store.switchThum) {
            file.imgb64 = ""
            continue
        }
        if (file.imgb64) {
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
            console.log('folder')
            file.imgb64 = await jFileCache.getFileThum(dirUrl, file.originName, true)
            continue
        }
    }
    isUpdatingThum = false
    if (isContinueUpdateThum) {
        isContinueUpdateThum = false
        return loopUpdateThum()
    }
}

const updateThum = async () => {

    isContinueUpdateThum = true
    loopUpdateThum()
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
    await scrollLazyLoad(undefined)
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
    if (store.autoThum) {
        updateThum()
    }
    return
}

/** 选中文件大法(包括) */
const selectFileFunc = async (item: (typeof fileList.value)[number]) => {
    let loadding = showLoadingToast({ message: "加载中", overlay: true, forbidClick: true, duration: 0 })
    preloadMediaCtrl.stop()
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
const scrollLazyLoad = async (playload: UIEvent) => {
    curScrollTop.value = (<HTMLElement>playload?.target)?.scrollTop || 0
    let num = 50
    let delta = 200
    if (scrollCount >= scrollMax) {
        return
    }
    let v = fileBoxDiv.clientHeight + fileBoxDiv.scrollTop - fileBoxDiv.scrollHeight
    if (v + delta < 0) {
        return
    }
    fileList.value.push(...fileCacheList.slice(scrollCount, scrollCount + num))
    if (store.autoThum) {
        updateThum()
    }
    scrollCount += num
    await new Promise((res, _rej) => {
        setTimeout(() => {
            scrollLazyLoad(playload)
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
    updateThum()
    onSaveFunc()
}

const handUpdateThum = () => {
    updateThumState = true
    updateThum()

}

const stopUpdateThumFunc = () => {
    updateThumState = false
}

const clearThumFunc = async () => {
    await jFileCache.clearThumDB(mediaStore.curDirUrl)
    for (let i = 0; i < fileList.value.length; i++) {
        let c = fileList.value[i]
        c.imgb64 = ''
    }
}

const onSaveFunc = () => {
    console.log(11)
    mainMediaCtrl.saveStoreByLocalStorage()
}

</script>

<template>
    <div class="file" draggable="false" ondragstart="return false;">
        <!-- 背景版 -->
        <div class='file_shadow'></div>
        <!-- 浮动层 -->

        <div class="file_card">
            <van-search @change="setSortFunc" v-model="searchKey" placeholder="搜索关键字" shape="round" />
            <div class="btn">
                <!-- 路径 -->
                <div class="btn-list path" style="margin-top: 5px;">
                    <button v-for="(item, index) in urlList" :title="item" @click="rebackFolderFuncByIndex(index)">
                        {{ item }} </button>
                </div>
                <!-- 功能键 -->
                <div class="btn-list control">
                    <van-Button @click="mediaStore.displayFileManager = false">关闭</van-Button>
                    <van-Button @click="rebackFolderFuncByIndex(-1)">后退</van-Button>
                    <van-Button @click="rebackFolderFuncByIndex(-2)">刷新</van-Button>
                    <van-Button @click="setSortTypeFunc">排序:{{ store.fileListSortType }}</van-Button>
                    <van-Button @click="setReverse">{{ store.fileListReverse ? '反序' : '正序' }}</van-Button>
                    <van-Button @click="rebackCur">当前</van-Button>
                    <van-Button @click="setIconTypeFunc">{{ store.displayFileStyleType == "detail" ? '详细' : '图标'
                        }}</van-Button>
                </div>
            </div>


            <!-- 文件显示大框 -->
            <div class="display_box" ref="fileBoxDivRef" @scroll="scrollLazyLoad">
                <van-config-provider :theme-vars="themeVars">
                    <!-- 图标显示 -->
                    <template v-if="store.displayFileStyleType == 'icon'">
                        <div class="icon-item"
                            :style="{ gridTemplateColumns: `repeat(${mediaStore.displayFileCol},calc(calc(100vw - 40px) / ${mediaStore.displayFileCol})` }">
                            <div v-for="(item) in fileList" :key="item.originName" @click="selectFileFunc(item)"
                                class="box">
                                <div>
                                    <img v-if="store.switchThum && item.imgb64" class="imgContent"
                                        :width="(mediaStore.displayFileIconSize * store.thumRatio) + 'px'"
                                        :height="(mediaStore.displayFileIconSize * store.thumRatio) + 'px'"
                                        :src="item.imgb64" />
                                    <van-icon v-else :name="item.className"
                                        :size="(mediaStore.displayFileIconSize * store.thumRatio) + 'px'"></van-icon>
                                </div>
                                <div class="title" :class="'title-'+item.type">{{ item.title }}</div>
                            </div>
                        </div>
                    </template>
                    <!-- 详细显示 -->
                    <template v-if="store.displayFileStyleType == 'detail'">
                        <div class="detail-item" v-for="(item) in fileList" :key="item.originName"
                            @click="selectFileFunc(item)">
                            <img v-if="store.switchThum && item.imgb64" class="imgContent"
                                :width="(mediaStore.displayFileIconSize * 1.5 * store.thumRatio) + 'px'"
                                :height="(mediaStore.displayFileIconSize * 1.5 * store.thumRatio) + 'px'"
                                :src="item.imgb64" />
                            <van-icon v-else :name="item.className"
                                :size="(mediaStore.displayFileIconSize * 1.5 * store.thumRatio) + 'px'"></van-icon>
                            <div class="msg">
                                <div>{{ item.originName }}</div>
                                <div class="size-date">
                                    <div>{{ item.type == 'file' ? getSizeStrFunc(item.size) : '' }}</div>
                                    <div>{{ getDateStrFunc(item.time) }}</div>
                                </div>
                            </div>
                        </div>
                    </template>

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
    <van-popup v-model:show="showPopup" position="top" :style="{ height: '45%' }">
        <JFlex direction="vertical">
            <div>缩略图控制</div>
            <JFlex>
                <div>缩略图切换:</div>
                <van-switch v-model="store.switchThum" @change="onSaveFunc" />
            </JFlex>
            <JFlex>
                <div>是否自动:</div>
                <van-switch v-model="store.autoThum" @change="onSaveFunc" />
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
                <div>图标/缩略图比例:</div>
                <VanButton type="primary" @click="store.thumRatio = 0.5; onSaveFunc()">0.5</VanButton>
                <VanButton type="primary" @click="store.thumRatio = 1; onSaveFunc()">1</VanButton>
                <VanButton type="primary" @click="store.thumRatio = 2; onSaveFunc()">2</VanButton>
                <input type="number" v-model="store.thumRatio" @change="onSaveFunc()" style="width:50px">
            </JFlex>
            <JFlex>
                <van-button type="default" @click="handUpdateThum()">手动刷新</van-button>
                <van-button type="default" @click="stopUpdateThumFunc()">停止刷新</van-button>
                <van-button type="default" @click="clearThumFunc()">清空当前</van-button>
            </JFlex>

        </JFlex>
    </van-popup>
</template>

<style scoped lang="scss">
.imgDiv {
    display: flex;
    justify-content: center;
    align-items: center;
}

.imgContent {
    object-fit: contain;
}

.file {
    position: absolute;
    overflow: hidden;
    width: 100vw;
    height: 100vh;
    z-index: 9;

    &_shadow {
        position: absolute;
        overflow: hidden;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(10px);
        background-color: rgba(109, 113, 104, 0.397);
        z-index: -1;
    }

    &_card {
        margin: 20px;
        background-color: #6e1e1e6e;
        display: flex;
        flex-direction: column;
        height: calc(100vh - 40px);
        border-radius: 10px;
        position: relative;

        .btn {
            height: 100px;
            // display: flex;
            // flex-direction: column;
            // justify-content: space-around;

            &-list {
                margin-bottom: 5px;
                display: flex;
                flex-wrap: nowrap;
                overflow-x: auto;
            }
        }


        .display_box {
            overflow: auto;
            width: 100%;
            flex-grow: 1;

            .icon-item {
                margin-top: 10px;
                display: grid;
                row-gap: 10px;

                .box {

                    padding: 5px;

                    .title {
                        word-wrap: break-word
                    }

                    .title-file {
                        color: #fff
                    }

                    .title-folder {
                        color: #e8b810
                    }
                }
            }

            .detail-item {
                display: flex;
                align-items: center;
                border-bottom: 1px solid #999;
                padding: 10px;

                .msg {
                    flex-grow: 1;
                    margin-left: 10px;

                    .size-date {
                        display: flex;
                        justify-content: space-between;
                        color: #999;
                    }
                }
            }
        }
    }

}
</style>
