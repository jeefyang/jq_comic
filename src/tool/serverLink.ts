
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/router';
import { store } from '../store'

export class JserverLink {

    private _client: ReturnType<typeof createTRPCProxyClient<AppRouter>>
    baseUrl: string

    constructor() {

    }

    init() {
        this._client = createTRPCProxyClient<AppRouter>({
            links: [
                httpBatchLink({
                    url: 'http://192.168.123.120:3006/trpc',
                })
            ],
            transformer: undefined
        })
    }

    async test() {
        store.baseDirUrl = "//192.168.123.3/藏经阁/docker/komga/data"
        this.baseUrl = store.baseDirUrl
        store.dirUrl = "comic/【战栗杀机】(Banana Fish)[19集全][漫画]日本小学馆授权中文版"
        store.fileName = '(www.chinav.tv)[comic]《战栗杀机》(Banana.Fish)[吉田秋生].vol.11-14.zip'
        store.curDirUrl = store.dirUrl
        store.curNo = 0
        store.isZipFile=true
        let url = `${store.baseDirUrl}/${store.dirUrl}/${store.fileName}`
        let zipData = await this._client.main.getZipMsg.mutate({ url: url })
        store.imgCount = zipData.list.length
        const imgData = await this._client.main.getZipInFile.mutate({ url: url, orderNO: store.curNo })
        store.canvasB64 = 'data:image/png;base64,' + btoa(new Uint8Array((<any>imgData).data).reduce((res, byte) => res + String.fromCharCode(byte), ''))
    }

    // /** 测试文件夹 */
    // async testFolder() {
    //     let url = "115Trans"
    //     let obj = this.getFolder(url)
    //     console.log(obj)
    // }

    async getFolder(url: string) {
        let obj = await this._client.main.getFolder.mutate({ baseUrl: this.baseUrl, url })
        return obj
    }

    async getZipMsg(url: string) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.getZipMsg.mutate({ url: newUrl })
        return data
    }

    async getZipInFileByNum(url: string, index: number = 0) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.getZipInFile.mutate({ url: newUrl, orderNO: index })
        return data
    }

    async getFile(url: string) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.getFile.mutate({ url: newUrl })
        return data
    }
}

export let jserver = new JserverLink()