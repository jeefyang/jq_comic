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
    /** 当前画布位置X */
    curCanvasX: <number>0,
    /** 当前画布位置Y */
    curCanvasY: <number>-100,

})