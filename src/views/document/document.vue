<template>
  <div class="document-viewer">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <el-icon class="main-icon">
            <Document />
          </el-icon>
        </div>
        <div class="header-text">
          <h1 class="page-title">用户手册</h1>
          <p class="page-subtitle">系统使用指南和操作说明</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" :icon="Download" @click="downloadPDF" size="large">
            下载手册
          </el-button>
        </div>
      </div>
    </div>

    <!-- PDF查看器 -->
    <div class="pdf-container">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button-group>
            <el-button :disabled="currentPage <= 1" @click="previousPage" :icon="ArrowLeft">
              上一页
            </el-button>
            <el-button :disabled="currentPage >= totalPages" @click="nextPage" :icon="ArrowRight">
              下一页
            </el-button>
          </el-button-group>

          <div class="page-info">
            <span class="page-text">第</span>
            <el-input-number v-model="currentPage" :min="1" :max="totalPages" @change="goToPage" size="small"
              controls-position="right" style="width: 100px; margin: 0 8px;" />
            <span class="page-text">页，共 {{ totalPages }} 页</span>
          </div>
        </div>

        <div class="toolbar-right">
          <div class="zoom-controls">
            <span class="zoom-label">缩放：</span>
            <el-button-group>
              <el-button @click="zoomOut" :disabled="scale <= 0.5" :icon="ZoomOut" size="small" />
              <el-button @click="resetZoom" size="small">
                {{ Math.round(scale * 100) }}%
              </el-button>
              <el-button @click="zoomIn" :disabled="scale >= 3" :icon="ZoomIn" size="small" />
            </el-button-group>
          </div>

          <el-button @click="fitToWidth" :icon="FullScreen" size="small" type="info">
            适应宽度
          </el-button>
        </div>
      </div>

      <div class="pdf-viewer-container" ref="pdfContainer">
        <div v-if="isLoading" class="loading-container" v-loading="isLoading" element-loading-text="正在加载PDF文档..."
          element-loading-spinner="el-icon-loading">
          <div class="loading-content">
            <el-icon class="loading-icon">
              <Loading />
            </el-icon>
            <p>正在加载用户手册，请稍候...</p>
          </div>
        </div>

        <div v-else-if="loadError" class="error-container">
          <div class="error-content">
            <el-icon class="error-icon">
              <WarningFilled />
            </el-icon>
            <h3>文档加载失败</h3>
            <p>{{ errorMessage }}</p>
            <el-button type="primary" @click="retryLoad" :icon="Refresh">
              重新加载
            </el-button>
          </div>
        </div>

        <div v-else class="pdf-display" :style="{ transform: `scale(${scale})` }">
          <VuePdfEmbed ref="pdfEmbed" :source="pdfSource" :page="currentPage" @loaded="onPDFLoaded"
            @loading-failed="onLoadingFailed" @rendered="onPageRendered" @progress="onProgress" class="pdf-page" />
        </div>
      </div>
    </div>

    <!-- 文档信息面板 -->
    <div class="info-panel" v-if="pdfInfo">
      <el-card class="info-card" shadow="hover">
        <template #header>
          <div class="info-header">
            <el-icon>
              <InfoFilled />
            </el-icon>
            <span>文档信息</span>
          </div>
        </template>
        <div class="info-content">
          <div class="info-item">
            <span class="info-label">文档标题：</span>
            <span class="info-value">{{ pdfInfo.title || '用户手册' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">页面总数：</span>
            <span class="info-value">{{ totalPages }} 页</span>
          </div>
          <div class="info-item">
            <span class="info-label">当前页面：</span>
            <span class="info-value">第 {{ currentPage }} 页</span>
          </div>
          <div class="info-item">
            <span class="info-label">缩放比例：</span>
            <span class="info-value">{{ Math.round(scale * 100) }}%</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import {
  Document,
  Download,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  FullScreen,
  Loading,
  WarningFilled,
  Refresh,
  InfoFilled
} from '@element-plus/icons-vue'
import VuePdfEmbed from 'vue-pdf-embed'

// 使用public目录中的PDF文件
const pdfFile = '/doc.pdf'

// 响应式数据
const pdfEmbed = ref()
const pdfContainer = ref()

// PDF状态
const isLoading = ref(true)
const loadError = ref(false)
const errorMessage = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const scale = ref(1)
const pdfSource = ref<ArrayBuffer | null>(null)

// PDF信息
const pdfInfo = reactive({
  title: '',
  author: '',
  subject: '',
  creator: ''
})

// 生命周期
onMounted(async () => {
  console.log('组件挂载，PDF路径:', pdfFile)
  await loadPDFAsArrayBuffer()
})

// 加载PDF为ArrayBuffer
const loadPDFAsArrayBuffer = async () => {
  try {
    isLoading.value = true
    loadError.value = false

    console.log('开始获取PDF文件:', pdfFile)
    const response = await fetch(pdfFile)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log('PDF ArrayBuffer获取成功，大小:', arrayBuffer.byteLength, 'bytes')

    pdfSource.value = arrayBuffer

    isLoading.value = false
  }
  catch (error: any) {
    console.error('获取PDF ArrayBuffer失败:', error)
    isLoading.value = false
    loadError.value = true
    errorMessage.value = `PDF文件获取失败: ${error?.message || '未知错误'}`
  }
}

const onPDFLoaded = (pdf: any) => {
  console.log('PDF加载成功:', pdf)
  isLoading.value = false
  loadError.value = false
  totalPages.value = pdf.numPages

  // 获取PDF信息
  pdf.getMetadata().then((metadata: any) => {
    const info = metadata?.info || {}
    pdfInfo.title = info.Title || '用户手册'
    pdfInfo.author = info.Author || ''
    pdfInfo.subject = info.Subject || ''
    pdfInfo.creator = info.Creator || ''
    console.log('PDF元数据:', pdfInfo)
  }).catch((error: any) => {
    console.warn('获取PDF元数据失败:', error)
  })

  ElNotification.success({
    title: 'PDF加载成功',
    message: `文档共 ${totalPages.value} 页`,
    duration: 3000
  })
}

const onLoadingFailed = (error: any) => {
  console.error('PDF加载失败详细信息:', error)
  console.error('PDF文件路径:', pdfFile)
  console.error('当前PDF源:', pdfSource.value)

  isLoading.value = false
  loadError.value = true
  errorMessage.value = error?.message || 'PDF文档加载失败，请检查文件是否存在'

  ElMessage.error({
    message: errorMessage.value,
    duration: 5000
  })
}

const onPageRendered = () => {
  console.log(`页面 ${currentPage.value} 渲染完成`)
}

const onProgress = (progressParams: any) => {
  console.log('PDF加载进度:', progressParams)
}

const retryLoad = async () => {
  console.log('重新加载PDF')
  pdfSource.value = null
  await nextTick()
  await loadPDFAsArrayBuffer()
}

// 页面导航
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// 缩放控制
const zoomIn = () => {
  if (scale.value < 3) {
    scale.value = Math.round((scale.value + 0.25) * 100) / 100
  }
}

const zoomOut = () => {
  if (scale.value > 0.5) {
    scale.value = Math.round((scale.value - 0.25) * 100) / 100
  }
}

const resetZoom = () => {
  scale.value = 1
}

const fitToWidth = () => {
  if (pdfContainer.value) {
    const containerWidth = pdfContainer.value.clientWidth
    const pdfWidth = 595 // A4页面宽度（像素）
    scale.value = Math.round((containerWidth / pdfWidth) * 0.9 * 100) / 100
  }
}

// 下载PDF
const downloadPDF = () => {
  try {
    const link = document.createElement('a')
    link.href = pdfFile
    link.download = '用户手册.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElNotification.success({
      title: '下载开始',
      message: '用户手册下载已开始'
    })
  } catch (error) {
    ElMessage.error('下载失败，请重试')
    console.error('下载错误:', error)
  }
}
</script>

<style scoped>
/* 页面容器 */
.document-viewer {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: "微软雅黑", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 40px 60px;
  color: white;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="2" height="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
  background-size: 20px 20px;
  pointer-events: none;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 2;
}

.header-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.main-icon {
  font-size: 32px;
  color: white;
  animation: float 3s ease-in-out infinite;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
}

.header-actions {
  flex-shrink: 0;
}

.header-actions .el-button {
  height: 48px;
  padding: 0 24px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.header-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* PDF容器 */
.pdf-container {
  max-width: 1200px;
  margin: -40px auto 0;
  background: white;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 3;
  min-height: 600px;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 2px solid #f0f0f0;
  background: #fafbfc;
  border-radius: 16px 16px 0 0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-info {
  display: flex;
  align-items: center;
  margin-left: 16px;
}

.page-text {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

/* PDF查看器容器 */
.pdf-viewer-container {
  padding: 20px;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #f8f9fa;
  overflow: auto;
}

.pdf-display {
  transform-origin: top center;
  transition: transform 0.3s ease;
}

.pdf-page {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  overflow: hidden;
}

/* 加载状态 */
.loading-container {
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-content {
  text-align: center;
  color: #64748b;
}

.loading-icon {
  font-size: 48px;
  color: #3b82f6;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

/* 错误状态 */
.error-container {
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-content {
  text-align: center;
  color: #64748b;
}

.error-icon {
  font-size: 48px;
  color: #f56565;
  margin-bottom: 16px;
}

.error-content h3 {
  font-size: 1.5rem;
  color: #1a202c;
  margin: 16px 0 8px;
}

.error-content p {
  margin-bottom: 24px;
  color: #64748b;
}

/* 信息面板 */
.info-panel {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 40px 40px;
}

.info-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #374151;
}

.info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  font-weight: 600;
  color: #374151;
}

/* 动画 */
@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-8px);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 20px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .pdf-container {
    margin: -20px auto 0;
    border-radius: 8px 8px 0 0;
  }

  .toolbar {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .toolbar-left,
  .toolbar-right {
    flex-wrap: wrap;
    justify-content: center;
  }

  .info-panel {
    padding: 0 20px 20px;
  }

  .info-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .zoom-controls {
    display: none;
  }

  .page-info {
    margin-left: 0;
  }
}
</style>

<style>
/* 全局样式覆盖 */
.el-button-group>.el-button {
  border-radius: 6px !important;
}

.el-button-group>.el-button:first-child {
  border-radius: 6px 0 0 6px !important;
}

.el-button-group>.el-button:last-child {
  border-radius: 0 6px 6px 0 !important;
}

.el-input-number .el-input__inner {
  text-align: center;
}
</style>