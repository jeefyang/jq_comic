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

export type JConfigType = {
    /** 目录切换 */
    switchUrlList: { key: string, url: string }[],
    /** vue调试用的端口 */
    vue_dev_port: number,
    /** vue调试用的域名或者ip,不带http,是用于可能会手机调试,可以输入ip地址,否则localhost */
    vue_dev_domain: string,
    /** vue生产用的端口 */
    vue_build_port: number,
    /** node调试用的端口 */
    node_dev_port: number,
    /** node服务调试用的域名(域名为是用于可能会手机调试,可以输入ip地址,否则localhost) */
    node_dev_domain: string,
    /** node服务生产用的链接(用于vue连接) */
    node_build_host: string,
    /** node服务生产用的端口(用于服务器启动) */
    node_build_post: number

}

export type NameSortType = "名称" | "日期" | "大小" | "数字"