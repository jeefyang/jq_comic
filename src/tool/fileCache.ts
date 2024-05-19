import { JFolderDisplayType, JFileFormatType, JFileDisplayType } from "../type";
import { JserverLink } from "../tool/serverLink"
import { store } from "../store"
import path from "path-browserify"
import { MediaContentChildType, MediaViewChildType, MediaZipMsgType, MiddleFileType } from "../media"


class JFileCache {
    /** 文件夹缓存 */
    dirCache: { [propName: string]: JFolderDisplayType } = {}
    /** 媒体缓存,会限制个数 */
    mediaCache: MediaContentChildType[] = []
    /** 压缩包信息,为了减少服务器读取 */
    zipMsgCache: MediaZipMsgType[] = []
    /** 服务 */
    server: JserverLink

    imgEXList: JFileFormatType[] = ["gif", "bmp", "jpg", "jpeg", "png", "apng", "webp"]
    videoEXList: JFileFormatType[] = ["avi", "mp4", "mkv", "webm"]

    constructor() {

    }

    getMediaCache(child: MediaViewChildType) {
        return this.mediaCache[child.searchIndex]
    }



    async init(server: JserverLink) {
        this.server = server
        return
    }


    sortABByName(a: MediaZipMsgType["list"][number], b: MediaZipMsgType["list"][number], a1?: JFileDisplayType, b1?: JFileDisplayType, a2?: MiddleFileType, b2?: MiddleFileType): -1 | 0 | 1 {
        let alist: string[] = []
        let blist: string[] = []
        if (a && b) {
            alist = a.data.name.split(path.sep)
            blist = b.data.name.split(path.sep)
        }
        else if (a1 && b1) {
            alist = a1.name.split(path.sep)
            blist = b1.name.split(path.sep)
        }
        else if (a2 && b2) {
            alist = a2.name.split(path.sep)
            blist = b2.name.split(path.sep)
        }
        let len = alist.length > blist.length ? alist.length : blist.length
        for (let i = 0; i < len; i++) {
            if (!alist[i] && blist[i]) {
                return 1
            }
            else if (alist[i] && !blist[i]) {
                return -1
            }
            else if (alist[i] > blist[i]) {
                return 1
            }
            else if (alist[i] < blist[i]) {
                return -1
            }
        }
        return 1
    }

    sortABBySize(a: MediaZipMsgType["list"][number], b: MediaZipMsgType["list"][number], a1?: JFileDisplayType, b1?: JFileDisplayType, a2?: MiddleFileType, b2?: MiddleFileType): -1 | 0 | 1 {
        // if (!a.data.size || !b.data.size) {
        //         let alist = a.data.name.split(path.sep)
        //         let blist = b.data.name.split(path.sep)
        //         let len = alist.length > blist.length ? alist.length : blist.length
        //         for (let i = 0; i < len; i++) {
        //             if (!alist[i] && blist[i]) {
        //                 return 1
        //             }
        //             else if (alist[i] && !blist[i]) {
        //                 return -1
        //             }
        //             else if (alist[i] > blist[i]) {
        //                 return 1
        //             }
        //             else if (alist[i] < blist[i]) {
        //                 return -1
        //             }
        //         }
        //         return 1
        //     }
        //     return a.data.size > b.data.size ? 1 : -1
        if (a && b) {
            if (a.data.size == b.data.size) {
                return this.sortABByName(a, b)
            }
            return a.data.size > b.data.size ? 1 : -1
        }
        if (a1 && b1) {
            if (a1.size == b1.size) {
                return this.sortABByName(undefined, undefined, a1, b1)
            }
            return a1.size > b1.size ? 1 : -1
        }
        if (a2 && b2) {
            if (a2.size == b2.size) {
                return this.sortABByName(undefined, undefined, undefined, undefined, a2, b2)
            }
            return a2.size > b2.size ? 1 : -1
        }
    }

    sortABByDate(a: MediaZipMsgType["list"][number], b: MediaZipMsgType["list"][number], a1?: JFileDisplayType, b1?: JFileDisplayType, a2?: MiddleFileType, b2?: MiddleFileType): -1 | 0 | 1 {
        if (a && b) {
            if (a.data.time == b.data.time) {
                return this.sortABByName(a, b)
            }
            return a.data.time > b.data.time ? 1 : -1
        }
        if (a1 && b1) {
            if (a1.mtime == b1.mtime) {
                return this.sortABByName(undefined, undefined, a1, b1)
            }
            return a1.mtime > b1.mtime ? 1 : -1
        }
        if (a2 && b2) {
            if (a2.time == b2.time) {
                return this.sortABByName(undefined, undefined, undefined, undefined, a2, b2)
            }
            return a2.time > b2.time ? 1 : -1
        }
    }

    sortABByNum(a: MediaZipMsgType["list"][number], b: MediaZipMsgType["list"][number], a1?: JFileDisplayType, b1?: JFileDisplayType, a2?: MiddleFileType, b2?: MiddleFileType): -1 | 0 | 1 {
        let alist: string[] = []
        let blist: string[] = []
        if (a && b) {
            alist = a.data.name.split(path.sep)
            blist = b.data.name.split(path.sep)
        }
        else if (a1 && b1) {
            alist = a1.name.split(path.sep)
            blist = b1.name.split(path.sep)
        }
        else if (a2 && b2) {
            alist = a2.name.split(path.sep)
            blist = b2.name.split(path.sep)
        }
        let len = alist.length > blist.length ? alist.length : blist.length
        for (let i = 0; i < len; i++) {
            if (!alist[i] && blist[i]) {
                return 1
            }
            else if (alist[i] && !blist[i]) {
                return -1
            }
            let an: string[] = alist[i].match(/\d+/g) || []
            let bn: string[] = blist[i].match(/\d+/g) || []
            let numlen = an.length > bn.length ? an.length : bn.length
            for (let j = 0; j < numlen; j++) {
                if (an[j] == undefined && bn[j] != undefined) {
                    return 1
                }
                else if (an[j] != undefined && bn[j] == undefined) {
                    return -1
                }
                if (Number(an[j]) > Number(bn[j])) {
                    return 1
                }
                else if (Number(an[j]) < Number(bn[j])) {
                    return -1
                }
            }

        }
        return 1
    }


    private _setZipInFileSort(data: MediaZipMsgType) {
        if (data.sortType == store.mediaSortType) {
            return
        }
        let cloneList = [...data.list]
        switch (store.mediaSortType) {
            case "名称":
                data.sortList = cloneList.sort((a, b) => this.sortABByName(a, b))
                break
            case "大小":
                data.sortList = cloneList.sort((a, b) => this.sortABBySize(a, b))
                break
            case "日期":
                data.sortList = cloneList.sort((a, b) => this.sortABByDate(a, b))
                break
            case "数字":
                data.sortList = cloneList.sort((a, b) => this.sortABByNum(a, b))
                break
        }
        data.sortType = store.mediaSortType
        // console.log(JSON.parse(JSON.stringify(data.sortList)))
    }

    private _setFloderSort(data: JFolderDisplayType) {
        if (data.sortType == store.mediaSortType) {
            return
        }

        let cloneList = [...data.noZipFiles]
        switch (store.mediaSortType) {
            case "名称":
                data.sortNoZipFile = cloneList.sort((a, b) => this.sortABByName(undefined, undefined, a, b))
                break
            case "大小":
                data.sortNoZipFile = cloneList.sort((a, b) => this.sortABBySize(undefined, undefined, a, b))
                break
            case "日期":
                data.sortNoZipFile = cloneList.sort((a, b) => this.sortABByDate(undefined, undefined, a, b))
                break
            case "数字":
                data.sortNoZipFile = cloneList.sort((a, b) => this.sortABByNum(undefined, undefined, a, b))
                break
        }
        data.sortType = store.mediaSortType
    }

    /** 获取文件夹信息 */
    async getFolder(url: string, forceUpdate?: boolean) {
        // store.curDirUrl = url
        if (!forceUpdate && this.dirCache[url]) {
            this._setFloderSort(this.dirCache[url])
            return this.dirCache[url]
        }
        let obj = await this.server.postFolder(url)
        obj.noZipFiles = []
        for (let i = 0; i < obj.files.length; i++) {
            if (obj.files[i].exName == "zip") {
                continue
            }
            obj.noZipFiles.push(obj.files[i])
        }
        this.dirCache[url] = obj
        this._setFloderSort(obj)
        return obj
    }

    /** 获取压缩包信息 */
    async getZipMsg(dirUrl?: string, fileName?: string) {

        dirUrl = dirUrl || store.dirUrl
        fileName = fileName || store.fileName
        let index = this.zipMsgCache.findIndex(c => c.dirUrl == dirUrl && c.fileName == fileName && c.key == store.urlkey)
        if (index != -1) {
            this._setZipInFileSort(this.zipMsgCache[index])
            return this.zipMsgCache[index]
        }
        let url = `${dirUrl}/${fileName}`
        let zipData = await this.server.postZipMsg(url)
        index = this.zipMsgCache.push({
            dirUrl, fileName, count: zipData.list.length, list: zipData.list,
            key: store.urlkey
        })
        this._setZipInFileSort(this.zipMsgCache[index - 1])
        return this.zipMsgCache[index - 1]
    }

    /** 获取图片缓存 */
    private _getImgCache(dirUrl?: string, fileName?: string, zipInFileName?: string) {
        dirUrl = dirUrl || store.dirUrl
        fileName = fileName || store.fileName
        let arr = store.fileName.split('.')
        let ex = arr[arr.length - 1].toLowerCase()
        let index = -1
        if (ex == "zip") {
            index = this.mediaCache.findIndex(c => c.isZip && c.dirUrl == dirUrl && c.fileName == fileName && c.zipInFileName == zipInFileName && store.urlkey == c.key)
        }
        else {
            index = this.mediaCache.findIndex(c => !c.isZip && c.dirUrl == dirUrl && c.fileName == fileName && store.urlkey == c.key)
        }
        return this.mediaCache[index]
    }

    /** 设置图片缓存 */
    private _setImgCache(data: { dataUrl: string, zipInFileName?: string, exName: string, type: "img" | "video" }, dirUrl?: string, fileName?: string) {

        dirUrl = dirUrl || store.dirUrl
        fileName = fileName || store.fileName
        if (this._getImgCache(dirUrl, fileName, data.zipInFileName)) {
            return
        }
        let arr = fileName.split('.')
        let ex = arr[arr.length - 1].toLowerCase()
        let obj: MediaContentChildType = { isZip: ex == "zip", dirUrl, fileName, dataUrl: data.dataUrl, time: new Date().getTime(), zipInFileName: data.zipInFileName, exName: data.exName, type: data.type, childIndex: this.mediaCache.length, key: store.urlkey }
        this.mediaCache.push(obj)
        return obj
    }

    /** 获取文件数据(尝试版) */
    async getFileDataTry(dirUrl: string, fileName: string, index: number = 0, reboot: number = 3): Promise<MediaContentChildType> {
        try {
            let data = await this.getFileData(dirUrl, fileName, index)
            if (!data) {
                throw new Error(`无法获取数据,需重新获取`)
            }
            return data
        }
        catch {
            if (reboot == 0) {
                console.warn({ dirUrl, fileName, index }, "多次获取无果,跳出bug")
                return
            }
            console.warn(`获取失败,再次获取,还有${reboot - 1}次重试`)
            return await this.getFileDataTry(dirUrl, fileName, index, reboot - 1)
        }
    }

    /** 获取文件列表数据 */
    async getFileListData(dirUrl: string, fileName: string) {
        let arr = fileName.split('.')
        let ex = arr[arr.length - 1].toLowerCase()
        let url = `${dirUrl}/${fileName}`
        let list: MediaContentChildType[] = []
        let isZip = false
        if (ex == "zip") {
            isZip = true
            let msg = await this.getZipMsg(dirUrl, fileName)
            if (msg.sortList.length == 0) {
                return { list, isZip }
            }
            for (let i = 0; i < msg.sortList.length; i++) {
                let child = msg.sortList[i]
                let cache = this._getImgCache(dirUrl, fileName, child.data.name)
                if (cache) {
                    list.push(cache)
                    continue
                }
                let arr = child.data.name.split('.')
                let fileEx = arr[arr.length - 1].toLowerCase()
                let dataUrl = this.server.getZipInFileUrlByName(url, child.data.name)
                let type: "img" | "video"
                if (this.imgEXList.includes(<any>fileEx)) {
                    type = "img"
                }
                else if (this.videoEXList.includes(<any>fileEx)) {
                    type = "video"
                }
                list.push(this._setImgCache({ dataUrl: dataUrl, zipInFileName: child.data.name, exName: fileEx, type: type }, dirUrl, fileName))
            }
            return { list, isZip }
        }
        let msg = await this.getFolder(dirUrl)
        if (msg.sortNoZipFile.length == 0) {
            return { list, isZip }
        }
        for (let i = 0; i < msg.sortNoZipFile.length; i++) {
            let child = msg.sortNoZipFile[i]
            let cache = this._getImgCache(dirUrl, child.name)
            if (cache) {
                list.push(cache)
                continue
            }
            let fileEx = child.exName.toLowerCase()
            let dataUrl = this.server.getFileUrl(`${dirUrl}/${child.name}`)
            let type: "img" | "video"
            if (this.imgEXList.includes(<any>fileEx)) {
                type = "img"
            }
            else if (this.videoEXList.includes(<any>fileEx)) {
                type = "video"
            }
            list.push(this._setImgCache({ dataUrl: dataUrl, exName: fileEx, type: type }, dirUrl, child.name))
        }
        return { list, isZip }
    }

    /** 获取文件数据 */
    async getFileData(dirUrl: string, fileName: string, index: number = 0) {
        let arr = fileName.split('.')
        let ex = arr[arr.length - 1].toLowerCase()
        let url = `${dirUrl}/${fileName}`
        let dataUrl: string
        let zipInFileName: string
        let fileEx: string = ex
        if (ex == "zip") {
            let msg = await this.getZipMsg(dirUrl, fileName)
            if (msg.sortList.length == 0) {
                return
            }

            zipInFileName = msg.sortList[index].data.name
            let cache = this._getImgCache(dirUrl, fileName, zipInFileName)
            if (cache) {
                return cache
            }
            let arr = zipInFileName.split('.')
            fileEx = arr[arr.length - 1].toLowerCase()
            dataUrl = this.server.getZipInFileUrlByName(url, zipInFileName)
        }
        else {
            let cache = this._getImgCache(dirUrl, fileName, zipInFileName)
            if (cache) {
                return cache
            }
            dataUrl = this.server.getFileUrl(url)
        }
        let type: "img" | "video"
        if (this.imgEXList.includes(<any>fileEx)) {
            type = "img"
        }
        else if (this.videoEXList.includes(<any>fileEx)) {
            type = "video"
        }
        else {
            return
        }

        return this._setImgCache({ dataUrl: dataUrl, zipInFileName, exName: fileEx, type: type }, dirUrl, fileName)
    }


}

export let jFileCache = new JFileCache()