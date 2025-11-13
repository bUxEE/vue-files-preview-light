import type {App as Application} from 'vue'
import DocxPreviewVueOffice from './index.vue'

DocxPreviewVueOffice.install = (app: Application) => {
    app.component('DocxPreviewVueOffice', DocxPreviewVueOffice)
}
export default DocxPreviewVueOffice

