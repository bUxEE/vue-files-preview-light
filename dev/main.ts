import { createApp } from 'vue'
import App from './App.vue'
import VueFilesPreview from '../packages/index'
import '../packages/preview/supports/md-preview/index.css'

const app = createApp(App)
app.use(VueFilesPreview)

app.mount('#app')

