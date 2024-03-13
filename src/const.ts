import { JAreaType } from "./type"

/** 静态数据,不需要监听的 */
export const staticData = {
    /** 图片加载预备时间 */
    imgLoadPrepareTime: <number>500,
    /** 保存图片缓存数量 */
    saveImgCount: 30,
    /** 提前加载图片数量 */
    advanceImgCount: 10,
    /** 默认颜色 */
    defaultBackground: "#1c1c1e",
    /** 默认媒体加载色 */
    defaultMediaLoadingColor: "green",
    /** 显示触碰区域透明度 */
    displayAreaOpacity: 0.16
}



function initAreaTouch(op: JAreaType) {
    if (!op.startX) {
        op.startX = 0
    }
    if (!op.startXPer) {
        op.startXPer = 0
    }
    if (!op.startY) {
        op.startY = 0
    }
    if (!op.startYPer) {
        op.startYPer = 0
    }
    if (!op.endX) {
        op.endX = 0
    }
    if (!op.endXPer) {
        op.endXPer = 0
    }
    if (!op.endY) {
        op.endY = 0
    }
    if (!op.endYPer) {
        op.endYPer = 0
    }
    if (!op.color) {
        let radomFunc = () => {
            return Math.floor(256 * Math.random())
        }
        op.color = `rgba(${radomFunc()},${radomFunc()},${radomFunc()},${staticData.displayAreaOpacity})`
    }
    return op
}

export const areaTouchWaterFall: JAreaType[] = [
    initAreaTouch({
        startXPer: 0.40,
        startYPer: 0.40,
        endXPer: 0.60,
        endYPer: 0.60,
        type: "option"
    }),
    initAreaTouch({
        startXPer: 0.15,
        startYPer: 0,
        endXPer: 0.85,
        endYPer: 0.10,
        type: "fileManager"
    }),
    initAreaTouch({
        startXPer: 0.15,
        startYPer: 0.9,
        endXPer: 0.85,
        endYPer: 1,
        type: "progressBar"
    }),
    initAreaTouch({
        startXPer: 0,
        startYPer: 0,
        endXPer: 0.5,
        endYPer: 1,
        type: "prev"
    }),
    initAreaTouch({
        startXPer: 0.5,
        startYPer: 0,
        endXPer: 1,
        endYPer: 1,
        type: "next"
    }),
]