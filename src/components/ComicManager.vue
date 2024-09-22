<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { jserver } from '../tool/serverLink';
import { showToast } from 'vant';

const dataList = ref<{
    key: string;
    url: string;
    isModify: boolean
}[]>([])

const showTop = ref(false)
const showType = ref<'add' | 'folder'>('add')
const addingKey = ref("")
const advanceKey = ref("")
const advanceFolderList = ref<string[]>([])

const updateFunc = async () => {
    let a = await jserver.postMangerKey('find')
    dataList.value = a.data.map(c => {
        return {
            key: c.key,
            url: c.url,
            isModify: false
        }
    })
    showToast("刷新数据成功!")
}

onMounted(async () => {
    await updateFunc()
})

const addingFunc = () => {
    showType.value = 'add'
    addingKey.value = ''
    showTop.value = true
}

const addFunc = async (key: string) => {

    if (!key) {
        showToast('关键字不能为空!')
        return
    }
    let res = await jserver.postMangerKey('add', { key: key, url: '/' })
    if (res.isSuccess) {
        await updateFunc()
    }
    showTop.value = false
    showToast(res.desc)
}

const rebackFunc = async (index: number) => {
    let d = dataList.value[index]
    let res = await jserver.postManagerUrl("reback", d.url)
    if (res.isSuccess) {
        d.isModify = true
        d.url = res.url
    }
}

const delFunc = async (index: number) => {
    let d = dataList.value[index]
    let c = confirm(`确认删除(${d.key})吗?`)
    if (!c) {
        return
    }
    let res = await jserver.postMangerKey('del', { key: d.key })
    if (res.isSuccess) {
        showToast("删除成功")
        await updateFunc()
    }
}

const testFunc = async (index: number) => {
    let d = dataList.value[index]
    let res = await jserver.postManagerUrl("isExist", d.url)
    if (res.isSuccess) {
        showToast(`'${d.url}' 存在!`)
    }
    else {
        showToast(`'${d.url}' 不存在!!!!!,请不要随意保存!!!!!`)
    }
}

const jumpFunc = async (index: number) => {
    let d = dataList.value[index]
    let c = confirm("确认为新建页面跳转,取消为当前页面跳转")
    let h = location.href.split("?")[0]
    let newH = `${h}?key=${d.key}`
    if (c) {
        window.open(newH)
    }
    else {
        location.href = newH
    }
}

const listFolderFunc = async (index: number) => {
    let d = dataList.value[index]
    let res = await jserver.postManagerUrl('folder', d.url)
    advanceFolderList.value = res?.list || []
    advanceKey.value = d.key
    showType.value = 'folder'
    showTop.value = true

}

const AdvanceFolderFunc = (folder: string) => {
    showTop.value = false
    let d = dataList.value.find(c => c.key == advanceKey.value)
    if (!d) {
        showToast(`关键字 '${advanceKey.value}' 不存在!`)
        return
    }
    d.isModify = true
    d.url = `${d.url}/${folder}`
}

const saveFunc = async (index: number) => {
    let d = dataList.value[index]

    let res = await jserver.postMangerKey("upgrade", { key: d.key, url: d.url })
    if (res.isSuccess) {
        showToast("保存更新成功!")
        await updateFunc()
        return
    }
    showToast("无法保存更新!")

}


</script>
<template>
    <div v-for="(item, index) in dataList" class="box">
        <van-row>
            <van-col span="5">
                <van-row justify="center" class="opacity">
                    <div class="row">关键字</div>
                </van-row>
                <van-row>
                    <div class="br"></div>
                </van-row>
                <van-row justify="center">
                    <van-button size="small" color="#7232dd" disabled>{{ item.key }}</van-button>
                </van-row>
            </van-col>
            <van-col span="19">
                <van-row>
                    <input class="input" type="text" v-model="item.url">
                </van-row>
                <van-row>
                    <div class="br"></div>
                </van-row>
                <van-row>
                    <van-space>

                        <van-button size="small" type="primary" @click="rebackFunc(index)">后退</van-button>
                        <van-button size="small" type="primary" @click="listFolderFunc(index)">前进</van-button>
                        <van-button size="small" type="primary" @click="testFunc(index)">测试</van-button>
                        <van-button size="small" type="primary" @click="saveFunc(index)">保存</van-button>
                        <van-button size="small" type="primary" @click="delFunc(index)"
                            :disabled="item.isModify">删除</van-button>
                        <van-button size="small" type="primary" :disabled="item.isModify"
                            @click="jumpFunc(index)">跳转</van-button>
                    </van-space>
                </van-row>
            </van-col>
        </van-row>
    </div>
    <van-space>
        <van-button size="small" type="primary" @click="addingFunc">添加</van-button>
        <van-button size="small" type="primary" @click="updateFunc">刷新</van-button>
    </van-space>
    <van-popup v-model:show="showTop" position="top" :style="{ height: '30%' }">
        <template v-if="showType == 'add'">
            <div class="flexCenter">
                <div>关键字</div>
                <div class="centerInput">
                    <input class="input" type="text" v-model="addingKey">
                </div>

                <div class="br"></div>
                <div>
                    <van-button size="small" type="primary" @click="addFunc(addingKey)">确认</van-button>
                </div>

            </div>
        </template>
        <template v-if="showType == 'folder'">
            <van-space wrap>
                <template v-for="(item) in advanceFolderList">
                    <van-button size="small" type="primary" @click="AdvanceFolderFunc(item)">{{ item }}</van-button>
                </template>
            </van-space>


        </template>
    </van-popup>
</template>
<style scoped>
.centerInput {
    width: 80%;
    left: 10%;
    position: relative;
}

.text {
    text-align: center;
}

.row {
    height: 32px;
}

.input {
    background-color: #242e3d;
    border: 0px;
    width: 100%;
}

.flex {
    display: flex;

}

.flexCenter {
    display: flex;
    flex-direction: column;
    justify-items: center;
    justify-content: center;
    top: 30%;
    position: relative;
}

.opacity {
    opacity: 0.5;
}

.box {
    border-style: solid;
    border-color: #DCDEE0;
    margin-top: 5px;
    margin-left: 10px;
    margin-right: 10px;
}

.btn {
    margin-top: 5px;
    margin-left: 5px;
    margin-bottom: 5px;
    margin-right: 5px;

    text-align: center;
    background-color: #3060b7;
}

.btnParent {
    border-radius: 5px;
    background-color: #3060b7;
}

.br {
    height: 5px;
}
</style>