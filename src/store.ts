import { reactive } from "vue"
import { NameSortType } from "./type"
import { staticData } from "./const"

export const store = reactive({
    /** 当前文件路径,不能带文件夹 */
    fileName: <string>"",
    /** 当前文件夹路径 */
    dirUrl: <string>"",
    /** 基础文件夹路径,一般不显示 */
    baseDirUrl: <string>"",
    /** 当前显示第几张图片 */
    displayIndex: <number>0,
    /** 图片观看排列顺序 */
    mediaSortType: <NameSortType>"数字",
    /** 阅读模式 */
    readMode: <"width" | "none" | "height" | "fit" | "udWaterfall">"fit",
    /** 显示文件的样式(图标,详细) */
    displayFileStyleType: <"icon" | "detail">"detail",
    /** 是否二分媒体 */
    splitMedia: <"auto" | "none" | "split">"none",
    /** 方向X,-1为从左到右,1为从右到左 */
    directX: <-1 | 1>1,
    /** 是否调试操作 */
    isControlDebug: <boolean>false,
    /** 是否显示媒体数目 */
    isDisplayMediaNum: <boolean>true,
    /** 文本信息颜色 */
    textMsgColor: <string>"#ffffff",
    /** 是否显示文件名 */
    isDisplayFileName: <boolean>false,
    /** 是否显示测试用的数据 */
    isDisplayDebugMsg: <boolean>false,
    /** 是否反转操作 */
    isCtrlReverse: <boolean>false,
    /** 是否允许滑动 */
    isSwipe: <boolean>false,
    /** 自动保存 */
    isAutoSaveStore: <boolean>false,
    /** 自动保存浏览历史 */
    isAutoSaveGlance: <boolean>false,
    /** 背景色 */
    background: <string>staticData.defaultBackground,
    /** 路径的key */
    urlkey: <string>"",
    /** 文件管理器是否反序显示 */
    fileListReverse: <boolean>false,
    /** 文件管理器的排序 */
    fileListSortType: <NameSortType>"名称"
})