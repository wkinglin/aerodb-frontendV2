<template>
    <div class="create-algorithm-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <h2 class="page-title">创建算法</h2>
            <p class="page-subtitle">定义算法参数、内容和执行逻辑</p>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-content">
            <!-- 操作栏 -->
            <div class="action-bar">
                <div class="action-group">
                    <el-button type="primary" @click="addVariable"
                        :disabled="form.inputs.length >= maxVariables" class="action-btn">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        新增变量
                    </el-button>
                    <el-button type="warning" @click="deleteVariable" :disabled="form.inputs.length <= 1"
                        class="action-btn">
                        <el-icon>
                            <Minus />
                        </el-icon>
                        删除变量
                    </el-button>
                </div>

                <div class="submit-group">
                    <el-button @click="resetForm" class="action-btn reset-btn">
                        <el-icon>
                            <RefreshLeft />
                        </el-icon>
                        重置表单
                    </el-button>
                    <el-button type="primary" @click="onSubmit" :loading="isSubmitting" :disabled="!canSubmit"
                        size="large" class="submit-btn">
                        <el-icon>
                            <Check />
                        </el-icon>
                        {{ isSubmitting ? '创建中...' : '创建算法' }}
                    </el-button>
                </div>
            </div>

            <!-- 表单区域 -->
            <el-card class="form-card" shadow="hover">
                <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="algorithm-form">
                    <!-- 基础信息 -->
                    <div class="form-section">
                        <div class="section-header">
                            <h3><el-icon>
                                    <Setting />
                                </el-icon>基础信息</h3>
                        </div>

                        <el-row :gutter="24">
                            <el-col :span="12">
                                <el-form-item label="算法名称" prop="name">
                                    <el-input v-model="form.name" placeholder="请输入算法名称" clearable show-word-limit
                                        maxlength="100" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="算法结果变量" prop="output">
                                    <el-input v-model="form.output" placeholder="请输入结果变量，多个变量用逗号分隔" clearable />
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-form-item label="算法描述" prop="description">
                            <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入算法的详细描述和用途"
                                show-word-limit maxlength="500" resize="vertical" />
                        </el-form-item>
                    </div>

                    <!-- 变量定义 -->
                    <div class="form-section">
                        <div class="section-header">
                            <h3><el-icon>
                                    <EditPen />
                                </el-icon>变量定义</h3>
                            <el-text type="info">已定义 {{ form.inputs.length }} / {{ maxVariables }} 个变量</el-text>
                        </div>

                        <div class="variables-container">
                            <div v-for="(input, index) in form.inputs" :key="input.key" class="variable-item">
                                <div class="variable-header">
                                    <span class="variable-index">{{ index + 1 }}</span>
                                    <h4 class="variable-title">变量 {{ index + 1 }}</h4>
                                    <el-tag :type="getVariableTagType(input)" size="small">
                                        {{ getVariableTypeText(input) }}
                                    </el-tag>
                                </div>

                                <el-row :gutter="20">
                                    <el-col :span="8">
                                        <el-form-item label="变量名称" :prop="`inputs.${index}.name`"
                                            :rules="variableNameRules">
                                            <el-input v-model="input.name" placeholder="请输入变量名称" clearable />
                                        </el-form-item>
                                    </el-col>

                                    <el-col :span="8">
                                        <el-form-item label="变量类型" :prop="`inputs.${index}.valueType`"
                                            :rules="variableTypeRules">
                                            <el-select v-model="input.valueType" placeholder="选择类型" style="width: 100%">
                                                <el-option v-for="option in valueTypeOptions" :key="option.value"
                                                    :label="option.label" :value="option.value" />
                                            </el-select>
                                        </el-form-item>
                                    </el-col>

                                    <el-col :span="8">
                                        <el-form-item label="数据结构" :prop="`inputs.${index}.type`"
                                            :rules="dataStructureRules">
                                            <el-radio-group v-model="input.type" class="type-radio-group">
                                                <el-radio :label="1" class="type-radio">单值</el-radio>
                                                <el-radio :label="2" class="type-radio">数组</el-radio>
                                            </el-radio-group>
                                        </el-form-item>
                                    </el-col>
                                </el-row>

                                <!-- 数组维度设置 -->
                                <div v-if="input.type === 2" class="array-config">
                                    <el-form-item label="数组维度个数">
                                        <el-input-number v-model="input.dimension" :min="1" :max="1000"
                                            placeholder="设置数组维度" style="width: 200px" />
                                        <el-text type="info" style="margin-left: 12px">
                                            数组将包含 {{ input.dimension || 0 }} 个{{
                                                input.valueType === 'int' ? '整数' : input.valueType === 'double' ? '浮点数' :
                                                    '维度'
                                            }}
                                        </el-text>
                                    </el-form-item>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 算法内容 -->
                    <div class="form-section">
                        <div class="section-header">
                            <h3><el-icon>
                                    <DocumentCopy />
                                </el-icon>算法内容</h3>
                        </div>

                        <el-form-item label="算法代码" prop="context">
                            <el-input v-model="form.context" type="textarea" :rows="8" placeholder="请输入算法的具体实现代码"
                                class="code-editor" show-word-limit maxlength="10000" resize="vertical" />
                        </el-form-item>

                        <el-alert title="代码编写提示" description="请确保代码语法正确，变量名与上面定义的变量名一致，结果变量已正确定义" type="info"
                            :closable="false" show-icon class="code-tip" />
                    </div>
                </el-form>
            </el-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { useRouter } from 'vue-router'
import { useWebSocket } from '@/composables/useWebSocket'

const router = useRouter()
const { isConnected, sendCommand, setMessageHandler } = useWebSocket()

// 类型定义
interface FormInput {
    key: number
    name: string
    value: string
    valueType: 'int' | 'double' | ''
    type: 1 | 2 // 1: 单值, 2: 数组
    dimension: number
}

interface FormData {
    name: string
    inputs: FormInput[]
    context: string
    description: string
    output: string
}

// 常量
const maxVariables = 10

// 下拉选项
const valueTypeOptions = [
    { label: '整数 (int)', value: 'int' },
    { label: '浮点数 (double)', value: 'double' }
]

// 响应式数据
const form = reactive<FormData>({
    name: '',
    inputs: [createNewInput()],
    context: '',
    description: '',
    output: ''
})

// 创建新输入项
function createNewInput(): FormInput {
    return {
        key: Date.now() + Math.random(),
        name: '',
        value: '',
        valueType: '',
        type: 1,
        dimension: 1
    }
}

// 表单验证规则
const rules = reactive({
    name: [
        { required: true, message: '请输入算法名称', trigger: 'blur' },
        { min: 2, max: 100, message: '算法名称长度在2到100个字符', trigger: 'blur' }
    ],
    context: [
        { required: true, message: '请输入算法内容', trigger: 'blur' },
        { min: 1, message: '算法内容不能少于1个字符', trigger: 'blur' }
    ],
    description: [
        { required: true, message: '请输入算法描述', trigger: 'blur' },
        { min: 3, max: 500, message: '描述长度在3到500个字符', trigger: 'blur' }
    ],
    output: [
        { required: true, message: '请输入结果变量', trigger: 'blur' }
    ]
})

const variableNameRules = [
    { required: true, message: '请输入变量名称', trigger: 'blur' },
    { min: 1, max: 50, message: '变量名称长度在1到50个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '变量名只能包含字母、数字和下划线，且不能以数字开头', trigger: 'blur' }
]

const variableTypeRules = [
    { required: true, message: '请选择变量类型', trigger: 'change' }
]

const dataStructureRules = [
    { required: true, message: '请选择数据结构', trigger: 'change' }
]

// 表单引用
const formRef = ref()

// 状态管理
const isSubmitting = ref(false)

// 计算属性
const canSubmit = computed(() => {
    return !isSubmitting.value && isConnected.value &&
        form.name.trim() && form.context.trim() && form.description.trim()
})

const hasValidInputs = computed(() => {
    return form.inputs.every((input: FormInput) =>
        input.name.trim() && input.valueType && input.type
    )
})

// 组件生命周期
onMounted(() => {
    initializeComponent()
})

const initializeComponent = () => {
    setMessageHandler(handleMessage)
    console.log('算法创建页面初始化完成')
}

// WebSocket消息处理
const handleMessage = (msg: MessageEvent) => {
    isSubmitting.value = false

    try {
        if (msg.data === '算法创建成功') {
            ElNotification.success({
                title: '创建成功',
                message: '算法已成功创建并保存'
            })
            setTimeout(() => {
                router.push({ path: '/algTable' })
            }, 1500)
            return
        }

        const data = JSON.parse(msg.data)
        console.log('收到服务器响应:', data)

        if (data.success) {
            ElNotification.success({
                title: '创建成功',
                message: data.message || '算法创建成功'
            })
            router.push({ path: '/algTable' })
        } else {
            ElMessage.error(data.message || '算法创建失败')
        }
    } catch (error) {
        console.error('解析服务器响应失败:', error)
        ElMessage.warning('算法创建请求已发送，请稍后查看结果')
    }
}

// 变量管理
const addVariable = () => {
    if (form.inputs.length >= maxVariables) {
        ElMessage.warning(`变量数量不能超过${maxVariables}个`)
        return
    }

    form.inputs.push(createNewInput())
    ElMessage.success('已添加新变量')
}

const deleteVariable = () => {
    if (form.inputs.length <= 1) {
        ElMessage.warning('至少需要保留一个变量')
        return
    }
    form.inputs.pop()
    ElMessage.success('已删除变量')
}

// 辅助方法
const getVariableTagType = (input: FormInput) => {
    if (!input.valueType) return 'info'
    return input.valueType === 'int' ? 'primary' : 'success'
}

const getVariableTypeText = (input: FormInput) => {
    if (!input.valueType) return '未设置'
    const typeText = input.valueType === 'int' ? '整数' : '浮点数'
    const structText = input.type === 1 ? '单值' : '数组'
    return `${typeText} | ${structText}`
}

// 表单提交
const onSubmit = async () => {
    if (!canSubmit.value) {
        ElMessage.error('请检查网络连接状态')
        return
    }

    if (!hasValidInputs.value) {
        ElMessage.error('请完善所有变量信息')
        return
    }

    try {
        const valid = await formRef.value?.validate()
        if (!valid) {
            ElMessage.error('请完善表单信息')
            return
        }

        isSubmitting.value = true

        // 构造算法数据
        const algorithm = {
            name: form.name.trim(),
            path: '',
            inputs: form.inputs.map((input: FormInput) => ({
                name: input.name.trim(),
                value: input.value || '0',
                type: String(input.type),
                valueType: input.valueType,
                dimension: input.type === 2 ? Math.max(1, input.dimension) : 0
            })),
            output: form.output
                ? form.output.split(',').map((item: string) => item.trim()).filter(Boolean)
                : [],
            formula: form.context.trim(),
            describe: form.description.trim()
        }

        // 发送创建请求
        if (sendCommand('createAlo', algorithm)) {
            // ElMessage.info('正在创建算法，请稍候...')
            ElMessage.success('成功提交算法')
        } else {
            throw new Error('网络连接异常')
        }
    } catch (error) {
        console.error('提交算法失败:', error)
        ElMessage.error('提交失败，请重试')
    } finally {
        isSubmitting.value = false
    }
}

// 重置表单
const resetForm = () => {
    try {
        formRef.value?.resetFields()

        // 重置为初始状态
        Object.assign(form, {
            name: '',
            inputs: [createNewInput()],
            context: '',
            description: '',
            output: ''
        })

        ElMessage.success('表单已重置')
    } catch (error) {
        console.error('重置表单失败:', error)
    }
}
</script>



<style scoped>
/* 页面容器 */
.create-algorithm-page {
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

/* 主要内容区 */
.main-content {
    max-width: 1200px;
    margin: 0 auto;
}

/* 操作栏 */
.action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.action-group,
.submit-group {
    display: flex;
    gap: 12px;
    align-items: center;
}

.action-btn {
    height: 40px;
    padding: 0 20px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.submit-btn {
    height: 48px;
    padding: 0 32px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 8px;
}

.reset-btn {
    color: #606266;
    border-color: #dcdfe6;
}

/* 表单卡片 */
.form-card {
    border-radius: 12px;
    border: none;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.algorithm-form {
    padding: 20px;
}

/* 表单分区 */
.form-section {
    margin-bottom: 40px;
    padding: 24px;
    background: #f8f9fa;
    border-radius: 12px;
    border-left: 4px solid #409EFF;
}

.form-section:last-child {
    margin-bottom: 0;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
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

/* 变量容器 */
.variables-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.variable-item {
    padding: 24px;
    background: white;
    border-radius: 12px;
    border: 2px solid #e4e7ed;
    transition: all 0.3s ease;
}

.variable-item:hover {
    border-color: #409EFF;
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
}

.variable-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
}

.variable-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
    color: white;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 600;
}

.variable-title {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    flex: 1;
}

/* 数组配置 */
.array-config {
    margin-top: 16px;
    padding: 16px;
    background: #f0f9ff;
    border-radius: 8px;
    border-left: 3px solid #409EFF;
}

/* 类型单选框 */
.type-radio-group {
    display: flex;
    gap: 16px;
}

.type-radio {
    margin-right: 0;
}

/* 代码编辑器 */
.code-editor :deep(.el-textarea__inner) {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.6;
    background: #2d3748;
    color: #e2e8f0;
    border: 2px solid #4a5568;
    border-radius: 8px;
}

.code-editor :deep(.el-textarea__inner):focus {
    border-color: #409EFF;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.code-tip {
    margin-top: 16px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(45deg, #e3f2fd 0%, #f3e5f5 100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .create-algorithm-page {
        padding: 16px;
    }

    .page-header {
        padding: 16px;
    }

    .page-title {
        font-size: 24px;
    }

    .action-bar {
        flex-direction: column;
        gap: 16px;
    }

    .action-group,
    .submit-group {
        width: 100%;
        justify-content: center;
    }

    .algorithm-form {
        padding: 16px;
    }

    .form-section {
        padding: 16px;
    }
}
</style>

<style>
/* 全局样式覆盖 */
.el-form-item__label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 14px;
}

.el-input__inner,
.el-textarea__inner {
    border-radius: 8px;
    transition: all 0.3s ease;
}

.el-input__inner:focus,
.el-textarea__inner:focus {
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.el-select {
    width: 100%;
}

.el-radio {
    margin-right: 20px;
}

.el-radio__label {
    font-weight: 500;
}

.el-tag {
    border-radius: 12px;
    font-weight: 500;
}

.el-alert {
    border-radius: 8px;
}
</style>