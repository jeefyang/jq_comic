import { MediaViewChildType } from "../media";
import { mediaStore } from "../mediaStore";
import { store } from "../store";
import { jaction } from "../tool/action";
import { jFileCache } from "../tool/fileCache";
import { JTouch } from "../tool/touch";

export class ComicDisplayStandard {


    constructor() {

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
            mediaStore.zipInFileName = cache.zipInFileName || ""
            store.fileName = cache.fileName
        }
        store.displayIndex = displayIndex
        return new Promise((res) => {
            setTimeout(() => {
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
                res(undefined)
            }, time);
        })
    }

    eventInit(div: HTMLElement) {
        let touch = new JTouch(div)
        touch.swipeTouchDelta = 200
        touch.dblInterval = 500
        touch.setClick((x, y) => {
            console.log("click")
            jaction.setClickArea(x, y, {
                setNext: () => {
                    mediaStore.setNext++
                },
                setPrev: () => {
                    mediaStore.setPrev++
                }
            })
        })
        touch.setDblclick((x, y) => {
            console.log('dblclick')
            this.pointScale(x, y, div)
        })
    }

    pointScale(x: number, y: number, div: HTMLElement) {
        let selectDiv = <HTMLDivElement>(div.getElementsByClassName("display_overflow")?.[0])
        if (!selectDiv) {
            return
        }
        let transDiv = <HTMLDivElement>(div.getElementsByClassName("display_trans")?.[0])
        if (!transDiv) {
            return
        }
        let oldSDomScale = mediaStore.domScale
        let clientX = x - mediaStore.divFloatLeft
        let clientY = y - mediaStore.divFloatTop
        mediaStore.domScale = mediaStore.domScale == 1 ? mediaStore.scaling : 1
        clientX -= parseFloat(transDiv.style.left) * mediaStore.domScale
        clientY -= parseFloat(transDiv.style.top) * mediaStore.domScale
        let left = (selectDiv.scrollLeft + clientX) / oldSDomScale * mediaStore.domScale - (clientX)
        let top = (selectDiv.scrollTop + clientY) / oldSDomScale * mediaStore.domScale - (clientY)
        setTimeout(() => {
            selectDiv.scrollTo({ left: left, top: top, behavior: 'auto' })
        }, 50);
    }

    resizeChild(child: MediaViewChildType) {
        let cache = jFileCache.getMediaCache(child)

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
        else {
            child.displayW = cache.originW
            child.transX = 0
        }
        child.displayH = cache.originH
        if (store.readMode == "none") {
            child.scale = 1
            child.parentTransX = 0
            child.parentTransY = 0
        }
        else {
            let divFloatR = mediaStore.divFloatW / mediaStore.divFloatH
            let displayR = child.displayW / child.displayH
            if (store.readMode == "width" || (store.readMode == "fit" && divFloatR <= displayR)) {
                child.scale = mediaStore.divFloatW / child.displayW

            }
            else if (store.readMode == "height" || (store.readMode == "fit" && divFloatR > displayR)) {
                child.scale = mediaStore.divFloatH / child.displayH
            }
            let w = child.displayW * child.scale * mediaStore.domScale
            let h = child.displayH * child.scale * mediaStore.domScale
            child.parentTransX = w >= mediaStore.divFloatW ? 0 : (mediaStore.divFloatW - w) / 2
            child.parentTransY = h >= mediaStore.divFloatH ? 0 : (mediaStore.divFloatH - h) / 2
        }
    }

    updateChild(child: MediaViewChildType) {
        let cache = jFileCache.getMediaCache(child)
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
        if (!child.isSplit) {
            child.splitNum = 0
        }
    }


}