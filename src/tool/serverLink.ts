
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/router';
import { store } from '../store';


export class JserverLink {

    private _client: ReturnType<typeof createTRPCProxyClient<AppRouter>>


    constructor() {

    }

    init() {

        this._client = createTRPCProxyClient<AppRouter>({
            links: [
                httpBatchLink({
                    url: "/trpc",
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
        let obj = await this._client.main.postFolder.mutate({ key: store.urlkey, url })
        return obj
    }

    /** 获取压缩包其他信息 */
    async postZipMsg(url: string) {

        let data = await this._client.main.postZipMsg.mutate({ key: store.urlkey, url })
        return data
    }
    /** 通过名称获取压缩包里文件 */
    async postZipInFileByName(url: string, fileName: string) {
        let data = await this._client.main.postZipInFileByName.mutate({ key: store.urlkey, url, fileName })
        return data
    }

    /** 通过名称获取压缩包里文件b64 */
    async postZipInFileB64ByName(url: string, fileName: string) {
        let data = await this._client.main.postZipInFileBase64ByName.mutate({ key: store.urlkey, url, fileName })
        return data
    }

    /** 通过名称获取压缩包里文件b64 */
    async getZipInFileB64ByName(url: string, fileName: string) {
        let data = await this._client.main.getZipInFileBase64ByName.query({ key: store.urlkey, url, fileName })
        return data
    }

    /** 通过名称获取缩略图 */
    async getThumB64(url: string, fileName: string, isZip?: boolean) {

        let data = await this._client.main.postGetThumB64.mutate({ w: 100, h: 100, key: store.urlkey, fileName: fileName, dirUrl: url, isZip: !!isZip })
        return data
    }

    /** 通过名称获取压缩包里文件Url */
    getZipInFileUrlByName(url: string, fileName: string) {
        return `/getZipInFileByName?key=${store.urlkey}&url=${encodeURIComponent(url)}&fileName=${encodeURIComponent(fileName)}`
    }

    /** 管理密钥链接 */
    async postManagerUrl(type: "isExist" | "reback" | "folder", url: string) {
        let data = await this._client.main.postManagerUrl.mutate({ type, url })
        return data
    }

    /** 获取管理密钥 */
    async postMangerKey(type: "add" | "upgrade" | "del" | "find", op?: { key?: string, url?: string }) {
        let data = await this._client.main.postMangerKey.mutate({ type, key: op?.key, url: op?.url })
        return data
    }

    /** 获取文件内容 */
    async postFile(url: string) {

        let data = await this._client.main.postFile.mutate({ key: store.urlkey, url })
        return data
    }

    /** 获取文件内容 */
    async getFile(url: string) {
        let data = await this._client.main.getFile.query({ key: store.urlkey, url })
        return data
    }

    /** 获取文件内容Url */
    getFileUrl(url: string) {
        return `/getFile?key=${store.urlkey}&url=${encodeURIComponent(url)}`
    }

    /** 获取文件内容b64 */
    async postFileB64(url: string) {

        let data = await this._client.main.postFileBase64.mutate({ key: store.urlkey, url })
        return data
    }


    async postIsFile(url: string) {
        let data = await this._client.main.postIsFile.mutate({ key: store.urlkey, url })
        return data
    }
}

export let jserver = new JserverLink()