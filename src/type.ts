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

export type LocalSaveDataType = {
    storeList: { key: string, data: typeof store }[]
}

export type ConfigType = {
    switchUrlList: { key: string, url: string }[]
}

export type NameSortType = "名称" | "日期" | "大小" | "数字"