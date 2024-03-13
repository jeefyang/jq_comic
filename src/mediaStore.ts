import { reactive } from "vue"
import { MediaStoreType, MediaViewChildType } from "./media"


export const mediaStore = reactive(<MediaStoreType>{
    // children: [],
    screenW: 0,
    screenH: 0,
    domScale: 1,
    domTransX: 0,
    domTransY: 0,
    divFloatWRatio: 0.01,
    divFloatHRatio: 0.01,
    divFloatTop: 0,
    divFloatLeft: 0,
    divFloatW: 0,
    divFloatH: 0,
    margin: 5,
    isMediaLoading: false,
    isMediaPrepareLoading: false,
    transitionMS: 300,
    isNextWaterfall: false,
    isPrevWaterfall: false,
    isZip: false,
    zipInFileName: "",
    len: 0,
    msgBottom: 30,
    curSplit: 0,
    waterfallNextMediaCount: 8,
    waterfallPrevMediaCount: 8,
    StandardPrevMediaCount: 3,
    StandardNextMediaCount: 3,
    areaTouch: [],
    displayArea: false,
    scaling: 2,
    standardMoveRatio: 1,
    debugMsg: "",
    setNext: 0,
    setPrev: 0,
    jumpPage: "0,0",
    forceJumpPage: 0,
    setResize: 0
})

export type mediaMiddleDataType = {
    list: MediaViewChildType[]
}

/** 媒体中间数据,一般不用于计算,只用于传递 */
export const mediaMiddleData: mediaMiddleDataType = {
    list: []
}
