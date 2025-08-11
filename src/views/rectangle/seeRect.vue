<template>
    <div class="rect-container">
        <el-card class="main-card">
            <template #header>
                <div class="card-header">
                    <div class="header-title">
                        <el-icon class="title-icon">
                            <Document />
                        </el-icon>
                        <span class="title-text">框图管理</span>
                    </div>
                    <el-button type="primary" :icon="Plus" @click="dialogVisible = true" class="create-btn">
                        新建框图
                    </el-button>
                </div>
            </template>

            <div class="content-area">
                <div v-if="rectList.length === 0" class="empty-state">
                    <el-empty description="暂无框图数据">
                        <el-button type="primary" :icon="Plus" @click="dialogVisible = true">
                            创建第一个框图
                        </el-button>
                    </el-empty>
                </div>

                <div v-else class="rect-list">
                    <div v-for="(item, index) in rectList" :key="item.id || index" class="rect-item">
                        <div class="rect-info">
                            <div class="rect-title">
                                <el-icon class="rect-icon">
                                    <Document />
                                </el-icon>
                                {{ item.name }}
                            </div>
                            <div class="rect-meta">
                                <span class="meta-item">
                                    <el-icon>
                                        <Calendar />
                                    </el-icon>
                                    创建时间: {{ formatDate(new Date()) }}
                                </span>
                                <span class="meta-item" v-if="item.message">
                                    <el-icon>
                                        <ChatLineSquare />
                                    </el-icon>
                                    备注: {{ item.message }}
                                </span>
                            </div>
                        </div>
                        <div class="rect-actions">
                            <el-button type="primary" :icon="View" @click="seePicture(index)" class="action-btn">
                                查看
                            </el-button>
                            <el-button type="warning" :icon="Edit" @click="editPicture(index)" class="action-btn">
                                编辑
                            </el-button>
                            <el-button type="danger" :icon="Delete" @click="deletePicture(index)" class="action-btn">
                                删除
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </el-card>

        <!-- 新建框图对话框 -->
        <el-dialog title="新建框图" v-model="dialogVisible" width="500px" center :before-close="handleClose">
            <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
                <el-form-item label="框图名称" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入框图名称" clearable maxlength="50" show-word-limit />
                </el-form-item>
                <el-form-item label="框图备注" prop="message">
                    <el-input type="textarea" v-model="formData.message" placeholder="请输入框图备注（可选）" :rows="3" clearable
                        maxlength="200" show-word-limit />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="cancelCreate">取 消</el-button>
                    <el-button type="primary" @click="submitCreate" :loading="creating">
                        {{ creating ? '创建中...' : '确 定' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 编辑框图对话框 -->
        <el-dialog title="编辑框图" v-model="editDialogVisible" width="500px" center :before-close="handleEditClose">
            <el-form ref="editFormRef" :model="editFormData" :rules="rules" label-width="80px">
                <el-form-item label="框图名称" prop="name">
                    <el-input v-model="editFormData.name" placeholder="请输入框图名称" clearable maxlength="50"
                        show-word-limit />
                </el-form-item>
                <el-form-item label="框图备注" prop="message">
                    <el-input type="textarea" v-model="editFormData.message" placeholder="请输入框图备注（可选）" :rows="3"
                        clearable maxlength="200" show-word-limit />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="cancelEdit">取 消</el-button>
                    <el-button type="primary" @click="submitEdit" :loading="updating">
                        {{ updating ? '更新中...' : '确 定' }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onActivated } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    Plus,
    Delete,
    Edit,
    View,
    Document,
    Calendar,
    ChatLineSquare
} from '@element-plus/icons-vue'
import { useWebSocket } from '@/composables/useWebSocket'

// 接口定义
interface RectItem {
    id: string | number
    name: string
    message: string
    sysId?: string | number
    proId?: string | number
}

interface FormData {
    name: string
    message: string
}

// 响应式数据
const rectList = ref<RectItem[]>([])
const dialogVisible = ref(false)
const editDialogVisible = ref(false)
const creating = ref(false)
const updating = ref(false)
const editingIndex = ref(-1)

// 表单数据
const formData = reactive<FormData>({
    name: '',
    message: ''
})

const editFormData = reactive<FormData>({
    name: '',
    message: ''
})

// 表单验证规则
const rules = reactive({
    name: [
        { required: true, message: '请输入框图名称', trigger: 'blur' },
        { min: 1, max: 50, message: '名称长度在1到50个字符', trigger: 'blur' },
        { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5\s]+$/, message: '只能包含字母、数字、下划线、中文和空格', trigger: 'blur' }
    ],
    message: [
        { max: 200, message: '备注长度不能超过200个字符', trigger: 'blur' }
    ]
})

// 获取实例
const router = useRouter()
const formRef = ref()
const editFormRef = ref()
const { sendCommand, setMessageHandler } = useWebSocket()

// 生命周期
onActivated(() => {
    setMessageHandler(getMessage)
    sendCommand("findAllGraph")
})

// 接收WebSocket消息
const getMessage = (msg: MessageEvent) => {
    try {
        const parsedData = JSON.parse(msg.data)
        if (Array.isArray(parsedData)) {
            rectList.value = parsedData.map(item => ({
                id: item.id,
                name: item.name || '未命名',
                message: item.message || '',
                sysId: item.sysId,
                proId: item.proId
            }))
            console.log('更新框图列表:', rectList.value)
        }
    } catch (error) {
        console.error('解析消息失败:', error)
    } finally {
        creating.value = false
        updating.value = false
    }
}

// 业务方法
const seePicture = (index: number) => {
    const item = rectList.value[index]
    if (!item) {
        ElMessage.error('框图不存在')
        return
    }

    // 路由跳转，通过query参数传递数据
    router.push({
        path: '/rectangle',
        query: {
            pictureName: item.name,
            id: item.id.toString(),
            isSystem: (item.proId === -1).toString(),
            sysId: item.sysId?.toString() || '',
            proId: item.proId?.toString() || ''
        }
    })
}

const editPicture = (index: number) => {
    const item = rectList.value[index]
    if (!item) {
        ElMessage.error('框图不存在')
        return
    }

    editingIndex.value = index
    editFormData.name = item.name
    editFormData.message = item.message
    editDialogVisible.value = true
}

const deletePicture = (index: number) => {
    const item = rectList.value[index]
    if (!item) {
        ElMessage.error('框图不存在')
        return
    }

    ElMessageBox.confirm(`确定要删除框图 "${item.name}" 吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        sendCommand("deleteGraph")
        sendCommand(item.id.toString())
    }).catch(() => {
        // 用户取消删除
    })
}

// 表单处理
const submitCreate = async () => {
    if (!formRef.value) return

    try {
        const valid = await formRef.value.validate()
        if (!valid) return

        // 检查名称是否重复
        const exists = rectList.value.some(item => item.name === formData.name.trim())
        if (exists) {
            ElMessage.error('框图名称已存在')
            return
        }

        creating.value = true
        sendCommand("addGraph")
        sendCommand(JSON.stringify({
            name: formData.name.trim(),
            message: formData.message.trim()
        }))

        // 关闭对话框并重置表单
        dialogVisible.value = false
        resetForm()
    } catch (error) {
        console.error('创建失败:', error)
        creating.value = false
    }
}

const submitEdit = async () => {
    if (!editFormRef.value || editingIndex.value === -1) return

    try {
        const valid = await editFormRef.value.validate()
        if (!valid) return

        const item = rectList.value[editingIndex.value]
        if (!item) {
            ElMessage.error('框图不存在')
            return
        }

        // 检查名称是否重复（排除当前编辑的项）
        const exists = rectList.value.some((existItem, idx) =>
            existItem.name === editFormData.name.trim() && idx !== editingIndex.value
        )
        if (exists) {
            ElMessage.error('框图名称已存在')
            return
        }

        updating.value = true
        sendCommand("updateGraph")
        sendCommand(JSON.stringify({
            id: item.id,
            name: editFormData.name.trim(),
            message: editFormData.message.trim()
        }))

        // 关闭对话框并重置表单
        editDialogVisible.value = false
        resetEditForm()
    } catch (error) {
        console.error('更新失败:', error)
        updating.value = false
    }
}

const cancelCreate = () => {
    dialogVisible.value = false
    resetForm()
}

const cancelEdit = () => {
    editDialogVisible.value = false
    resetEditForm()
}

const resetForm = () => {
    formData.name = ''
    formData.message = ''
    formRef.value?.resetFields()
}

const resetEditForm = () => {
    editFormData.name = ''
    editFormData.message = ''
    editingIndex.value = -1
    editFormRef.value?.resetFields()
}

const handleClose = (done: any) => {
    if (formData.name || formData.message) {
        ElMessageBox.confirm('确认关闭？未保存的数据将丢失。')
            .then(() => {
                resetForm()
                done()
            })
            .catch(() => { })
    } else {
        done()
    }
}

const handleEditClose = (done: any) => {
    if (editFormData.name || editFormData.message) {
        ElMessageBox.confirm('确认关闭？未保存的数据将丢失。')
            .then(() => {
                resetEditForm()
                done()
            })
            .catch(() => { })
    } else {
        done()
    }
}

// 工具方法
const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}
</script>

<style scoped>
/* 主容器样式 */
.rect-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    padding: 20px;
    font-family: "微软雅黑", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.main-card {
    max-width: 1200px;
    margin: 0 auto;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
    border: 1px solid #dbeafe;
    overflow: hidden;
    background: white;
}

/* 卡片头部样式 */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #1e40af;
    font-weight: 600;
    font-size: 18px;
}

.title-icon {
    font-size: 24px;
    color: #3b82f6;
}

.title-text {
    font-size: 18px;
    font-weight: 600;
}

.create-btn {
    border-radius: 8px;
    font-weight: 500;
    padding: 12px 24px;
    transition: all 0.3s ease;
}

.create-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 内容区域样式 */
.content-area {
    min-height: 400px;
    padding: 20px 0;
}

.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
}

/* 框图列表样式 */
.rect-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.rect-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #f0f0f0;
    transition: all 0.3s ease;
}

.rect-item:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
    border-color: #409eff;
}

.rect-info {
    flex: 1;
    min-width: 0;
}

.rect-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.rect-icon {
    color: #409eff;
    font-size: 20px;
}

.rect-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 14px;
    color: #909399;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.meta-item .el-icon {
    font-size: 14px;
}

/* 操作按钮样式 */
.rect-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.action-btn {
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.action-btn:hover {
    transform: translateY(-1px);
}

/* 对话框样式 */
:deep(.el-dialog__header) {
    padding: 24px 24px 0;
    border-bottom: 1px solid #f0f0f0;
}

:deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
}

:deep(.el-dialog__body) {
    padding: 24px;
}

:deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
}

.dialog-footer {
    text-align: right;
    padding: 16px 24px 24px;
}

.dialog-footer .el-button {
    margin-left: 12px;
    border-radius: 6px;
    font-weight: 500;
    padding: 10px 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .rect-container {
        padding: 12px;
    }

    .card-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }

    .header-title {
        justify-content: center;
    }

    .create-btn {
        align-self: center;
    }

    .rect-item {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }

    .rect-actions {
        justify-content: center;
        flex-wrap: wrap;
    }

    .action-btn {
        flex: 1;
        min-width: 80px;
    }

    .rect-meta {
        flex-direction: column;
        gap: 8px;
    }
}

@media (max-width: 480px) {
    .rect-actions {
        gap: 4px;
    }

    .action-btn {
        font-size: 12px;
        padding: 8px 12px;
    }

    .header-title {
        font-size: 16px;
    }

    .rect-title {
        font-size: 16px;
    }
}

/* 动画效果 */
.rect-item {
    animation: fadeInUp 0.3s ease forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 加载状态 */
.el-button.is-loading {
    pointer-events: none;
}
</style>