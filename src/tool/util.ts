import hammer from "hammerjs"
import { store } from "../store"
import { staticData } from "../const"

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



export function newHammer(e: HTMLElement, isManger?: boolean) {
    let h = isManger ? new hammer.Manager(e) : new hammer(e)
    // 专门用于自定义操作
    if (isManger) {


    }

    let onFunc = (e: hammerEventType | hammerEventType[], f: HammerListener) => {
        if (Array.isArray(e)) {
            h.on(e.join(" "), f)
        }
        else {
            h.on(e, f)
        }
        return {
            h,
            on: onFunc
        }
    }
    return {
        h, on: onFunc
    }
}

/** 设置图片加载效果 */
export function setImgLoading() {
    store.isImgPrepareLoading = true
    setTimeout(() => {
        if (store.isImgPrepareLoading) {
            store.isImgLoading = true
        }
    }, staticData.imgLoadPrepareTime);
}