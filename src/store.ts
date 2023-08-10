import { reactive } from "vue"

export const store = reactive({
    /** 当前文件路径,不能带文件夹 */
    fileName: <string>"",
    /** 当前文件夹路径 */
    dirUrl: <string>"",
    /** 基础文件夹路径,一般不显示 */
    baseDirUrl: <string>"",
    /** 图片数量 */
    imgCount: <number>0,
    /** 当前显示第几张图片 */
    curNo: <number>0,
    /** 屏幕宽 */
    screenW: <number>0,
    /** 屏幕高 */
    screenH: <number>0,
    /** 画布数据 */
    canvasB64: <string>"",
    /** 当前图片宽度 */
    curImgW: <number>0,
    /** 当前图片高度 */
    curImgH: <number>0,
    /** 图片原始宽 */
    originImgW: <number>0,
    /** 图片原始高 */
    originImgH: <number>0,
    /** 图片元素宽 */
    imgDomW: <number>0,
    /** 图片元素高 */
    imgDomH: <number>0,
    /** 图片元素坐标x */
    imgDomX: <number>0,
    /** 图片元素坐标y */
    imgDomY: <number>0,
    /** 图片显示的宽度 */
    displayImgW: <number>0,
    /** 图片显示的高度 */
    displayImgH: <number>0,
    /** 当前画布位置X */
    curCanvasX: <number>0,
    /** 当前画布位置Y */
    curCanvasY: <number>0,
    /** div浮动宽度比例 */
    divFloatWRatio: <number>0.01,
    /** div浮动高度比例 */
    divFloatHRatio: <number>0.01,
    /** div浮动位置上 */
    divFloatTop: <number>0,
    /** div浮动位置左 */
    divFloatLeft: <number>0,
    /** div浮动宽度 */
    divFloatW: <number>0,
    /** div浮动高度 */
    divFloatH: <number>0,
    /** 阅读模式 */
    readMode: <"width" | "none" | "height" | "fit">"fit",
    /** 是否打开文件管理 */
    displayFileManager: <boolean>false,
    /** 是否打开底部工具栏 */
    displayBottomBar: <boolean>false,
    /** 是否打开配置面板 */
    displayOPPanel: <boolean>false,
    /** 当前正在搜索的文件夹路径 */
    curDirUrl: <string>"",
    /** 显示文件列数 */
    displayFileCol: <number>1,
    /** 显示文件名的字数 */
    displayFileTextCount: <number>10,
    /** 显示文件图标尺寸 */
    displayFileIconSize: <number>20,
    /** 显示文件的样式(图标,详细) */
    displayFileStyleType: <"icon" | "detail">"detail",
    /** 是否二分图片 */
    splitImg: <"auto" | "none" | "split">"auto",
    /** 切割后的第几张 */
    splitNum: <0 | 1>0,
    /** 方向X,-1为从左到右,1为从右到左 */
    directX: <-1 | 1>1,
    /** 服务器是否连接成功 */
    isServerCompleted: <boolean>false,
    /** 是否调试操作 */
    isControlDebug: true,
    /** 是否显示加载 */
    isDisplayLoading: false,
    /** 是否显示图片数目 */
    isDisplayImgNum: true,
    /** 是否显示文件名 */
    isDisplayFileName: false,
    /** 图片是否正在加载 */
    isImgLoading: false,
    /** 图片是否准备加载 */
    isImgPrepareLoading: false,
    /** 是否反转操作 */
    isCtrlReverse: <boolean>false,
    /** 是否为压缩包文件 */
    isZipFile: <boolean>false,
    /** 是否为视频文件 */
    isVideo: <boolean>false,
    /** 动画时间 */
    transitionMS: <number>300
})