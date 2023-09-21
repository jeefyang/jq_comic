import { imgStore, imgStoreDisplayChildType } from "../imgStore"
import { store } from "../store"
import { jFileCache } from "./fileCache"
import { JImgCommonType } from "./imgCommon"

export class JImgCommonChild implements JImgCommonType {
    preprocessChildMedia(obj: imgStoreDisplayChildType) {
        obj.displayW = imgStore.divFloatW
        obj.displayH = imgStore.divFloatH
        obj.transX = 0
        obj.transY = 0
        obj.scale = 1
        obj.parentTransX = 0
        obj.parentTransY = 0
        return obj
    }
    screenResize() {
        return
    }
    MediaResize(obj: imgStoreDisplayChildType) {
        return
    }
    pointScale(x: number, y: number, scale: number) {
        return
    }
    async jumpMedia(displayIndex: number, splitNum: 0 | 1) {
        return
    }
    updateViewState() {
        return
    }
    setCurMsg() {
        return
    }

    /** 更新图片状态 */
    mediaUpdateState(obj: imgStoreDisplayChildType, isNoMirro?: boolean) {
        let cache = jFileCache.imgCache[obj.searchIndex]
        obj.isViewVideo = cache.type == 'video'
        obj.isViewImg = cache.type == 'img'
        obj.isViewDivLoad = obj.isView
        obj.isViewLoading = !obj.isLoaded
        obj.isViewMedia = obj.isView
        if (store.splitMedia == "none") {
            obj.isSplit = false
            obj.isViewDisplay = obj.splitNum == 0
        }
        else if (store.splitMedia == "split") {
            obj.isSplit = true
            obj.isViewDisplay = true
        }
        else if (store.splitMedia == "auto") {
            obj.isSplit = cache.originW > cache.originH
            obj.isViewDisplay = !obj.isLoaded || obj.isSplit || obj.splitNum == 0
        }
        if (!isNoMirro) {
            let otherObj = imgStore.children.find(o => {
                return o.searchIndex == obj.searchIndex && o.splitNum != obj.splitNum
            })
            if (otherObj) {
                this.mediaUpdateState(otherObj, true)
            }
        }

    }

    setPrev() {

    }

    setNext() {

    }
}