
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
    url: string
} & JFileFolderType

export type JFileFormatType = "zip" | "gif" | "bmp" | "jpg" | "jpeg" | "png" | "avi" | "webp" | "apng" | "mp4" | "mkv" | "webm"