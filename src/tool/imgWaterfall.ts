
import { mediaMiddleData, mediaStore } from "../mediaStore"
import { MediaViewChildType } from "../media"
import { store } from "../store"
import { jFileCache } from "./fileCache"
import { JImgCommonType } from "./imgCommon"
import { JImgCommonChild } from "./imgCommonChild"

class JImgWaterfall extends JImgCommonChild implements JImgCommonType {
    displayDiv: HTMLDivElement



    updateViewState() {
        for (let i = 0; i < mediaStore.waterfallNextMediaCount; i++) {
            let displayIndex = i + store.displayIndex
            for (let j = 0; j < mediaMiddleData.list.length; j++) {
                let child = mediaMiddleData.list[j]
                if (child.displayIndex == displayIndex) {
                    child.isView = true
                }
                this.mediaUpdateState(child)
            }
        }
    }

    MediaResize(obj: MediaViewChildType) {
        let cache = jFileCache.mediaCache[obj.searchIndex]

        this.mediaUpdateState(obj)
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
        obj.scale = mediaStore.divFloatW / obj.displayW
    }

    scrollView(index: number, start: number, checkFunc: (size: number, c: MediaViewChildType, index: number) => boolean) {
        let findIndex = -1
        for (let i = index; i < mediaMiddleData.list.length; i++) {
            let c = mediaMiddleData.list[i]
            if (!c.isViewDisplay) {
                continue
            }
            let h = start + c.displayH * c.scale * mediaStore.domScale
            if (checkFunc(h, c, i)) {
                findIndex = i
                break
            }
            start = h + mediaStore.margin
        }
        index = findIndex
        return { index, start }
    }

    scrollViewList(index: number, start: number, cb?: (c: MediaViewChildType) => void) {
        let list: number[] = []
        let screensh = this.displayDiv.scrollTop
        let srceeneh = this.displayDiv.scrollTop + mediaStore.divFloatH
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



    async jumpMedia(displayIndex: number, splitNum: 0 | 1): Promise<void> {
        return new Promise((res) => {
            setTimeout(() => {
                let top = 0

                for (let i = 0; i < mediaMiddleData.list.length; i++) {
                    let child = mediaMiddleData.list[i]
                    if (!child.isViewDisplay) {
                        continue
                    }
                    if (displayIndex == child.displayIndex && splitNum == child.splitNum) {
                        this.displayDiv.scrollTo({ top, behavior: "smooth" })
                        res()
                        return
                    }
                    top += child.displayH * child.scale * mediaStore.domScale + mediaStore.margin
                }
                res()
            }, 500);
        })
    }



}

export const jImgWaterfall = new JImgWaterfall()