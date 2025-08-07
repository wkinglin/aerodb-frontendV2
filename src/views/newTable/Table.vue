<template>
  <div class="table-container">
    <el-card class="table-card">
      <template #header>
        <div class="table-header">
          <div class="header-title">
            <el-icon class="title-icon">
              <Grid />
            </el-icon>
            <span class="title-text">数据表编辑器</span>
          </div>
          <div class="header-actions">
            <el-button-group>
              <el-button type="primary" @click="addNewRow" :icon="Plus">添加行</el-button>
              <el-button type="primary" @click="removeRow" :icon="Minus">删除行</el-button>
            </el-button-group>
            <el-button-group>
              <el-button type="primary" @click="addNewCol" :icon="Plus">添加列</el-button>
              <el-button type="primary" @click="removeCol" :icon="Minus">删除列</el-button>
            </el-button-group>
            <el-button-group>
              <el-button type="primary" @click="changeColHeaders" :icon="Edit">修改表头</el-button>
              <el-button type="success" @click="save" :icon="Check">保存</el-button>
            </el-button-group>
          </div>
        </div>
      </template>
      <div class="table-wrapper">
        <HotTable class="data-table" ref="hotRef" :settings="hotSettings" :data="hotData" />
      </div>
    </el-card>

    <el-dialog title="表格" v-model="dialogVisible" width="50%">
      <el-form ref="formRef" :model="form" label-width="130px" :label-position="labelPosition" :rules="rules">
        <el-form-item label="表格名称" prop="name">
          <el-input v-model="form.name" placeholder="不能以数字开头"></el-input>
        </el-form-item>
        <el-form-item label="表格列数" prop="columnNumbers">
          <el-input v-model.number="form.columnNumbers" placeholder="请输入列数"></el-input>
        </el-form-item>
        <div v-for="o of turnInt(form.columnNumbers)" :key="o">
          <el-form-item :label='"第" + o + "列名称"' prop="colHeadersData">
            <el-input v-model="form.colHeadersData[o - 1]" placeholder="请输入列名"></el-input>
          </el-form-item>
          <el-form-item label="此列的数据类型" prop="colHeadersType">
            <el-radio-group v-model="form.colHeadersType[o - 1]">
              <el-radio label="1">数字</el-radio>
              <el-radio label="2">字符</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        <el-form-item label="表格行数" prop="rowNumbers">
          <el-input v-model="form.rowNumbers" placeholder="请输入行数"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer">
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="提示" v-model="dialogVisible2" width="50%">
      <el-form ref="formRef" label-width="130px" :label-position="labelPosition">
        <div v-for="o of turnInt(form.colHeadersData.length)" :key="o">
          <el-form-item :label='"第" + o + "列名称"'>
            <el-input v-model="form.colHeadersData[o - 1]"></el-input>
          </el-form-item>
          <el-form-item label="此列的数据类型">
            <el-radio-group v-model.number="newType">
              <el-radio label="1">数字</el-radio>
              <el-radio label="2">字符</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
      </el-form>
      <span class="dialog-footer">
        <el-button @click="dialogVisible2 = false">取消</el-button>
        <el-button type="primary" @click="onSubmit2">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="提示" v-model="dialogVisible3" width="50%">
      <el-form ref="formRef" label-width="130px" :label-position="labelPosition">
        <el-form-item label="新列名称">
          <el-input v-model="newName"></el-input>
        </el-form-item>
        <el-form-item label="此列的数据类型">
          <el-radio-group v-model="newType">
            <el-radio label="1">数字</el-radio>
            <el-radio label="2">字符</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span class="dialog-footer">
        <el-button @click="dialogVisible2 = false">取消</el-button>
        <el-button type="primary" @click="onSubmit3">确定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Minus,
  Edit,
  Check,
  Grid
} from '@element-plus/icons-vue'
import { useMainStore } from '@/store'
import globalWebSocket from '@/global'
import { useRoute } from 'vue-router'

import { HotTable } from '@handsontable/vue3'
import 'handsontable/dist/handsontable.full.min.css'
import 'handsontable/dist/languages/zh-CN.js'

// 表单验证函数
const validatePass = (rule: any, value: any, callback: any) => {
  const num = /^[a-zA-Z]/
  if (!num.test(value)) {
    return callback(new Error('不能以数字开头'))
  } else {
    callback()
  }
}

const dialogVisible = ref(false)
const dialogVisible2 = ref(false)
const dialogVisible3 = ref(false)
const IfUpdateData = ref(false)
const labelPosition = ref("left")

const form = reactive({
  name: '',
  columnNumbers: '',
  rowNumbers: '',
  resourceColumns: '',
  resourceRows: '',
  colHeadersData: [] as string[],
  colHeadersType: [] as string[],
})

const row = ref(0)
// tableData 移除，直接在save函数中构造

const ccN = reactive({
  name: "",
  oldname: [] as string[],
  newname: [] as string[],
})

// SourceData 移除，直接使用hotInstance.getSourceData()
const hotData = ref([] as any[])
const hotDataId = ref([] as any[])
const newName = ref("")
const newType = ref(0)

const hotSettings = reactive({
  licenseKey: 'non-commercial-and-evaluation',
  rowHeaders: true,
  // colHeaders: true,
  columnHeaderHeight: 40,
  rowHeights: 40,
  colWidths: 120,
  stretchH: 'all', // 自动填满宽度
  width: '100%',
  height: 'auto',
  contextMenu: true,
  mergeCells: false,
  allowInsertColumn: true,
  allowRemoveColumn: true,
  manualColumnResize: true,
  manualRowResize: true,
  wordWrap: true,
  cells: function (row: number, col: number) {
    const cellProperties: any = {
      readOnly: false,
      className: 'custom-cell',
      renderer: 'text'
    }
    return cellProperties
  },
})

const rules = reactive({
  name: [
    { required: true, message: '请输入数据库名称', trigger: 'blur' },
    { validator: validatePass },
  ],
  columnNumbers: [
    { required: true, message: '请输入列数', trigger: 'blur' },
    { type: 'number', message: '必须为数字', trigger: 'blur' }
  ],
  rowNumbers: [
    { required: true, message: '请输入行数', trigger: 'blur' },
  ],
  colHeadersData: [
    { required: true, message: '请输入列名', trigger: 'blur' },
    { validator: validatePass },
  ],
  colHeadersType: [
    { required: true, message: '请输入列的类型', trigger: 'change' },
  ],
})

// 获取路由和store实例
const store = useMainStore()
const route = useRoute()

// 表单引用
const formRef = ref()
const hotRef = ref()

// WebSocket相关
const socket = ref<WebSocket | null>(null)

// 组件挂载时初始化
onMounted(() => {
  init()
})

// 响应式的当前表格ID
const currentTableId = ref<string>('')

// 安全获取当前表格数据的辅助函数
const getCurrentTable = () => {
  if (!currentTableId.value) {
    return null
  }
  return store.findTableById(currentTableId.value)
}

const init = () => {
  // 从路由获取表格ID
  const tableId = route.query.table_id as string
  if (!tableId) {
    ElMessage.error('表格ID不能为空')
    return
  }

  currentTableId.value = tableId

  // 获取当前表格数据
  const currentTable = getCurrentTable()
  if (!currentTable) {
    ElMessage.error('找不到指定的数据库')
    return
  }

  // 为兼容保留row.value，但不再用于数组索引
  row.value = store.findTableIndexById(tableId) + 1

  dialogVisible.value = currentTable.valid || false

  //初始化WebSocket
  initWebSocket()

  //获取表格数据
  send("getUserTable")
  send(currentTable.name)

  //重新渲染表格
  if (!dialogVisible.value) {
    setTimeout(() => {
      renderTable()
    }, 10)
  }

  //添加数据
  form.colHeadersData = currentTable.headers || []
}

const initWebSocket = () => {
  // 实例化socket
  socket.value = globalWebSocket.ws as WebSocket
  if (socket.value) {
    socket.value.onmessage = getInput
  }
}

// 发送数据函数
const send = (ms: string) => {
  if (socket.value) {
    socket.value.send(ms)
  }
}


// socket连接失败
const getInput = (msg: any) => {
  console.log("==websocket接收数据==")
  if (msg != null) {
    IfUpdateData.value = true
  }

  try {
    const json = JSON.parse(msg.data)
    const json_data = json[0]
    console.log('接收到的数据:', json_data)

    if (json_data && json_data.data) {
      hotDataId.value = json_data.id || []
      hotData.value = json_data.data

      // 更新表格设置
      if (hotRef.value && hotRef.value.hotInstance) {
        hotRef.value.hotInstance.updateSettings({
          colHeaders: json_data.column?.map((col: any) => col.name) || [],
          data: json_data.data
        })
      }

      console.log('更新后的hotData:', hotData.value)
    }
  } catch (error) {
    console.error('解析数据失败:', error)
  }
}

const getMessage = (msg: any) => {
  console.log("==websocket接收数据==")
  const js = msg.data

  //是否建表成功
  if (js != 'create table success') {
    ElMessage.error('建表失败')
  } else {
    ElMessage({
      message: '恭喜你，建表成功',
      type: 'success'
    })
  }
  if (socket.value) {
    socket.value.onmessage = getInput
  }
}


//添加行数
const addNewRow = () => {
  const currentTable = getCurrentTable()
  if (!currentTable) {
    ElMessage.error('表格数据不存在')
    return
  }

  if (hotRef.value && hotRef.value.hotInstance) {
    const currentRows = hotRef.value.hotInstance.countRows()
    hotRef.value.hotInstance.alter('insert_row_below', currentRows)
    currentTable.rownum++
    ElMessage.success('已添加新行')
  }
}

//删除行数
const removeRow = () => {
  if (hotRef.value && hotRef.value.hotInstance) {
    const currentRows = hotRef.value.hotInstance.countRows()
    if (currentRows <= 1) {
      ElMessage.warning('至少需要保留一行')
      return
    }

    ElMessageBox.confirm('确定要删除最后一行吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      hotRef.value.hotInstance.alter('remove_row', currentRows - 1)
      const currentTable = getCurrentTable()
      if (currentTable) {
        currentTable.rownum--
      }
      ElMessage.success('已删除行')
    }).catch(() => {
      // 取消删除
    })
  }
}

const addNewCol = () => {
  dialogVisible3.value = true
}

const removeCol = () => {
  const currentTable = getCurrentTable()
  if (!currentTable) {
    ElMessage.error('表格数据不存在')
    return
  }

  if (hotRef.value && hotRef.value.hotInstance) {
    const currentCols = hotRef.value.hotInstance.countCols()
    if (currentCols <= 1) {
      ElMessage.warning('至少需要保留一列')
      return
    }

    const headers = currentTable.headers || []
    if (headers.length === 0) {
      ElMessage.error('表头信息不存在')
      return
    }

    const lastColumnName = headers[headers.length - 1]

    ElMessageBox.confirm(`确定要删除列 "${lastColumnName}" 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      // 发送删除列的消息
      send("delColumn")
      const delCol = {
        name: currentTable.name,
        column: lastColumnName
      }
      send(JSON.stringify(delCol))

      // 修改表格
      hotRef.value.hotInstance.alter('remove_col', currentCols - 1)

      // 更新store
      const tableIndex = store.findTableIndexById(currentTableId.value)
      if (tableIndex !== -1) {
        store.deleteTableHeader({
          i: tableIndex,
        })
      }

      ElMessage.success('已删除列')
    }).catch(() => {
      // 取消删除
    })
  }
}

//提交表单1
const onSubmit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      changeColAndRow(parseInt(form.columnNumbers), parseInt(form.rowNumbers))

      //记录数据
      store.changeTableNameById(currentTableId.value, form.name)
      getColHeaders()
      dialogVisible.value = false
      // renderPage = true

    } else {
      ElMessage.error('提交失败')
      return false
    }
  })
}

const save = () => {
  try {
    if (!hotRef.value || !hotRef.value.hotInstance) {
      ElMessage.error('表格未初始化')
      return
    }

    const hotInstance = hotRef.value.hotInstance
    const colnum = hotInstance.countCols()
    const rownum = hotInstance.countRows()

    // 验证表格数据
    if (colnum === 0 || rownum === 0) {
      ElMessage.error('表格不能为空')
      return
    }

    // 获取表格数据
    const sourceData = hotInstance.getSourceData()

    // 获取当前表格数据
    const currentTable = getCurrentTable()
    if (!currentTable) {
      ElMessage.error('表格数据不存在')
      return
    }

    // 处理表头数据（如果是新创建的表）
    if (currentTable.valid === true) {
      const tableHeaderData = {
        name: currentTable.name,
        header: (currentTable.headers || []).map((headerName: string, index: number) => ({
          key: headerName,
          type: form.colHeadersType[index] || '2' // 默认为字符类型
        }))
      }

      send("creatTable")
      send(JSON.stringify(tableHeaderData))
    }

    // 发送表格数据
    const tableData = {
      name: currentTable.name,
      data: sourceData
    }

    send("insert")
    send(JSON.stringify(tableData))

    // 更新表格状态
    store.changeTableValidById(currentTableId.value, false)

    // 设置消息处理
    if (currentTable.valid === true && socket.value) {
      socket.value.onmessage = getMessage
    } else {
      ElMessage.success('保存成功')
    }

  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请重试')
  }
}

const getColHeaders = () => {
  //获得行数和列数
  if (hotRef.value && hotRef.value.hotInstance) {
    const colnum = hotRef.value.hotInstance.countVisibleCols()
    const rownum = hotRef.value.hotInstance.countVisibleRows()
    console.log(colnum)
    console.log(rownum)

    //修改表格数据
    const tableIndex = store.findTableIndexById(currentTableId.value)
    if (tableIndex !== -1) {
      for (var i = 0; i < form.colHeadersData.length; i++) {
        store.changeTableData({
          row: tableIndex + 1, // changeTableData期望从1开始的索引
          i: i,
          colnum: form.colHeadersData.length,
          rownum: parseInt(form.rowNumbers),
          element: form.colHeadersData[i]
        })
      }
    }

    const currentTable = getCurrentTable()
    console.log(currentTable)
    hotRef.value.hotInstance.updateSettings({
      colHeaders: makeColHeaders()
    })
  }
}

const turnInt = (num: string | number) => {
  if (num == '') return 0
  else return parseInt(num.toString())
}

//修改表头按钮函数
const changeColHeaders = () => {
  const currentTable = getCurrentTable()
  if (!currentTable) {
    ElMessage.error('表格数据不存在')
    return
  }

  ccN.oldname = JSON.parse(JSON.stringify(currentTable.headers || []))
  //重新赋值
  form.colHeadersData = currentTable.headers || []
  form.colHeadersType = currentTable.headersType || []

  dialogVisible2.value = true
}

//提交表单2
const onSubmit2 = () => {
  //重新渲染表头
  getColHeaders()

  //传送数据
  send("changeColumnName")
  const currentTable = getCurrentTable()
  if (currentTable) {
    ccN.newname = currentTable.headers || []
    ccN.name = currentTable.name
  }
  send(JSON.stringify(ccN))

  //关闭dialog
  dialogVisible2.value = false
}

//修改表头
const makeColHeaders = () => {
  const currentTable = getCurrentTable()
  return currentTable?.headers || []
}

//重新渲染
const renderTable = () => {
  const currentTable = getCurrentTable()
  if (!currentTable) {
    console.error('表格数据不存在')
    return
  }

  console.log(currentTable.headers)
  console.log(currentTable.headers?.length || 0)
  console.log(currentTable.rownum)

  //重新渲染表格
  // hotRef.value?.hotInstance.updateSettings({
  //   startCols: currentTable.headers?.length || 0,
  //   startRows: currentTable.rownum,
  //   colHeaders: makeColHeaders()
  // })
  if (IfUpdateData.value) {
    // hotRef.value?.hotInstance.updateData(hotData.value)
  }
}

const changeColAndRow = (colnum: number, rownum: number) => {
  //修改列数
  if (colnum > 5) {
    for (var i = 0; i < colnum - 5; i++) {
      // hotRef.value?.hotInstance.alter('insert_col')
    }
  } else if (colnum < 5) {
    if (colnum == 0) colnum++
    for (var i = 0; i < 5 - colnum; i++) {
      // hotRef.value?.hotInstance.alter('remove_col')
    }
  }
  //修改行数
  if (rownum > 5) {
    for (var i = 0; i < rownum - 5; i++) {
      // hotRef.value?.hotInstance.alter('insert_row')
    }
  } else if (rownum < 5) {
    if (rownum == 0) rownum++
    for (var i = 0; i < 5 - rownum; i++) {
      // hotRef.value?.hotInstance.alter('remove_row')
    }
  }
}


const onSubmit3 = () => {
  const tableIndex = store.findTableIndexById(currentTableId.value)
  if (tableIndex !== -1) {
    store.changeTableData({
      row: tableIndex + 1, // changeTableData期望从1开始的索引
      i: 0, // 这里需要根据实际列数调整
      colnum: 1,
      rownum: parseInt(form.rowNumbers),
      element: newName.value,
    })
    store.changeTableType({
      row: tableIndex + 1, // changeTableType期望从1开始的索引
      i: 0, // 这里需要根据实际列数调整
      element: newType.value,
    })
  }

  send("addColumn")
  const currentTable = getCurrentTable()
  if (currentTable) {
    const newcol = {
      name: currentTable.name,
      column: newName.value,
      type: newType.value,
    }
    send(JSON.stringify(newcol))
    console.log(currentTable.headers)
  }
  newName.value = ""
  newType.value = 0
  dialogVisible3.value = false
}

//重置表单
const resetForm = () => {
  formRef.value?.resetFields()
}

watch(() => route.query.table_id, (newTableId) => {
  if (newTableId && newTableId !== currentTableId.value) {
    init()
  }
}, { immediate: true })

</script>

<style scoped>
.table-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 20px;
  font-family: "微软雅黑", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.table-card {
  max-width: 100%;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
  border: 1px solid #dbeafe;
  overflow: hidden;
}

/* 头部样式 */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.header-actions .el-button-group {
  border-radius: 8px;
  overflow: hidden;
}

.header-actions .el-button {
  border-radius: 0;
  font-weight: 500;
  transition: all 0.3s ease;
}

.header-actions .el-button-group .el-button:first-child {
  border-radius: 8px 0 0 8px;
}

.header-actions .el-button-group .el-button:last-child {
  border-radius: 0 8px 8px 0;
}

.header-actions .el-button:hover {
  transform: translateY(-1px);
}

/* 表格容器样式 */
.table-wrapper {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Handsontable 自定义样式 */
.data-table {
  width: 100% !important;
}

/* 对话框样式 */
.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 12px;
  border-radius: 6px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-container {
    padding: 12px;
  }

  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-title {
    justify-content: center;
  }

  .header-actions {
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .header-actions .el-button-group {
    flex: 1;
    min-width: 150px;
  }

  .table-wrapper {
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .header-actions .el-button {
    font-size: 12px;
    padding: 8px 12px;
  }

  .title-text {
    font-size: 16px;
  }
}
</style>

<!-- Handsontable 全局样式覆盖 -->
<style>
/* Handsontable 表头样式 - 使用Element Plus淡蓝色主题 */
.data-table .handsontable table thead th {
  font-size: 14px;
  font-family: "微软雅黑", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #ffffff !important;
  text-align: center;
  vertical-align: middle;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  border: 1px solid #2563eb !important;
  font-weight: 600;
  height: 40px;
}

/* Handsontable 行标题样式 */
.data-table .handsontable table tbody th {
  background: #f8fafc !important;
  color: #64748b !important;
  font-weight: 500;
  border: 1px solid #e2e8f0 !important;
}

/* Handsontable 单元格样式 */
.data-table .handsontable table tbody td {
  background: #ffffff !important;
  color: #374151 !important;
  border: 1px solid #e5e7eb !important;
  font-size: 13px;
  padding: 8px !important;
  line-height: 1.5;
}

.data-table .handsontable table tbody td:hover {
  background: #f0f9ff !important;
}

.data-table .handsontable table tbody td.current {
  background: #dbeafe !important;
  border: 2px solid #3b82f6 !important;
}

/* Handsontable 选中区域样式 */
.data-table .handsontable table tbody td.area {
  background: #eff6ff !important;
}

/* Handsontable 容器样式 */
.data-table .handsontable {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
}

/* 自定义单元格类 */
.data-table .custom-cell {
  text-align: center;
  vertical-align: middle;
}

/* 滚动条样式 */
.data-table .handsontable .wtHolder {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.data-table .handsontable .wtHolder::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.data-table .handsontable .wtHolder::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.data-table .handsontable .wtHolder::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.data-table .handsontable .wtHolder::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>