import { reactive } from "vue"

export const store = reactive({
    /** 文件路径 */
    fileUrl: <string>"",
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
    /** 尺寸适应 */
    adaptSize: <"width" | "none" | "height" | "fit">"fit",
    /** 是否打开文件管理 */
    displayFileManager: <boolean>false,
    /** 服务器是否连接成功 */
    isServerCompleted: <boolean>false,
    /** 当前正在搜索的1文件夹路径 */
    curDirUrl: <string>""
})