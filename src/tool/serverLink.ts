
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/router';

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


    // /** 测试文件夹 */
    // async testFolder() {
    //     let url = "115Trans"
    //     let obj = this.getFolder(url)
    //     console.log(obj)
    // }

    /** 获取文件夹里文件列表 */
    async getFolder(url: string) {
        let obj = await this._client.main.getFolder.mutate({ baseUrl: this.baseUrl, url })
        return obj
    }

    /** 获取压缩包其他信息 */
    async getZipMsg(url: string) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.getZipMsg.mutate({ url: newUrl })
        return data
    }
    /** 通过名称获取压缩包里文件 */
    async getZipInFileByName(url: string, fileName: string) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.getZipInFileByName.mutate({ url: newUrl, fileName })
        return data
    }

    /** 获取文件内容 */
    async getFile(url: string) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.getFile.mutate({ url: newUrl })
        return data
    }

    async isFile(url: string) {
        let newUrl = `${this.baseUrl}/${url}`
        console.log(newUrl)
        let data = await this._client.main.isFile.mutate({ url: newUrl })
        return data
    }
}

export let jserver = new JserverLink()