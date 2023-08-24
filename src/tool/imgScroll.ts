import { store } from "../store"
import { showToast } from "vant"
import { jFileCache } from "./fileCache"
import { setImgLoading } from "./util"
import { imgStore, imgStoreChildType } from "../imgStore"

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
    minScale: number = 1
    maxScale: number = 3
    isDoubleTap: boolean = false
    originScale: number = 1
    curEXScale: number = 1

    /** 能否滑动到下张 */
    canSwiperNext: boolean = true


    constructor() {

    }

    initImgObj(obj: imgStoreChildType, isInit: boolean) {

        if (isInit || store.readMode != "udWaterfall") {
            imgStore.children = [obj]
        }
        else {
            imgStore.children.push(obj)
        }
        this.resizeImg()
    }

    setVideoPlay(v?: boolean) {

    }

    resizeOneImg(obj: imgStoreChildType) {
        obj.isSplit = store.splitImg == "split" || (store.splitImg == "auto" && obj.originImgW > obj.originImgH)
        if (!obj.isSplit) {
            obj.displayImgW = obj.originImgW
            obj.displayImgH = obj.originImgH
        }
        else {
            obj.displayImgW = obj.originImgW / 2
            obj.displayImgH = obj.originImgH
        }

        let imgScale = 1
        switch (store.readMode) {
            case "none":

                break
            case "width": case "udWaterfall":
                imgScale = imgStore.divFloatW / obj.displayImgW
                break
            case "height":
                imgScale = imgStore.divFloatH / obj.displayImgH
                break
            case "fit":
                let curRatio = obj.displayImgW / obj.displayImgH
                let screenRatio = imgStore.divFloatW / imgStore.divFloatH
                if (curRatio > screenRatio) {
                    imgScale = imgStore.divFloatW / obj.displayImgW
                }
                else {
                    imgScale = imgStore.divFloatH / obj.displayImgH
                }
                break
        }
        obj.imgScale = imgScale
        let imgTranslateX = 0
        if (!this.isSplit) {
        }
        else {
            let splitNum = 0
            if ((store.directX == -1 && obj.splitNum == 1) || (store.directX == 1 && obj.splitNum == 0)) {
                splitNum = 1
            }
            else { splitNum = 0 }
            imgTranslateX -= obj.originImgW / 2 * splitNum
        }
        obj.imgTransX = imgTranslateX
        obj.imgTransY = 0
        obj.parentTransX = 0
        obj.parentTransY = 0
    }


    resizeImg() {

        imgStore.children.forEach(o => {
            this.resizeOneImg(o)
        })
        this.isMoveX = true
        this.isMoveY = true

        let domTransX = 0
        let domTransY = 0
        let imgScale = 1

        switch (store.readMode) {
            case "none":
                var curRatio = imgStore.children[0].displayImgW / imgStore.children[0].displayImgH
                var screenRatio = imgStore.divFloatW / imgStore.divFloatH
                if (imgStore.children[0].displayImgH <= imgStore.divFloatH) {
                    this.isMoveY = false
                    domTransY = (imgStore.divFloatH - imgStore.children[0].displayImgH * imgScale) / 2
                }
                if (imgStore.children[0].displayImgW <= imgStore.divFloatW) {
                    this.isMoveX = false
                    domTransX = (imgStore.divFloatW - imgStore.children[0].displayImgW * imgScale) / 2
                }
                break
            case "width":
                imgScale = imgStore.divFloatW / imgStore.children[0].displayImgW
                this.isMoveX = false
                if (imgStore.children[0].displayImgH * imgScale <= imgStore.divFloatH) {
                    this.isMoveY = false
                    domTransY = (imgStore.divFloatH - imgStore.children[0].displayImgH * imgScale) / 2
                }

                break
            case "height":
                imgScale = imgStore.divFloatH / imgStore.children[0].displayImgH
                this.isMoveY = false
                if (imgStore.children[0].displayImgW * imgScale <= imgStore.divFloatW) {
                    this.isMoveX = false
                    domTransX = (imgStore.divFloatW - imgStore.children[0].displayImgW * imgScale) / 2
                }
                break
            case "fit":
                var curRatio = imgStore.children[0].displayImgW / imgStore.children[0].displayImgH
                var screenRatio = imgStore.divFloatW / imgStore.divFloatH
                if (curRatio > screenRatio) {
                    imgScale = imgStore.divFloatW / imgStore.children[0].displayImgW
                }
                else {
                    imgScale = imgStore.divFloatH / imgStore.children[0].displayImgH
                }
                domTransX = (imgStore.divFloatW - imgStore.children[0].displayImgW * imgScale) / 2
                domTransY = (imgStore.divFloatH - imgStore.children[0].displayImgH * imgScale) / 2
                this.isMoveY = false
                this.isMoveX = false
                break
        }

        this.setMaxMin(imgScale, 1)

        if (this.isMoveX) {
            domTransX = (store.directX + 1) / 2 * this.minX
        }
        imgStore.domTransX = domTransX
        imgStore.domTransY = domTransY
        this.isDoubleTap = false
        this.originScale = 1
        this.curEXScale = 1
        imgStore.domScale = 1
    }

    setMaxMin(imgscale?: number, domscale?: number) {

        if (store.readMode != "udWaterfall") {
            if (!imgscale) {
                imgscale = imgStore.children[0].imgScale
            }
            if (!domscale) {
                domscale = 1
            }
            this.maxX = 0
            this.minX = Math.min(this.maxX, (imgStore.screenW - imgStore.children[0].displayImgW * imgscale * domscale))
            this.maxY = 0
            this.minY = Math.min(this.maxY, (imgStore.screenH - imgStore.children[0].displayImgH * imgscale * domscale))
            console.log(this.minX, this.minY)
        }
    }

    /** 设置移动 */
    setMove(x: number, y: number) {
        if (this.isMoveX) {
            imgStore.domTransX = Math.min(this.maxX, Math.max(this.minX, x))
        }
        if (this.isMoveY) {
            imgStore.domTransY = Math.min(this.maxY, Math.max(this.minY, y))
        }
    }

    scaleInit() {
        this.originScale = this.curEXScale
    }

    setPointScale(x: number, y: number, scale: number) {
        let limitEXScale = Math.min(Math.max(this.minScale, this.originScale * scale), this.maxScale)
        let newScale = imgStore.domScale / this.curEXScale * limitEXScale
        this.curEXScale = limitEXScale
        let delta = 1 / imgStore.domScale * newScale
        let domScale = imgStore.domScale * delta
        this.setMaxMin(undefined, newScale)

        let newX = (x - imgStore.domTransX) / imgStore.domScale
        let newY = (y - imgStore.domTransY) / imgStore.domScale
        newX = imgStore.domTransX - (newX * (newScale - imgStore.domScale))
        newY = imgStore.domTransY - (newY * (newScale - imgStore.domScale))
        if (store.readMode != 'udWaterfall') {
            if (imgStore.children[0].displayImgW * imgStore.children[0].imgScale * domScale <= imgStore.divFloatW) {
                this.isMoveX = true
                newX = (imgStore.divFloatW - imgStore.children[0].displayImgW * imgStore.children[0].imgScale * domScale) / 2
            }
            else {
                this.isMoveX = true
                newX = Math.min(this.maxX, Math.max(this.minX, newX))
            }
            if (imgStore.children[0].displayImgH * imgStore.children[0].imgScale * domScale <= imgStore.divFloatH) {
                this.isMoveY = false
                newY = (imgStore.divFloatH - imgStore.children[0].displayImgH * imgStore.children[0].imgScale * domScale) / 2
            }
            else {
                this.isMoveY = true
                newY = Math.min(this.maxY, Math.max(this.minY, newY))
            }
        }
        imgStore.domScale = domScale
        imgStore.domTransX = newX
        imgStore.domTransY = newY


    }

    setDoubleTap(ev: HammerInput) {
        if (store.readMode != "udWaterfall" && imgStore.children[0].isVideo) {
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
        if ((imgStore.domTransX > -1 && newX > 0) || (imgStore.domTransX - 1 < this.minX && newX < 0)) {
        }
        else {
            this.canSwiperNext = false
        }
        this.setMove(imgStore.domTransX + newX, imgStore.domTransY + newY)
        this.prevMouseX = x
        this.prevMouseY = y

    }

    /** 设置滑动逻辑 */
    async setSwipeMove(x: number, y: number) {

        if (x != 0 && (this.canSwiperNext || !this.isMoveX)) {
            if ((!this.isMoveX || imgStore.domTransX > -1) && x > 0) {
                await this.turnLeft()
                jFileCache.autoSave()
                return
            }
            if ((!this.isMoveX || imgStore.domTransX - 1 < imgStore.screenW - imgStore.children[0].displayImgW * imgStore.domScale) && x < 0) {
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
        if (this.isSplit && !imgStore.children[0].splitNum) {
            imgStore.children[0].splitNum = 1
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
        imgStore.children[0].splitNum = 0
        store.isDisplayLoading = true
        setImgLoading()
        await jFileCache.setImgByNum(store.curNo + 1)
        store.isDisplayLoading = false
        await jFileCache.preloadImg(store.curNo + 1, -1)
    }

    async setPrev() {
        if (this.isSplit && imgStore.children[0].splitNum) {
            imgStore.children[0].splitNum = 0
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
        imgStore.children[0].splitNum = 1
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
        this.setMove(imgStore.domTransX + x - this.prevMouseX, imgStore.domTransY + y - this.prevMouseY)
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

        deltaX = (deltaX ? (Math.abs(deltaX) / deltaX) : 0) * imgStore.screenW * this.wheelRatio
        deltaY = (deltaY ? (Math.abs(deltaY) / deltaY) : 0) * imgStore.screenH * this.wheelRatio
        this.setMove(imgStore.domTransX + deltaX, imgStore.domTransY + deltaY)
    }

    setMouseWheelScale(ev: WheelEvent) {
        this.setPointScale(ev.clientX - imgStore.divFloatLeft, ev.clientY - imgStore.divFloatTop, this.curEXScale + (ev.deltaY > 0 ? 0.1 : -0.1))
    }

}

export const jImgScroll = new JImgScroll()