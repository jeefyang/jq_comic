
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
    localhost: string

    constructor() {

    }

    init() {
        if (!this.host) {
            this.host = `http://${this.domain}:${this.port}`
        }
        let url = `${this.host}/trpc`
        this.localhost = url
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
    async postFolder(url: string) {
        let obj = await this._client.main.postFolder.mutate({ baseUrl: this.baseUrl, url })
        return obj
    }

    /** 获取压缩包其他信息 */
    async postZipMsg(url: string) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.postZipMsg.mutate({ url: newUrl })
        return data
    }
    /** 通过名称获取压缩包里文件 */
    async postZipInFileByName(url: string, fileName: string) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.postZipInFileByName.mutate({ url: newUrl, fileName })
        return data
    }

    /** 通过名称获取压缩包里文件b64 */
    async postZipInFileB64ByName(url: string, fileName: string) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.postZipInFileBase64ByName.mutate({ url: newUrl, fileName })
        return data
    }

    /** 通过名称获取压缩包里文件b64 */
    async getZipInFileB64ByName(url: string, fileName: string) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.getZipInFileBase64ByName.query({ url: newUrl, fileName })
        return data
    }

    /** 通过名称获取压缩包里文件Url */
    getZipInFileUrlByName(url: string, fileName: string) {
        let newUrl = `${this.baseUrl}/${url}`
        return `${this.host}/getZipInFileByName?url=${encodeURIComponent(newUrl)}&fileName=${encodeURIComponent(fileName)}`
    }


    /** 获取文件内容 */
    async postFile(url: string) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.postFile.mutate({ url: newUrl })
        return data
    }

    /** 获取文件内容 */
    async getFile(url: string) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.getFile.query({ url: newUrl })
        return data
    }

    /** 获取文件内容Url */
    getFileUrl(url: string) {
        let newUrl = `${this.baseUrl}/${url}`
        return `${this.host}/getFile?url=${encodeURIComponent(newUrl)}`
    }

    /** 获取文件内容b64 */
    async postFileB64(url: string) {
        let newUrl = `${this.baseUrl}/${url}`
        let data = await this._client.main.postFileBase64.mutate({ url: newUrl })
        return data
    }


    async postIsFile(url: string) {
        let newUrl = `${this.baseUrl}/${url}`
        console.log(newUrl)
        let data = await this._client.main.postIsFile.mutate({ url: newUrl })
        return data
    }
}

export let jserver = new JserverLink()