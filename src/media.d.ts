import StreamZip from "node-stream-zip";

export type MediaContentChildType = {
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
    /** 关键key */
    key: string
}

export type MediaZipMsgType = {
    /** 关键key */
    key: string
    /** 文件夹路径 */
    dirUrl: string
    /** 文件名 */
    fileName: string
    /** 子文件数量 */
    count: number,
    /** 原始文件排列 */
    list: {
        key: string
        data: StreamZip.ZipEntry;
    }[]
    /** 后期排列 */
    sortList?: {
        key: string;
        data: StreamZip.ZipEntry;
    }[]
    /** 排列类型 */
    sortType?: string
}

export type MediaViewChildType = {
    /** 索引值 */
    searchIndex: number
    /** 偏移坐标x */
    transX?: number
    /** 偏移坐标y */
    transY?: number
    /** 缩放 */
    scale?: number
    /** 媒体显示的宽度 */
    displayW?: number
    /** 媒体显示的高度 */
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
    /** div是否需要加载,用于减少过度 */
    isViewDiv?: boolean
    /** 是否显示在视频 */
    isViewVideo?: boolean
    /** 是否显示在图片 */
    isViewImg?: boolean
    /** 是否显示,跟分割有关 */
    isViewDisplay?: boolean
}

export type MediaStoreType = {
    /** 子节点 */
    // children: MediaViewChildType[]
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
    isMediaLoading: boolean
    /** 图片是否准备加载 */
    isMediaPrepareLoading: boolean
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
    /** 媒体数量 */
    len: number
    /** 信息底部位置 */
    msgBottom: number
    /** 瀑布媒体上数量 */
    waterfallPrevMediaCount: number
    /** 瀑布媒体下数量 */
    waterfallNextMediaCount: number
    /** 标准媒体上数量 */
    StandardPrevMediaCount: number
    /** 标准媒体下数量 */
    StandardNextMediaCount: number
    /** 浏览到子节点第几个 */
    viewChildIndex: number
    /** 触碰区域 */
    areaTouch: JAreaType[]
    /** 显示触碰区域 */
    displayArea: boolean
    /** 测试数据 */
    debugMsg: string | number
    /** 当前显示单双页 */
    curSplit: 0 | 1
    /** 缩放比例 */
    scaling: number
    /** 标准移动比例(相对于屏幕) */
    standardMoveRatio: number
}