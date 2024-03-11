import { JFolderDisplayType, JFileFormatType } from "../type";
import { JserverLink } from "../tool/serverLink"
import { store } from "../store"
import { LocalSaveDataType } from "../type"
import StreamZip from "node-stream-zip";
import path from "path-browserify"
import { imgStoreChildType } from "../imgStore"


class JFileCache {
    /** 文件夹缓存 */
    dirCache: { [propName: string]: JFolderDisplayType } = {}
    /** 图片缓存,会限制个数 */
    imgCache: imgStoreChildType[] = []
    /** 压缩包信息,为了减少服务器读取 */
    zipMsgCache: {
        dirUrl: string,
        fileName: string,
        /** 数量 */
        count: number,
        /** 原始文件排列 */
        list: {
            key: string;
            data: StreamZip.ZipEntry;
        }[],
        /** 后期排列 */
        sortList?: {
            key: string;
            data: StreamZip.ZipEntry;
        }[]
        sortType?: string
    }[] = []
    server: JserverLink
    preloadCount: number = 0
    preloadIndex: number = -1
    imgEXList: JFileFormatType[] = ["gif", "bmp", "jpg", "jpeg", "png", "apng", "webp"]
    videoEXList: JFileFormatType[] = ["avi", "mp4", "mkv", "webm", "wmv"]
    localStorageKey: string = "localSaveDataType"
    private _isControlDebug = false

    constructor() {

    }

    private _initSwitchKey() {
        let url = new URL(document.location.href)
        this._isControlDebug = !!url.searchParams.get("isControlDebug")
    }

    private _initStore() {
        let newStore = this.getLocalStorage()
        if (!newStore) {
            return
        }
        else {
            for (let key in newStore) {
                if (store[key] != null) {
                    store[key] = newStore[key]
                }
            }
        }
        store.isControlDebug = store.isControlDebug || this._isControlDebug
        this._isControlDebug = store.isControlDebug
    }

    async init(server: JserverLink) {
        this.server = server

        this._initSwitchKey()
        this._initStore()
        let url = `${store.dirUrl}/${store.fileName}`
        let v = await this.server.postIsFile(url)
        return v
    }

    getLocalStorage() {
        let txt = localStorage.getItem(this.localStorageKey)
        if (!txt) {
            return
        }
        let json: LocalSaveDataType = JSON.parse(txt)
        let index = json?.storeList ? json.storeList.findIndex(c => c.key == store.switchKey) : -1
        if (index == -1) {
            return
        }
        return json.storeList[index].data
    }

    setLocalStorage() {
        let json: LocalSaveDataType
        let txt = localStorage.getItem(this.localStorageKey)
        if (!txt) {
            json = { storeList: [] }
        }
        else {
            json = JSON.parse(txt)
        }
        let cloneStore: typeof store = <any>{}
        for (let key in store) {
            if (['canvasB64'].includes(key)) {
                continue
            }
            cloneStore[key] = store[key]
        }
        let index = json?.storeList ? json.storeList.findIndex(c => c.key == store.switchKey) : -1
        if (index == -1) {

            json.storeList.push({ key: store.switchKey, data: cloneStore })
        }
        else {
            json.storeList[index] = { key: store.switchKey, data: cloneStore }
        }
        let newTxt = JSON.stringify(json)
        localStorage.setItem(this.localStorageKey, newTxt)
    }

    /** 自动保存 */
    autoSave() {
        if (!store.isAutoSave) {
            return
        }
        this.setLocalStorage()
    }

    /** 清空保存 */
    clearSave() {
        let txt = localStorage.getItem(this.localStorageKey)
        if (!txt) {
            return
        }
        let json: LocalSaveDataType = JSON.parse(txt)
        let index = json?.storeList ? json.storeList.findIndex(c => c.key == store.switchKey) : -1
        if (index == -1) {
            return
        }
        // console.log(index)
        json.storeList.splice(index, 1)
        let newTxt = JSON.stringify(json)
        localStorage.setItem(this.localStorageKey, newTxt)
        return
    }

    private _setZipInFileSort(data: (typeof this.zipMsgCache)[number]) {
        if (data.sortType == store.mediaSortType) {
            return
        }
        let cloneList = [...data.list]
        switch (store.mediaSortType) {
            case "名称":
                data.sortList = cloneList.sort((a, b) => {
                    let alist = a.data.name.split(path.sep)
                    let blist = b.data.name.split(path.sep)
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
                })
                break
            case "大小":
                data.sortList = cloneList.sort((a, b) => {
                    if (!a.data.size || !b.data.size) {
                        let alist = a.data.name.split(path.sep)
                        let blist = b.data.name.split(path.sep)
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
                    return a.data.size > b.data.size ? 1 : -1
                })
                break
            case "日期":
                data.sortList = cloneList.sort((a, b) => a.data.time > b.data.time ? 1 : -1)
                break
            case "数字":
                data.sortList = cloneList.sort((a, b) => {
                    let alist = a.data.name.split(path.sep)
                    let blist = b.data.name.split(path.sep)
                    let len = alist.length > blist.length ? alist.length : blist.length
                    for (let i = 0; i < len; i++) {
                        if (!alist[i] && blist[i]) {
                            return 1
                        }
                        else if (alist[i] && !blist[i]) {
                            return -1
                        }
                        let an = alist[i].match(/\d+/)?.[0]
                        let bn = blist[i].match(/\d+/)?.[0]
                        if (Number(an) > Number(bn)) {
                            return 1
                        }
                        else if (Number(an) < Number(bn)) {
                            return -1
                        }
                    }
                    return 1
                })
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
                data.sortNoZipFile = cloneList.sort((a, b) => a.name > b.name ? 1 : -1)
                break
            case "大小":
                data.sortNoZipFile = cloneList.sort((a, b) => {
                    if (!a.size || !b.size) {
                        return a.name > b.name ? 1 : -1
                    }
                    return a.size > b.size ? 1 : -1
                })
                break
            case "日期":
                data.sortNoZipFile = cloneList.sort((a, b) => a.mtime > b.mtime ? 1 : -1)
                break
            case "数字":
                data.sortNoZipFile = cloneList.sort((a, b) => {
                    let an = a.name.match(/\d+/)?.[0]
                    let bn = b.name.match(/\d+/)?.[0]
                    if (an == null) {
                        an = "0"
                    }
                    if (bn == null) {
                        bn = "0"
                    }
                    return Number(an) - Number(bn)
                })
                break
        }
        data.sortType = store.mediaSortType
    }

    /** 获取文件夹信息 */
    async getFolder(url: string) {
        // store.curDirUrl = url
        if (this.dirCache[url]) {
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
        let index = this.zipMsgCache.findIndex(c => c.dirUrl == dirUrl && c.fileName == fileName)
        if (index != -1) {
            this._setZipInFileSort(this.zipMsgCache[index])
            return this.zipMsgCache[index]
        }
        let url = `${dirUrl}/${fileName}`
        let zipData = await this.server.postZipMsg(url)
        index = this.zipMsgCache.push({
            dirUrl, fileName, count: zipData.list.length, list: zipData.list
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
            index = this.imgCache.findIndex(c => c.isZip && c.dirUrl == dirUrl && c.fileName == fileName && c.zipInFileName == zipInFileName)
        }
        else {
            index = this.imgCache.findIndex(c => !c.isZip && c.dirUrl == dirUrl && c.fileName == fileName)
        }
        return this.imgCache[index]
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
        let obj: imgStoreChildType = { isZip: ex == "zip", dirUrl, fileName, dataUrl: data.dataUrl, time: new Date().getTime(), zipInFileName: data.zipInFileName, exName: data.exName, type: data.type, childIndex: this.imgCache.length }
        this.imgCache.push(obj)
        return obj
    }

    /** 获取文件数据(尝试版) */
    async getFileDataTry(dirUrl: string, fileName: string, index: number = 0, reboot: number = 3): Promise<imgStoreChildType> {
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
        let list: imgStoreChildType[] = []
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