import { JFolderDisplayType } from "../type";
import { JserverLink } from "../tool/serverLink"
import { store } from "../store"

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
    async openZip(dirUrl?: string, fileName?: string, index: number = 0) {
        store.dirUrl = dirUrl || store.dirUrl
        store.fileName = fileName || store.fileName
        store.curDirUrl = store.dirUrl
        store.curNo = index
        let url = `${store.dirUrl}/${store.fileName}`
        let zipData = await this.server.client.main.getZipMsg.mutate({ url: url })
        store.imgCount = zipData.list.length
        const imgData = await this.server.client.main.getZipInFile.mutate({ url: url, orderNO: store.curNo })
        if (!imgData) {
            store.canvasB64 = ""
        }
        else {
            store.canvasB64 = 'data:image/png;base64,' + btoa(new Uint8Array((<any>imgData).data).reduce((res, byte) => res + String.fromCharCode(byte), ''))
        }
    }

    /** 通过序号设置图片 */
    async setImgByNum(index: number) {
        if (index < 0) {
            return
        }
        if (store.imgCount <= index-1) {
            return
        }
        let url = `${store.dirUrl}/${store.fileName}`
        const imgData = await this.server.client.main.getZipInFile.mutate({ url: url, orderNO: index })
        store.canvasB64 = 'data:image/png;base64,' + btoa(new Uint8Array((<any>imgData).data).reduce((res, byte) => res + String.fromCharCode(byte), ''))
        store.curNo = index
    }
}

export let jFileCache = new JFileCache()