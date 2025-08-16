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
                            <!-- <el-button type="warning" :icon="Edit" @click="editPicture(index)" class="action-btn">
                                编辑
                            </el-button> -->
                            <el-button type="danger" :icon="Delete" @click="deletePicture(index)" class="action-btn">
                                删除
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </el-card>

        <!-- 新建框图对话框 -->
        <el-dialog title="新建框图" v-model="dialogVisible" width="600px" center :before-close="handleClose"
            class="create-rect-dialog">
            <el-form ref="formRef" :model="createRectForm" label-width="100px" class="create-form">
                <el-form-item label="框图所属系统" prop="sysId">
                    <el-select v-model="createRectForm.sysId" placeholder="请选择框图所属系统" @change="handleSysChange"
                        style="width: 100%;">
                        <el-option v-for="item in validSystemList" :key="item.id" :label="item.name" :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="框图所属产品" prop="proId" v-if="createRectForm.sysId">
                    <el-select v-model="createRectForm.proId" placeholder="请选择框图所属产品" style="width: 100%;">
                        <el-option v-for="item in validProductList" :key="item.id" :label="item.name"
                            :value="item.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="框图备注" prop="message">
                    <el-input type="textarea" v-model="createRectForm.message" placeholder="请输入框图备注（可选）" :rows="4"
                        clearable maxlength="200" show-word-limit style="width: 100%;" />
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
            <el-form ref="editFormRef" :model="editFormData" label-width="80px">
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
import { ref, reactive, onActivated, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    Plus,
    Delete,
    View,
    Document,
    Calendar,
    ChatLineSquare
} from '@element-plus/icons-vue'
import { useWebSocket } from '@/composables/useWebSocket'

import { System, Pro, } from './nodes.ts'
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

const editFormData = reactive<FormData>({
    name: '',
    message: ''
})

const createRectForm = ref({
    name: '',
    sysId: '',
    proId: '',
    message: ''
})

const systemList = ref<System[]>([])
const productList = ref<Pro[]>([])

// 计算属性：过滤有效的系统和产品数据
const validSystemList = computed(() => {
    return systemList.value.filter(item =>
        item &&
        typeof item === 'object' &&
        item.id !== undefined &&
        item.id !== null &&
        item.name !== undefined &&
        item.name !== null &&
        item.name !== ''
    )
})

const validProductList = computed(() => {
    return productList.value.filter(item =>
        item &&
        typeof item === 'object' &&
        item.id !== undefined &&
        item.id !== null &&
        item.name !== undefined &&
        item.name !== null &&
        item.name !== ''
    )
})

// 获取实例
const router = useRouter()
const formRef = ref()
const editFormRef = ref()
const { sendCommand, setMessageHandler } = useWebSocket()

// 生命周期
onActivated(() => {
    // 先获取系统数据
    setMessageHandler(getData)
    sendCommand("systemAll")

    // 延迟获取框图列表
    setTimeout(() => {
        setMessageHandler(getMessage)
        sendCommand("findAllGraph")
    }, 200)
})

// 接收WebSocket消息
const getMessage = (msg: MessageEvent) => {
    if (msg.data === "delete success") {
        ElMessage({
            message: '删除成功',
            type: 'success'
        });
        return
    }

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

        // 获取系统数据，但不覆盖当前的消息处理器
        if (systemList.value.length === 0) {
            setMessageHandler(getData)
            sendCommand("systemAll")
        }
    }
}

const getData = (msg: MessageEvent) => {
    // console.log('接收到系统数据:', msg.data)
    if (msg.data === "delete success") {
        ElMessage({
            message: '删除成功',
            type: 'success'
        });
        // 刷新框图列表
        setMessageHandler(getMessage)
        sendCommand("findAllGraph")
        return
    }

    try {
        const parsedData = JSON.parse(msg.data)
        systemList.value = Array.isArray(parsedData) ? parsedData : []

        // 恢复框图列表消息处理器
        setMessageHandler(getMessage)
    } catch (error) {
        console.error('解析系统数据失败:', error)
        systemList.value = []
        // 恢复框图列表消息处理器
        setMessageHandler(getMessage)
    }
}

const handleSysChange = (value: string) => {
    const system = systemList.value.find((item: System) => item.id === Number(value))
    productList.value = system?.pro || []

    // 重置产品选择，因为系统变了，之前选择的产品可能不再有效
    createRectForm.value.proId = ''
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
            sysId: item.sysId?.toString() || '-1',
            proId: item.proId?.toString() || '-1'
        }
    })
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
        rectList.value = rectList.value.filter((rect: RectItem) => rect.id != item.id)
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

        const pro = productList.value.find((item: Pro) => item.id === Number(createRectForm.value.proId))
        const sys = systemList.value.find((item: System) => item.id === Number(createRectForm.value.sysId))
        createRectForm.value.name = pro ? pro.name : sys?.name || ''

        // 检查名称是否重复
        const exists = rectList.value.some((item: RectItem) => item.name === createRectForm.value.name.trim())
        if (exists) {
            ElMessage.error('框图名称已存在')
            return
        }

        creating.value = true
        sendCommand("addGraph")
        sendCommand(JSON.stringify({
            name: createRectForm.value.name.trim(),
            message: createRectForm.value.message.trim(),
            sysId: createRectForm.value.sysId || -1,
            proId: createRectForm.value.proId || -1
        }))

        // 关闭对话框并重置表单
        ElMessage({
            message: '创建成功',
            type: 'success'
        });

        dialogVisible.value = false
        resetForm()

        // 刷新框图列表
        setTimeout(() => {
            setMessageHandler(getMessage)
            sendCommand("findAllGraph")
        }, 500) // 延迟一点确保后端处理完成
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
        const exists = rectList.value.some((existItem: RectItem, idx: number) =>
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

        // 刷新框图列表
        setMessageHandler(getMessage)
        sendCommand("findAllGraph")

    } catch (error) {
        console.error('更新失败:', error)
        updating.value = false
    }
}

const cancelCreate = () => {
    dialogVisible.value = false
    // 取消时完全重置表单
    createRectForm.value = {
        name: '',
        sysId: '',
        proId: '',
        message: ''
    }
    productList.value = [] // 清空产品列表
}

const cancelEdit = () => {
    editDialogVisible.value = false
    resetEditForm()
}

const resetForm = () => {
    // 保留系统选择，只清空产品和备注
    const currentSysId = createRectForm.value.sysId
    createRectForm.value = {
        name: '',
        sysId: currentSysId, // 保留当前选择的系统
        proId: '',
        message: ''
    }
}

const resetEditForm = () => {
    editFormData.name = ''
    editFormData.message = ''
    editingIndex.value = -1
}

const handleClose = (done: any) => {
    ElMessageBox.confirm('确认关闭？未保存的数据将丢失。')
        .then(() => {
            // 完全重置表单
            createRectForm.value = {
                name: '',
                sysId: '',
                proId: '',
                message: ''
            }
            productList.value = [] // 清空产品列表
            done()
        })
        .catch(() => { })
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

/* 新建框图对话框样式 */
.create-rect-dialog .el-dialog__body {
    padding: 20px 24px;
}

.create-form .el-form-item {
    margin-bottom: 20px;
}

.create-form .el-form-item__label {
    font-weight: 500;
    color: #606266;
}

.create-form .el-select,
.create-form .el-input {
    width: 100%;
}

.create-form .el-textarea__inner {
    resize: vertical;
    min-height: 80px;
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