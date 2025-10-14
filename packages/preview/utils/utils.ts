import type {FileRenderType, PreviewType} from '../preview.interface'
import {
    arrayBufferPreviewTypeList,
    getPreviewTypeByFileType,
    imagePreviewTypeList,
    pdfPreviewTypeList,
    textFilePreviewTypeList,
    videoPreviewTypeList,
} from '../preview.const'

/**
 * Get file type
 * @param file
 */
export function getFileType(file: File): string {
    const fileName = file.name
    const idx = fileName.lastIndexOf('.')
    return fileName.substring(idx + 1)
}

/**
 * Get file name
 * @param file
 */
export function getFileName(file: File): string {
    const fileAllName = file.name
    const idx = fileAllName.lastIndexOf('.')
    return fileAllName.substring(0, idx)
}

/**
 * Get fileRender by file type
 */
export function getFileRenderByFile(file: File): Promise<ArrayBuffer | string> {
    const previewType = getPreviewTypeByFileType(getFileType(file))
    const renderType = getFileRenderType(previewType)
    return new Promise((resolve) => {
        const raw = file
        const fileReader = new FileReader()
        switch (renderType) {
            case 'text':
                fileReader.readAsText(raw)
                fileReader.onload = () => {
                    resolve(fileReader.result)
                }
                break
            case 'arrayBuffer':
                fileReader.readAsArrayBuffer(raw)
                fileReader.onload = () => {
                    resolve(fileReader.result)
                }
                break
            case 'image':
                resolve(window.URL.createObjectURL(raw))
                break
            case 'pdf': {
                const pdfBloBlob = new Blob([raw], {type: 'application/pdf'})
                const pdfBlobUrl = URL.createObjectURL(pdfBloBlob)
                resolve(pdfBlobUrl)
                break
            }
            case 'video': {
                const videoBlobUrl = URL.createObjectURL(new Blob([raw], {type: 'video/mp4'}))
                resolve(videoBlobUrl)
                break
            }
            default:
                resolve(window.URL.createObjectURL(raw))
                break
        }
    })
}

/**
 * Get file render data type
 * @param previewType
 */
export function getFileRenderType(previewType: PreviewType): FileRenderType {
    const types: Record<FileRenderType, boolean> = {
        text: textFilePreviewTypeList.includes(previewType),
        arrayBuffer: arrayBufferPreviewTypeList.includes(previewType),
        image: imagePreviewTypeList.includes(previewType),
        pdf: pdfPreviewTypeList.includes(previewType),
        video: videoPreviewTypeList.includes(previewType),
    }
    return Object.keys(types)!.find(key => types[key]) as FileRenderType
}
