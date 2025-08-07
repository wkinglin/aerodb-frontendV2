<template>
    <div id="main">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <h3 class="card-title">算法管理</h3>
                    <div class="card-actions">
                        <el-button type="primary" @click="newAlo" :icon="Plus">
                            创建算法
                        </el-button>
                        <el-button type="success" @click="exportAlo()" :icon="Download">
                            导出算法库
                        </el-button>
                    </div>
                </div>
            </template>
            <HotTable class="ht" ref="hot" :settings="hotSettings" :data="hotData"></HotTable>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Plus, Download } from '@element-plus/icons-vue'
import { useWebSocket } from '@/composables/useWebSocket'

// handsontable
import { HotTable } from '@handsontable/vue3'
import { registerAllModules } from 'handsontable/registry'
import 'handsontable/styles/handsontable.min.css'
import 'handsontable/styles/ht-theme-main.min.css'

registerAllModules()

const router = useRouter()
const { sendCommand, setMessageHandler } = useWebSocket()

// Refs
const hot = ref<any>(null)
const hotData = ref<any[]>([])
const algorithms = ref<any[]>([])

// Lifecycle hooks
onMounted(async () => {
    await initializeComponent()
})

const initializeComponent = async () => {
    await nextTick()

    if (hot.value?.hotInstance) {
        hot.value.hotInstance.addHook('afterOnCellMouseDown', (_event: any, coords: any) => {
            handleCellClick(coords)
        })
    }

    // 设置WebSocket消息处理
    setMessageHandler(handleMessage)

    // 请求数据
    if (sendCommand("findAll")) {
        console.log("算法数据请求已发送")
    } else {
        ElMessage.error("WebSocket未连接，无法获取数据")
    }
}

// Data
const hotSettings = ref<any>({
    licenseKey: 'non-commercial-and-evaluation',
    columnHeaderHeight: 40,
    rowHeights: 100,
    stretchH: 'all',
    width: "100%",
    height: "auto",
    contextMenu: true,
    allowInsertColumn: true,
    allowremoveColumn: true,
    colWidths: [175, 400, 100, 100],
    columns: [
        {},
        {
            wordWrap: false,
        },
        {},
        {},
    ],
    colHeaders: ["算法名称", "算法内容", "执行算法", "删除算法"],
    cells: function (row: number, col: number) {
        const cellProperties = { readOnly: false, className: '' };  // 初始化属性和类名
        const visualColIndex = this.instance.toVisualColumn(col);  // 获取列号
        if (visualColIndex == 3 || visualColIndex == 2 || visualColIndex == 0) {
            cellProperties.readOnly = true;
            if (visualColIndex == 2 || visualColIndex == 3) {
                cellProperties.className = (row % 2 == 0 ? 'linkhoverStyle' : 'linkhoverStyleEven');  // 特殊处理按钮的样式
            }
        }
        if (visualColIndex == 1) {
            cellProperties.readOnly = true;
        }
        if (visualColIndex == 0 || visualColIndex == 1) {
            cellProperties.className = (row % 2 === 0 ? 'cellStyle' : 'cellStyleEven');
        }
        return cellProperties;
    },
});

// 接收消息处理
const handleMessage = (msg: MessageEvent) => {
    try {
        algorithms.value = JSON.parse(msg.data)
        updateTableData()
        console.log("算法数据更新成功")
    } catch (error) {
        console.error("解析算法数据失败:", error)
        ElMessage.error("数据格式错误")
    }
}

// 更新表格数据
const updateTableData = () => {
    const dataLength = algorithms.value.length
    const currentLength = hotData.value.length

    // 调整数组长度
    if (dataLength > currentLength) {
        for (let i = currentLength; i < dataLength; i++) {
            hotData.value.push([])
        }
    } else if (dataLength < currentLength) {
        hotData.value.splice(dataLength)
    }

    // 填充数据
    algorithms.value.forEach((algorithm, index) => {
        hotData.value[index] = [
            algorithm.name || '',
            algorithm.formula || '',
            '执行',
            '删除'
        ]
    })
}

// 处理单元格点击
const handleCellClick = (coords: any) => {
    const { row, col } = coords

    if (row === -1 || !algorithms.value[row]) return

    const algorithm = algorithms.value[row]

    switch (col) {
        case 2: // 执行算法
            handleExecuteAlgorithm(algorithm)
            break
        case 3: // 删除算法
            handleDeleteAlgorithm(algorithm, row)
            break
    }
}

// 处理执行算法
const handleExecuteAlgorithm = async (algorithm: any) => {
    try {
        await ElMessageBox.confirm("确定调用此算法？", "提示", {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
        })

        router.push({
            path: '/alg',
            query: { id: algorithm.id }
        })

        console.log("跳转到算法执行页面:", algorithm.id)
    } catch {
        // 用户取消操作
    }
}

// 处理删除算法
const handleDeleteAlgorithm = async (algorithm: any, row: number) => {
    try {
        await ElMessageBox.confirm("确定删除此算法？", "提示", {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })

        const deleteData = { id: algorithm.id }

        if (sendCommand("deleteAlo", deleteData)) {
            hot.value?.hotInstance?.alter('remove_row', row)
            algorithms.value.splice(row, 1)
            ElMessage.success("算法删除成功")
        } else {
            ElMessage.error("删除失败，网络连接异常")
        }
    } catch {
        // 用户取消操作
    }
}

// 导出算法库
const exportAlo = () => {
    if (!hot.value?.hotInstance) {
        ElMessage.error("表格未初始化")
        return
    }

    const exportPlugin = hot.value.hotInstance.getPlugin('exportFile')
    exportPlugin.downloadFile('csv', {
        filename: `算法库_${new Date().toLocaleDateString()}`
    })
    ElMessage.success("算法库导出成功")
}

// 创建新算法
const newAlo = () => {
    router.push({ path: '/create' })
}
</script>

<style scoped>
/* 页面主容器 */
#main {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 120px);
}

/* 卡片样式 */
.box-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border: 1px solid #ebeef5;
    background-color: #fff;
}

/* Card Header 样式 */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0;
    margin: 0;
}

.card-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0;
    font-family: "微软雅黑", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.card-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

.card-actions .el-button {
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.card-actions .el-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 表格容器样式 */
.ht {
    margin: 0;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
</style>

<style>
/* Handsontable 全局样式 */
.handsontable .cellStyle {
    vertical-align: middle !important;
    background: #fff;
    font-size: 14px;
    font-family: "微软雅黑";
    color: #606266;
}

.handsontable .cellStyleEven {
    vertical-align: middle !important;
    background: #fafafa;
    font-size: 14px;
    font-family: "微软雅黑";
    color: #606266;
}

.handsontable .linkhoverStyle {
    font-size: 14px;
    font-family: "微软雅黑";
    color: #409EFF !important;
    text-align: center;
    vertical-align: middle !important;
    background-color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
}

.handsontable .linkhoverStyle:hover {
    background-color: #ecf5ff !important;
    color: #337ecc !important;
}

.handsontable .linkhoverStyleEven {
    font-size: 14px;
    font-family: "微软雅黑";
    color: #409EFF !important;
    text-align: center;
    vertical-align: middle !important;
    background: #fafafa;
    cursor: pointer;
    transition: all 0.2s ease;
}

.handsontable .linkhoverStyleEven:hover {
    background-color: #ecf5ff !important;
    color: #337ecc !important;
}

.ht .handsontable table thead th {
    font-size: 15px;
    font-family: "微软雅黑";
    color: #fff;
    text-align: center;
    vertical-align: middle;
    background: linear-gradient(135deg, #409EFF 0%, #337ecc 100%);
    font-weight: 600;
    padding: 12px 8px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.ht .handsontable table thead th:last-child {
    border-right: none;
}

/* 表格整体样式优化 */
.ht .handsontable table {
    border-collapse: separate;
    border-spacing: 0;
}

.ht .handsontable table td {
    border-right: 1px solid #ebeef5;
    border-bottom: 1px solid #ebeef5;
    padding: 10px 8px;
}

.ht .handsontable table tbody tr:hover td {
    background-color: #f5f7fa !important;
}
</style>