<template>
  <el-card>
    <template #header>
      <div class="clearfix">
        <el-button type="primary" @click="newAlo" style="float: left; margin-top: 4px">创建算法</el-button>
        <el-button type="primary" @click="exportAlo" style="float: left; margin-top: 4px">导出算法库</el-button>
      </div>
    </template>
    <div id="algorithm-table" ref="tableRef"></div>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
// import { useAlgorithmStore } from '../../store/algorithm'

import globalWebSocket from '@/global'

// 1. 从主入口一次性导入
import { Tabulator, ResponsiveLayoutModule, SortModule, FilterModule, PageModule, DownloadModule, SelectRowModule, EditModule } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator_bootstrap5.min.css'; // 使用一个更现代的主题

// 2. 注册所有你用到的模块
Tabulator.registerModule([
  ResponsiveLayoutModule,
  SortModule,
  FilterModule,
  PageModule,
  DownloadModule,
  SelectRowModule,
  EditModule
]);

// 路由和状态管理
const router = useRouter()
// const algorithmStore = useAlgorithmStore()

// 表格引用
const tableRef = ref<HTMLElement | null>(null)
let table: any = null

// 数据状态
const socket = ref<WebSocket | null>(null)
const tableData = ref<any[]>([])
const message = ref("")
const jsonData = ref<any[]>([])

// 组件挂载后初始化
onMounted(() => {
  // 初始化 WebSocket 连接
  initSocket()

  // 初始化表格
  nextTick(() => {
    initTable()
    // 请求所有数据
    send("findAll")
  })
})

// 使用全局 WebSocket 实例
const initSocket = () => {
  // 直接使用全局 WebSocket 实例
  socket.value = globalWebSocket.ws as WebSocket

  // 只设置消息处理函数，其他事件已在全局初始化
  if (socket.value) {
    socket.value.onmessage = getMessage
  }
}

// 发送数据
const send = (ms: string) => {
  if (socket.value) {
    socket.value.send(ms)
  }
}

// 接收消息
const getMessage = (msg: MessageEvent) => {
  message.value = msg.data
  console.log("==websocket接收数据==")

  try {
    // 使用 JSON.parse 替代 eval
    jsonData.value = JSON.parse(msg.data)

    // 转换数据格式为 Tabulator 可用的格式
    tableData.value = jsonData.value.map((item: any) => ({
      id: item.id,
      name: item.name,
      formula: item.formula,
      execute: '执行',
      delete: '删除'
    }))

    // 如果表格已初始化，则更新数据
    if (table) {
      table.replaceData(tableData.value)
    }
  } catch (e) {
    console.error("数据解析错误:", e)
  }
}

// 初始化 Tabulator 表格
const initTable = () => {
  // 表格列定义
  const columns = [
    {
      title: "算法名称",
      field: "name",
      headerSort: true,
      sorter: "string",
      width: 200,
    },
    {
      title: "算法内容",
      field: "formula",
      headerSort: true,
      sorter: "string",
      width: 400,
    },
    {
      title: "执行算法",
      field: "execute",
      hozAlign: "center",
      headerHozAlign: "center",
      headerSort: false,
      cssClass: "action-cell"
    },
    {
      title: "删除算法",
      field: "delete",
      hozAlign: "center",
      headerHozAlign: "center",
      headerSort: false,
      cssClass: "action-cell"
    }
  ]

  // 创建 Tabulator 实例
  if (tableRef.value) {
    table = new Tabulator(tableRef.value, {
      data: tableData.value,
      columns: columns,
      layout: "fitColumns",
      height: 550,
      rowHeight: 70,
      responsiveLayout: "collapse",
      pagination: true,
      paginationSize: 10,
      paginationSizeSelector: [5, 10, 20, 50],
      paginationCounter: "rows",
      movableColumns: true,
      resizableRows: true,
      placeholder: "<div class='empty-table'>暂无算法数据</div>",
      selectable: true, // 允许选择行
      selectableRangeMode: "click",
      tooltipGenerationMode: "hover",
      tooltipsHeader: true,
      headerFilterLiveFilterDelay: 300,
      ajaxLoader: true,
      ajaxLoaderLoading: "<div class='loader'>加载中...</div>",
      // 表格初始化完成后的回调
      tableBuilt: function () {
        console.log("表格构建完成")
      },
      // 数据加载完成后的回调
      dataLoaded: function (data: any) {
        console.log(`加载了 ${data.length} 条数据`)
      }
    })
  }
}

// 导出数据为 CSV
const exportAlo = () => {
  if (table) {
    table.download("csv", "算法库.csv")
  }
}

// 新建算法
const newAlo = () => {
  router.push({ path: '/create' })
}
</script>

<style>
.el-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06);
}

.el-card__header {
  border-bottom: 1px solid #e4e7ed;
}

/* --- Tabulator 核心样式覆写 --- */
#algorithm-table {
  width: 100%;
  border: none;
}

.tabulator {
  font-family: var(--tabulator-font-family);
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
}

/* 表头 */
.tabulator .tabulator-header {
  background-color: #f5f7fa;
  color: #303133;
  font-weight: 500;
  border-bottom: 1px solid #dcdfe6;
}

.tabulator .tabulator-header .tabulator-col {
  background-color: transparent;
}

.tabulator .tabulator-header .tabulator-col .tabulator-col-content {
  padding: 12px 10px;
}

/* 行样式 */
.tabulator .tabulator-row {
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
}

.tabulator .tabulator-row:last-of-type {
  border-bottom: none;
}

.tabulator .tabulator-row:hover {
  background-color: #ecf5ff !important;
  /* 使用Element Plus的悬停色 */
}

/* 单元格样式 */
.tabulator .tabulator-row .tabulator-cell {
  padding: 14px 10px;
  vertical-align: middle;
  border-right: none;
}

/* 算法名称列自定义样式 */
.tabulator-cell .algorithm-name {
  font-weight: 500;
  color: #303133;
}

/* 操作按钮自定义样式 */
.tabulator-cell .action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  white-space: nowrap;
  min-width: 90px;
}

.tabulator-cell .action-button i {
  margin-right: 6px;
  font-size: 15px;
}

.tabulator-cell .execute-button {
  color: #fff;
  background-color: var(--el-color-primary);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.2);
}

.tabulator-cell .execute-button:hover {
  background-color: #66b1ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.3);
}

.tabulator-cell .delete-button {
  color: #fff;
  background-color: #f56c6c;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.2);
}

.tabulator-cell .delete-button:hover {
  background-color: #f78989;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(245, 108, 108, 0.3);
}

/* 分页 */
.tabulator .tabulator-footer {
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  padding: 10px;
}

/* 空状态和加载状态 */
.tabulator .tabulator-placeholder .empty-table {
  padding: 50px;
  text-align: center;
  color: #909399;
}

.tabulator .tabulator-placeholder .empty-table::before {
  content: '📊';
  font-size: 40px;
  display: block;
  margin-bottom: 15px;
}

.tabulator .tabulator-loader {
  background-color: rgba(255, 255, 255, 0.8);
}

.tabulator .tabulator-loader .tabulator-loader-msg.tabulator-loading {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--el-color-primary);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>