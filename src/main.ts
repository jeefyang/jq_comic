import { createSSRApp } from 'vue'
import './style.css'
import App from './App.vue'
import { Col, Row, Button, Grid, GridItem, ConfigProvider, Icon, TextEllipsis, Field, Slider, Loading, RadioGroup, Radio, ActionSheet, Switch, DropdownMenu, DropdownItem, FloatingBubble, Image, Space, Popup, Checkbox, CheckboxGroup, Image as VanImage } from 'vant';
import './assets/iconfont/iconfont.css'
import "vant/lib/index.css"
import '@vant/touch-emulator';



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
    app.use(Loading)
    app.use(RadioGroup)
    app.use(Radio)
    app.use(ActionSheet)
    app.use(Switch)
    app.use(DropdownMenu)
    app.use(DropdownItem)
    app.use(FloatingBubble)
    app.use(Image)
    app.use(Space)
    app.use(Popup)
    app.use(Checkbox)
    app.use(CheckboxGroup)
    app.use(VanImage)
    // app.use(Toast)
    return { app }
}

