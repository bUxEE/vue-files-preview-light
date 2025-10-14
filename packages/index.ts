import VueFilesPreview from './preview/supports/vue-files-preview/index.js'
import {version} from './version.js'

const components = {
    VueFilesPreview,
}

function install(app: import('vue').App<any>): void {
    Object.keys(components).forEach((key) => {
        app.component(key, components[key])
    })
}

export default {version, install}
export {
    VueFilesPreview,
}
