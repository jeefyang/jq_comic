# 急速漫画小工具

用vue开发简易的看漫画工具,目的是为简单在线看漫画

## 命令使用

- `dev:vue` 启动vue的开发调试
- `dev:node` 启动node服务的开发调试
- `build:all` 同时打包`vue`和`node`的项目代码,打包目录分别是`build_vue`和`build_node`

## 其他文件使用
- `./public/config.jsonc`:
  - 用于配置服务器相关,触发`build`打包会自动分发到`build_node`和`build_vue`,此文件仅在开发时使用,生产模式后,`nodejs`一律只读`build_node`文件夹下的,均以触发`js`为当前文件夹,`vue`则只读`build_vue`,均以触发`index.html`为当前文件夹.详细内容,请看配置
- `./express.js`:
  - vue生产环境的js,方便调用,也可以自备方案

## 网络路径
本质是为了能够区分本地或者在线
- `nodedomain`:域名,由于url原因,不带`http://`
- `nodessl`:区分`https://`|`http://`,只要有值就默认`https://`
- `nodeport`:端口,由于url原因,域名很难带上端口,故在这里增加端口
  
用来触发某些配置
- `switch`:用来切换目录,配置请看在`./public/config.jsonc`
- `isControlDebug`:强制打开操作debug功能