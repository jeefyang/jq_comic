import { reactive } from "vue"

export type imgStoreChildType = {
    /** 画布数据,必须存在 */
    canvasB64: string
    /** 图片原始宽,必须存在 */
    originImgW: number
    /** 图片原始高,必须存在 */
    originImgH: number
    /** 图片偏移坐标x */
    imgTransX?: number
    /** 图片偏移坐标y */
    imgTransY?: number
    /** 图片缩放 */
    imgScale?: number
    /** 图片显示的宽度 */
    displayImgW?: number
    /** 图片显示的高度 */
    displayImgH?: number
    /** 是否为视频文件 */
    isVideo?: boolean
    /** 是否已经开始播放视频 */
    isPlayedVideo?: boolean
    /** 切割后的第几张 */
    splitNum?: 0 | 1
    /** 包裹元素的位移x */
    parentTransX?: number
    /** 包裹元素的位移y */
    parentTransY?: number
    /** 是否完全加载好 */
    isLoaded?: boolean
    /** 是否切割 */
    isSplit?: boolean
    /** 顺序 */
    index: number
}

export type imgStoreType = {
    /** 子节点 */
    children: imgStoreChildType[]
    /** 屏幕宽 */
    screenW: number
    /** 屏幕高 */
    screenH: number
    /** dom元素缩放比例 */
    domScale: number
    /** 当前包裹元素位置X */
    domTransX: number
    /** 当前包裹元素 位置Y */
    domTransY: number
    /** div浮动宽度比例 */
    divFloatWRatio: number
    /** div浮动高度比例 */
    divFloatHRatio: number
    /** div浮动位置上 */
    divFloatTop: number
    /** div浮动位置左 */
    divFloatLeft: number
    /** div浮动宽度 */
    divFloatW: number
    /** div浮动高度 */
    divFloatH: number
    /** 图片是否正在加载 */
    isImgLoading: boolean
    /** 图片是否准备加载 */
    isImgPrepareLoading: boolean,
    /** 动画时间 */
    transitionMS: number
}

export const imgStore = reactive(<imgStoreType>{
    children: [],
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
    isImgLoading: false,
    isImgPrepareLoading: false,
    transitionMS: 300
})
