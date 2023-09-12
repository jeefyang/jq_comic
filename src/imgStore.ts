import { reactive } from "vue"
import { JAreaType } from "./const"

export type imgStoreDisplayChildType = {
    searchIndex: number
    /** 图片偏移坐标x */
    transX?: number
    /** 图片偏移坐标y */
    transY?: number
    /** 图片缩放 */
    scale?: number
    /** 图片显示的宽度 */
    displayW?: number
    /** 图片显示的高度 */
    displayH?: number
    /** 是否已经开始播放视频 */
    isPlayedVideo?: boolean
    /** 包裹元素的位移x */
    parentTransX?: number
    /** 包裹元素的位移y */
    parentTransY?: number
    /** 展示用的顺序 */
    displayIndex: number
    /** 是否切割 */
    isSplit?: boolean
    /** 是否完全加载好 */
    isLoaded?: boolean
    /** 切割后的第几张 */
    splitNum?: 0 | 1
    /** 是否可以打开浏览 */
    isView?: boolean
    // 额外操作
    /** 图像是否可显 */
    isViewDisplay?: boolean
    /** 是否显示加载 */
    isViewLoading?: boolean
    /** 是否开始加载图像 */
    isViewLoaded?: boolean
    /** 是否显示在视频 */
    isViewVideo?: boolean
    /** 是否显示在图片 */
    isViewImg?: boolean

}

export type imgStoreChildType = {
    /** 画布数据,必须存在 */
    dataUrl: string
    /** 图片原始宽,后期获取 */
    originW?: number
    /** 图片原始高,后期获取 */
    originH?: number
    /** 类型 */
    type: "img" | "video"
    /** 文件名称 */
    fileName: string
    /** 是否压缩包 */
    isZip: boolean
    /** 压缩包内文件 */
    zipInFileName?: string
    /** 文件夹路径 */
    dirUrl: string,
    /** 获取时间 */
    time: number
    /** 后缀名 */
    exName: string
    /** 是否完整 */
    isComplete?: boolean
    /** 子节点排序 */
    childIndex: number
}

export type imgStoreType = {
    /** 子节点 */
    children: imgStoreDisplayChildType[]
    /** 屏幕宽 */
    screenW: number
    /** 屏幕高 */
    screenH: number
    /** dom元素缩放比例 */
    domScale: number
    /** dom元素矩阵 */
    domMatrix3d: string
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
    isImgPrepareLoading: boolean
    /** 动画时间 */
    transitionMS: number
    /** 是否正在读取下个瀑布,用来限制单线程读取,缓解服务器压力 */
    isNextWaterfall: boolean
    /** 是否正在读取上个瀑布,用来限制单线程读取,缓解服务器压力 */
    isPrevWaterfall: boolean
    /** 间隔 */
    margin: number
    /** 是否为压缩包,用于显示 */
    isZip: boolean
    /** 压缩包里文件名,用于显示 */
    zipInFileName: string
    /** 图片数量 */
    len: number
    /** 信息底部位置 */
    msgBottom: number
    /** 瀑布图片上数量 */
    waterfallPrevImgCount: number
    /** 瀑布图片下数量 */
    waterfallNextImgCount: number
    /** 浏览到子节点第几个 */
    viewChildIndex: number
    /** 触碰区域 */
    areaTouch: JAreaType[]
    /** 显示触碰区域 */
    displayArea: boolean
    /** 测试数据 */
    debugMsg: string | number
    curSplit: 0 | 1
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
    margin: 5,
    isImgLoading: false,
    isImgPrepareLoading: false,
    transitionMS: 300,
    isNextWaterfall: false,
    isPrevWaterfall: false,
    isZip: false,
    zipInFileName: "",
    len: 0,
    msgBottom: 30,
    curSplit: 0,
    waterfallNextImgCount: 8,
    waterfallPrevImgCount: 8,
    areaTouch: [],
    displayArea: false,
    debugMsg: "",
    domMatrix3d: `matrix3d(
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
        )`
})
