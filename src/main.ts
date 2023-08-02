import { createSSRApp } from 'vue'
import './style.css'
import App from './App.vue'
import { Overlay, Col, Row, Button, Grid, GridItem, ConfigProvider } from 'vant';
import './assets/iconfont/iconfont.css'
import "vant/lib/index.css"


export const createApp = () => {
    const app = createSSRApp(App)
    app.use(Overlay)
    app.use(Col)
    app.use(Row)
    app.use(Button)
    app.use(Grid)
    app.use(GridItem)
    app.use(ConfigProvider)
    return { app }
}

