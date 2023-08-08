import { JFolderDisplayType } from "../type";
import { JserverLink } from "../tool/serverLink"
import { store } from "../store"
import { staticData } from "../const"

class JFileCache {
    /** 文件夹缓存 */
    dirCache: { [propName: string]: JFolderDisplayType } = {}
    /** 图片缓存,会限制个数 */
    imgCache: { dirUrl: string, fileName: string, isZip?: boolean, zipIndex?: number, time: number, base64: string }[] = []
    /** 压缩包信息,为了减少服务器读取 */
    zipMsgCache: { dirUrl: string, fileName: string, count: number }[] = []
    server: JserverLink

    constructor() {

    }

    init(server: JserverLink) {
        this.server = server
    }

    /** 获取文件夹信息 */
    async getFolder(url: string) {
        // store.curDirUrl = url
        if (this.dirCache[url]) {
            return this.dirCache[url]
        }
        let obj = await this.server.getFolder(url)
        obj.noZipFiles = []
        for (let i = 0; i < obj.files.length; i++) {
            if (obj.files[i].exName == "zip") {
                continue
            }
            obj.noZipFiles.push(obj.files[i])
        }
        this.dirCache[url] = obj

        return obj
    }

    /** 获取压缩包信息 */
    async getZipMsg(dirUrl?: string, fileName?: string) {

        dirUrl = dirUrl || store.dirUrl
        fileName = fileName || store.fileName
        let index = this.zipMsgCache.findIndex(c => c.dirUrl == dirUrl && c.fileName == fileName)
        if (index != -1) {
            return this.zipMsgCache[index]
        }
        let url = `${dirUrl}/${fileName}`
        let zipData = await this.server.getZipMsg(url)
        index = this.zipMsgCache.push({
            dirUrl, fileName, count: zipData.list.length
        })
        return this.zipMsgCache[index]
    }

    /** 获取图片缓存 */
    private _getImgCache(dirUrl?: string, fileName?: string, zipIndex: number = 0) {
        dirUrl = dirUrl || store.dirUrl
        fileName = fileName || store.fileName
        let arr = store.fileName.split('.')
        let ex = arr[arr.length - 1].toLowerCase()
        let index = -1
        if (ex == "zip") {
            index = this.imgCache.findIndex(c => c.isZip && c.dirUrl == dirUrl && c.fileName == fileName && c.zipIndex == zipIndex)
        }
        else {
            index = this.imgCache.findIndex(c => !c.isZip && c.dirUrl == dirUrl && c.fileName == fileName)
        }
        return this.imgCache[index]
    }

    /** 设置图片缓存 */
    private _setImgCache(base64: string, dirUrl?: string, fileName?: string, zipIndex: number = 0) {
        if (this._getImgCache()) {
            return
        }
        dirUrl = dirUrl || store.dirUrl
        fileName = fileName || store.fileName
        let arr = fileName.split('.')
        let ex = arr[arr.length - 1].toLowerCase()
        this.imgCache.push({ isZip: ex == "zip", dirUrl, fileName, zipIndex, base64, time: new Date().getMilliseconds() })
        this.imgCache = this.imgCache.sort((a, b) => b.time - a.time)
        this.imgCache = this.imgCache.slice(0, staticData.saveImgCount)
    }

    /** 获取文件数据 */
    async getFileB64(dirUrl: string, fileName: string, index: number = 0) {
        let cache = this._getImgCache(dirUrl, fileName, index)
        if (cache) {
            return cache.base64
        }
        let arr = fileName.split('.')
        let ex = arr[arr.length - 1].toLowerCase()
        let url = `${dirUrl}/${fileName}`
        let base64: string
        if (ex == "zip") {
            await this.getZipMsg(dirUrl, fileName)
            let buffer = await this.server.getZipInFileByNum(url, index)
            base64 = 'data:image/png;base64,' + btoa(new Uint8Array((<any>buffer).data).reduce((res, byte) => res + String.fromCharCode(byte), ''))
        }
        else {
            let buffer = await this.server.getFile(url)
            base64 = 'data:image/png;base64,' + btoa(new Uint8Array((<any>buffer).data).reduce((res, byte) => res + String.fromCharCode(byte), ''))
        }
        this._setImgCache(base64, dirUrl, fileName, index)
        return base64
    }

    /** 打开文件 */
    async openFile(dirUrl?: string, fileName?: string, index: number = 0) {
        store.dirUrl = dirUrl || store.dirUrl
        store.fileName = fileName || store.fileName
        store.curDirUrl = store.dirUrl
        let arr = store.fileName.split('.')
        let ex = arr[arr.length - 1].toLowerCase()
        if (ex == 'zip') {
            store.curNo = index
            store.isZipFile = true
            let zipMsg = await this.getZipMsg(dirUrl, fileName)
            store.imgCount = zipMsg.count
            store.canvasB64 = await this.getFileB64(store.dirUrl, store.fileName, store.curNo)
        }
        else {

            store.isZipFile = false
            let dir = await this.getFolder(dirUrl)
            let index = dir.noZipFiles.findIndex(c => c.name == fileName)
            if (index == -1) {
                return
            }
            store.curNo = index
            store.imgCount = dir.noZipFiles.length
            store.canvasB64 = await this.getFileB64(store.dirUrl, store.fileName)
        }
    }

    /** 通过序号设置图片 */
    async setImgByNum(index: number) {
        if (index < 0) {
            return
        }
        if (store.imgCount <= index - 1) {
            return
        }
        if (store.isZipFile) {
            store.canvasB64 = await this.getFileB64(store.dirUrl, store.fileName, index)
        }
        else {
            let dirMsg = await this.getFolder(store.dirUrl)
            store.fileName = dirMsg.noZipFiles[index].name
            store.canvasB64 = await this.getFileB64(store.dirUrl, store.fileName)
        }
        store.curNo = index
    }

    /** 预加载图片 */
    async preloadImg(index: number, add: number, count: number = staticData.advanceImgCount) {
        if (count == 0) {
            return
        }
        if (index < 0) {
            return
        }
        if (store.imgCount <= index - 1) {
            return
        }
        if (store.isZipFile) {
            await this.getFileB64(store.dirUrl, store.fileName, index)
            await this.preloadImg(index + add, add, count - 1)
            return
        }
        else {
            let dirMsg = await this.getFolder(store.dirUrl)
            let fileName = dirMsg.noZipFiles[index].name
            await this.getFileB64(store.dirUrl, fileName)
            await this.preloadImg(index + add, add, count - 1)
            return
        }
    }
}

export let jFileCache = new JFileCache()