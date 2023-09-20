import { imgStore, imgStoreDisplayChildType } from "../imgStore"
import { store } from "../store"
import { jFileCache } from "./fileCache"
import { JImgCommonType } from "./imgCommon"

export class JImgCommonChild implements JImgCommonType {
    preprocessChildImg(obj: imgStoreDisplayChildType) {
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
    imgResize(obj: imgStoreDisplayChildType) {
        return
    }
    pointScale(x: number, y: number, scale: number) {
        return
    }
    async jumpImg(displayIndex: number) {
        return
    }
    updateViewState() {
        return
    }
    setCurMsg() {
        return
    }

    /** 更新图片状态 */
    imgUpdateState(obj: imgStoreDisplayChildType) {
        let cache = jFileCache.imgCache[obj.searchIndex]
        obj.isViewVideo = cache.type == 'video'
        obj.isViewImg = cache.type == 'img'
        obj.isViewDivLoad = obj.isView
        obj.isViewLoading = !obj.isLoaded
        obj.isViewMedia = obj.isView
        obj.isSplit = store.splitMedia == "split" ? true : store.splitMedia == "auto" && cache.originW > cache.originH ? true : false
        obj.isViewDisplay = !obj.isLoaded || obj.isSplit || obj.splitNum == 0
        let otherObj = imgStore.children.find(o => {
            return o.searchIndex == obj.searchIndex && o.splitNum != obj.splitNum && o.splitNum == 1
        })
        if (otherObj) {
            this.imgUpdateState(otherObj)
        }
    }
}