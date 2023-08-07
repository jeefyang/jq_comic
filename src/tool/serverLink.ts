
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/router';
import { store } from '../store'

export class JserverLink {

    client: ReturnType<typeof createTRPCProxyClient<AppRouter>>

    constructor() {

    }

    init() {
        this.client = createTRPCProxyClient<AppRouter>({
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
        await this.client.main.setBaseUrl.query({ baseUrl: store.baseDirUrl })
        store.dirUrl = "comic/【战栗杀机】(Banana Fish)[19集全][漫画]日本小学馆授权中文版"
        store.fileName = '(www.chinav.tv)[comic]《战栗杀机》(Banana.Fish)[吉田秋生].vol.11-14.zip'
        store.curDirUrl = store.dirUrl
        store.curNo = 0
        let url = `${store.dirUrl}/${store.fileName}`
        let zipData = await this.client.main.getZipMsg.mutate({ url: url })
        store.imgCount = zipData.list.length
        const imgData = await this.client.main.getZipInFile.mutate({ url: url, orderNO: store.curNo })
        store.canvasB64 = 'data:image/png;base64,' + btoa(new Uint8Array((<any>imgData).data).reduce((res, byte) => res + String.fromCharCode(byte), ''))
    }

    /** 测试文件夹 */
    async testFolder() {
        let url = "115Trans"
        let obj = this.getFolder(url)
        console.log(obj)
    }

    async getFolder(url: string) {
        let obj = await this.client.main.getFolder.mutate({ url })
        return obj
    }
}

export let jserver = new JserverLink()