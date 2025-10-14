import type {Component} from 'vue'

/**
 * VueFilesPreview
 */
// region FilesPreview
// Preview component rule configuration
export interface IPreviewRule {
    name: string
    type: PreviewType
    accept: Array<string>
    component: Component | (() => Promise<Component>) | null
}

// Preview component types - how many preview modes and items
export enum PreviewType {
    NONE = 'none', // No type
    CODE = 'code', // Code type
    DOC = 'doc',
    DOCX = 'docx', // WORD document
    XLSX = 'xlsx', // Excel file
    PDF = 'pdf', // PDF
    PIC = 'pic', // Image
    TXT = 'txt', // Text
    MD = 'md', // Markdown
    EPUB = 'epub', // epub
    PPT = 'ppt',
    AUDIO = 'audio',
    VIDEO = 'video',
}

// Type used when reading render
export type FileRenderType = 'text' | 'image' | 'pdf' | 'arrayBuffer' | 'video'

// endregion

// region common
// Basic properties of preview component, extended properties use & implementation
export interface PreviewProps {
    // Accept file object
    file?: File
    // Link
    url?: string
    // File name
    name?: string
}

// endregion
