import { areaTouchWaterFall } from "../const"
import { imgStore, imgStoreChildType, imgStoreDisplayChildTtype } from "../imgStore"
import { store } from "../store"
import { jFileCache } from "./fileCache"
import { jImgWaterfall } from "./imgWaterfall"

export type JImgCommonType = {
    init: () => Promise<boolean>
    /** 预处理 */
    preprocessChildImg: (obj: imgStoreDisplayChildTtype) => imgStoreDisplayChildTtype
    /** 屏幕尺寸重置 */
    screenResize: () => void
    /** 图片尺寸重置 */
    imgResize: (obj: imgStoreDisplayChildTtype) => void
    /** 设置当前的信息 */
    setCurMsg: () => void
    /** 定点缩放 */
    pointScale: (x: number, y: number, scale: number) => void
    /** 跳转图片 */
    jumpImg: (displayIndex: number) => Promise<void>
}

export class JImgCommon implements JImgCommonType {

    screenResize() {
        if (store.readMode == "udWaterfall") {
            jImgWaterfall.screenResize()
        }
    }

    imgResize(obj: imgStoreDisplayChildTtype) {
        if (store.readMode == "udWaterfall") {
            jImgWaterfall.imgResize(obj)
        }
    }

    async init() {
        this.setAreaTouch()
        await this.openImg(store.dirUrl, store.fileName, store.curNo)
        if (store.readMode == "udWaterfall") {
            await jImgWaterfall.init()
        }
        return true
    }

    setAreaTouch() {
        if (store.readMode == "udWaterfall") {
            imgStore.areaTouch = [...areaTouchWaterFall]
        }
    }

    setCurMsg() {
        if (store.readMode == "udWaterfall") {
            jImgWaterfall.setCurMsg()
        }
    }

    /** 重新打开图片 */
    async openImg(dirUrl?: string, fileName?: string, index: number = 0) {
        store.dirUrl = dirUrl || store.dirUrl
        store.fileName = fileName || store.fileName
        store.curDirUrl = store.dirUrl
        let obj = await jFileCache.getFileData(store.dirUrl, store.fileName, index)
        imgStore.isZip = obj.isZip
        imgStore.zipInFileName = obj?.zipInFileName || ""
        let displayIndex = -1
        if (obj.isZip) {
            displayIndex = index
            let zipMsg = await jFileCache.getZipMsg(store.dirUrl, store.fileName)
            imgStore.len = zipMsg.sortList.length
        }
        else {
            let dir = await jFileCache.getFolder(store.dirUrl)
            imgStore.len = dir.sortNoZipFile.length
            displayIndex = dir.sortNoZipFile.findIndex(c => c.name == fileName)
        }
        let imgObjA: imgStoreDisplayChildTtype = {
            searchIndex: obj.childIndex,
            displayIndex: displayIndex,
            splitNum: 0,
        }
        this.preprocessChildImg(imgObjA)
        let imgObjB: imgStoreDisplayChildTtype = {
            searchIndex: obj.childIndex,
            displayIndex: displayIndex,
            splitNum: 1,
        }
        this.preprocessChildImg(imgObjB)
        imgStore.children = [imgObjA, imgObjB]
    }

    async jumpImg(displayIndex: number) {
        if (displayIndex == undefined) {
            return
        }
        let list = await imgCommon.setImgByNum(displayIndex)
        if (list) {
            let obj = list[0]
            let cache = jFileCache.imgCache[obj.searchIndex]
            store.fileName = cache.fileName
            imgStore.zipInFileName = cache?.zipInFileName || ""
            store.curNo = displayIndex
        }
        if (store.readMode == "udWaterfall") {
            await jImgWaterfall.jumpImg(displayIndex)
        }

    }

    preprocessChildImg(obj: imgStoreDisplayChildTtype) {
        obj.scale = 1
        obj.parentTransX = 0
        obj.parentTransY = 0
        if (store.readMode == "udWaterfall") {
            return jImgWaterfall.preprocessChildImg(obj)
        }
        return obj
    }

    pointScale(x: number, y: number, scale: number) {
        if (store.readMode == 'udWaterfall') {
            return jImgWaterfall.pointScale(x, y, scale)
        }
    }

    /** 通过序号获取图片 */
    async getImgByNum(index: number) {
        if (index < 0) {
            return
        }
        if (imgStore.len <= index - 1) {
            return
        }
        let obj: imgStoreChildType
        let filename: string = ""
        if (imgStore.isZip) {
            obj = await jFileCache.getFileDataTry(store.dirUrl, store.fileName, index)
            // store.zipInFileName = obj.zipInFileName
            filename = store.fileName
        }
        else {
            let dirMsg = await jFileCache.getFolder(store.dirUrl)
            // store.fileName = dirMsg.sortNoZipFile[index].name
            filename = dirMsg.sortNoZipFile[index].name
            obj = await jFileCache.getFileDataTry(store.dirUrl, filename)
        }
        let imgObjA: imgStoreDisplayChildTtype = {
            searchIndex: obj.childIndex,
            displayIndex: index,
            splitNum: 0,
        }
        this.preprocessChildImg(imgObjA)
        let imgObjB: imgStoreDisplayChildTtype = {
            searchIndex: obj.childIndex,
            displayIndex: index,
            splitNum: 1,
        }
        this.preprocessChildImg(imgObjA)
        return [imgObjA, imgObjB]
    }

    /** 通过顺序布置图片 */
    async setImgByNum(displayIndex: number) {
        let imgObjList = await this.getImgByNum(displayIndex)

        let isSame = false
        let searchIndex = imgStore.children.findIndex(c => {
            if (c.displayIndex > displayIndex) {
                return true
            }
            if (c.displayIndex == displayIndex) {
                isSame = true
                return true
            }
            return false
        })
        if (isSame) {
            console.warn("同样的图片,不加载")
            return
        }
        if (searchIndex == -1) {
            imgStore.children.push(imgObjList[0], imgObjList[1])
        }
        else {
            imgStore.children.splice(searchIndex, 0, imgObjList[0], imgObjList[1])
        }
        return imgObjList
    }

    /** 布置下一张图片 */
    async setNextImg(overCB?: () => void) {
        let children = imgStore.children
        let displayIndex = children[children.length - 1].displayIndex
        if (displayIndex >= imgStore.len - 1) {
            overCB && overCB()
            return
        }
        await this.setImgByNum(displayIndex + 1)
        return
    }

    isImg(obj: imgStoreDisplayChildTtype) {
        return (obj.isSplit || !obj.splitNum)
    }

    /** 布置上一张图片 */
    async setPrevImg(overCB?: () => void) {
        let children = imgStore.children
        let displayIndex = children[0].displayIndex
        if (displayIndex <= 0) {
            overCB && overCB()
            return
        }
        await this.setImgByNum(displayIndex - 1)
        return
    }


}

export const imgCommon = new JImgCommon()