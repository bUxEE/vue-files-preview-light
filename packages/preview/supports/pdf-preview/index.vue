<script lang="ts" setup>
import { watch } from 'vue'
import type { PreviewProps } from '../../preview.interface'
import { applyPdfSuffix, getFileRenderByFile } from '../../utils/utils'

const props = withDefaults(
  defineProps<PreviewProps & { page?: number, pdfSettings?: Record<string, string | number> }>(),
  { url: () => null, file: () => null, pdfSettings: () => null },
)

const fileRender = ref(null)
watch(
  () => [props.file, props.page, props.pdfSettings],
  () => {
    if (props.file) {
      getFileRenderByFile(props.file, props.page, props.pdfSettings).then(render => (fileRender.value = render))
    }
  },
  { immediate: true },
)

watch(
  () => [props.url, props.page, props.pdfSettings],
  ([url]) => {
    if (url) {
      fileRender.value = applyPdfSuffix(url as string, props.page, props.pdfSettings)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="pdf-preview">
    <iframe class="pdf-iframe" :src="fileRender" frameborder="0" />
  </div>
</template>

<style scoped lang="scss">
.pdf-iframe {
  width: 100%;
  height: 100vh;
}
</style>
