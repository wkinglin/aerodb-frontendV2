<template>
  <div class="algorithm-page">
    <div class="page-header">
      <h2 class="page-title">算法执行</h2>
      <p class="page-subtitle">{{ algorithmInfo.name || '算法详情' }}</p>
    </div>

    <div class="content-layout">
      <!-- 左侧：输入参数 -->
      <el-card class="input-section" shadow="hover">
        <template #header>
          <div class="section-header">
            <h3><el-icon>
                <Setting />
              </el-icon>输入参数</h3>
          </div>
        </template>

        <el-form ref="inputFormRef" :model="form" label-position="top" class="input-form">
          <div class="variable-list">
            <div v-for="(item, index) in form.input" :key="index" class="variable-item">
              <div class="variable-header">
                <span class="variable-index">{{ index + 1 }}</span>
                <span class="variable-name">{{ item.name }}</span>
                <el-tag :type="getVariableTypeColor(item.valueType)" size="small">
                  {{ getVariableTypeText(item) }}
                </el-tag>
              </div>

              <el-form-item :label="form.inputSee[index]" :prop="`input.${index}.value`" class="variable-input">
                <el-input v-model="item.value" :placeholder="getInputPlaceholder(item)" clearable>
                  <template #suffix>
                    <el-tooltip v-if="item.description" :content="item.description">
                      <el-icon class="info-icon">
                        <InfoFilled />
                      </el-icon>
                    </el-tooltip>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item v-if="item.type == 2" label="数组维数" class="dimension-input">
                <el-input-number v-model="item.dimension" :min="1" :max="100" size="small" />
              </el-form-item>
            </div>
          </div>

          <el-alert title="提示" description="算法变量若为数组，请使用英文逗号隔开多个值" type="info" :closable="false" show-icon
            class="input-tip" />
        </el-form>
      </el-card>

      <!-- 右侧：算法详情 -->
      <div class="right-section">
        <el-card class="algorithm-details" shadow="hover">
          <template #header>
            <div class="section-header">
              <h3><el-icon>
                  <DocumentCopy />
                </el-icon>算法详情</h3>
            </div>
          </template>

          <el-form ref="detailFormRef" :model="form" label-position="top">
            <el-form-item label="算法描述">
              <el-input v-model="form.describe" type="textarea" :rows="4" placeholder="请输入算法描述" resize="vertical" />
            </el-form-item>

            <el-form-item label="算法内容">
              <el-input v-model="form.con" type="textarea" :rows="6" placeholder="请输入算法内容" resize="vertical"
                class="code-input" />
            </el-form-item>

            <el-form-item label="执行结果">
              <el-input v-model="form.output" type="textarea" :rows="4" placeholder="算法执行后将在此显示结果" readonly
                class="result-output" />
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="executeAlgorithm" :loading="isExecuting" size="large">
            <el-icon>
              <Play />
            </el-icon>
            {{ isExecuting ? '执行中...' : '运行算法' }}
          </el-button>

          <el-button type="success" @click="updateAlgorithm" :loading="isUpdating" size="large">
            <el-icon>
              <Edit />
            </el-icon>
            {{ isUpdating ? '保存中...' : '保存修改' }}
          </el-button>

          <el-button type="info" @click="openHistory" size="large">
            <el-icon>
              <Clock />
            </el-icon>
            执行历史
          </el-button>
        </div>
      </div>
    </div>

    <!-- 历史记录抽屉 -->
    <el-drawer v-model="drawer" title="算法执行历史" :direction="direction" size="70%">
      <el-table :data="tableData" stripe height="100%" class="history-table">
        <el-table-column prop="input" label="输入参数" min-width="200">
          <template #default="{ row }">
            <el-text class="input-text" truncated>{{ row.input }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="output" label="输出结果" min-width="200">
          <template #default="{ row }">
            <el-text class="output-text" truncated>{{ row.output }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="lastTime" label="执行时间" width="180" />
        <el-table-column prop="success" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.success === '成功' ? 'success' : 'danger'">
              {{ row.success }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="失败原因" min-width="150">
          <template #default="{ row }">
            <el-text v-if="row.reason" type="danger">{{ row.reason }}</el-text>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { useAlgorithmStore } from '../../store/algorithm'
import { useWebSocket } from '@/composables/useWebSocket'

// 组合式函数
const route = useRoute()
const algorithmStore = useAlgorithmStore()
const { sendCommand, setMessageHandler } = useWebSocket()

// 响应式数据
const form = reactive({
  input: [] as AlgorithmInput[],
  inputSee: [] as string[],
  con: '',
  output: '',
  describe: '',
})

// 类型定义
interface AlgorithmInput {
  name: string
  value: string | string[]
  valueType: 'int' | 'double' | string
  type: number // 1: 数字, 2: 数组
  dimension?: number
  description?: string
}

interface TableDataItem {
  input: string
  output: string
  lastTime: string
  success: string
  reason: string
}

interface AlgorithmInfo {
  id: number
  name: string
  formula: string
  describe: string
  input: string
}

// 状态管理
const algorithmInfo = ref<AlgorithmInfo>({
  id: 0,
  name: '',
  formula: '',
  describe: '',
  input: ''
})

const tableData = ref<TableDataItem[]>([])
const drawer = ref(false)
const direction = ref<'rtl' | 'ltr'>('rtl')
const algorithmId = ref(route.query.id as string)

// 加载状态
const isExecuting = ref(false)
const isUpdating = ref(false)
const isLoading = ref(true)

// 计算属性
const hasInputs = computed(() => form.input && form.input.length > 0)

// 生命周期
onMounted(() => {
  initializeComponent()
})

// 监听路由变化
watch(
  () => route.query.id,
  (newId) => {
    if (newId && newId !== algorithmId.value) {
      algorithmId.value = newId as string
      loadAlgorithmData()
    }
  },
  { immediate: true }
)

// 初始化组件
const initializeComponent = () => {
  setMessageHandler(handleWebSocketMessage)
  loadAlgorithmData()
}

// 加载算法数据
const loadAlgorithmData = () => {
  if (!algorithmId.value) {
    ElMessage.error('缺少算法ID参数')
    return
  }

  isLoading.value = true
  if (sendCommand('findAll')) {
    console.log('正在加载算法数据...')
  } else {
    ElMessage.error('网络连接异常，无法加载数据')
    isLoading.value = false
  }
}

// WebSocket消息处理
const handleWebSocketMessage = (msg: MessageEvent) => {
  try {
    if (msg.data === "修改算法成功") {
      isUpdating.value = false
      ElNotification.success({
        title: '保存成功',
        message: '算法修改已保存'
      })
      return
    }

    const data = JSON.parse(msg.data)
    const targetId = parseInt(algorithmId.value)
    const algorithm = data.find((item: any) => item.id === targetId)

    if (!algorithm) {
      ElMessage.error('未找到指定的算法')
      return
    }

    // 更新算法信息
    algorithmInfo.value = {
      id: algorithm.id,
      name: algorithm.name,
      formula: algorithm.formula,
      describe: algorithm.describe,
      input: algorithm.input
    }

    // 解析输入参数
    parseAlgorithmInputs(algorithm)

    // 处理算法内容（移除注释）
    form.con = removeComments(algorithm.formula)
    form.describe = algorithm.describe + "请根据提示输入变量的值"

    isLoading.value = false
    console.log('算法数据加载完成:', algorithmInfo.value)

  } catch (error) {
    console.error('解析算法数据失败:', error)
    ElMessage.error('数据格式错误')
    isLoading.value = false
  }
}

// 解析算法输入参数
const parseAlgorithmInputs = (algorithm: any) => {
  try {
    const inputs = JSON.parse(algorithm.input)

    // 处理数组类型的值
    form.input = inputs.map((item: any) => ({
      ...item,
      value: item.type === '2' && Array.isArray(item.value) && item.value.length > 1
        ? item.value.join(',')
        : item.value
    }))

    // 生成输入提示文本
    form.inputSee = form.input.map((item, index) => {
      const typeText = item.valueType === 'int' ? '(整数)' :
        item.valueType === 'double' ? '(实数)' : ''
      return `${index + 1}.算法变量的值 ${typeText}`
    })

  } catch (error) {
    console.error('解析输入参数失败:', error)
    form.input = []
    form.inputSee = []
  }
}

// 移除注释
const removeComments = (formula: string): string => {
  let result = formula
  while (result.startsWith('%')) {
    const endIndex = result.indexOf('\n')
    if (endIndex === -1) {
      result = ''
      break
    }
    result = result.substring(endIndex + 1).trimStart()
  }
  return result
}

// 执行算法
const executeAlgorithm = async () => {
  if (!validateInputs()) return

  isExecuting.value = true

  try {
    const payload = {
      id: algorithmInfo.value.id,
      describe: form.describe,
      formula: form.con,
      input: prepareInputData()
    }

    if (sendCommand('exec', payload)) {
      setMessageHandler(handleExecutionResult)
      console.log('算法执行请求已发送')
    } else {
      throw new Error('网络连接异常')
    }
  } catch (error) {
    console.error('执行算法失败:', error)
    ElMessage.error('执行失败，请重试')
    isExecuting.value = false
  }
}

// 验证输入
const validateInputs = (): boolean => {
  if (!hasInputs.value) {
    ElMessage.warning('请先配置算法输入参数')
    return false
  }

  for (const input of form.input) {
    if (!input.value || input.value.toString().trim() === '') {
      ElMessage.warning(`请填写参数 "${input.name}" 的值`)
      return false
    }
  }

  return true
}

// 准备输入数据
const prepareInputData = () => {
  return form.input.map(item => ({
    ...item,
    value: item.type === 2
      ? (typeof item.value === 'string' ? item.value.split(',') : item.value)
      : item.value
  }))
}

// 处理执行结果
const handleExecutionResult = (msg: MessageEvent) => {
  isExecuting.value = false

  try {
    const processedData = msg.data.replace(/\\n\\n\\n/g, ';').replace(/["\\n' ']/g, '')
    const result = JSON.parse(processedData)

    form.output = JSON.stringify(result.result, null, 2)

    // 更新store中的算法值
    if (result.R !== undefined) {
      algorithmStore.setAloValue({
        R: result.R,
        DR: 0,
        H: 0,
        Z: 0
      })
    }

    ElNotification.success({
      title: '执行完成',
      message: '算法执行成功'
    })

  } catch (error) {
    console.error('解析执行结果失败:', error)
    form.output = msg.data
    ElMessage.warning('算法执行完成，但结果格式异常')
  }
}

// 更新算法
const updateAlgorithm = async () => {
  isUpdating.value = true

  try {
    const payload = {
      id: algorithmInfo.value.id,
      formula: form.con,
      input: form.input,
      output: form.output
    }

    if (sendCommand('changeAloFormula', payload)) {
      console.log('算法更新请求已发送')
    } else {
      throw new Error('网络连接异常')
    }
  } catch (error) {
    console.error('更新算法失败:', error)
    ElMessage.error('保存失败，请重试')
    isUpdating.value = false
  }
}

// 打开历史记录
const openHistory = () => {
  const id = algorithmInfo.value.id
  if (sendCommand('findAllRecords', id.toString())) {
    setMessageHandler(handleHistoryData)
    drawer.value = true
  } else {
    ElMessage.error('无法获取历史记录')
  }
}

// 处理历史数据
const handleHistoryData = (msg: MessageEvent) => {
  try {
    const historyData = JSON.parse(msg.data)

    tableData.value = historyData.map((record: any) => ({
      input: formatHistoryInput(record.input),
      output: record.output || '-',
      lastTime: record.date || '-',
      success: record.success || '失败',
      reason: record.message || ''
    }))

    console.log('历史记录加载完成:', tableData.value.length, '条')
  } catch (error) {
    console.error('解析历史数据失败:', error)
    ElMessage.error('历史数据格式错误')
  }
}

// 格式化历史输入
const formatHistoryInput = (input: string): string => {
  if (input === 'no input') return 'No input'

  try {
    const parsed = JSON.parse(input)
    return Array.isArray(parsed)
      ? parsed.map(item => item.value).join(';')
      : input
  } catch {
    return input
  }
}

// 辅助方法
const getVariableTypeColor = (type: string) => {
  switch (type) {
    case 'int': return 'primary'
    case 'double': return 'success'
    default: return 'info'
  }
}

const getVariableTypeText = (item: AlgorithmInput) => {
  const typeText = item.valueType === 'int' ? '整数' :
    item.valueType === 'double' ? '实数' : '未知类型'
  const formatText = item.type === 2 ? '数组' : '单值'
  return `${typeText} | ${formatText}`
}

const getInputPlaceholder = (item: AlgorithmInput) => {
  return item.type === 2
    ? '请输入数组值，用逗号分隔 (如: 1,2,3)'
    : `请输入${item.valueType === 'int' ? '整数' : '数值'}`
}
</script>

<style scoped>
/* 页面容器 */
.algorithm-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 24px;
  font-family: "微软雅黑", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
}

/* 内容布局 */
.content-layout {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 24px;
  align-items: start;
}

/* 左侧输入区域 */
.input-section {
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.input-section:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
}

/* 右侧详情区域 */
.right-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.algorithm-details {
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.algorithm-details:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
}

/* 区域标题 */
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-header .el-icon {
  color: #409EFF;
  font-size: 20px;
}

/* 变量列表 */
.variable-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.variable-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
  transition: all 0.2s ease;
}

.variable-item:hover {
  background: #e3f2fd;
  border-left-color: #1976d2;
}

.variable-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.variable-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #409EFF;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.variable-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
}

/* 表单输入 */
.variable-input,
.dimension-input {
  margin-bottom: 0;
}

.input-tip {
  margin-top: 20px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(45deg, #e3f2fd 0%, #f3e5f5 100%);
}

/* 代码输入框 */
.code-input :deep(textarea) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  background: #2d3748;
  color: #e2e8f0;
  border: none;
}

.code-input :deep(.el-textarea__inner) {
  background: #2d3748 !important;
  color: #e2e8f0 !important;
  border: 1px solid #4a5568 !important;
}

/* 结果输出框 */
.result-output :deep(.el-textarea__inner) {
  background: #f7fafc;
  border: 2px dashed #cbd5e0;
  color: #2d3748;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.action-buttons .el-button {
  flex: 1;
  height: 48px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: none;
}

.action-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* 信息图标 */
.info-icon {
  color: #909399;
  cursor: pointer;
  transition: color 0.2s ease;
}

.info-icon:hover {
  color: #409EFF;
}

/* 历史表格 */
.history-table {
  margin-top: 16px;
}

.input-text,
.output-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .algorithm-page {
    padding: 16px;
  }

  .page-header {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    flex: none;
  }
}
</style>

<style>
/* 全局样式覆盖 */
.el-drawer {
  border-radius: 12px 0 0 12px;
}

.el-drawer__header {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 0;
}

.el-drawer__body {
  padding: 24px;
}

.el-card__header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.el-card__body {
  padding: 24px;
}

.el-form-item__label {
  font-weight: 600;
  color: #2c3e50;
}

.el-input__inner,
.el-textarea__inner {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.el-input__inner:focus,
.el-textarea__inner:focus {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.el-tag {
  border-radius: 12px;
  font-weight: 500;
}
</style>