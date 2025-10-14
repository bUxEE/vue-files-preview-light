import type {IPreviewRule} from './preview.interface'
import {PreviewType} from './preview.interface'

export const textFilePreviewTypeList = [PreviewType.CODE, PreviewType.TXT, PreviewType.MD]
export const arrayBufferPreviewTypeList = [PreviewType.DOC, PreviewType.DOCX, PreviewType.XLSX, PreviewType.PPT, PreviewType.EPUB]
export const imagePreviewTypeList = [PreviewType.PIC, PreviewType.AUDIO]
export const pdfPreviewTypeList = [PreviewType.PDF]
export const videoPreviewTypeList = [PreviewType.VIDEO]

export const PreviewRules: Record<PreviewType, IPreviewRule> = {
    [PreviewType.NONE]: {
        name: '',
        component: null,
        type: PreviewType.NONE,
        accept: [],
    },
    [PreviewType.CODE]: {
        name: '',
        component: () => import('./supports/code-preview/index.vue'),
        type: PreviewType.CODE,
        accept: ['html', 'css', 'less', 'scss', 'js', 'json', 'ts', 'vue', 'c', 'cpp', 'java', 'py', 'go', 'php', 'lua', 'rb', 'pl', 'swift', 'vb', 'cs', 'sh', 'rs', 'vim', 'log', 'lock', 'swift', 'mod', 'mht', 'mhtml', 'xml'],
    },
    [PreviewType.DOC]: {
        name: '',
        component: null,
        type: PreviewType.DOC,
        accept: ['doc', 'docm', 'dot', 'dotm', 'dotx', 'fodt', 'mht', 'odt', 'ott', 'rtf', 'djvu', 'xps'],
    },
    [PreviewType.DOCX]: {
        name: '',
        component: () => import('./supports/docx-preview/index.vue'),
        type: PreviewType.DOCX,
        accept: ['docx'],
    },
    [PreviewType.XLSX]: {
        name: '',
        component: () => import('./supports/xlsx-preview/index.vue'),
        type: PreviewType.XLSX,
        accept: ['xlsx', 'xls', 'csv', 'fods', 'ods', 'ots', 'xlsm', 'xlt', 'xltm'],
    },
    // ppt: presentation
    [PreviewType.PPT]: {
        name: '',
        component: null,
        type: PreviewType.PPT,
        accept: ['ppt', 'pptx', 'fodp', 'odp', 'otp', 'pot', 'potm', 'potx', 'pps', 'ppsm', 'ppsx', 'pptm'],
    },
    [PreviewType.PDF]: {
        name: '',
        component: () => import('./supports/pdf-preview/index.vue'),
        type: PreviewType.PDF,
        accept: ['pdf'],
    },
    [PreviewType.EPUB]: {
        name: '',
        component: () => import('./supports/epub-preview/index.vue'),
        type: PreviewType.EPUB,
        accept: ['epub'],
    },
    [PreviewType.MD]: {
        name: '',
        component: () => import('./supports/md-preview/index.vue'),
        type: PreviewType.MD,
        accept: ['md'],
    },
    [PreviewType.PIC]: {
        name: '',
        component: () => import('./supports/pic-preview/index.vue'),
        type: PreviewType.PIC,
        accept: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'bmp', 'svg', 'ico'],
    },
    [PreviewType.TXT]: {
        name: '',
        component: () => import('./supports/txt-preview/index.vue'),
        type: PreviewType.TXT,
        accept: ['txt'],
    },
    [PreviewType.AUDIO]: {
        name: '',
        component: () => import('./supports/audio-preview/index.vue'),
        type: PreviewType.AUDIO,
        accept: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac'],
    },
    [PreviewType.VIDEO]: {
        name: '',
        component: () => import('./supports/video-preview/index.vue'),
        type: PreviewType.VIDEO,
        accept: ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mpeg', 'flv', 'mov', 'wmv'],
    },
}

/**
 * Get rule by file type
 * @param type
 */
export function getRuleByFileType(type: string): IPreviewRule {
    return Object.values(PreviewRules).find(cur => cur.accept.includes(type)) ?? PreviewRules[PreviewType.NONE]
}

/**
 * Get PreviewType by file type
 * @param type
 */
export function getPreviewTypeByFileType(type: string): PreviewType {
    return getRuleByFileType(type).type
}
