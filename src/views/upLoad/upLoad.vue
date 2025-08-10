<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="clearfix">
          <span class="header-title">上传文件</span>
          <el-button type="primary" @click="dialogVisible = true" class="upload-btn" :disabled="!isConnected">
            上传文件
          </el-button>
        </div>
      </template>

      <el-upload class="upload-demo" drag :file-list="fileList" :on-change="handleChange" :before-upload="beforeUpload"
        :accept="'.csv'" multiple>
        <el-icon class="el-icon--upload">
          <UploadFilled />
        </el-icon>
        <div class="el-upload__text">
          Drop file here or <em>click to upload</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            csv files with a size less than 10MB
          </div>
          <div class="el-upload__tip">
            上传的文件列头不能以数字开头
          </div>
        </template>
      </el-upload>

      <!-- 文件信息显示 -->
      <div class="file-info-panel" v-if="fileList.length > 0">
        <div class="file-info-header">
          <span class="info-title">已选择的文件</span>
          <el-button type="text" @click="clearFiles" size="small">清空</el-button>
        </div>
        <div class="file-list">
          <div v-for="(file, index) in fileList" :key="index" class="file-item">
            <div class="file-icon">
              <el-icon>
                <DocumentCopy />
              </el-icon>
            </div>
            <div class="file-details">
              <div class="file-name" :title="file.name">{{ file.name }}</div>
              <div class="file-meta">
                <span class="file-size">{{ formatFileSize(file.size || 0) }}</span>
                <span class="file-type">CSV</span>
                <span class="file-status" :class="getFileStatusClass(file)">
                  {{ getFileStatusText(file) }}
                </span>
              </div>
            </div>
            <div class="file-actions">
              <el-button type="text" @click="removeFile(index)" size="small" class="remove-btn">
                <el-icon>
                  <Close />
                </el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <el-dialog v-model="dialogVisible" title="上传文件配置" width="50%" :close-on-click-modal="false">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="150px">
          <el-form-item label="数据库名称" prop="filename">
            <el-input v-model="form.filename" placeholder="请输入上传文件名称" clearable />
          </el-form-item>
          <el-form-item label="上传方式" prop="isMerge">
            <el-radio-group v-model="form.isMerge">
              <el-radio :label="true">合并到已有数据库</el-radio>
              <el-radio :label="false">创建新数据库</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="cancelUpload">取 消</el-button>
            <el-button type="primary" @click="uploadFile" :loading="isUploading" :disabled="!canUpload">
              {{ isUploading ? '上传中...' : '确 定' }}
            </el-button>
          </span>
        </template>
      </el-dialog>

      <!-- 上传结果显示 -->
      <el-card class="result-card" v-if="uploadResults.length > 0" shadow="hover">
        <template #header>
          <div class="result-header">
            <span>上传结果</span>
            <el-button type="text" @click="clearResults" size="small">清空</el-button>
          </div>
        </template>
        <div class="upload-results">
          <div v-for="(result, index) in uploadResults" :key="index" class="result-item" :class="result.type">
            <el-icon class="result-icon">
              <SuccessFilled v-if="result.type === 'success'" />
              <WarningFilled v-else-if="result.type === 'warning'" />
              <CircleCloseFilled v-else />
            </el-icon>
            <div class="result-content">
              <div class="result-time">{{ result.timestamp }}</div>
              <div class="result-message">{{ result.message }}</div>
            </div>
          </div>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onActivated } from 'vue'
import { ElMessage } from 'element-plus'
import { useWebSocket } from '@/composables/useWebSocket'
import type { UploadFile, UploadProps, FormInstance } from 'element-plus'

// 表单数据接口
interface FormData {
  filename: string
  isMerge: boolean | string
}

// 上传结果接口
interface UploadResult {
  type: 'success' | 'error' | 'warning'
  message: string
  timestamp: string
}

// 响应式数据
const dialogVisible = ref(false)
const isUploading = ref(false)
const fileList = ref<UploadFile[]>([])
const uploadResults = ref<UploadResult[]>([])

const form = reactive<FormData>({
  filename: "",
  isMerge: false,
})

// 表单引用
const formRef = ref<FormInstance>()

// 表单验证规则
const rules = reactive({
  filename: [
    { required: true, message: '请输入数据库名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度在1到50个字符', trigger: 'blur' }
  ],
  isMerge: [
    { required: true, message: '请选择上传方式', trigger: 'change' }
  ]
})

const { isConnected, sendCommand, setMessageHandler } = useWebSocket()

// 计算属性
const canUpload = computed(() =>
  fileList.value.length > 0 &&
  form.filename.trim() &&
  form.isMerge !== '' &&
  !isUploading.value &&
  isConnected.value
)

// 生命周期
onMounted(() => {
  initializeComponent()
})

onActivated(() => {
  isUploading.value = false
})

const initializeComponent = () => {
  setMessageHandler(handleMessage)
  console.log('文件上传页面初始化完成')
}

// 处理WebSocket消息
const handleMessage = (msg: MessageEvent) => {
  try {
    const rawData = msg.data
    console.log(msg)
    console.log('收到上传响应:', rawData)

    // 尝试解析JSON，如果失败则当作纯文本处理
    let data: any = rawData
    try {
      data = JSON.parse(rawData)
    } catch {
      // 如果不是JSON格式，直接使用字符串
      data = { message: rawData }
    }

    // 处理不同的响应格式
    if (typeof data === 'string') {
      // 纯文本响应
      if (data.includes('成功') || data.includes('success')) {
        ElMessage.success('文件上传成功')
        showUploadResult(data)
        resetForm()
      } else if (data.includes('失败') || data.includes('error') || data.includes('Error')) {
        ElMessage.error('文件上传失败: ' + data)
        showUploadResult(data, 'error')
      } else {
        ElMessage.info('上传响应: ' + data)
        showUploadResult(data, 'warning')
      }
    } else if (typeof data === 'object') {
      // JSON对象响应
      if (data.message.includes('成功') ) {
        ElMessage.success(data.message || '文件上传成功')
        showUploadResult(data.message || '上传成功')
        resetForm()
      } else {
        ElMessage.error(data.message || '文件上传失败')
        showUploadResult(data.message || '文件上传失败', 'error')
      }
    }
  } catch (error) {
    console.error('处理上传响应失败:', error)
    ElMessage.error('处理上传响应失败')
  } finally {
    isUploading.value = false
  }
}

// 显示上传结果
const showUploadResult = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  const result: UploadResult = {
    type,
    message,
    timestamp: new Date().toLocaleString('zh-CN')
  }
  uploadResults.value.unshift(result) // 最新的结果显示在前面

  // 限制结果数量，避免内存占用过多
  if (uploadResults.value.length > 10) {
    uploadResults.value = uploadResults.value.slice(0, 10)
  }
}

// 清空上传结果
const clearResults = () => {
  uploadResults.value = []
}

// 文件上传前的处理
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isCSV = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isCSV) {
    ElMessage.error('只能上传CSV格式的文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过10MB!')
    return false
  }
  return false // 阻止自动上传，由我们手动控制
}

// 文件变化处理
const handleChange = (file: UploadFile) => {
  console.log('文件选择:', file.name)
  fileList.value = [file] // 只保留最后选择的文件
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取文件状态类名
const getFileStatusClass = (file: UploadFile): string => {
  if (file.status === 'success') return 'status-success'
  if (file.status === 'uploading') return 'status-uploading'
  if (file.status === 'fail') return 'status-error'
  return 'status-ready'
}

// 获取文件状态文本
const getFileStatusText = (file: UploadFile): string => {
  if (file.status === 'success') return '上传成功'
  if (file.status === 'uploading') return '上传中'
  if (file.status === 'fail') return '上传失败'
  return '待上传'
}

// 移除文件
const removeFile = (index: number) => {
  fileList.value.splice(index, 1)
}

// 清空文件列表
const clearFiles = () => {
  fileList.value = []
}

// 上传文件
const uploadFile = async () => {
  if (!canUpload.value) {
    ElMessage.error('请检查上传条件')
    return
  }

  try {
    const valid = await formRef.value?.validate()
    if (!valid) {
      return
    }

    isUploading.value = true

    const file = fileList.value[0]
    if (!file.raw) {
      throw new Error('无效的文件')
    }

    // 准备上传数据
    const uploadData = {
      name: form.filename.trim(),
      isMerge: String(form.isMerge),
      path: (file.raw as any).path || file.name,
      size: file.size,
      type: file.raw.type
    }

    console.log('准备上传文件:', uploadData)

    // 发送上传指令和数据
    if (sendCommand("upLoadCsv", uploadData)) {
      ElMessage.info('正在上传文件，请稍候...')
      dialogVisible.value = false
    } else {
      throw new Error('网络连接异常')
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    ElMessage.error('上传失败，请重试')
    isUploading.value = false
  }
}

// 取消上传
const cancelUpload = () => {
  dialogVisible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  form.filename = ''
  form.isMerge = false
  fileList.value = []
  formRef.value?.resetFields()
}
</script>

<style scoped>
.clearfix::before,
.clearfix::after {
  display: table;
  content: "";
}

.clearfix::after {
  clear: both;
}

.header-title {
  float: left;
  font-family: "微软雅黑";
  font-size: 16px;
  font-weight: 500;
}

.upload-btn {
  float: right;
  margin-top: 7px;
}

.upload-demo {
  font-family: "微软雅黑";
  margin: 20px 0;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 上传区域样式优化 */
:deep(.el-upload-dragger) {
  border: 2px dashed #d3d3d3;
  border-radius: 8px;
  transition: all 0.3s;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409EFF;
  background-color: #f5f9ff;
}

:deep(.el-icon--upload) {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

:deep(.el-upload__text) {
  color: #606266;
  font-size: 14px;
}

:deep(.el-upload__text em) {
  color: #409EFF;
  font-style: normal;
}

/* 上传结果样式 */
.result-card {
  margin-top: 20px;
  border-radius: 8px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.upload-results {
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.result-item:last-child {
  border-bottom: none;
}

.result-icon {
  font-size: 18px;
  margin-top: 2px;
  flex-shrink: 0;
}

.result-item.success .result-icon {
  color: #67c23a;
}

.result-item.error .result-icon {
  color: #f56c6c;
}

.result-item.warning .result-icon {
  color: #e6a23c;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.result-message {
  font-size: 14px;
  color: #303133;
  line-height: 1.4;
  word-break: break-word;
}

.result-item.success .result-message {
  color: #67c23a;
}

.result-item.error .result-message {
  color: #f56c6c;
}

.result-item.warning .result-message {
  color: #e6a23c;
}

/* 滚动条样式 */
.upload-results::-webkit-scrollbar {
  width: 4px;
}

.upload-results::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 2px;
}

.upload-results::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 2px;
}

.upload-results::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 文件信息面板样式 */
.file-info-panel {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.file-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.file-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.file-icon {
  flex-shrink: 0;
  font-size: 20px;
  color: #409eff;
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.file-size {
  color: #606266;
}

.file-type {
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.file-status {
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.status-ready {
  background: #f0f0f0;
  color: #606266;
}

.status-uploading {
  background: #e6f7ff;
  color: #1890ff;
}

.status-success {
  background: #f6ffed;
  color: #52c41a;
}

.status-error {
  background: #fff2f0;
  color: #ff4d4f;
}

.file-actions {
  flex-shrink: 0;
}

.remove-btn {
  color: #909399;
  font-size: 14px;
  padding: 4px;
}

.remove-btn:hover {
  color: #f56c6c;
  background-color: #fef0f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .file-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .file-meta {
    flex-wrap: wrap;
    gap: 8px;
  }

  .file-actions {
    align-self: flex-end;
  }
}
</style>
