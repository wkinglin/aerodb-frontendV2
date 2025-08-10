<template>
  <div class="new-table-container">
    <el-card class="box-card">
      <template #header>
        <div class="header-content">
          <div class="header-left">
            <!-- <el-button type="primary" @click="creatTables()" :icon="Plus" size="large">
              新建数据库
            </el-button> -->
          </div>
          <div class="header-right">
            <div class="search-container">
              <el-input v-model="search" placeholder="请输入数据库名称" class="search-input" clearable
                @keyup.enter="searchTables">
                <template #prefix>
                  <el-icon>
                    <Search />
                  </el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="searchTables()" :icon="Search">
                搜索
              </el-button>
              <el-button type="info" plain @click="seeAll()" :icon="Refresh">
                重置
              </el-button>
            </div>
          </div>
        </div>
      </template>
      <div class="table-list">
        <div v-if="tableData.length === 0" class="empty-state">
          <el-empty description="暂无数据库">
            <el-button type="primary" @click="creatTables()" :icon="Plus">
              创建第一个数据库
            </el-button>
          </el-empty>
        </div>
        <div v-else>
          <div v-for="(item, index) in tableData" :key="`table-${index}`" class="table-item">
            <div class="table-info">
              <div class="table-name">
                <el-icon class="table-icon">
                  <List />
                </el-icon>
                {{ item.name }}
              </div>
              <div class="table-meta">
                创建时间: {{ formatDate(new Date()) }}
              </div>
            </div>
            <div class="table-actions">
              <el-button type="primary" @click="watchTables(index)" :icon="View">
                查看
              </el-button>
              <el-button type="warning" @click="changeTablesName(index)" :icon="Edit">
                重命名
              </el-button>
              <el-button type="danger" @click="deleteRows(index)" :icon="Delete">
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog title="重命名数据库" v-model="dialogVisible" width="400px" :before-close="handleClose" center>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="数据库名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入新的数据库名称" clearable maxlength="50" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onSubmitName()">确定</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  List,
  View,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import globalWebSocket from '@/global'

// 响应式数据
const tablenumbers = ref(0)
const search = ref('')
const dialogVisible = ref(false)
const index = ref(0)
const tableData = ref([] as any[])
const formRef = ref()

// 表单数据
const formData = reactive({
  name: ''
})

// 表单验证规则
const rules = reactive({
  name: [
    { required: true, message: '数据库名称不能为空', trigger: 'blur' },
    { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '只能包含字母、数字、下划线和中文', trigger: 'blur' }
  ]
})

// 获取路由实例
const router = useRouter()

// 初始化socket
const socket = ref<WebSocket | null>(null)

// 组件挂载时初始化
onActivated(() => {
  init()
  send("getAllUserTables")
})

// 发送数据函数
const send = (ms: string) => {
  if (socket.value) {
    socket.value.send(ms);
  }
}

const init = () => {
  // 实例化socket
  socket.value = globalWebSocket.ws as WebSocket;
  // 监听socket消息
  if (socket.value) {
    socket.value.onmessage = getMessage
  }
}

//接收数据
const getMessage = (msg: any) => {
  try {
    // 安全解析JSON数据，避免使用eval
    const data = JSON.parse(msg.data)
    const arr = Array.isArray(data) ? data : []
    
    // 直接设置tableData，不使用store缓存
    const newTableData = arr.map((name: string, index: number) => ({
      id: `table_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 11)}`,
      name: name,
      valid: false
    }))
    
    tableData.value = newTableData
    originalTableData.value = [...newTableData] // 保存原始数据用于搜索
  } catch (error) {
    console.error('解析WebSocket消息失败:', error)
    ElMessage.error('数据解析失败')
  }
}

const creatTables = () => {
  // 直接发送创建表格请求，不使用store
  tablenumbers.value++
  const newTable = {
    id: `table_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    name: `表格${tablenumbers.value}`,
    valid: true
  }
  tableData.value.push(newTable)
}


const watchTables = (index: number) => {
  const table = tableData.value[index]
  if (table) {
    router.push({
      path: `table`,
      query: {
        table_id: table.id,
        table_name: table.name // 额外传递名称用于显示
      }
    })
  } else {
    ElMessage.error('表格不存在')
  }
}

const changeTablesName = (idx: number) => {
  const table = tableData.value[idx]
  if (!table) {
    ElMessage.error('表格不存在')
    return
  }
  
  dialogVisible.value = true
  index.value = idx
  formData.name = table.name
}

const onSubmitName = () => {
  if (!formRef.value) return

  formRef.value.validate((valid: boolean) => {
    if (valid) {
      // 检查名称是否已存在（在当前tableData中检查）
      const exists = tableData.value.some((table, idx) =>
        table.name === formData.name && idx !== index.value
      )

      if (exists) {
        ElMessage.error('数据库名称已存在')
        return
      }

      const currentTable = tableData.value[index.value]
      if (!currentTable) {
        ElMessage.error('表格不存在')
        return
      }

      send("changeTableName")
      const payload = {
        oldname: currentTable.name,
        newname: formData.name,
      }
      send(JSON.stringify(payload))
      
      // 直接更新本地数据
      currentTable.name = formData.name

      ElMessage.success('重命名成功')
      dialogVisible.value = false
      formData.name = ''
    }
  })
}

// 原始完整数据（用于搜索重置）
const originalTableData = ref([] as any[])

const searchTables = () => {
  if (!search.value.trim()) {
    tableData.value = [...originalTableData.value]
    return
  }

  tableData.value = originalTableData.value.filter(table =>
    table.name.toLowerCase().includes(search.value.toLowerCase())
  )
}

const handleClose = (done: any) => {
  ElMessageBox.confirm('确认关闭？').then(() => {
    done()
  }).catch(() => { })
}

const seeAll = () => {
  tableData.value = [...originalTableData.value]
  search.value = ""
}

// 格式化日期
const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const deleteRows = (idx: number) => {
  const table = tableData.value[idx]
  if (!table) {
    ElMessage.error('表格不存在')
    return
  }

  //向后端传递删除信息
  const UserTable = {
    name: table.name,
  }
  send("deleteUserTable")
  send(JSON.stringify(UserTable))

  //执行删除操作 - 直接从本地数组删除
  tableData.value.splice(idx, 1)
  // 同时从原始数据中删除
  const originalIndex = originalTableData.value.findIndex(t => t.id === table.id)
  if (originalIndex !== -1) {
    originalTableData.value.splice(originalIndex, 1)
  }
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.new-table-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  font-family: "微软雅黑", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.box-card {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: none;
  overflow: hidden;
}

/* 头部样式 */
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 8px 0;
}

.header-left {
  flex-shrink: 0;
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 280px;
}

/* 表格列表样式 */
.table-list {
  min-height: 400px;
}

.empty-state {
  padding: 60px 20px;
}

.table-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  margin-bottom: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.table-item:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
  border-color: #409eff;
}

.table-item:last-child {
  margin-bottom: 0;
}

.table-info {
  flex: 1;
}

.table-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-icon {
  color: #409eff;
  font-size: 20px;
}

.table-meta {
  font-size: 14px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 16px;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.table-actions .el-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.table-actions .el-button:hover {
  transform: translateY(-1px);
}

/* 对话框样式 */
.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 12px;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .new-table-container {
    padding: 10px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-left,
  .header-right {
    justify-content: center;
  }

  .search-container {
    flex-wrap: wrap;
    justify-content: center;
  }

  .search-input {
    width: 100%;
    min-width: 200px;
  }

  .table-item {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 16px;
  }

  .table-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .table-actions .el-button {
    flex: 1;
    min-width: 80px;
  }
}

@media (max-width: 480px) {
  .table-actions {
    gap: 4px;
  }

  .table-actions .el-button {
    font-size: 12px;
    padding: 8px 12px;
  }

  .search-container {
    gap: 8px;
  }
}

/* 动画效果 */
.table-item {
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
</style>
