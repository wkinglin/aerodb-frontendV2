<template>
    <div id="main">
        <el-card class="box-card">
            <template #header>
                <div class="clearfix">
                    <el-button type="primary" @click="newAlo" style="float: left;margin-top:4px">创建算法</el-button>
                    <el-button type="primary" @click="exportAlo()" style="float: left;margin-top:4px">导出算法库</el-button>
                </div>
            </template>
            <HotTable class="ht" ref="hot" :settings="hotSettings" :data="hotData"></HotTable>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { useAlgorithmStore } from '../../store/algorithm';
import globalWebSocket from '../../global';


// handsontable
import { HotTable } from '@handsontable/vue3';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';

// register Handsontable's modules
registerAllModules();


const router = useRouter();

// 数据状态
const socket = ref<WebSocket | null>(null)

// Refs
const hot = ref<any>(null);
const hotData = ref<any[]>([]);
const message = ref("");
const json = ref<any>("");

// Lifecycle hooks
onMounted(() => {
    nextTick(() => {
        if (hot.value?.hotInstance) {
            hot.value.hotInstance.addHook('afterOnCellMouseDown', (_event: any, coords: any, _td: any) => {
                callBackMD(coords);
            });
        }
        initSocket();
    });
    globalWebSocket.ws?.send("findAll");
});

// 使用全局 WebSocket 实例
const initSocket = () => {
    // 直接使用全局 WebSocket 实例
    socket.value = globalWebSocket.ws as WebSocket

    // 只设置消息处理函数，其他事件已在全局初始化
    if (socket.value) {
        socket.value.onmessage = getMessage
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

// 接收消息
const getMessage = (msg: MessageEvent) => {
    message.value = msg.data;
    console.log("==websocket接收数据==");
    // console.log(msg.data);
    json.value = eval(msg.data);
    const l = json.value.length - hotData.value.length;
    for (let i = 0; i < l; i++) {
        hotData.value.push([]);
    }
    for (let i = 0; i < json.value.length; i++) {
        hotData.value[i] = hotData.value[i] || [];
        hotData.value[i][0] = json.value[i].name;
        hotData.value[i][1] = json.value[i].formula;
        hotData.value[i][2] = '执行';
        hotData.value[i][3] = '删除';
    }
};

const callBackMD = (coords: any) => {
    const row = coords.row;  // 获取行号和列号
    const col = coords.col;
    if (col == 2 && row != -1 && hot.value?.hotInstance) {
        ElMessageBox.confirm("确定调用此算法？", "提示", {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
        }).then(() => {
            router.push({
                path: `/alg`,
                query: {
                    id: json.value[row].id
                }
            });
            console.log("table", json.value[row].id);
        }).catch(() => {
            // 取消操作
        });
    }
    if (col == 3 && row != -1) {
        ElMessageBox.confirm("确定删除此算法？", "提示", {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(() => {
            const Alo = {
                id: json.value[row].id
            };
            globalWebSocket.ws?.send("deleteAlo");
            globalWebSocket.ws?.send(JSON.stringify(Alo));
            if (hot.value?.hotInstance) {
                hot.value.hotInstance.alter('remove_row', row);
            }
        }).catch(() => {
            // 取消操作
        });
    }
};

const exportAlo = () => {
    if (hot.value?.hotInstance) {
        const exportPlugin = hot.value.hotInstance.getPlugin('exportFile');
        exportPlugin.downloadFile('csv', { filename: 'MyFile' });
    }
};

const newAlo = () => {
    router.push({ path: `/create` });
};
</script>

<style>
.ht {
    margin-left: auto;
    margin-right: auto;
    margin-bottom: auto;
}

.handsontable .cellStyle {
    vertical-align: middle !important;
    background: #fff;
    /* font--size:16px */
}

.handsontable .cellStyleEven {
    vertical-align: middle !important;
    /* background: #eee; */
    /* font--size:16px */
}

.handsontable .linkhoverStyle {
    font-size: 16px;
    font-family: "微软雅黑";
    color: #397cf6 ! important;
    text-align: center;
    vertical-align: middle !important;
    background-color: #fff;
}

.handsontable .linkhoverStyleEven {
    font-size: 16px;
    font-family: "微软雅黑";
    color: #397cf6 ! important;
    text-align: center;
    vertical-align: middle !important;
    /* background: #eee; */
}

.handsontable .odd {
    font-size: 16px;
    font-family: "微软雅黑";
    color: #fff;
    text-align: center;
    vertical-align: middle;
    background: #397cf6;
}

.ht .handsontable table thead th {
    font-size: 16px;
    font-family: "微软雅黑";
    color: #fff;
    text-align: center;
    vertical-align: middle;
    background: #3399ff;
}
</style>