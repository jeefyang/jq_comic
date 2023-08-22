
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/router';

export class JserverLink {

    private _client: ReturnType<typeof createTRPCProxyClient<AppRouter>>
    baseUrl: string
    /** 域名 */
    domain = "localhost"
    /** 端口 */
    port: number
    /** 包含端口,比domain和port更高优先级 */
    host: string

    constructor() {

    }

    init() {
        let url = `http://${this.domain}:${this.port}/trpc`
        if (this.host) {
            url = `${this.host}/trpc`
        }
        this._client = createTRPCProxyClient<AppRouter>({
            links: [
                httpBatchLink({
                    url: url,
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

    /** 通过名称获取压缩包里文件b64 */
    async getZipInFileB64ByName(url: string, fileName: string) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.getZipInFileBase64ByName.mutate({ url: newUrl, fileName })
        return data
    }

    /** 获取文件内容 */
    async getFile(url: string) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.getFile.mutate({ url: newUrl })
        return data
    }

    /** 获取文件内容b64 */
    async getFileB64(url: string) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.getFileBase64.mutate({ url: newUrl })
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