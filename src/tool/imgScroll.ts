import { store } from "../store"
import { showToast } from "vant"
import { jFileCache } from "./fileCache"
import { setImgLoading } from "./util"

class JImgScroll {

    prevMouseX: number = null
    prevMouseY: number = null
    wheelRatio: number = 0.2
    isScrollX = true
    isScrollY = true
    imgDom: HTMLImageElement = null
    constructor() {

    }

    resizeImg() {
        if (!this.imgDom || !this.imgDom.naturalWidth || !this.imgDom.naturalHeight) {
            return
        }
        this.isScrollX = true
        this.isScrollY = true
        store.curCanvasX = 0
        store.curCanvasY = 0
        store.curImgW = this.imgDom.naturalWidth
        store.curImgH = this.imgDom.naturalHeight
        let curRatio = store.curImgW / store.curImgH
        let screenRatio = store.divFloatW / store.divFloatH
        switch (store.readMode) {
            case "none":
                store.displayImgW = store.curImgW
                store.displayImgH = store.curImgH
                if (store.displayImgH <= store.divFloatH) {
                    this.isScrollY = false
                    store.curCanvasY = (store.divFloatH - store.displayImgH) / 2
                }
                if (store.displayImgW <= store.divFloatW) {
                    this.isScrollX = false
                    store.curCanvasX = (store.divFloatW - store.displayImgW) / 2
                }
                break
            case "width":
                store.displayImgW = store.divFloatW
                store.displayImgH = store.displayImgW / curRatio
                this.isScrollX = false
                if (store.displayImgH <= store.divFloatH) {
                    this.isScrollY = false
                    store.curCanvasY = (store.divFloatH - store.displayImgH) / 2
                }

                break
            case "height":
                store.displayImgH = store.divFloatH
                store.displayImgW = store.displayImgH * curRatio
                this.isScrollY = false
                if (store.displayImgW <= store.divFloatW) {
                    this.isScrollX = false
                    store.curCanvasX = (store.divFloatW - store.displayImgW) / 2
                }
                break
            case "fit":
                if (curRatio > screenRatio) {
                    store.displayImgW = store.divFloatW
                    store.displayImgH = store.displayImgW / curRatio
                }
                else {
                    store.displayImgH = store.divFloatH
                    store.displayImgW = store.displayImgH * curRatio
                }
                store.curCanvasX = (store.divFloatW - store.displayImgW) / 2
                store.curCanvasY = (store.divFloatH - store.displayImgH) / 2
                this.isScrollY = false
                this.isScrollX = false
                break
        }
    }

    scroll(x: number, y: number) {
        if (this.isScrollX) {
            store.curCanvasX = Math.min(0, Math.max(store.screenW - store.displayImgW, x))
        }
        if (this.isScrollY) {
            store.curCanvasY = Math.min(0, Math.max(store.screenH - store.displayImgH, y))
        }
    }

    setTouchStart(x: number, y: number) {
        this.prevMouseX = x
        this.prevMouseY = y
    }

    setTouchMove(x: number, y: number) {
        let newX = x - this.prevMouseX
        let newY = y - this.prevMouseY
        this.scroll(store.curCanvasX + newX, store.curCanvasY + newY)
        this.prevMouseX = x
        this.prevMouseY = y
    }

    /** 设置滑动逻辑 */
    async setSwipeMove(x: number, y: number) {

        if (x != 0) {
            if (store.curCanvasX > -1 && x > 0) {
                await this.setPrev()
                return
            }
            if (store.curCanvasX - 1 < store.screenW - store.displayImgW && x < 0) {
                await this.setNext()
                return
            }
        }
        this.setTouchMove(x, y)
        return
    }

    async setNext() {
        if (store.curNo + 1 >= store.imgCount) {
            showToast({
                message: "已经是尾页了",
                forbidClick: true,
                duration: 1000
            })
            return
        }
        store.isDisplayLoading = true
        setImgLoading()
        await jFileCache.setImgByNum(store.curNo + 1)
        store.isDisplayLoading = false
        await jFileCache.preloadImg(store.curNo + 1, -1)
    }

    async setPrev() {
        if (store.curNo <= 0) {
            showToast({
                message: "已经是首页了",
                forbidClick: true,
                duration: 1000
            })
            return
        }
        store.isDisplayLoading = true
        setImgLoading()
        await jFileCache.setImgByNum(store.curNo - 1)
        store.isDisplayLoading = false
        await jFileCache.preloadImg(store.curNo - 1, -1)
    }


    setMouseDown(x: number, y: number) {
        this.prevMouseX = x
        this.prevMouseY = y
    }

    setMouseMove(x: number, y: number) {
        if (this.prevMouseX == null) {
            return
        }

        this.scroll(store.curCanvasX + x - this.prevMouseX, store.curCanvasY + y - this.prevMouseY)
        this.prevMouseX = x
        this.prevMouseY = y
    }

    setMouseUp() {
        this.prevMouseX = null
        this.prevMouseY = null
    }

    setMouseWheel(delta: number, isKey: boolean) {
        let deltaX = 0
        let deltaY = delta
        if (isKey) {
            deltaX = deltaY
            deltaY = 0
        }

        deltaX = (deltaX ? (Math.abs(deltaX) / deltaX) : 0) * store.screenW * this.wheelRatio
        deltaY = (deltaY ? (Math.abs(deltaY) / deltaY) : 0) * store.screenH * this.wheelRatio
        // console.log(deltaX, deltaY, store.screenH)
        this.scroll(store.curCanvasX + deltaX, store.curCanvasY + deltaY)
    }

}

export const jImgScroll = new JImgScroll()