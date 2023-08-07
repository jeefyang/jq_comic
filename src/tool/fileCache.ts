import { JFolderDisplayType } from "../type";
import { JserverLink } from "../tool/serverLink"
import { store } from "../store"
import path from "path-browserify"

class JFileCache {

    cache: { [propName: string]: JFolderDisplayType } = {}
    server: JserverLink

    constructor() {

    }

    init(server: JserverLink) {
        this.server = server
    }

    async getFolder(url: string) {
        store.curDirUrl = url
        if (this.cache[url]) {
            return this.cache[url]
        }
        let obj = await this.server.getFolder(url)
        this.cache[url] = obj
        return obj
    }

    // async addFolderUrl(url: string) {
    //     let newUrl = path.join(store.curDirUrl, url)
    //     await this.getFolder(newUrl)
    //     return
    // }

    /** 打开压缩包 */
    async openZip(url: string, index: number = 0) {
        store.fileUrl = url
        let arr = store.fileUrl.split(path.sep)
        arr = arr.slice(0, arr.length - 1)
        store.curDirUrl = arr.join(path.sep)
        store.curNo = index
        let zipData = await this.server.client.main.getZipMsg.mutate({ url: store.fileUrl })
        store.imgCount = zipData.list.length
        console.log(store.imgCount)
        const imgData = await this.server.client.main.getZipFile.mutate({ url: store.fileUrl, orderNO: store.curNo })
        if (!imgData) {
            store.canvasB64 = ""
        }
        else {
            store.canvasB64 = 'data:image/png;base64,' + btoa(new Uint8Array((<any>imgData).data).reduce((res, byte) => res + String.fromCharCode(byte), ''))
        }

    }
}

export let jFileCache = new JFileCache()