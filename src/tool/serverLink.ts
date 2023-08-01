
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
                    url: 'http://localhost:3006/trpc',
                })
            ],
            transformer: undefined
        })
    }

    async test() {
        store.fileUrl = '//192.168.123.3/藏经阁/exhentai/[衣一] 秘密 14-18.zip'

        const zipTest = await this.client.main.testZip.mutate({ url: store.fileUrl })
        console.log(zipTest)

        const imgData = await this.client.main.getZipImg.mutate({ url: store.fileUrl, orderNO: 0 })
        store.canvasB64 = 'data:image/png;base64,' + btoa(new Uint8Array((<any>imgData).data).reduce((res, byte) => res + String.fromCharCode(byte), ''))
    }

    async setNextImg() {
        const imgData = await this.client.main.getZipImg.mutate({ url: store.fileUrl, orderNO: store.curNo + 1 })
        store.canvasB64 = 'data:image/png;base64,' + btoa(new Uint8Array((<any>imgData).data).reduce((res, byte) => res + String.fromCharCode(byte), ''))
        store.curNo += 1
    }
}

