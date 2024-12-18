import { JFolderDisplayType, JFileFormatType } from "../type";
import { JserverLink } from "../tool/serverLink"
import { store } from "../store"

import { MediaContentChildType, MediaViewChildType, MediaZipMsgType, } from "../media"
import { sortABByDate, sortABByName, sortABByNum, sortABBySize } from "./util";
import Dexie, { type EntityTable } from 'dexie';

interface ThumDBCache {
    id: number;
    name: string;
    key: string;
    dir: string;
    b64: string
}
class JFileCache {
    /** 文件夹缓存 */
    dirCache: { [propName: string]: JFolderDisplayType } = {}
    /** 媒体缓存,会限制个数 */
    mediaCache: MediaContentChildType[] = []
    /** 压缩包信息,为了减少服务器读取 */
    zipMsgCache: MediaZipMsgType[] = []
    /** 服务 */
    server: JserverLink
    cacheDB = new Dexie("cacheDB") as Dexie & {
        thums: EntityTable<
            ThumDBCache,
            'id' // primary key "id" (for the typings only)
        >;
    };


    imgEXList: JFileFormatType[] = ["gif", "bmp", "jpg", "jpeg", "png", "apng", "webp"]
    videoEXList: JFileFormatType[] = ["avi", "mp4", "mkv", "webm"]

    constructor() {

    }

    getMediaCache(child: MediaViewChildType) {
        return this.mediaCache[child.searchIndex]
    }


    async init(server: JserverLink) {
        this.server = server
        let v = this.cacheDB.version(1).stores({
            thums: '++id,name,key,dir,b64'
        })
        console.log(v)
        return
    }

    private _setZipInFileSort(data: MediaZipMsgType) {
        if (data.sortType == store.mediaSortType) {
            return
        }
        let cloneList = [...data.list]
        switch (store.mediaSortType) {
            case "名称":
                data.sortList = cloneList.sort((a, b) => sortABByName(a, b))
                break
            case "大小":
                data.sortList = cloneList.sort((a, b) => sortABBySize(a, b))
                break
            case "日期":
                data.sortList = cloneList.sort((a, b) => sortABByDate(a, b))
                break
            case "数字":
                data.sortList = cloneList.sort((a, b) => sortABByNum(a, b))
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
                data.sortNoZipFile = cloneList.sort((a, b) => sortABByName(undefined, undefined, a, b))
                break
            case "大小":
                data.sortNoZipFile = cloneList.sort((a, b) => sortABBySize(undefined, undefined, a, b))
                break
            case "日期":
                data.sortNoZipFile = cloneList.sort((a, b) => sortABByDate(undefined, undefined, a, b))
                break
            case "数字":
                data.sortNoZipFile = cloneList.sort((a, b) => sortABByNum(undefined, undefined, a, b))
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
        console.log("11",url)
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

    /** 获取文件列表数据
     * @param fileName 指压缩包文件名,如果是单纯想获取文件夹列表,直接用''表示
     */
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

    /** 获取缩略图 */
    async getFileThum(dirUrl: string, fileName: string, isFolder?: boolean) {
        let d = await this.cacheDB.thums.where('key').equals(store.urlkey).and(c => c.dir == dirUrl && c.name == fileName).toArray()
        if (d.length > 0) {
            return d[0].b64
        }
        let arr = fileName.split('.')
        let ex = arr[arr.length - 1].toLowerCase()
        if (isFolder) {
            let url = `${dirUrl}/${fileName}`
            let list = await this.getFileListData(url, "")
            for (let i = 0; i < list.list.length; i++) {
                let c = list.list[i]
                if (this.imgEXList.includes(<any>c.exName.toLowerCase())) {
                    console.log(url, c.fileName)
                    let b64 = await this.server.getThumB64(url, c.fileName)
                    if (!b64) {
                        return ""
                    }
                    else {
                        b64 = "data:image/jpeg;base64," + b64
                    }
                    // 防止数据锁
                    d = await this.cacheDB.thums.where('key').equals(store.urlkey).and(c => c.dir == dirUrl && c.name == fileName).toArray()
                    if (d.length == 0) {
                        await this.cacheDB.thums.add({
                            key: store.urlkey,
                            dir: dirUrl,
                            name: fileName,
                            b64: b64
                        })
                    }
                    return b64
                }
            }
            console.log(url, '没在文件夹找到图片')
            await this.cacheDB.thums.add({
                key: store.urlkey,
                dir: dirUrl,
                name: fileName,
                b64: ""
            })
            return ""
        }
        let b64 = await this.server.getThumB64(dirUrl, fileName, ex == "zip")
        if (!b64) {
            return ""
        }
        else {
            b64 = "data:image/jpeg;base64," + b64
        }
        // 防止数据锁
        d = await this.cacheDB.thums.where('key').equals(store.urlkey).and(c => c.dir == dirUrl && c.name == fileName).toArray()
        if (d.length == 0) {
            await this.cacheDB.thums.add({
                key: store.urlkey,
                dir: dirUrl,
                name: fileName,
                b64: b64
            })
        }
        return b64
    }

    async clearThumDB(dirUrl?: string) {
        await this.cacheDB.thums.where('key').equals(store.urlkey).and(c => dirUrl == undefined || dirUrl == c.dir).delete()
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