<script lang="ts" setup>
import VueOfficeDocx from '@vue-office/docx'
import '@vue-office/docx/lib/index.css'
import {ref, watch} from 'vue'
import type {PreviewProps} from '../../preview.interface'
import {getFileRenderByFile} from '../../utils/utils'

const props = withDefaults(
    defineProps<PreviewProps>(),
    {
      url: () => null,
      file: () => null,
    },
)

const fileRender = ref(null)
watch(
    () => props.file,
    (file) => {
      if (file) {
        getFileRenderByFile(file).then(render => (fileRender.value = render))
      }
    },
    {immediate: true},
)

function renderedHandler(): void {
  console.log('Rendering completed')
}

function errorHandler(): void {
  console.log('Rendering failed')
}
</script>

<template>
  <div class="docx-preview-vue-office">
    <VueOfficeDocx :src="fileRender" @rendered="renderedHandler" @error="errorHandler"/>
  </div>
</template>

<style scoped lang="scss">
.docx-preview-vue-office {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
