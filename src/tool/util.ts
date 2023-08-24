import hammer from "hammerjs"
import { store } from "../store"
import { staticData } from "../const"
import { imgStore } from "../imgStore"

export type hammerEventType =
    "press" |
    "pressup" |
    "pan" |
    "panstart" |
    "panmove" |
    "panend" |
    "pancancel" |
    "panleft" |
    "panright" |
    "panup" |
    "pandown" |
    "pinch" |
    "pinchstart" |
    "pinchmove" |
    "pinchend" |
    "pinchcancel" |
    "pinchin" |
    "pinchout" |
    "rotate" |
    'rotatestart' |
    "rotatemove" |
    "rotateend" |
    "rotatecancel" |
    "swipe" |
    "swipeleft" |
    "swiperight" |
    "swipeup" |
    "swipedown" |
    "tap" |
    "doubletap"



export class JHammer {
    h: HammerManager
    constructor(e: HTMLElement, isManger?: boolean) {
        this.h = isManger ? new hammer.Manager(e) : new hammer(e)
        // 专门用于自定义操作
        if (isManger) {


        }
    }

    on(e: hammerEventType | hammerEventType[], f: HammerListener) {
        if (Array.isArray(e)) {
            this.h.on(e.join(" "), f)
        }
        else {
            this.h.on(e, f)
        }
        return this
    }

    set(options: HammerOptions) {
        this.h.set(options)
        return this
    }

    setDirection(e: hammerEventType) {
        this.h.get(e).set({ direction: Hammer.DIRECTION_ALL })
        return this
    }

    openPinch() {
        this.h.get("pinch").set({ enable: true })
        return this
    }



}

/** 设置图片加载效果 */
export function setImgLoading() {
    imgStore.isImgPrepareLoading = true
    setTimeout(() => {
        if (imgStore.isImgPrepareLoading) {
            imgStore.isImgLoading = true
        }
    }, staticData.imgLoadPrepareTime);
}

let transitionMS: number
export function stopTransition() {
    transitionMS = imgStore.transitionMS
    if (imgStore.transitionMS != 0) {
        imgStore.transitionMS = 0
    }

}

export function recoverTransition() {
    if (imgStore.transitionMS != transitionMS) {
        imgStore.transitionMS = transitionMS
    }

}