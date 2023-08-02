
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/router';
import { store } from '../store'
import path from "path-browserify"

export class JserverLink {

    client: ReturnType<typeof createTRPCProxyClient<AppRouter>>

    constructor() {

    }

    init() {
        this.client = createTRPCProxyClient<AppRouter>({
            links: [
                httpBatchLink({
                    url: 'http://localhost:3006/trpc',
                })
            ],
            transformer: undefined
        })
    }

    async test() {
        let baseUrl = "//192.168.123.3/藏经阁"
        await this.client.main.setBaseUrl.query({ baseUrl: baseUrl })
        store.fileUrl = 'exhentai/[衣一] 秘密 14-18.zip'
        let arr = store.fileUrl.split(path.sep)
        arr = arr.slice(0, arr.length - 1)
        store.curDirUrl = arr.join(path.sep)
        const zipTest = await this.client.main.testZip.mutate({ url: store.fileUrl })
        console.log(zipTest)

        const imgData = await this.client.main.getZipFile.mutate({ url: store.fileUrl, orderNO: 0 })
        store.canvasB64 = 'data:image/png;base64,' + btoa(new Uint8Array((<any>imgData).data).reduce((res, byte) => res + String.fromCharCode(byte), ''))
    }

    /** 触发下张图片 */
    async setNextImg() {
        const imgData = await this.client.main.getZipFile.mutate({ url: store.fileUrl, orderNO: store.curNo + 1 })
        store.canvasB64 = 'data:image/png;base64,' + btoa(new Uint8Array((<any>imgData).data).reduce((res, byte) => res + String.fromCharCode(byte), ''))
        store.curNo += 1
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