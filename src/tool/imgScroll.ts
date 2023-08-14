import { store } from "../store"
import { showToast } from "vant"
import { jFileCache } from "./fileCache"
import { setImgLoading } from "./util"

class JImgScroll {

    prevMouseX: number = null
    prevMouseY: number = null
    wheelRatio: number = 0.2
    isMoveX = true
    isMoveY = true
    minX: number = 0
    minY: number = 0
    maxX: number = 0
    maxY: number = 0
    isSplit: boolean = true
    originScale: number = 1
    curEXScale: number = 1
    minScale: number = 1
    maxScale: number = 3
    isDoubleTap: boolean = false

    /** 能否滑动到下张 */
    canSwiperNext: boolean = true

    videoDom: HTMLVideoElement
    constructor() {

    }

    setVideoPlay(v?: boolean) {
        if (v != null && !v == this.videoDom.paused) {
            return
        }
        if (v == null) {
            v = this.videoDom.paused
        }
        console.log(v)

        if (v) {
            console.log("play")
            this.videoDom.play()
        }
        else {
            console.log("pause")
            this.videoDom.pause()
        }
    }

    resizeImg() {
        console.log(store.originImgW, store.originImgH)
        this.isSplit = store.splitImg == "split" || (store.splitImg == "auto" && store.originImgW > store.originImgH)
        if (!this.isSplit) {
            store.displayImgW = store.originImgW
            store.displayImgH = store.originImgH
        }
        else {
            store.displayImgW = store.originImgW / 2
            store.displayImgH = store.originImgH
        }
        this.isMoveX = true
        this.isMoveY = true
        let curRatio = store.displayImgW / store.displayImgH
        let screenRatio = store.divFloatW / store.divFloatH
        let domTransX = 0
        let domTransY = 0
        let domScale = 1

        switch (store.readMode) {
            case "none":
                if (store.displayImgH <= store.divFloatH) {
                    this.isMoveY = false
                    domTransY = (store.divFloatH - store.displayImgH * domScale) / 2
                }
                if (store.displayImgW <= store.divFloatW) {
                    this.isMoveX = false
                    domTransX = (store.divFloatW - store.displayImgW * domScale) / 2
                }
                break
            case "width":
                domScale = store.divFloatW / store.displayImgW
                this.isMoveX = false
                if (store.displayImgH * domScale <= store.divFloatH) {
                    this.isMoveY = false
                    domTransY = (store.divFloatH - store.displayImgH * domScale) / 2
                }

                break
            case "height":
                domScale = store.divFloatH / store.displayImgH
                this.isMoveY = false
                if (store.displayImgW * domScale <= store.divFloatW) {
                    this.isMoveX = false
                    domTransX = (store.divFloatW - store.displayImgW * domScale) / 2
                }
                break
            case "fit":
                if (curRatio > screenRatio) {
                    domScale = store.divFloatW / store.displayImgW
                }
                else {
                    domScale = store.divFloatH / store.displayImgH
                }
                domTransX = (store.divFloatW - store.displayImgW * domScale) / 2
                domTransY = (store.divFloatH - store.displayImgH * domScale) / 2
                this.isMoveY = false
                this.isMoveX = false
                break
        }
        this.maxX = 0
        this.minX = Math.min(this.maxX, (store.screenW - store.displayImgW * domScale))
        this.maxY = 0
        this.minY = Math.min(this.maxY, (store.screenH - store.displayImgH * domScale))
        if (this.isMoveX) {
            domTransX = (store.directX + 1) / 2 * this.minX
        }
        let imgTranslateX = 0
        if (!this.isSplit) {
        }
        else {
            let splitNum = 0
            if ((store.directX == -1 && store.splitNum == 1) || (store.directX == 1 && store.splitNum == 0)) {
                splitNum = 1
            }
            else { splitNum = 0 }
            imgTranslateX -= store.originImgW / 2 * splitNum
        }
        store.domTransX = domTransX
        store.domTransY = domTransY
        store.imgTransX = imgTranslateX
        store.imgTransY = 0
        store.domScale = domScale
        this.originScale = this.curEXScale = 1
        this.isDoubleTap = false

        store.debugMsg = `${store.originImgW} ${store.originImgH}`

    }

    setMove(x: number, y: number) {
        if (this.isMoveX) {
            store.domTransX = Math.min(this.maxX, Math.max(this.minX, x))
        }
        if (this.isMoveY) {
            store.domTransY = Math.min(this.maxY, Math.max(this.minY, y))
        }
    }

    scaleInit() {
        this.originScale = this.curEXScale
    }

    setPointScale(x: number, y: number, scale: number) {
        let limitEXScale = Math.min(Math.max(this.minScale, this.originScale * scale), this.maxScale)
        let newScale = store.domScale / this.curEXScale * limitEXScale
        this.curEXScale = limitEXScale
        let delta = 1 / store.domScale * newScale
        let domScale = store.domScale * delta
        this.maxX = 0
        this.minX = Math.min(this.maxX, store.screenW - store.displayImgW * newScale)
        this.maxY = 0
        this.minY = Math.min(this.maxY, store.screenH - store.displayImgH * newScale)
        store.debugMsg = limitEXScale - store.domScale
        let newX = (x - store.domTransX) / store.domScale
        let newY = (y - store.domTransY) / store.domScale
        newX = store.domTransX - (newX * (newScale - store.domScale))
        newY = store.domTransY - (newY * (newScale - store.domScale))
        if (store.displayImgW * domScale <= store.divFloatW) {
            this.isMoveX = true
            newX = (store.divFloatW - store.displayImgW * domScale) / 2
        }
        else {
            this.isMoveX = true
            newX = Math.min(this.maxX, Math.max(this.minX, newX))
        }
        if (store.displayImgH * domScale <= store.divFloatH) {
            this.isMoveY = false
            newY = (store.divFloatH - store.displayImgH * domScale) / 2
        }
        else {
            this.isMoveY = true
            newY = Math.min(this.maxY, Math.max(this.minY, newY))
        }
        store.domTransX = newX
        store.domTransY = newY

        store.domScale = domScale
    }

    setDoubleTap(ev: HammerInput) {
        if (store.isVideo) {
            this.setVideoPlay()
            return
        }
        if (this.isDoubleTap) {
            this.setPointScale(ev.center.x, ev.center.y, 1)
        }
        else {
            this.setPointScale(ev.center.x, ev.center.y, 2)
        }
        this.isDoubleTap = !this.isDoubleTap
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
        if ((store.domTransX > -1 && newX > 0) || (store.domTransX - 1 < this.minX && newX < 0)) {
        }
        else {
            this.canSwiperNext = false
        }
        this.setMove(store.domTransX + newX, store.domTransY + newY)
        this.prevMouseX = x
        this.prevMouseY = y

    }

    /** 设置滑动逻辑 */
    async setSwipeMove(x: number, y: number) {

        if (x != 0 && (this.canSwiperNext || !this.isMoveX)) {
            if ((!this.isMoveX || store.domTransX > -1) && x > 0) {
                await this.turnLeft()
                jFileCache.autoSave()
                return
            }
            if ((!this.isMoveX || store.domTransX - 1 < store.screenW - store.displayImgW * store.domScale) && x < 0) {
                await this.turnRight()
                jFileCache.autoSave()
                return
            }
        }
        this.setPanMove(x, y)

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
        this.setMove(store.domTransX + x - this.prevMouseX, store.domTransY + y - this.prevMouseY)
        this.prevMouseX = x
        this.prevMouseY = y
    }

    setMouseUp() {
        this.prevMouseX = null
        this.prevMouseY = null
    }

    /** 设置鼠标滚动 */
    setMouseWheel(delta: number, isKey: boolean) {
        let deltaX = 0
        let deltaY = delta
        if (isKey) {
            deltaX = deltaY
            deltaY = 0
        }

        deltaX = (deltaX ? (Math.abs(deltaX) / deltaX) : 0) * store.screenW * this.wheelRatio
        deltaY = (deltaY ? (Math.abs(deltaY) / deltaY) : 0) * store.screenH * this.wheelRatio
        this.setMove(store.domTransX + deltaX, store.domTransY + deltaY)
    }

    setMouseWheelScale(ev: WheelEvent) {
        this.setPointScale(ev.clientX - store.divFloatLeft, ev.clientY - store.divFloatTop, this.curEXScale + (ev.deltaY > 0 ? 0.1 : -0.1))
    }

}

export const jImgScroll = new JImgScroll()