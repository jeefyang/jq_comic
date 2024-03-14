import { MediaViewChildType } from "../media"
import { mediaStore } from "../mediaStore"
import { store } from "../store"
import { jaction } from "../tool/action"
import { jFileCache } from "../tool/fileCache"
import { JTouch } from "../tool/touch"


export class ComicDisplayWaterfall {

    scrollTag: -1 | 0 | 1 = 0
    isScrollUp = false

    constructor() {

    }

    resizeChild(child: MediaViewChildType) {
        let cache = jFileCache.getMediaCache(child)
        // if (!child.isViewDiv) {
        //     return
        // }
        child.displayW = cache.originW
        child.transX = 0
        child.displayH = cache.originH
        child.isSplit = store.splitMedia == "split" ? true : (store.splitMedia == "auto" && cache.originW > cache.originH) ? true : false
        if (child.isSplit) {
            child.displayW = cache.originW / 2
            if (
                (store.directX == -1 && child.splitNum == 1) ||
                (store.directX == 1 && child.splitNum == 0)
            ) {
                child.transX = -cache.originW / 2
            }
            else {
                child.transX = 0
            }
        }
        child.scale = mediaStore.divFloatW / child.displayW
    }

    pointScale(x: number, y: number, div: HTMLElement) {
        let clientX = x - mediaStore.divFloatLeft
        let clientY = y - mediaStore.divFloatTop
        let oldSDomScale = mediaStore.domScale
        mediaStore.domScale = mediaStore.domScale == 1 ? mediaStore.scaling : 1
        let left = (div.scrollLeft + clientX) / oldSDomScale * mediaStore.domScale - (clientX)
        let top = (div.scrollTop + clientY) / oldSDomScale * mediaStore.domScale - (clientY)
        setTimeout(() => {

            div.scrollTo({ left: left, top: top, behavior: 'auto' })
        }, 50);
    }

    updateChild(child: MediaViewChildType) {
        let cache = jFileCache.getMediaCache(child)
        // child.isViewVideo = cache.type == 'video'
        // child.isViewImg = cache.type == 'img'
        // child.isViewDiv = child.isView
        if (store.splitMedia == "none") {
            child.isSplit = false
            child.isViewDisplay = child.splitNum == 0
        }
        else if (store.splitMedia == "split") {
            child.isSplit = true
            child.isViewDisplay = true
        }
        else if (store.splitMedia == "auto") {
            child.isSplit = cache.originW > cache.originH
            child.isViewDisplay = !child.isLoaded || child.isSplit || child.splitNum == 0
        }
    }

    eventInit(div: HTMLElement) {
        let touch = new JTouch(div)
        touch.setClick((x, y) => {
            console.log("click")
            jaction.setClickArea(x, y)
        })
        touch.setDblclick((x, y) => {
            console.log('dblclick')
            this.pointScale(x, y, div)
        })
        touch.setSiwpe((start, end, _time) => {
            let deltaX = end.x - start.x
            let deltaY = end.y - start.y
            if (Math.abs(deltaY) - Math.abs(deltaX)) {
                if (deltaY > 0 && !this.isScrollUp) {
                    this.scrollTag = -1
                }
            }
        })
        div.onwheel = (e) => {
            if (e.deltaY < 0 && this.isScrollUp) {
                return false
            }
            if (e.deltaY > 0) {
                this.scrollTag = 1
            }
            else {
                this.scrollTag = -1
            }
        }
    }

    async jumpMedia(div: HTMLElement, displayIndex: number, splitNum: 0 | 1, list: MediaViewChildType[], time: number) {
        if (displayIndex == undefined) {
            return
        }
        for (let i = 0; i < list.length; i++) {
            let child = list[i]
            if (!child.isViewDisplay || child.displayIndex != displayIndex || child.splitNum != splitNum) {
                continue
            }
            // child.isView = true
            let cache = jFileCache.getMediaCache(child)
            // mediaStore.zipInFileName = cache.zipInFileName || ""
            store.fileName = cache.fileName
        }
        store.displayIndex = displayIndex
        return new Promise((res) => {
            setTimeout(() => {

                // let childDiv = <HTMLDivElement>(div.getElementsByClassName(`display_list ${displayIndex}_${splitNum}`)?.[0])
                // if (childDiv) {
                //     childDiv.scrollIntoView({ behavior: "smooth" })
                //     res(undefined)
                //     return
                // }

                let top = 0

                for (let i = 0; i < list.length; i++) {
                    let child = list[i]
                    if (!child.isViewDisplay) {
                        continue
                    }
                    if (displayIndex == child.displayIndex && splitNum == child.splitNum) {
                        div.scrollTo({ top, behavior: "smooth" })
                        res(undefined)
                        return
                    }
                    top += child.displayH * child.scale * mediaStore.domScale + mediaStore.margin
                }

            }, time);
        })
    }

    // scrollViewList(index: number, start: number, cb?: (c: MediaViewChildType) => void) {
    //     let list: number[] = []
    //     let screensh = this.displayDiv.scrollTop
    //     let srceeneh = this.displayDiv.scrollTop + mediaStore.divFloatH
    //     this.scrollView(index, start, (h, c, i) => {
    //         if ((screensh <= start && srceeneh >= start) ||
    //             (screensh <= h && srceeneh >= h) ||
    //             (screensh >= start && srceeneh <= h)
    //         ) {
    //             cb && cb(c)
    //             list.push(i)
    //         }
    //         start = h
    //         return false
    //     })
    //     return list
    // }
}