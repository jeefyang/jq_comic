
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
    url: string
} & JFileFolderType