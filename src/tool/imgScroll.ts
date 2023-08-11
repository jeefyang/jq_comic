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
    minX: number = 0
    minY: number = 0
    maxX: number = 0
    maxY: number = 0
    isSplit: boolean = true

    /** 能否滑动到下张 */
    canSwiperNext: boolean = true
    constructor() {

    }

    resizeImg() {
        this.isSplit = store.splitImg == "split" || (store.splitImg == "auto" && store.originImgW > store.originImgH)
        if (!this.isSplit) {
            store.curImgW = store.originImgW
            store.curImgH = store.originImgH
        }
        else {
            store.curImgW = store.originImgW / 2
            store.curImgH = store.originImgH
        }
        store.imgDomY = 0
        this.isScrollX = true
        this.isScrollY = true
        let curRatio = store.curImgW / store.curImgH
        let screenRatio = store.divFloatW / store.divFloatH
        store.curCanvasY = 0
        store.curCanvasX = 0
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
        this.maxX = 0
        this.minX = Math.min(this.maxX, store.screenW - store.displayImgW)
        this.maxY = 0
        this.minY = Math.min(this.maxY, store.screenH - store.displayImgH)
        if (this.isScrollX) {
            store.curCanvasX = (store.directX + 1) / 2 * this.minX
        }
        store.imgDomH = store.displayImgH
        store.imgDomX = 0
        if (!this.isSplit) {
            store.imgDomW = store.displayImgW
        }
        else {
            store.imgDomW = store.displayImgW * 2
            let splitNum = 0
            if ((store.directX == -1 && store.splitNum == 1) || (store.directX == 1 && store.splitNum == 0)) {
                splitNum = 1
            }
            else { splitNum = 0 }
            store.imgDomX -= store.displayImgW * splitNum
        }

    }

    scroll(x: number, y: number) {
        if (this.isScrollX) {
            store.curCanvasX = Math.min(this.maxX, Math.max(this.minX, x))
        }
        if (this.isScrollY) {
            store.curCanvasY = Math.min(this.maxY, Math.max(this.minY, y))
        }
    }

    setPanStart(x: number, y: number, v: boolean = true) {
        this.prevMouseX = x
        this.prevMouseY = y
        if (v) {
            this.canSwiperNext = true
        }
    }

    setPanMove(x: number, y: number) {
        let newX = x - this.prevMouseX
        let newY = y - this.prevMouseY
        if ((store.curCanvasX > -1 && newX > 0) || (store.curCanvasX - 1 < this.minX && newX < 0)) {
        }
        else {
            this.canSwiperNext = false
        }
        this.scroll(store.curCanvasX + newX, store.curCanvasY + newY)
        this.prevMouseX = x
        this.prevMouseY = y
        jFileCache.autoSave()

    }

    /** 设置滑动逻辑 */
    async setSwipeMove(x: number, y: number) {

        if (x != 0 && (this.canSwiperNext || !this.isScrollX)) {
            if ((!this.isScrollX || store.curCanvasX > -1) && x > 0) {
                await this.turnLeft()
                return
            }
            if ((!this.isScrollX || store.curCanvasX - 1 < store.screenW - store.displayImgW) && x < 0) {
                await this.turnRight()
                return
            }
        }
        this.setPanMove(x, y)
        jFileCache.autoSave()
        return
    }

    async turnLeft() {
        if (store.directX != -1) {
            this.setNext()
        }
        else {
            this.setPrev()
        }
    }

    async turnRight() {
        if (store.directX == -1) {
            this.setNext()
        }
        else {
            this.setPrev()
        }
    }

    async setNext() {
        if (this.isSplit && !store.splitNum) {
            store.splitNum = 1
            this.resizeImg()
            return
        }
        if (store.curNo + 1 >= store.imgCount) {
            showToast({
                message: "已经是尾页了",
                forbidClick: true,
                duration: 1000
            })
            return
        }
        store.splitNum = 0
        store.isDisplayLoading = true
        setImgLoading()
        await jFileCache.setImgByNum(store.curNo + 1)
        store.isDisplayLoading = false
        await jFileCache.preloadImg(store.curNo + 1, -1)
    }

    async setPrev() {
        if (this.isSplit && store.splitNum) {
            store.splitNum = 0
            this.resizeImg()
            return
        }
        if (store.curNo <= 0) {
            showToast({
                message: "已经是首页了",
                forbidClick: true,
                duration: 1000
            })
            return
        }
        store.splitNum = 1
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
        this.scroll(store.curCanvasX + deltaX, store.curCanvasY + deltaY)
    }

}

export const jImgScroll = new JImgScroll()