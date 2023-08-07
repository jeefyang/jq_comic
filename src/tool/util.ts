import hammer from "hammerjs"

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