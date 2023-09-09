
import { imgStore, imgStoreDisplayChildTtype } from "../imgStore"
import { store } from "../store"
import { jFileCache } from "./fileCache"
import { imgCommon, JImgCommonType } from "./imgCommon"

class JImgWaterfall implements JImgCommonType {
    displayDiv: HTMLDivElement

    async init() {
        for (let i = 0; i < imgStore.waterfallNextImgCount; i++) {
            let displayIndex = i + store.displayIndex
            for (let j = 0; j < imgStore.children.length; j++) {
                if (imgStore.children[j].displayIndex == displayIndex) {
                    imgStore.children[j].isView = true
                }
            }
        }
        return true
    }

    preprocessChildImg(obj: imgStoreDisplayChildTtype) {
        obj.displayW = imgStore.divFloatW
        obj.displayH = imgStore.divFloatH
        return obj
    }

    screenResize() {

    }

    imgResize(obj: imgStoreDisplayChildTtype) {
        let cache = jFileCache.imgCache[obj.searchIndex]
        obj.isSplit = store.splitImg == "split" ? true : store.splitImg == "auto" && cache.originW > cache.originH ? true : false
        if (!obj.isSplit && obj.splitNum == 1) {
            return
        }
        if (obj.isSplit) {
            obj.displayW = cache.originW / 2
        }
        else {
            obj.displayW = cache.originW
        }
        obj.displayH = cache.originH

        obj.scale = imgStore.divFloatW / obj.displayW

    }

    setCurMsg() {

    }

    pointScale(x: number, y: number, scale: number) {

    }

    async jumpImg(displayIndex: number): Promise<void> {
        return new Promise((res) => {
            setTimeout(() => {
                let top = 0

                for (let i = 0; i < imgStore.children.length; i++) {
                    let child = imgStore.children[i]
                    if (!imgCommon.isImg(child)) {
                        continue
                    }
                    if (displayIndex == child.displayIndex) {
                        this.displayDiv.scrollTo({ top, behavior: "smooth" })
                        res()
                        return
                    }
                    top += child.displayH * child.scale * imgStore.domScale + imgStore.margin
                }
                res()
            }, 500);
        })
    }



}

export const jImgWaterfall = new JImgWaterfall()