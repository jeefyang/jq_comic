export type JFileDisplayType = {
    name: string,
    exName: string
    base64?: string
}

export type JFolderDisplayType = {
    files?: JFileDisplayType[]
    folders?: JFolderDisplayType[]
    url: string
    name: string
}