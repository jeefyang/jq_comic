<script setup lang="ts">
import { onMounted, ref } from 'vue';
// import HelloWorld from './components/HelloWorld.vue'
import ComicDisplay from "./components/ComicDisplay.vue"
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/router';
import { store } from './store';

const trpcTest = ref("")
// const imgSrc = ref("")

const resizeFunc = () => {
  store.screenW = window.innerWidth
  store.screenH = window.innerHeight
  console.log(store.screenW,store.screenH)
}

onMounted(async () => {
  const client = createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost:3006/trpc',
      })
    ],
    transformer: undefined
  })
  const withoutInputQuery = await client.main.greeting.query();
  trpcTest.value += withoutInputQuery + "\n"
  console.log(withoutInputQuery);

  const withInputQuery = await client.main.greeting.query({ name: 'Alex' });
  trpcTest.value += withInputQuery + "\n"
  console.log(withInputQuery);

  let url = '//192.168.123.3/藏经阁/exhentai/[衣一] 秘密 14-18.zip'
  const zipTest = await client.main.testZip.mutate({ url: url })
  console.log(zipTest)

  const imgData = await client.main.getZipImg.mutate({ url: url, orderNO: 0 })
  store.canvasB64 = 'data:image/png;base64,' + btoa(new Uint8Array((<any>imgData).data).reduce((res, byte) => res + String.fromCharCode(byte), ''))

  resizeFunc()
  window.addEventListener("resize", () => {
    resizeFunc()
  })
})

</script>

<template>
  <ComicDisplay></ComicDisplay>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.trpc {
  color: red;
}
</style>
