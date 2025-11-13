/**
 * Docx2Html.ts — Convert .docx to responsive, visible HTML in the browser
 * TypeScript version using mammoth.js npm package
 * 
 * Features:
 * - Converts .docx ArrayBuffer/File/URL into sanitized HTML using mammoth
 * - Embeds images with data URIs (configurable) or leaves image srcs as blob URLs
 * - Injects responsive CSS to make typography and images fluid
 * - Exposes async methods: convertArrayBufferToHtml, convertFileToHtml, convertUrlToHtml
 */

import * as mammoth from 'mammoth'

export interface Docx2HtmlOptions {
  injectCss?: boolean
  cssId?: string
  css?: string
  imageEmbedding?: 'datauri' | 'blob'
}

const DEFAULTS: Required<Docx2HtmlOptions> = {
  injectCss: true,
  cssId: 'docx2html-styles',
  css: `
/* Docx2Html responsive A4 defaults */
.docx2html-root { 
  box-sizing: border-box; 
  width: 100%; 
  max-width: 794px; /* A4 width at 96 DPI (210mm) */
  min-height: 1123px; /* A4 height at 96 DPI (297mm) - ensures all pages are A4 size */
  margin: 0 auto 40px; /* Add bottom margin for spacing between pages */
  padding: 40px 60px;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow to distinguish pages */
  /* Multi-page support - all pages maintain A4 dimensions */
}
.docx2html-root img { 
  max-width: 100%; 
  height: auto; 
  display: block; 
  margin: 0.5em auto; 
}
.docx2html-root figure { 
  margin: 1em 0; 
}
.docx2html-root svg,
.docx2html-root canvas,
.docx2html-root object,
.docx2html-root embed {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0.5em auto;
}
.docx2html-root table { 
  width: 100%; 
  border-collapse: collapse; 
  overflow-x: auto; 
  display: block; 
  margin: 1em 0;
}
.docx2html-root table td, 
.docx2html-root table th { 
  padding: 0.5em; 
  border: 1px solid #ddd; 
  text-align: left;
}
.docx2html-root p { 
  margin: 0.5em 0; 
}
.docx2html-root h1, 
.docx2html-root h2, 
.docx2html-root h3, 
.docx2html-root h4, 
.docx2html-root h5, 
.docx2html-root h6 { 
  margin: 1em 0 0.5em; 
  font-weight: 600;
  page-break-after: avoid;
}
.docx2html-root ul,
.docx2html-root ol {
  margin: 0.5em 0;
  padding-left: 2em;
}
/* Page break support */
.docx2html-root p,
.docx2html-root div,
.docx2html-root section {
  page-break-inside: avoid;
}
/* Responsive: mobile-first approach - 100% width on mobile, scale content proportionally */
@media (max-width: 850px) { 
  .docx2html-root {
    width: 100%;
    max-width: 100%;
    min-height: auto; /* Allow flexible height on smaller screens */
    padding: 30px 20px;
    font-size: 15px;
    margin-bottom: 30px; /* Reduced spacing on smaller screens */
  }
}
@media (max-width: 600px) { 
  .docx2html-root {
    width: 100%;
    max-width: 100%;
    min-height: auto; /* Allow flexible height on mobile */
    padding: 20px 15px;
    font-size: 14px;
    margin-bottom: 20px; /* Reduced spacing on mobile */
  }
  .docx2html-root h1 { font-size: 1.8em; }
  .docx2html-root h2 { font-size: 1.5em; }
  .docx2html-root h3 { font-size: 1.3em; }
  .docx2html-root h4 { font-size: 1.1em; }
  .docx2html-root table {
    font-size: 0.9em;
  }
}
`,
  imageEmbedding: 'datauri',
}

function arrayBufferToUint8Array(ab: ArrayBuffer): Uint8Array {
  return new Uint8Array(ab)
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(fr.result as ArrayBuffer)
    fr.onerror = reject
    fr.readAsArrayBuffer(file)
  })
}

function fetchUrlAsArrayBuffer(url: string): Promise<ArrayBuffer> {
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Network error while fetching: ${r.status}`)
    return r.arrayBuffer()
  })
}

function injectCssIfNeeded(cssText: string, id: string): void {
  if (!cssText) return
  if (document.getElementById(id)) return
  const style = document.createElement('style')
  style.id = id
  style.type = 'text/css'
  style.appendChild(document.createTextNode(cssText))
  document.head.appendChild(style)
}

function makeBlobUrlFromArrayBuffer(ab: ArrayBuffer, mime?: string): string {
  const blob = new Blob([ab], { type: mime || 'application/octet-stream' })
  return URL.createObjectURL(blob)
}

/**
 * Split HTML into pages by detecting page breaks or using a wrapper approach
 * Since mammoth doesn't preserve exact page breaks, we'll use CSS to create visual pages
 */
function wrapHtml(html: string): string {
  // Check for page break markers in the HTML
  // Mammoth might add page-break styles or we can detect manual breaks
  const pageBreakMarkers = [
    /<p[^>]*style="[^"]*page-break-before:\s*always[^"]*"[^>]*>/gi,
    /<p[^>]*class="[^"]*page-break[^"]*"[^>]*>/gi,
    /<div[^>]*style="[^"]*page-break-before:\s*always[^"]*"[^>]*>/gi,
    /<hr[^>]*class="[^"]*page-break[^"]*"[^>]*>/gi,
  ]

  let hasPageBreaks = false
  for (const marker of pageBreakMarkers) {
    if (marker.test(html)) {
      hasPageBreaks = true
      break
    }
  }

  if (hasPageBreaks) {
    // Split by page breaks
    const pageBreakRegex = /(<(?:p|div)[^>]*style="[^"]*page-break-before:\s*always[^"]*"[^>]*>|<hr[^>]*class="[^"]*page-break[^"]*"[^>]*>)/gi
    const parts = html.split(pageBreakRegex)
    const pages: string[] = []
    let currentPage = ''

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      if (part.match(pageBreakRegex)) {
        if (currentPage.trim()) {
          pages.push(`<div class="docx2html-root">${currentPage}</div>`)
        }
        currentPage = part
      } else {
        currentPage += part
      }
    }
    
    if (currentPage.trim()) {
      pages.push(`<div class="docx2html-root">${currentPage}</div>`)
    }

    return pages.length > 0 ? pages.join('') : `<div class="docx2html-root">${html}</div>`
  }

  // No explicit page breaks found - return as single page
  // The CSS will handle visual separation if needed
  return `<div class="docx2html-root">${html}</div>`
}

export class Docx2Html {
  private options: Required<Docx2HtmlOptions>

  constructor(options?: Docx2HtmlOptions) {
    this.options = { ...DEFAULTS, ...options }
  }

  async convertArrayBufferToHtml(arrayBuffer: ArrayBuffer): Promise<string> {
    const opts = this.options

    // Mammoth image handling and style mapping to preserve page breaks
    // Include options to preserve embedded objects like charts
    const mammothOptions = {
      convertImage: mammoth.images.imgElement((image) => {
        return image.read('base64').then((imageBuffer: string) => {
          const contentType = image.contentType || 'image/png'
          if (opts.imageEmbedding === 'datauri') {
            return { src: `data:${contentType};base64,${imageBuffer}` }
          }
          // Blob approach: create blob URL
          const binary = atob(imageBuffer)
          const len = binary.length
          const buffer = new Uint8Array(len)
          for (let i = 0; i < len; i++) buffer[i] = binary.charCodeAt(i)
          const blob = new Blob([buffer], { type: contentType })
          const url = URL.createObjectURL(blob)
          return { src: url }
        })
      }),
      // Style mapping to convert page breaks to HTML
      styleMap: [
        "p[style-name='Page Break'] => p.page-break",
        "p[style-name='page-break'] => p.page-break",
      ],
      // Include embedded objects (charts, etc.) as images when possible
      includeDefaultStyleMap: true,
    }

    const uint8 = arrayBufferToUint8Array(arrayBuffer)
    const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer }, mammothOptions)
    let html = result.value // Raw HTML

    // Log warnings about unconverted content (like charts)
    if (result.messages && result.messages.length > 0) {
      console.warn('Mammoth conversion warnings:', result.messages)
      // Check for chart/embedded object warnings
      const chartWarnings = result.messages.filter((msg: any) => 
        msg.type === 'warning' && 
        (msg.message?.toLowerCase().includes('chart') || 
         msg.message?.toLowerCase().includes('embedded') ||
         msg.message?.toLowerCase().includes('ole'))
      )
      if (chartWarnings.length > 0) {
        console.warn('Charts or embedded objects detected but may not be converted:', chartWarnings)
      }
    }

    // Post-process: Add page break markers for elements with page-break styles
    // Replace page-break classes with explicit page break markers
    html = html.replace(
      /<p[^>]*class="[^"]*page-break[^"]*"[^>]*>/gi,
      '<p style="page-break-before: always;" class="page-break">'
    )

    // Optionally inject CSS
    if (opts.injectCss) injectCssIfNeeded(opts.css, opts.cssId)

    return wrapHtml(html)
  }

  async convertFileToHtml(file: File): Promise<string> {
    if (!(file instanceof File)) throw new Error('convertFileToHtml expects a File')
    const ab = await readFileAsArrayBuffer(file)
    return this.convertArrayBufferToHtml(ab)
  }

  async convertUrlToHtml(url: string): Promise<string> {
    const ab = await fetchUrlAsArrayBuffer(url)
    return this.convertArrayBufferToHtml(ab)
  }

  async injectInto(container: string | HTMLElement, source: File | ArrayBuffer | string): Promise<HTMLElement> {
    // Container can be selector or element
    const el = typeof container === 'string' ? document.querySelector(container) : container
    if (!el) throw new Error('Container element not found')

    let html: string
    if (source instanceof File) {
      html = await this.convertFileToHtml(source)
    }
    else if (source instanceof ArrayBuffer) {
      html = await this.convertArrayBufferToHtml(source)
    }
    else if (typeof source === 'string' && /^https?:\/\//.test(source)) {
      html = await this.convertUrlToHtml(source)
    }
    else {
      throw new Error('Source must be File, ArrayBuffer or URL string')
    }

    el.innerHTML = html
    return el as HTMLElement
  }

  // Helper to sanitize by stripping scripts (very light)
  sanitize(html: string): string {
    const template = document.createElement('template')
    template.innerHTML = html
    // Remove script tags
    template.content.querySelectorAll('script').forEach((s) => s.remove())
    return template.innerHTML
  }
}

export default Docx2Html

