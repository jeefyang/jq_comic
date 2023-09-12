
import { imgStore, imgStoreDisplayChildType as imgStoreDisplayChildType } from "../imgStore"
import { store } from "../store"
import { jFileCache } from "./fileCache"
import { JImgCommonType } from "./imgCommon"

class JImgWaterfall implements JImgCommonType {
    displayDiv: HTMLDivElement

    async init() {
        for (let i = 0; i < imgStore.waterfallNextImgCount; i++) {
            let displayIndex = i + store.displayIndex
            for (let j = 0; j < imgStore.children.length; j++) {
                let child = imgStore.children[j]
                if (child.displayIndex == displayIndex) {
                    child.isView = true
                }
                this.imgUpdateState(child)
            }
        }
        return true
    }

    preprocessChildImg(obj: imgStoreDisplayChildType) {
        obj.displayW = imgStore.divFloatW
        obj.displayH = imgStore.divFloatH
        obj.transX = 0
        obj.transY = 0
        obj.scale = 1
        return obj
    }

    screenResize() {

    }

    /** 更新图片状态 */
    imgUpdateState(obj: imgStoreDisplayChildType) {
        let cache = jFileCache.imgCache[obj.searchIndex]
        obj.isViewVideo = cache.type == 'video'
        obj.isViewImg = cache.type == 'img'
        obj.isViewLoading = !obj.isView || !obj.isLoaded
        obj.isViewLoaded = obj.isView
        obj.isSplit = store.splitImg == "split" ? true : store.splitImg == "auto" && cache.originW > cache.originH ? true : false
        obj.isViewDisplay = !obj.isLoaded || obj.isSplit || obj.splitNum == 0
        let otherObj = imgStore.children.find(o => {
            return o.searchIndex == obj.searchIndex && o.splitNum != obj.splitNum && o.splitNum == 1
        })
        if (otherObj) {
            this.imgUpdateState(otherObj)
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
        if (isNaN(obj.displayH)) {
            console.log("xx")
        }
        obj.scale = imgStore.divFloatW / obj.displayW




    }

    setCurMsg() {

    }

    scrollView(index: number, start: number, checkFunc: (size: number, c: imgStoreDisplayChildType, index: number) => boolean) {
        let findIndex = -1
        for (let i = index; i < imgStore.children.length; i++) {
            let c = imgStore.children[i]
            if (!c.isViewDisplay) {
                continue
            }
            let h = start + c.displayH * c.scale * imgStore.domScale
            if (checkFunc(h, c, i)) {
                findIndex = i
                break
            }
            start = h + imgStore.margin
        }
        index = findIndex
        return { index, start }
    }

    scrollViewList(index: number, start: number, cb?: (c: imgStoreDisplayChildType) => void) {
        let list: number[] = []
        let screensh = this.displayDiv.scrollTop
        let srceeneh = this.displayDiv.scrollTop + imgStore.divFloatH
        this.scrollView(index, start, (h, c, i) => {
            if ((screensh <= start && srceeneh >= start) ||
                (screensh <= h && srceeneh >= h) ||
                (screensh >= start && srceeneh <= h)
            ) {
                cb && cb(c)
                list.push(i)
            }
            start = h
            return false
        })
        return list
    }


    pointScale(x: number, y: number, scale: number) {

    }

    async jumpImg(displayIndex: number): Promise<void> {
        return new Promise((res) => {
            setTimeout(() => {
                let top = 0

                for (let i = 0; i < imgStore.children.length; i++) {
                    let child = imgStore.children[i]
                    if (!child.isViewDisplay) {
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