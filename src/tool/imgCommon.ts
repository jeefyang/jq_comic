import { areaTouchWaterFall } from "../const"
import { imgStore, imgStoreDisplayChildType } from "../imgStore"
import { store } from "../store"
import { jFileCache } from "./fileCache"
import { jImgStandard } from "./imgStandard"
import { jImgWaterfall } from "./imgWaterfall"

export type JImgCommonType = {
    /** 预处理 */
    preprocessChildImg: (obj: imgStoreDisplayChildType) => imgStoreDisplayChildType
    /** 屏幕尺寸重置 */
    screenResize: () => void
    /** 图片尺寸重置 */
    imgResize: (obj: imgStoreDisplayChildType) => void
    /** 设置当前的信息 */
    setCurMsg: () => void
    /** 定点缩放 */
    pointScale: (x: number, y: number, scale: number) => void
    /** 跳转图片 */
    jumpImg: (displayIndex: number) => Promise<void>
    imgUpdateState: (obj: imgStoreDisplayChildType) => void
    updateViewState: () => void
}


export class JImgCommon implements JImgCommonType {

    displayDiv: HTMLDivElement

    setDiv(div: HTMLDivElement) {
        this.displayDiv = div
        jImgWaterfall.displayDiv = div
    }

    screenResize() {
        if (store.readMode == "udWaterfall") {
            jImgWaterfall.screenResize()
        }
        else {
            jImgStandard.screenResize()
        }
    }

    imgResize(obj: imgStoreDisplayChildType) {

        if (store.readMode == "udWaterfall") {
            jImgWaterfall.imgResize(obj)
        }
        else {
            jImgStandard.imgResize(obj)
        }
    }

    imgUpdateState(obj: imgStoreDisplayChildType) {
        if (store.readMode == "udWaterfall") {
            jImgWaterfall.imgUpdateState(obj)
        }
        else {
            jImgStandard.imgUpdateState(obj)
        }
    }

    async init(isLoad: boolean) {
        this.setAreaTouch()
        if (isLoad) {
            await this.openImg(store.dirUrl, store.fileName, store.displayIndex)
        }
    }

    setAreaTouch() {
        if (store.readMode == "udWaterfall") {
            imgStore.areaTouch = [...areaTouchWaterFall]
        }
        else {
            imgStore.areaTouch = [...areaTouchWaterFall]
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


    /** 重新打开图片 */
    async openImg(dirUrl?: string, fileName?: string, index: number = 0) {
        store.dirUrl = dirUrl || store.dirUrl
        store.fileName = fileName || store.fileName
        store.curDirUrl = store.dirUrl
        let comicData = await this.openComicList(store.dirUrl, store.fileName)
        imgStore.isZip = comicData.listdata.isZip
        imgStore.zipInFileName = ""
        if (imgStore.isZip) {
            store.displayIndex = index
        }
        else {
            let a = imgStore.children.find(c => {
                let b = jFileCache.imgCache[c.searchIndex]
                return b.fileName == fileName
            })
            store.displayIndex = a.displayIndex
        }
        this.updateViewState()
        await new Promise((res) => {
            setTimeout(() => {
                this.jumpImg(store.displayIndex)
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
        imgStore.isZip = listdata.isZip
        imgStore.children = []
        imgStore.len = listdata.list.length
        for (let i = 0; i < listdata.list.length; i++) {
            let child = listdata.list[i]
            let imgObjA: imgStoreDisplayChildType = {
                searchIndex: child.childIndex,
                displayIndex: i,
                splitNum: 0,
            }
            this.preprocessChildImg(imgObjA)
            let imgObjB: imgStoreDisplayChildType = {
                searchIndex: child.childIndex,
                displayIndex: i,
                splitNum: 1,
            }
            this.preprocessChildImg(imgObjB)
            imgStore.children.push(imgObjA, imgObjB)
        }
        return { listdata }
    }

    async jumpImg(displayIndex: number) {
        if (displayIndex == undefined) {
            return
        }
        for (let i = 0; i < imgStore.children.length; i++) {
            let child = imgStore.children[i]
            if (child.displayIndex != displayIndex) {
                continue
            }
            // child.isView = true
            let cache = jFileCache.imgCache[child.searchIndex]
            imgStore.zipInFileName = cache.zipInFileName || ""
            store.fileName = cache.fileName
        }
        store.displayIndex = displayIndex
        if (store.readMode == "udWaterfall") {
            await jImgWaterfall.jumpImg(displayIndex)
        }
        else {
            await jImgStandard.jumpImg(displayIndex)
        }
    }


    preprocessChildImg(obj: imgStoreDisplayChildType) {
        obj.scale = 1
        obj.parentTransX = 0
        obj.parentTransY = 0
        obj.isView = false
        if (store.readMode == "udWaterfall") {
            return jImgWaterfall.preprocessChildImg(obj)
        }
        else {
            return jImgStandard.preprocessChildImg(obj)
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

export const imgCommon = new JImgCommon()