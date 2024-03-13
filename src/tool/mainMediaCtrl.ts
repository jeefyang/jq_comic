
import { mediaMiddleData, mediaStore } from "../mediaStore"
import { MediaViewChildType } from "../media"
import { store } from "../store"
import { jFileCache } from "./fileCache"
import { LocalSaveDataType } from "../type"
import { cloneAssign } from "./util"


export class MainMediaCtrl {

    localStorageKey: string = "localSaveDataType"
    private _isControlDebug = false

    /** 重新打开图片 */
    async openMedia(dirUrl?: string, fileName?: string, index: number = 0) {
        store.dirUrl = dirUrl || store.dirUrl
        store.fileName = fileName || store.fileName
        store.curDirUrl = store.dirUrl
        let comicData = await this.openComicList(store.dirUrl, store.fileName)
        mediaStore.isZip = comicData.listdata.isZip
        mediaStore.zipInFileName = ""
        if (mediaStore.isZip) {
            store.displayIndex = index
        }
        else {
            let a = mediaMiddleData.list.find(c => {
                let b = jFileCache.mediaCache[c.searchIndex]
                return b.fileName == fileName
            })
            store.displayIndex = a.displayIndex
        }
        store.isRefresh = true
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

    initStore() {
        let c = this.loadStoreByLocalStorage()
        if (!c) {
            return
        }
        store.isControlDebug = store.isControlDebug || this._isControlDebug
        this._isControlDebug = store.isControlDebug
    }

    getStoreByLocalStorage() {
        let txt = localStorage.getItem(this.localStorageKey)
        if (!txt) {
            return
        }
        let json: LocalSaveDataType = JSON.parse(txt)
        let index = json?.storeList ? json.storeList.findIndex(c => c.key == store.urlkey) : -1
        if (index == -1) {
            return
        }
        return json.storeList[index].data
    }

    saveStoreByLocalStorage() {
        let json: LocalSaveDataType
        let txt = localStorage.getItem(this.localStorageKey)
        if (!txt) {
            json = { storeList: [] }
        }
        else {
            json = JSON.parse(txt)
        }
        let cloneStore = cloneAssign(store)

        let index = json?.storeList ? json.storeList.findIndex(c => c.key == store.urlkey) : -1
        if (index == -1) {

            json.storeList.push({ key: store.urlkey, data: cloneStore })
        }
        else {
            json.storeList[index] = { key: store.urlkey, data: cloneStore }
        }
        console.log(json)
        let newTxt = JSON.stringify(json)
        localStorage.setItem(this.localStorageKey, newTxt)
    }

    /** 自动保存 */
    autoSave() {
        if (!store.isAutoSave) {
            return
        }
        this.saveStoreByLocalStorage()
    }

    /** 清空保存 */
    clearSave() {
        let txt = localStorage.getItem(this.localStorageKey)
        if (!txt) {
            return
        }
        let json: LocalSaveDataType = JSON.parse(txt)
        let index = json?.storeList ? json.storeList.findIndex(c => c.key == store.urlkey) : -1
        if (index == -1) {
            return
        }
        // console.log(index)
        json.storeList.splice(index, 1)
        let newTxt = JSON.stringify(json)
        localStorage.setItem(this.localStorageKey, newTxt)
        return
    }


}

export const mainMediaCtrl = new MainMediaCtrl()