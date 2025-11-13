<template>
  <div class="main-container">
    <div v-if="uploadFile" class="preview-container">
      <VueFilesPreview :file="uploadFile" :useMammoth="true" />
    </div>
    <div v-else class="upload-btn">
      <div class="upload-area" @drop="handleDrop" @dragover.prevent @dragenter.prevent @click="handleClick">
        <input
          ref="fileInputRef"
          type="file"
          @change="handleFileChange"
          class="file-input"
          accept="*/*"
        />
        <div class="upload-icon">+</div>
        <div class="upload-text">Drop file here or <em>click to upload</em></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { VueFilesPreview } from '../packages/index'

const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadFile = ref<File | null>(null)

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    uploadFile.value = target.files[0]
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    uploadFile.value = event.dataTransfer.files[0]
  }
}

function handleClick() {
  fileInputRef.value?.click()
}
</script>

<style scoped>
.main-container {
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

.preview-container {
  width: 100%;
  height: calc(100vh - 40px);
}

.upload-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 40px);
}

.upload-area {
  width: 100%;
  max-width: 600px;
  padding: 60px 20px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.file-input {
  display: none;
}

.upload-icon {
  font-size: 48px;
  color: #8c939d;
  margin-bottom: 16px;
  font-weight: 300;
  line-height: 1;
}

.upload-text {
  color: #606266;
  font-size: 14px;
}

.upload-text em {
  color: #409eff;
  font-style: normal;
}
</style>

