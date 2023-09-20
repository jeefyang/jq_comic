
import { imgStore, imgStoreDisplayChildType as imgStoreDisplayChildType } from "../imgStore"
import { store } from "../store"
import { jFileCache } from "./fileCache"
import { JImgCommonType } from "./imgCommon"
import { JImgCommonChild } from "./imgCommonChild"

class JImgStandard extends JImgCommonChild implements JImgCommonType {
    displayDiv: HTMLDivElement

    updateViewState() {
        for (let i = 0; i < imgStore.StandardNextMediaCount; i++) {
            let displayIndex = i + store.displayIndex
            for (let j = 0; j < imgStore.children.length; j++) {
                let child = imgStore.children[j]
                if (child.displayIndex == displayIndex) {
                    child.isView = true
                }
                this.imgUpdateState(child)
            }
        }
    }

    imgResize(obj: imgStoreDisplayChildType) {
        let cache = jFileCache.imgCache[obj.searchIndex]

        this.imgUpdateState(obj)
        if (!obj.isViewDisplay) {
            return
        }
        if (obj.isSplit) {
            obj.displayW = cache.originW / 2
            if (
                (store.directX == -1 && obj.splitNum == 1) ||
                (store.directX == 1 && obj.splitNum == 0)
            ) {
                obj.transX = -cache.originW / 2
            }
            else {
                obj.transX = 0
            }
        }
        else {
            obj.displayW = cache.originW
            obj.transX = 0
        }
        obj.displayH = cache.originH
        if (store.readMode == "none") {
            obj.scale = 1
            obj.parentTransX = 0
            obj.parentTransY = 0
        }
        else {
            let divFloatR = imgStore.divFloatW / imgStore.divFloatH
            let displayR = obj.displayW / obj.displayH
            if (store.readMode == "width" || (store.readMode == "fit" && divFloatR <= displayR)) {
                obj.scale = imgStore.divFloatW / obj.displayW

            }
            else if (store.readMode == "height" || (store.readMode == "fit" && divFloatR > displayR)) {
                obj.scale = imgStore.divFloatH / obj.displayH
            }
            let w = obj.displayW * obj.scale * imgStore.domScale
            let h = obj.displayH * obj.scale * imgStore.domScale
            obj.parentTransX = w >= imgStore.divFloatW ? 0 : (imgStore.divFloatW - w) / 2
            obj.parentTransY = h >= imgStore.divFloatH ? 0 : (imgStore.divFloatH - h) / 2
        }
    }

}

export const jImgStandard = new JImgStandard()