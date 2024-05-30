import { store } from "./store"

type JFileFolderType = {
    mtime?: number
    atime?: number
    ctime?: number
    btime?: number
    size?: number
    name: string
}

export type JFileDisplayType = {
    exName: string
    base64?: string
} & JFileFolderType

export type JFolderDisplayType = {
    files?: JFileDisplayType[]
    folders?: JFolderDisplayType[]
    noZipFiles?: JFileDisplayType[]
    sortType?: NameSortType
    sortNoZipFile?: JFileDisplayType[]
    url: string
} & JFileFolderType

export type JFileFormatType = "zip" | "gif" | "bmp" | "jpg" | "jpeg" | "png" | "apng" | "webp" | "avi" | "wmv" | "mp4" | "mkv" | "webm"

export type LocalSaveStoreType = {
    storeList: { key: string, data: typeof store }[]
}

export type LocalSaveGlanceType = {
    key: string, dirurl: string, filename: string, iszip: boolean, displayIndex?: number
}

export type JConfigType = {
    /** 目录切换 */
    switchUrlList: { key: string, url: string }[],
    /** 监听接口 */
    listen: number
    /** mgick程序接口 */
    magickCmd: string
}

export type NameSortType = "名称" | "日期" | "大小" | "数字"

export type JAreaKeyType = "option" | "fileManager" | "progressBar" | "next" | "prev"

export type JAreaType = {
    startX?: number
    startXPer?: number
    startY?: number
    startYPer?: number
    endX?: number
    endXPer?: number
    endY?: number
    endYPer?: number
    color?: string
    type: JAreaKeyType
}
