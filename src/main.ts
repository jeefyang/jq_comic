import { createSSRApp } from 'vue'
import './style.css'
import App from './App.vue'
import { Col, Row, Button, Grid, GridItem, ConfigProvider, Icon, TextEllipsis, Field, Slider } from 'vant';
import './assets/iconfont/iconfont.css'
import "vant/lib/index.css"



export const createApp = () => {
    const app = createSSRApp(App)
    app.use(Col)
    app.use(Row)
    app.use(Button)
    app.use(Grid)
    app.use(GridItem)
    app.use(ConfigProvider)
    app.use(Icon)
    app.use(TextEllipsis)
    app.use(Field)
    app.use(Slider)
    return { app }
}

