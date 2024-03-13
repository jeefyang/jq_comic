import { areaTouchWaterFall } from "../const"
import { mediaMiddleData, mediaStore } from "../mediaStore"
import { MediaViewChildType } from "../media"
import { store } from "../store"
import { jFileCache } from "./fileCache"
import { jImgStandard } from "./imgStandard"
import { jImgWaterfall } from "./imgWaterfall"

export type JImgCommonType = {
    /** 预处理 */
    preprocessChildMedia: (obj: MediaViewChildType) => MediaViewChildType
    /** 屏幕尺寸重置 */
    screenResize: () => void
    /** 媒体尺寸重置 */
    MediaResize: (obj: MediaViewChildType) => void
    /** 设置当前的信息 */
    setCurMsg: () => void
    /** 定点缩放 */
    pointScale: (x: number, y: number, scale: number) => void
    /** 跳转媒体 */
    jumpMedia: (displayIndex: number, splitNum: 0 | 1) => Promise<void>
    mediaUpdateState: (obj: MediaViewChildType, isNoMirro?: boolean) => void
    updateViewState: () => void
    setNext: () => void
    setPrev: () => void
}


export class JImgCommon implements JImgCommonType {

    displayDiv: HTMLDivElement

    setDiv(div: HTMLDivElement) {
        this.displayDiv = div
        jImgWaterfall.displayDiv = div
        jImgStandard.displayDiv = div
    }

    screenResize() {
        if (store.readMode == "udWaterfall") {
            jImgWaterfall.screenResize()
        }
        else {
            jImgStandard.screenResize()
        }
    }

    MediaResize(obj: MediaViewChildType) {

        if (store.readMode == "udWaterfall") {
            jImgWaterfall.MediaResize(obj)
        }
        else {
            jImgStandard.MediaResize(obj)
        }
    }

    mediaUpdateState(obj: MediaViewChildType, isNoMirro?: boolean) {
        if (store.readMode == "udWaterfall") {
            jImgWaterfall.mediaUpdateState(obj, isNoMirro)
        }
        else {
            jImgStandard.mediaUpdateState(obj, isNoMirro)
        }
    }

    async init(isLoad: boolean) {
        this.setAreaTouch()
        if (isLoad) {
            await this.openMedia(store.dirUrl, store.fileName, store.displayIndex)
        }
    }

    setAreaTouch() {
        if (store.readMode == "udWaterfall") {
            mediaStore.areaTouch = [...areaTouchWaterFall]
        }
        else {
            mediaStore.areaTouch = [...areaTouchWaterFall]
        }
    }

    setCurMsg() {
        if (store.readMode == "udWaterfall") {
            jImgWaterfall.setCurMsg()
        }
        else {
            jImgStandard.setCurMsg()
        }
    }

    setPrev() {
        if (store.readMode == "udWaterfall") {
            jImgWaterfall.setPrev()
        }
        else {
            jImgStandard.setPrev()
        }
    }

    setNext() {
        if (store.readMode == "udWaterfall") {
            jImgWaterfall.setNext()
        }
        else {
            jImgStandard.setNext()
        }
    }


    /** 重新打开图片 */
    async openMedia(dirUrl?: string, fileName?: string, index: number = 0) {
        store.dirUrl = dirUrl || store.dirUrl
        store.fileName = fileName || store.fileName
        store.curDirUrl = store.dirUrl
        let comicData = await this.openComicList(store.dirUrl, store.fileName)
        mediaStore.isZip = comicData.listdata.isZip
        mediaStore.zipInFileName = ""
        if (mediaStore.isZip) {
            store.displayIndex = index
        }
        else {
            let a = mediaMiddleData.list.find(c => {
                let b = jFileCache.mediaCache[c.searchIndex]
                return b.fileName == fileName
            })
            store.displayIndex = a.displayIndex
        }
        this.updateViewState()
        store.isRefresh = true
        await new Promise((res) => {
            setTimeout(() => {
                this.jumpMedia(store.displayIndex, 0)
                res(undefined)
            }, 50);
        })

        return true
    }

    updateViewState() {
        if (store.readMode == "udWaterfall") {
            jImgWaterfall.updateViewState()
        }
        else {
            jImgStandard.updateViewState()
        }
    }

    /** 打开漫画列表 */
    async openComicList(dirUrl: string, fileName: string) {
        let listdata = await jFileCache.getFileListData(dirUrl, fileName)
        mediaStore.isZip = listdata.isZip
        // mediaStore.children = []
        mediaMiddleData.list = []
        mediaStore.len = listdata.list.length
        for (let i = 0; i < listdata.list.length; i++) {
            let child = listdata.list[i]
            let imgObjA: MediaViewChildType = {
                searchIndex: child.childIndex,
                displayIndex: i,
                splitNum: 0,
            }
            this.preprocessChildMedia(imgObjA)
            let imgObjB: MediaViewChildType = {
                searchIndex: child.childIndex,
                displayIndex: i,
                splitNum: 1,
            }
            this.preprocessChildMedia(imgObjB)
            mediaMiddleData.list.push(imgObjA, imgObjB)
        }
        return { listdata }
    }

    async jumpMedia(displayIndex: number, splitNum: 0 | 1) {
        if (displayIndex == undefined) {
            return
        }
        for (let i = 0; i < mediaMiddleData.list.length; i++) {
            let child = mediaMiddleData.list[i]
            if (!child.isViewDisplay || child.displayIndex != displayIndex || child.splitNum != splitNum) {
                continue
            }
            // child.isView = true
            let cache = jFileCache.mediaCache[child.searchIndex]
            mediaStore.zipInFileName = cache.zipInFileName || ""
            store.fileName = cache.fileName
        }
        store.displayIndex = displayIndex
        if (store.readMode == "udWaterfall") {
            await jImgWaterfall.jumpMedia(displayIndex, splitNum)
        }
        else {
            await jImgStandard.jumpMedia(displayIndex, splitNum)
        }
    }


    preprocessChildMedia(obj: MediaViewChildType) {
        obj.scale = 1
        obj.parentTransX = 0
        obj.parentTransY = 0
        obj.isView = false
        if (store.readMode == "udWaterfall") {
            return jImgWaterfall.preprocessChildMedia(obj)
        }
        else {
            return jImgStandard.preprocessChildMedia(obj)
        }
        return obj
    }

    pointScale(x: number, y: number, scale: number) {
        if (store.readMode == 'udWaterfall') {
            return jImgWaterfall.pointScale(x, y, scale)
        }
        else {
            return jImgStandard.pointScale(x, y, scale)
        }
    }


}

export const mainMediaCtrl = new JImgCommon()