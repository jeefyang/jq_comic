import { reactive } from "vue"
import { NameSortType } from "./type"
import { staticData } from "./const"

export const store = reactive({
    /** 选中关键字 */
    switchKey: <string>"",
    /** 当前文件路径,不能带文件夹 */
    fileName: <string>"",
    /** 当前文件夹路径 */
    dirUrl: <string>"",
    /** 基础文件夹路径,一般不显示 */
    baseDirUrl: <string>"",
    /** 当前显示第几张图片 */
    displayIndex: <number>0,
    /** 图片观看排列顺序 */
    mediaSortType: <NameSortType>"名称",
    /** 阅读模式 */
    readMode: <"width" | "none" | "height" | "fit" | "udWaterfall">"udWaterfall",
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
    /** 是否二分媒体 */
    splitMedia: <"auto" | "none" | "split">"none",
    /** 方向X,-1为从左到右,1为从右到左 */
    directX: <-1 | 1>1,
    /** 服务器是否连接成功 */
    isServerCompleted: <boolean>false,
    /** 是否调试操作 */
    isControlDebug: <boolean>false,
    /** 是否显示加载 */
    isDisplayLoading: <boolean>false,
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
    /** 自动保存 */
    isAutoSave: <boolean>false,
    /** 背景色 */
    background: <string>staticData.defaultBackground,
    /** 媒体加载时背景色 */
    mediaLoadingDivColor: <string>staticData.defaultMediaLoadingColor

})