import { JFolderDisplayType, JFileFormatType } from "../type";
import { JserverLink } from "../tool/serverLink"
import { store } from "../store"
import { staticData } from "../const"
import { JConfigType, LocalSaveDataType } from "../type"
import StreamZip from "node-stream-zip";


class JFileCache {
    /** 文件夹缓存 */
    dirCache: { [propName: string]: JFolderDisplayType } = {}
    /** 图片缓存,会限制个数 */
    imgCache: { dirUrl: string, fileName: string, isZip?: boolean, zipIndex?: number, time: number, base64: string, w?: number, h?: number, zipInFileName?: string, type: "img" | "video", exName?: string }[] = []
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
    config: JConfigType
    localStorageKey: string = "localSaveDataType"
    private _isControlDebug = false

    constructor() {

    }

    private _initSwitchKey() {
        let url = new URL(document.location.href)
        let switchKey = url.searchParams.get("switch")
        let index = this.config.switchUrlList.findIndex(o => o.key == switchKey)
        if (index == -1) {
            switchKey = this.config.switchUrlList[0].key
        }
        this._isControlDebug = !!url.searchParams.get("isControlDebug")
        index = this.config.switchUrlList.findIndex(o => o.key == switchKey)
        store.switchKey = this.config.switchUrlList[index].key
        this.server.baseUrl = store.baseDirUrl = this.config.switchUrlList[index].url

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

        // 不想覆盖的部分
        store.transitionMS = 300
    }

    async init(server: JserverLink, config: JConfigType) {
        this.server = server
        this.config = config
        this._initSwitchKey()
        this._initStore()
        let url = `${store.dirUrl}/${store.fileName}`
        let v = await this.server.isFile(url)
        if (v) {
            await this.openFile(store.dirUrl, store.fileName, store.curNo)
            return true
        }
        return false

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
        let index = json?.storeList ? json.storeList.findIndex(c => c.key == store.switchKey) : -1
        if (index == -1) {
            json.storeList.push({ key: store.switchKey, data: store })
        }
        else {
            json.storeList[index] = { key: store.switchKey, data: store }
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
        console.log(index)
        json.storeList.splice(index, 1)
        let newTxt = JSON.stringify(json)
        localStorage.setItem(this.localStorageKey, newTxt)
        return
    }


    async test() {
        store.baseDirUrl = "//192.168.123.3/藏经阁/docker/komga/data"
        this.server.baseUrl = store.baseDirUrl
        store.dirUrl = "comic/【战栗杀机】(Banana Fish)[19集全][漫画]日本小学馆授权中文版"
        store.fileName = '(www.chinav.tv)[comic]《战栗杀机》(Banana.Fish)[吉田秋生].vol.11-14.zip'
        store.curDirUrl = store.dirUrl
        store.curNo = 0
        await this.openFile(store.dirUrl, store.fileName)
    }

    private _setZipInFileSort(data: (typeof this.zipMsgCache)[number]) {
        if (data.sortType == store.imgSortType) {
            return
        }
        let cloneList = [...data.list]
        switch (store.imgSortType) {
            case "名称":
                data.sortList = cloneList.sort((a, b) => a.data.name > b.data.name ? 1 : -1)
                break
            case "大小":
                data.sortList = cloneList.sort((a, b) => {
                    if (!a.data.size || !b.data.size) {
                        return a.data.name > b.data.name ? 1 : -1
                    }
                    return a.data.size > b.data.size ? 1 : -1
                })
                break
            case "日期":
                data.sortList = cloneList.sort((a, b) => a.data.time > b.data.time ? 1 : -1)
                break
            case "数字":
                data.sortList = cloneList.sort((a, b) => {
                    let an = a.data.name.match(/\d+/)?.[0]
                    let bn = b.data.name.match(/\d+/)?.[0]
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
        data.sortType = store.imgSortType
    }

    private _setFloderSort(data: JFolderDisplayType) {
        if (data.sortType == store.imgSortType) {
            return
        }

        let cloneList = [...data.noZipFiles]
        switch (store.imgSortType) {
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
        data.sortType = store.imgSortType
    }

    /** 获取文件夹信息 */
    async getFolder(url: string) {
        // store.curDirUrl = url
        if (this.dirCache[url]) {
            this._setFloderSort(this.dirCache[url])
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
        let zipData = await this.server.getZipMsg(url)
        index = this.zipMsgCache.push({
            dirUrl, fileName, count: zipData.list.length, list: zipData.list
        })
        this._setZipInFileSort(this.zipMsgCache[index - 1])
        return this.zipMsgCache[index - 1]
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
    private _setImgCache(data: { base64: string, w: number, h: number, zipInFileName?: string, exName: string, type: "img" | "video" }, dirUrl?: string, fileName?: string, zipIndex: number = 0) {

        dirUrl = dirUrl || store.dirUrl
        fileName = fileName || store.fileName
        if (this._getImgCache(dirUrl, fileName, zipIndex)) {
            return
        }
        let arr = fileName.split('.')
        let ex = arr[arr.length - 1].toLowerCase()
        let obj: (typeof JFileCache.prototype.imgCache)[number] = { isZip: ex == "zip", dirUrl, fileName, zipIndex, base64: data.base64, w: data.w, h: data.h, time: new Date().getMilliseconds(), zipInFileName: data.zipInFileName, exName: data.exName, type: data.type }
        this.imgCache.push(obj)
        this.imgCache = this.imgCache.sort((a, b) => b.time - a.time)
        this.imgCache = this.imgCache.slice(0, staticData.saveImgCount)
        return obj
    }

    /** 获取文件数据 */
    async getFileData(dirUrl: string, fileName: string, index: number = 0) {
        let cache = this._getImgCache(dirUrl, fileName, index)
        if (cache) {
            return cache
        }
        let arr = fileName.split('.')
        let ex = arr[arr.length - 1].toLowerCase()
        let url = `${dirUrl}/${fileName}`
        let base64: string
        let zipInFileName: string
        let fileEx: string = ex
        let buffer: Buffer
        if (ex == "zip") {
            let msg = await this.getZipMsg(dirUrl, fileName)
            if (msg.sortList.length == 0) {
                return
            }
            zipInFileName = msg.sortList[index].data.name
            console.log(url, zipInFileName)
            let arr = zipInFileName.split('.')
            fileEx = arr[arr.length - 1].toLowerCase()
            buffer = await this.server.getZipInFileByName(url, zipInFileName)
        }
        else {
            buffer = await this.server.getFile(url)
        }
        let w = 0
        let h = 0
        let type: "img" | "video"

        if (this.imgEXList.includes(<any>fileEx)) {
            type = "img"
            base64 = 'data:image/' + fileEx + ';base64,' + btoa(new Uint8Array((<any>buffer).data).reduce((res, byte) => res + String.fromCharCode(byte), ''))
            let img = new Image()
            await new Promise((res, _rej) => {
                img.src = base64
                img.onload = () => {
                    w = img.width
                    h = img.height
                    img.remove()
                    res(undefined)
                }
            })
        }
        else if (this.videoEXList.includes(<any>fileEx)) {
            type = "video"
            base64 = 'data:video/' + fileEx + ';base64,' + btoa(new Uint8Array((<any>buffer).data).reduce((res, byte) => res + String.fromCharCode(byte), ''))
            let video = document.createElement("video")
            document.body.append(video)
            await new Promise((res, _rej) => {
                video.src = base64

                video.oncanplay = () => {
                    console.log("webp")
                    w = video.clientWidth
                    h = video.clientHeight
                    video.remove()
                    res(undefined)
                }
            })
        }
        else {
            return
        }

        return this._setImgCache({ base64, w: w, h: h, zipInFileName, exName: fileEx, type: type }, dirUrl, fileName, index)
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
            if (zipMsg.count == 0) {
                return false
            }
            store.imgCount = zipMsg.count
            let obj = await this.getFileData(store.dirUrl, store.fileName, store.curNo)
            store.canvasB64 = obj.base64
            store.originImgW = obj.w
            store.originImgH = obj.h
            store.isZipFile = true
            store.isVideo = obj.type == "video"
            store.isPlayedVideo = false
            store.videoLoad = !store.videoLoad
            store.zipInFileName = obj.zipInFileName
        }
        else {
            store.isZipFile = false
            let dir = await this.getFolder(dirUrl)
            let findIndex = dir.sortNoZipFile.findIndex(c => c.name == fileName)
            if (findIndex == -1) {
                return false
            }

            store.curNo = findIndex
            store.imgCount = dir.sortNoZipFile.length
            let obj = await this.getFileData(store.dirUrl, store.fileName)
            store.canvasB64 = obj.base64
            store.originImgW = obj.w
            store.originImgH = obj.h
            store.isZipFile = false
            store.isVideo = obj.type == "video"
            store.isPlayedVideo = false
            store.videoLoad = !store.videoLoad
            store.zipInFileName = ""
        }
        return true
    }

    /** 通过序号设置图片 */
    async setImgByNum(index: number, reboot: number = 3) {
        if (index < 0) {
            return
        }
        if (store.imgCount <= index - 1) {
            return
        }
        let obj: Awaited<ReturnType<typeof JFileCache.prototype.getFileData>>

        if (store.isZipFile) {

            obj = await this.getFileData(store.dirUrl, store.fileName, index)
            store.zipInFileName = obj.zipInFileName
        }
        else {
            let dirMsg = await this.getFolder(store.dirUrl)
            store.fileName = dirMsg.sortNoZipFile[index].name
            obj = await this.getFileData(store.dirUrl, store.fileName)
        }
        try {
            store.canvasB64 = obj.base64
            store.originImgW = obj.w
            store.originImgH = obj.h
            store.curNo = index
            store.zipInFileName
        }
        catch {
            if (reboot == 0) {
                console.warn("多次获取无果,跳出bug")
                return
            }
            console.warn(`获取失败,再次获取,还有${reboot - 1}次重试`)
            await this.setImgByNum(index, reboot - 1)
        }

    }

    /** 停止预加载 */
    async stopPreloadImg() {
        this.preloadCount = 0
        this.preloadIndex = -1
    }

    /** 预加载图片 */
    async preloadImg(index: number, add: number, count: number = staticData.advanceImgCount) {
        if (count == 0) {
            return
        }
        if (index < 0) {
            return
        }
        if (store.imgCount - 1 <= index) {
            return
        }
        this.preloadIndex = index + add
        this.preloadCount = count - 1
        if (store.isZipFile) {
            await this.getFileData(store.dirUrl, store.fileName, index)
            await this.preloadImg(this.preloadIndex, add, this.preloadCount)
        }
        else {
            let dirMsg = await this.getFolder(store.dirUrl)
            let fileName = dirMsg.sortNoZipFile[index].name
            await this.getFileData(store.dirUrl, fileName)
            await this.preloadImg(this.preloadIndex, add, this.preloadCount)
        }
        return
    }
}

export let jFileCache = new JFileCache()