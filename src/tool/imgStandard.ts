
import { imgStore, imgStoreDisplayChildType as imgStoreDisplayChildType } from "../imgStore"
import { store } from "../store"
import { jFileCache } from "./fileCache"
import { JImgCommonType } from "./imgCommon"
import { JImgCommonChild } from "./imgCommonChild"
import { showToast } from 'vant';

class JImgStandard extends JImgCommonChild implements JImgCommonType {
    displayDiv: HTMLDivElement

    updateViewState() {
        for (let i = 0; i < imgStore.StandardNextMediaCount; i++) {
            let displayIndex = i + store.displayIndex
            for (let j = 0; j < imgStore.children.length; j++) {
                let child = imgStore.children[j]
                if (child.displayIndex == displayIndex) {
                    child.isView = true
                }
                this.mediaUpdateState(child)
            }
        }
    }

    MediaResize(obj: imgStoreDisplayChildType) {
        let cache = jFileCache.imgCache[obj.searchIndex]

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
        if (store.readMode == "none") {
            obj.scale = 1
            obj.parentTransX = 0
            obj.parentTransY = 0
        }
        else {
            let divFloatR = imgStore.divFloatW / imgStore.divFloatH
            let displayR = obj.displayW / obj.displayH
            if (store.readMode == "width" || (store.readMode == "fit" && divFloatR <= displayR)) {
                obj.scale = imgStore.divFloatW / obj.displayW

            }
            else if (store.readMode == "height" || (store.readMode == "fit" && divFloatR > displayR)) {
                obj.scale = imgStore.divFloatH / obj.displayH
            }
            let w = obj.displayW * obj.scale * imgStore.domScale
            let h = obj.displayH * obj.scale * imgStore.domScale
            obj.parentTransX = w >= imgStore.divFloatW ? 0 : (imgStore.divFloatW - w) / 2
            obj.parentTransY = h >= imgStore.divFloatH ? 0 : (imgStore.divFloatH - h) / 2
        }
    }

    setPrev() {
        let overflowDiv = this.getOverFlowDiv()
        if (!overflowDiv) {
            return
        }
        // 切换
        if (overflowDiv.scrollLeft <= 4) {
            let index = this.getCurChild().index
            let c = this.getStepMedia(index, -1)
            if (!c) {
                showToast({ "message": "已经是首页了!", forbidClick: true })
                return
            }
            this.jumpMedia(c.child.displayIndex, c.child.splitNum)
            this.preloadMedia(c.child.displayIndex, c.child.splitNum, -1)
            jFileCache.autoSave()
            return
        }
        else {
            let left = overflowDiv.scrollLeft - imgStore.divFloatW * imgStore.standardMoveRatio
            overflowDiv.scrollTo({ left: left, behavior: "smooth" })
        }
    }

    setNext() {
        let overflowDiv = this.getOverFlowDiv()
        if (!overflowDiv) {
            return
        }
        // 切换
        if (overflowDiv.scrollWidth - overflowDiv.scrollLeft - overflowDiv.clientWidth <= 4) {
            let index = this.getCurChild().index
            let c = this.getStepMedia(index, 1)
            if (!c) {
                showToast({ "message": "已经是尾页了!", forbidClick: true })
                return
            }
            this.jumpMedia(c.child.displayIndex, c.child.splitNum)
            this.preloadMedia(c.child.displayIndex, c.child.splitNum, 1)
            jFileCache.autoSave()
            return
        }
        else {
            let left = overflowDiv.scrollLeft + imgStore.divFloatW * imgStore.standardMoveRatio
            overflowDiv.scrollTo({ left: left, behavior: "smooth" })
        }
    }

    preloadMedia(displayIndex: number, splitNum: 0 | 1, add: 1 | -1) {
        let index = imgStore.children.findIndex(c => c.displayIndex == displayIndex && c.splitNum == splitNum)
        let count = add == 1 ? imgStore.StandardNextMediaCount : imgStore.StandardPrevMediaCount
        for (let i = 1; i < imgStore.children.length; i++) {
            if (count < 0) {
                return
            }
            let c = imgStore.children[i + index]
            if (!c) {
                return
            }
            c.isView = true
            this.mediaUpdateState(c)
            count--
        }
    }


    getStepMedia(index: number, add: -1 | 1) {
        for (let i = 1; i < imgStore.children.length; i++) {
            let newIndex = index + i * add
            let child = imgStore.children[newIndex]
            if (!child) {
                return
            }
            if (!child.isViewDisplay) {
                continue
            }
            return { child, index: newIndex }
        }
        return
    }

    jumpMedia(displayIndex: number, splitNum: 0 | 1): Promise<void> {

        let index = imgStore.children.findIndex(c => c.isViewDisplay && c.displayIndex == displayIndex && c.splitNum == splitNum)
        if (index == -1) {
            return
        }
        let child = imgStore.children[index]
        child.isView = true
        this.mediaUpdateState(child)
        let overflowDiv = this.getOverFlowDiv()
        imgStore.domScale = 1
        overflowDiv.scrollTop = 0
        overflowDiv.scrollLeft = 0

        store.displayIndex = child.displayIndex
        imgStore.curSplit = child.splitNum
        // let count = imgStore.children.reduce((prev, c, i) => {
        //     return prev + (!c.isViewDisplay || i > index ? 0 : 1)
        // }, -1)
        imgStore.domTransX = - index * imgStore.divFloatW
        return
    }



    getOverFlowDiv() {
        let listDiv: HTMLElement = <any>this.displayDiv.getElementsByClassName(`display_list ${store.displayIndex}_${imgStore.curSplit}`)?.[0]
        if (!listDiv) {
            return
        }
        let overflowDiv: HTMLElement = <any>listDiv.getElementsByClassName("display_overflow")?.[0]
        if (!overflowDiv) {
            return
        }
        return overflowDiv
    }

    getCurChild() {
        let index = imgStore.children.findIndex(c => c.displayIndex == store.displayIndex && c.splitNum == imgStore.curSplit)
        let o = imgStore.children[index]
        return {
            index, o
        }
    }

}

export const jImgStandard = new JImgStandard()