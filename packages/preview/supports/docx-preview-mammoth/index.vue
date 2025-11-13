<script lang='ts' setup>
import {ref, watch, nextTick} from 'vue'
import type {PreviewProps} from '../../preview.interface'
import Docx2Html from '../../utils/Docx2Html'

const props = withDefaults(
    defineProps<PreviewProps>(),
    {
      url: () => null,
      file: () => null,
    },
)

const htmlContent = ref<string>('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const contentRef = ref<HTMLElement | null>(null)

const converter = new Docx2Html({
  injectCss: true,
  imageEmbedding: 'datauri',
})

/**
 * Split content into pages based on A4 height
 * Uses actual rendered measurements from the visible container
 */
function splitIntoPages(): void {
  if (!contentRef.value) return

  const container = contentRef.value
  const rootElements = container.querySelectorAll('.docx2html-root')
  
  // If already split into multiple pages, don't re-split
  if (rootElements.length > 1) return

  const rootElement = rootElements[0] as HTMLElement
  if (!rootElement) return

  const A4_HEIGHT = 1123 // A4 height in pixels (297mm at 96 DPI)
  const PAGE_PADDING = 80 // Top + bottom padding (40px each)
  const MAX_PAGE_CONTENT_HEIGHT = A4_HEIGHT - PAGE_PADDING
  
  // Get all direct children (preserves nested content like images, charts)
  const children = Array.from(rootElement.children) as HTMLElement[]
  
  if (children.length === 0) return

  // Measure the actual rendered height of the root element (includes padding)
  const totalHeight = rootElement.offsetHeight || rootElement.scrollHeight
  
  // If content fits in one page, don't split
  if (totalHeight <= A4_HEIGHT) return

  const pages: string[] = []
  let currentPageContent: HTMLElement[] = []
  
  // Use the actual root element for measurement (it's already rendered)
  // Create a clone to measure without affecting the original
  const measureContainer = rootElement.cloneNode(false) as HTMLElement
  measureContainer.style.position = 'absolute'
  measureContainer.style.visibility = 'hidden'
  measureContainer.style.width = rootElement.offsetWidth + 'px'
  document.body.appendChild(measureContainer)

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    currentPageContent.push(child)
    
    // Measure the actual height of accumulated content
    measureContainer.innerHTML = currentPageContent.map(el => el.outerHTML).join('')
    void measureContainer.offsetHeight // Force layout
    // scrollHeight includes padding (80px), so we need content height
    const totalMeasuredHeight = measureContainer.scrollHeight
    const contentHeight = totalMeasuredHeight - PAGE_PADDING

    // If content height exceeds max, split (but only if we have more than one element)
    if (contentHeight > MAX_PAGE_CONTENT_HEIGHT && currentPageContent.length > 1) {
      // Remove the last element that caused overflow
      const lastElement = currentPageContent.pop()!
      
      // Create page from content before overflow
      const pageHtml = currentPageContent.map(el => el.outerHTML).join('')
      pages.push(`<div class="docx2html-root">${pageHtml}</div>`)
      
      // Start new page with the element that caused overflow
      currentPageContent = [lastElement]
      measureContainer.innerHTML = lastElement.outerHTML
      void measureContainer.offsetHeight
    }
  }

  document.body.removeChild(measureContainer)

  // Add the last page
  if (currentPageContent.length > 0) {
    const pageHtml = currentPageContent.map(el => el.outerHTML).join('')
    pages.push(`<div class="docx2html-root">${pageHtml}</div>`)
  }

  // Update the HTML if we created multiple pages
  if (pages.length > 1) {
    container.innerHTML = pages.join('')
  }
}

watch(
    () => props.file,
    async (file) => {
      if (!file) {
        htmlContent.value = ''
        return
      }

      isLoading.value = true
      error.value = null

      try {
        const html = await converter.convertFileToHtml(file)
        htmlContent.value = html
        
        // Wait for DOM to update, then split into pages
        await nextTick()
        setTimeout(() => {
          splitIntoPages()
        }, 100)
      }
      catch (err) {
        console.error('Failed to convert DOCX:', err)
        error.value = err instanceof Error ? err.message : 'Failed to convert document'
        htmlContent.value = ''
      }
      finally {
        isLoading.value = false
      }
    },
    {immediate: true},
)
</script>

<template>
  <div class="docx-preview">
    <div v-if="isLoading" class="loading">
      Loading document...
    </div>
    <div v-else-if="error" class="error">
      Error: {{ error }}
    </div>
    <div v-else-if="htmlContent" ref="contentRef" class="docx-content" v-html="htmlContent" />
    <div v-else class="no-content">
      No document to display
    </div>
  </div>
</template>

<style scoped lang='scss'>
.docx-preview {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 20px;
  box-sizing: border-box;
}

.loading,
.error,
.no-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  color: #666;
  font-size: 14px;
}

.error {
  color: #f56c6c;
}

.docx-content {
  width: 100%;
  min-height: 100%;
  overflow: visible;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
