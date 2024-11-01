
import { mediaMiddleData, mediaStore } from "../mediaStore"
import { MediaContentChildType, MediaViewChildType } from "../media"
import { store } from "../store"
import { jFileCache } from "./fileCache"
import { LocalSaveStoreType, LocalSaveGlanceType } from "../type"
import { cloneAssign } from "./util"


export class MainMediaCtrl {

    storageStoreKey: string = "store"
    storageGlanceKey: string = "glance"
    /** 浏览记录 */
    glanceList: LocalSaveGlanceType[] = []
    private _isControlDebug = false

    /** 重新打开图片 */
    async openMedia(dirUrl?: string, fileName?: string, index: number = 0) {
        store.dirUrl = dirUrl || store.dirUrl
        store.fileName = fileName || store.fileName
        mediaStore.curDirUrl = store.dirUrl
        let comicData = await this.openComicList(store.dirUrl, store.fileName)
        mediaStore.isZip = comicData.listdata.isZip
        // mediaStore.zipInFileName = ""
        let displayIndex = index
        if (mediaStore.isZip) {
            displayIndex = index
        }
        else {
            let a = mediaMiddleData.list.find(c => {
                let b = jFileCache.mediaCache[c.searchIndex]
                return b.fileName == fileName
            })
            displayIndex = a.displayIndex
        }
        if (store.isAutoSaveGlance) {
            let c = this.glanceList.find(c => c.dirurl == store.dirUrl && c.filename == store.fileName && c.key == store.urlkey)
            console.log(c)
            if (c) {
                displayIndex = c.displayIndex
            }
        }
        store.displayIndex = displayIndex
        mediaStore.isRefresh = true
        await new Promise((res) => {
            setTimeout(() => {
                mediaStore.jumpPage = `${store.displayIndex},0`
                res(undefined)
            }, 50);
        })

        return true
    }


    /** 打开漫画列表 */
    async openComicList(dirUrl: string, fileName: string) {
        let listdata = await jFileCache.getFileListData(dirUrl, fileName)
        mediaStore.isZip = listdata.isZip
        // mediaStore.children = []
        mediaMiddleData.list = []
        mediaStore.len = listdata.list.length
        for (let i = 0; i < listdata.list.length; i++) {
            let child = listdata.list[i]
            let obj: MediaViewChildType = {
                searchIndex: child.childIndex,
                displayIndex: i,
                splitNum: 0,
                scale: 1,
                parentTransX: 0,
                parentTransY: 0,
                isView: false,
                displayW: mediaStore.divFloatW,
                displayH: mediaStore.divFloatH,
                transX: 0,
                transY: 0,
                isSplit: false
            }
            mediaMiddleData.list.push(obj)
        }
        return { listdata }
    }

    loadStoreByLocalStorage() {
        let newStore = this.getStoreByLocalStorage()
        if (!newStore) {
            return false
        }
        for (let key in store) {
            if (key in newStore) {
                store[key] = newStore[key]
            }
        }
        return true
    }

    loadGlanceByLocalStorage() {
        this.glanceList = this.getGlanceByLocalStorage()
    }

    getGlanceByLocalStorage() {
        let txt = localStorage.getItem(this.storageGlanceKey)
        if (!txt) {
            return []
        }
        let json: LocalSaveGlanceType[] = JSON.parse(txt)
        return json
    }

    saveGlanceByLocalStorage() {
        let c = this.glanceList.find(c => c.key == store.urlkey && c.dirurl == store.dirUrl && c.filename == store.fileName)
        if (!c) {
            c = { key: store.urlkey, dirurl: store.dirUrl, filename: store.fileName, iszip: mediaStore.isZip, displayIndex: 0 }
            this.glanceList.push(c)
        }
        c.displayIndex = store.displayIndex
        let txt = JSON.stringify(this.glanceList)
        localStorage.setItem(this.storageGlanceKey, txt)
    }

    initStorage() {
        this.loadStoreByLocalStorage()
        this.loadGlanceByLocalStorage()
        store.isControlDebug = store.isControlDebug || this._isControlDebug
        this._isControlDebug = store.isControlDebug
    }

    getStoreByLocalStorage() {
        let txt = localStorage.getItem(this.storageStoreKey)
        if (!txt) {
            return
        }
        let json: LocalSaveStoreType = JSON.parse(txt)
        let index = json?.storeList ? json.storeList.findIndex(c => c.key == store.urlkey) : -1
        if (index == -1) {
            return
        }
        return json.storeList[index].data
    }

    saveStoreByLocalStorage(o?: typeof store) {

        if (!o) {
            o = store
        }
        let json: LocalSaveStoreType
        let txt = localStorage.getItem(this.storageStoreKey)
        if (!txt) {
            json = { storeList: [] }
        }
        else {
            json = JSON.parse(txt)
        }
        let cloneStore = cloneAssign(o)

        let index = json?.storeList ? json.storeList.findIndex(c => c.key == o.urlkey) : -1
        if (index == -1) {

            json.storeList.push({ key: o.urlkey, data: cloneStore })
        }
        else {
            json.storeList[index] = { key: o.urlkey, data: cloneStore }
        }
        let newTxt = JSON.stringify(json)
        localStorage.setItem(this.storageStoreKey, newTxt)
    }

    /** 自动保存 */
    autoSave(type?: "store" | "glance") {
        if ((!type || type == "store") && store.isAutoSaveStore) {
            this.saveStoreByLocalStorage()
        }
        if ((!type || type == "glance") && store.isAutoSaveGlance) {
            this.saveGlanceByLocalStorage()
        }
    }

    clearSave() {
        localStorage.clear()
    }

    clearSaveGlance() {
        let list: LocalSaveGlanceType[] = []
        for (let i = 0; i < this.glanceList.length; i++) {
            let c = this.glanceList[i]
            if (c.key == store.urlkey) {
                continue
            }
            list.push(c)
        }
        this.glanceList = list
        localStorage.setItem(this.storageGlanceKey, JSON.stringify(list))
    }

    /** 清空保存 */
    clearSaveStore() {
        let txt = localStorage.getItem(this.storageStoreKey)
        if (!txt) {
            return
        }
        let json: LocalSaveStoreType = JSON.parse(txt)
        let index = json?.storeList ? json.storeList.findIndex(c => c.key == store.urlkey) : -1
        if (index == -1) {
            return
        }
        // console.log(index)
        json.storeList.splice(index, 1)
        let newTxt = JSON.stringify(json)
        localStorage.setItem(this.storageStoreKey, newTxt)
        return
    }

    async onMediaLoad(c: MediaViewChildType): Promise<MediaContentChildType> {
        let cache = jFileCache.mediaCache[c.searchIndex]
        if (cache.isComplete) {
            return cache
        }
        if (cache.type == "img") {
            return new Promise((res) => {
                let img = new Image()
                img.onload = () => {
                    cache.originW = img.width
                    cache.originH = img.height
                    cache.isComplete = true
                    // cache.isComplete = true
                    res(cache)
                }
                img.src = cache.dataUrl
            })
        }
    }

}

export const mainMediaCtrl = new MainMediaCtrl()