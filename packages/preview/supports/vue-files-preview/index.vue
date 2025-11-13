<script lang="ts" setup>
import { watch, shallowRef, defineAsyncComponent } from 'vue'
import { PreviewRules, getPreviewTypeByFileType } from '../../preview.const'
import type { IPreviewRule, PreviewProps } from '../../preview.interface'
import { PreviewType } from '../../preview.interface'
import { getFileName, getFileType } from '../../utils/utils'

const props = withDefaults(
  defineProps<PreviewProps & {
    width?: string
    height?: string
    overflow?: string
    useMammoth?: boolean // Use mammoth.js instead of @vue-office/docx for DOCX files
  }>(),
  {
    file: () => null,
    url: () => null,
    width: () => '100%',
    height: () => '100%',
    overflow: () => 'auto',
    useMammoth: () => false,
  },
)

const currentPreview = shallowRef<IPreviewRule>(PreviewRules[PreviewType.NONE])
const loadedComponent = shallowRef<any>(null)
const isLoading = shallowRef(false)

async function syncPreview(file: File): Promise<void> {
  const previewType = getPreviewTypeByFileType(getFileType(file))
  let preview = PreviewRules[previewType]
  
  // Override DOCX preview component if useMammoth prop is true
  if (previewType === PreviewType.DOCX && props.useMammoth) {
    preview = {
      ...preview,
      component: () => import('../docx-preview-mammoth/index.vue'),
    }
  }
  
  if (preview) {
    preview.name = getFileName(file)
    currentPreview.value = preview
    
    // Load component asynchronously if it's a function
    if (preview.component && typeof preview.component === 'function') {
      isLoading.value = true
      try {
        const componentModule = await (preview.component as () => Promise<any>)()
        loadedComponent.value = defineAsyncComponent(() => Promise.resolve(componentModule))
      } catch (error) {
        console.error('Failed to load preview component:', error)
        loadedComponent.value = null
      } finally {
        isLoading.value = false
      }
    } else {
      loadedComponent.value = preview.component
    }
  }
}

watch(
  () => [props.file, props.useMammoth],
  () => {
    if (props.file) {
      syncPreview(props.file)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="vue-files-preview" :style="{ width, height, overflow }">
    <div v-if="isLoading" class="loading-placeholder">
      Loading preview...
    </div>
    <component 
      v-else-if="loadedComponent" 
      :is="loadedComponent" 
      :name="currentPreview.name" 
      :file="file" 
      :url="url" 
    />
    <div v-else class="no-preview">
      No preview available for this file type
    </div>
  </div>
</template>

<style lang="scss">
.vue-files-preview {
  overflow: hidden !important;
    > div {
    width: 100%;
    height: 100%;
    > iframe {
      width: 100%;
      height: 100%;
    }
  }
}
.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 14px;
}

.no-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}
</style>
