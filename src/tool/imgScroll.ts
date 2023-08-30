import { store } from "../store"
import { showToast } from "vant"
import { jFileCache } from "./fileCache"
import { setImgLoading } from "./util"
import { imgStore, imgStoreChildType } from "../imgStore"
import { staticData } from "../const"

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
            this.resizeImg()
        }

        if (store.readMode == "udWaterfall") {
            this.setNextWaterfall()
            // this.setWaterfallImgObj(1)
        }
        // else {

        // }

    }



    setVideoPlay(v?: boolean) {

    }

    resizeOneImg(index: number, lastAdd: -1 | 1 = -1) {
        let obj = imgStore.children[index]
        obj.isSplit = store.splitImg == "split" || (store.splitImg == "auto" && obj.originImgW > obj.originImgH)
        if (!obj.splitNum) {
            obj.splitNum = 0
        }
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
        let imgTransX = 0
        let imgTransY = 0
        if (!obj.isSplit) {
        }
        else {
            let splitNum = 0
            if ((store.directX == -1 && obj.splitNum == 1) || (store.directX == 1 && obj.splitNum == 0)) {
                splitNum = 1
            }
            else { splitNum = 0 }
            imgTransX -= obj.originImgW / 2 * splitNum
        }
        obj.imgTransX = imgTransX
        obj.imgTransY = imgTransY
        obj.parentTransX = 0
        if (store.readMode == "udWaterfall") {
            let last = imgStore.children[index + lastAdd]
            if (!last) {
                obj.parentTransY = 0
            }
            else {
                obj.parentTransY = last.parentTransY - (staticData.splitD * lastAdd) - (last.displayImgH * lastAdd * last.imgScale)
                // obj.parentTransY = last.parentTransY - (staticData.splitD * lastAdd / obj.imgScale) - (obj.displayImgH * lastAdd * obj.imgScale)
            }

        }
        else {
            obj.parentTransY = 0
        }

        return obj
    }


    resizeImg() {
        for (let i = 0; i < imgStore.children.length; i++) {
            this.resizeOneImg(i)
        }
        this.isMoveX = true
        this.isMoveY = true

        let domTransX = 0
        let domTransY = 0
        let imgScale = 1

        switch (store.readMode) {
            case "udWaterfall":
                break
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
        let children = imgStore.children
        let startImgScale = imgscale
        if (!startImgScale) {
            startImgScale = children[0].imgScale
        }
        let endImgScale = imgscale
        if (!endImgScale) {
            endImgScale = children[children.length - 1].imgScale
        }
        if (!domscale) {
            domscale = 1
        }
        this.maxX = Math.max(children[0].parentTransX * startImgScale * domscale, 0)
        this.minX = Math.min(this.maxX, (imgStore.screenW - (children[children.length - 1].displayImgW * endImgScale * domscale) - children[children.length - 1].parentTransX * domscale))
        this.maxY = Math.max(children[0].parentTransY * startImgScale * domscale, 0)
        this.minY = Math.min(this.maxY, (imgStore.screenH - (children[children.length - 1].displayImgH * endImgScale * domscale) - children[children.length - 1].parentTransY * domscale))

        // if (store.readMode != "udWaterfall") {
        //     if (!imgscale) {
        //         imgscale = imgStore.children[0].imgScale
        //     }
        //     if (!domscale) {
        //         domscale = 1
        //     }
        //     this.maxX = 0
        //     this.minX = Math.min(this.maxX, (imgStore.screenW - imgStore.children[0].displayImgW * imgscale * domscale))
        //     this.maxY = 0
        //     this.minY = Math.min(this.maxY, (imgStore.screenH - imgStore.children[0].displayImgH * imgscale * domscale))
        // }

        // if (store.readMode == "udWaterfall") {
        //     this.isMoveX = true
        //     this.isMoveY = true


        // }
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

    adjustPos() {
        this.setMaxMin()
        this.setMove(imgStore.domTransX, imgStore.domTransY)
    }

    async setNextOnlyOne() {
        if (imgStore.children[0].isSplit && !imgStore.children[0].splitNum) {
            imgStore.children[0].splitNum = 1
            this.resizeImg()
            jFileCache.preloadImg(store.curNo + 1, 1)
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
        store.isDisplayLoading = true
        setImgLoading()
        await jFileCache.setImgByNum(store.curNo + 1, 0)
        store.isDisplayLoading = false
        await jFileCache.preloadImg(store.curNo + 2, 1)
    }

    async setNextWaterfall(count: number = staticData.advanceImgCount) {
        if (count <= 0) {
            return
        }
        let children = imgStore.children
        let last = children[children.length - 1]
        if (last.isSplit && !last.splitNum) {
            let obj: (typeof children)[number] = JSON.parse(JSON.stringify(last))
            obj.splitNum = 1
            imgStore.children.push(obj)
            this.resizeOneImg(children.length - 1)
            obj.isLoaded = true
            this.adjustPos()
            await this.setNextWaterfall(count - 1)
            return
        }
        if (last.index + 1 >= store.imgCount) {
            showToast({
                message: "已经是尾页了",
                forbidClick: true,
                duration: 1000
            })
            return
        }
        // let curno=last
        let obj = await jFileCache.getImgByNum(last.index + 1, 0)
        imgStore.children.push(obj)
        this.resizeOneImg(children.length - 1)
        obj.isLoaded = true
        this.adjustPos()
        await this.setNextWaterfall(count - 1)
        return
    }

    async setNext() {
        if (store.readMode != "udWaterfall") {
            await this.setNextOnlyOne()
        }
    }

    async setPrevOnlyOne() {
        if (imgStore.children[0].isSplit && imgStore.children[0].splitNum) {
            imgStore.children[0].splitNum = 0
            this.resizeImg()
            await jFileCache.preloadImg(store.curNo - 1, -1)
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
        store.isDisplayLoading = true
        setImgLoading()
        await jFileCache.setImgByNum(store.curNo - 1, 1)
        store.isDisplayLoading = false
        await jFileCache.preloadImg(store.curNo - 2, -1)
    }

    async setPrevWaterfall(count: number = staticData.advanceImgCount) {
        if (count <= 0) {
            return
        }
        let children = imgStore.children
        let first = children[0]
        if (first.isSplit && first.splitNum) {
            let obj: (typeof children)[number] = JSON.parse(JSON.stringify(first))
            obj.splitNum = 0
            children.splice(0, 0, obj)
            this.resizeOneImg(0, 1)
            obj.isLoaded = true
            this.adjustPos()
            await this.setPrevWaterfall(count - 1)

            return
        }
        if (first.index <= 0) {
            showToast({
                message: "已经是首页了",
                forbidClick: true,
                duration: 1000
            })
            return
        }
        // let curno=last
        let obj = await jFileCache.getImgByNum(first.index - 1, 0)
        children.splice(0, 0, obj)
        this.resizeOneImg(0, 1)
        obj.isLoaded = true
        this.adjustPos()
        await this.setPrevWaterfall(count - 1)
        return
    }

    async setPrev() {
        if (store.readMode != "udWaterfall") {
            await this.setPrevOnlyOne()
        }
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