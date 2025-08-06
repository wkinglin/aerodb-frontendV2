<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="clearfix">
          <el-button class="newbutton" type="primary" @click="addNewRow"
            style="float: left;margin-top:4px">添加新行</el-button>
          <el-button class="newbutton" type="primary" @click="removeRow"
            style="float: left;margin-top:4px">删除行</el-button>
          <el-button class="newbutton" type="primary" @click="addNewCol"
            style="float: left;margin-top:4px">添加新列</el-button>
          <el-button class="newbutton" type="primary" @click="removeCol"
            style="float: left;margin-top:4px">删除列</el-button>
          <el-button class="newbutton" type="primary" @click="save" style="float: left;margin-top:4px">保存</el-button>
          <el-button class="newbutton" type="primary" @click="changeColHeaders"
            style="float: left;margin-top:4px">修改表头</el-button>
        </div>
      </template>
      <HotTable class="personTable" ref="hotRef" :settings="hotSettings" :data="hotData"></HotTable>
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
        <el-button @click="resetForm('formRef')">重置</el-button>
        <el-button type="primary" @click="onSubmit('formRef')">确定</el-button>
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
import { ElMessage } from 'element-plus'
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
const tableData = reactive({
  name: '',
  header: [] as any[],
})

const ccN = reactive({
  name: "",
  oldname: [] as string[],
  newname: [] as string[],
})

const SourceData = ref([] as any[])
const hotData = ref([] as any[])
const hotDataId = ref([] as any[])
const newName = ref("")
const newType = ref(0)

const hotSettings = reactive({
  licenseKey: 'non-commercial-and-evaluation',
  rowHeaders: true,
  colHeaders: true,
  columnHeaderHeight: 30,
  rowHeights: 50,
  // colWidths: 100,
  // stretchH: 'all',
  // width: "100%",
  height: "auto",
  contextMenu: true,
  mergeCells: true,
  allowInsertColumn: true,
  allowremoveColumn: true,
  cells: function (row: number, col: number, prop: string) {
    const cellProperties: any = { readOnly: false, className: '' }
    cellProperties.className = "cellStyle"
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

const init = () => {
  //获得数据库行号
  row.value = parseInt(route.query.table_id as string)
  dialogVisible.value = store.tableData[row.value - 1].valid

  //初始化WebSocket
  initWebSocket()

  //获取表格数据
  send("getUserTable")
  send(store.tableData[row.value - 1].name)

  //重新渲染表格
  if (!dialogVisible.value) {
    setTimeout(() => {
      renderTable()
    }, 0.01)
  }

  //添加数据
  form.colHeadersData = store.tableData[row.value - 1].headers
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

const addRows = () => {
  // 这里需要根据实际的HotTable组件来调整
  // var row = hotRef.value?.hotInstance.countVisibleRows()
  // if (row == 1) {
  //   hotRef.value?.hotInstance.alter('insert_row')
  // }
}

const addCols = () => {
  // 这里需要根据实际的HotTable组件来调整
  // var col = hotRef.value?.hotInstance.countVisibleCols()
  // if (col == 1) {
  //   hotRef.value?.hotInstance.alter('insert_col')
  // }
}

//添加行数
const addNewRow = () => {
  store.tableData[row.value - 1].rownum++
  // hotRef.value?.hotInstance.alter('insert_row')
  // hotRef.value?.hotInstance.render()
}

//删除行数
const removeRow = () => {
  // var rownum = hotRef.value?.hotInstance.countVisibleRows()
  store.tableData[row.value - 1].rownum--
  // hotRef.value?.hotInstance.alter('remove_row')
  // hotRef.value?.hotInstance.render()
}

const addNewCol = () => {
  // var colnum = hotRef.value?.hotInstance.countVisibleCols()
  // hotRef.value?.hotInstance.alter('insert_col', colnum)
  // hotRef.value?.hotInstance.render()
  dialogVisible3.value = true
}

const removeCol = () => {
  // var colnum = hotRef.value?.hotInstance.countVisibleCols()
  console.log(store.tableData[row.value - 1].headers)

  //传送数据
  send("delColumn")
  var delCol = {
    name: store.tableData[row.value - 1].name,
    column: store.tableData[row.value - 1].headers[0] // 这里需要根据实际列数调整
  }
  send(JSON.stringify(delCol))

  //修改表格
  // hotRef.value?.hotInstance.alter('remove_col')
  // hotRef.value?.hotInstance.render()

  //减一行
  // if (colnum != 1) {
  //   store.tableData[row.value - 1].colnum--
  //   store.deleteTableHeader({
  //     i: row.value - 1,
  //   })
  // }

  console.log(store.tableData[row.value - 1].headers)
}

//提交表单1
const onSubmit = (formName: string) => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      changeColAndRow(parseInt(form.columnNumbers), parseInt(form.rowNumbers))

      //记录数据
      store.changeTableName({
        i: row.value - 1,
        name: form.name,
      })
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
  // 获取表格数据
  if (hotRef.value && hotRef.value.hotInstance) {
    const colnum = hotRef.value.hotInstance.countVisibleCols()
    const rownum = hotRef.value.hotInstance.countVisibleRows()
    const array = hotRef.value.hotInstance.getSourceDataArray(0, 0, rownum - 1, colnum - 1)

    SourceData.value = []
    for (var i = 0; i < rownum; i++) {
      SourceData.value.push([])
      for (var j = 0; j < colnum; j++) {
        SourceData.value[i].push(array[i][j])
      }
    }
  }

  // 传递表头数据
  if (store.tableData[row.value - 1].valid == true) {
    tableData.name = store.tableData[row.value - 1].name
    if (hotRef.value && hotRef.value.hotInstance) {
      const colnum = hotRef.value.hotInstance.countVisibleCols()
      for (var i = 0; i < colnum; i++) {
        console.log(store.tableData[row.value - 1].headers[i])
        tableData.header.push({
          key: store.tableData[row.value - 1].headers[i],
          type: form.colHeadersType[i],
        })
      }
    }
    let temp = JSON.stringify(tableData)
    send("creatTable")
    send(temp)
  }

  //传递表格数据
  let data = {
    name: store.tableData[row.value - 1].name,
    data: SourceData.value,
  }
  let tmp = JSON.stringify(data)
  send("insert")
  send(tmp)

  if (store.tableData[row.value - 1].valid == true) {
    if (socket.value) {
      socket.value.onmessage = getMessage
    }
  } else {
    ElMessage({
      message: '恭喜你，保存成功',
      type: 'success'
    })
  }

  //改变表格状态
  store.changeTableValid({
    i: row.value - 1,
    valid: false,
  })
}

const getColHeaders = () => {
  //获得行数和列数
  if (hotRef.value && hotRef.value.hotInstance) {
    const colnum = hotRef.value.hotInstance.countVisibleCols()
    const rownum = hotRef.value.hotInstance.countVisibleRows()
    console.log(colnum)
    console.log(rownum)

    //修改表格数据
    for (var i = 0; i < form.colHeadersData.length; i++) {
      store.changeTableData({
        row: row.value,
        i: i,
        colnum: form.colHeadersData.length,
        rownum: parseInt(form.rowNumbers),
        element: form.colHeadersData[i]
      })
    }

    console.log(store.tableData[row.value - 1])
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
  ccN.oldname = JSON.parse(JSON.stringify(store.tableData[row.value - 1].headers))
  //重新赋值
  form.colHeadersData = store.tableData[row.value - 1].headers
  form.colHeadersType = store.tableData[row.value - 1].headersType

  dialogVisible2.value = true
}

//提交表单2
const onSubmit2 = () => {
  //重新渲染表头
  getColHeaders()

  //传送数据
  send("changeColumnName")
  ccN.newname = store.tableData[row.value - 1].headers
  ccN.name = store.tableData[row.value - 1].name
  send(JSON.stringify(ccN))

  //关闭dialog
  dialogVisible2.value = false
}

//修改表头
const makeColHeaders = () => {
  return store.tableData[row.value - 1].headers
}

//重新渲染
const renderTable = () => {
  console.log(store.tableData[row.value - 1].headers)
  console.log(store.tableData[row.value - 1].headers.length)
  console.log(store.tableData[row.value - 1].rownum)

  //重新渲染表格
  // hotRef.value?.hotInstance.updateSettings({
  //   startCols: store.tableData[row.value - 1].headers.length,
  //   startRows: store.tableData[row.value - 1].rownum,
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

const deleteRows = (index: number) => {
  send("deleteUserLine")
  var json = {
    name: store.tableData[row.value - 1].name,
    id: hotDataId.value[index],
  }
  var js = JSON.stringify(json)
  send(js)
}

const onSubmit3 = () => {
  // var colnum = hotRef.value?.hotInstance.countVisibleCols()
  // var rownum = hotRef.value?.hotInstance.countVisibleRows()

  store.changeTableData({
    row: row.value,
    i: 0, // 这里需要根据实际列数调整
    colnum: 1,
    rownum: parseInt(form.rowNumbers),
    element: newName.value,
  })
  store.changeTableType({
    row: row.value,
    i: 0, // 这里需要根据实际列数调整
    element: newType.value,
  })

  // hotRef.value?.hotInstance.updateSettings({
  //   colHeaders: makeColHeaders()
  // })
  send("addColumn")
  var newcol = {
    name: store.tableData[row.value - 1].name,
    column: newName.value,
    type: newType.value,
  }
  send(JSON.stringify(newcol))
  newName.value = ""
  newType.value = 0
  dialogVisible3.value = false
  console.log(store.tableData[row.value - 1].headers)
}

//重置表单
const resetForm = (formName: string) => {
  formRef.value?.resetFields()
}

watch(() => route.query.table_id, () => {
  init()
}, { immediate: true })

</script>

<style>
.box-card {
  margin: 50px;
}

.personTable .handsontable table thead th {
  font-size: 16px;
  font-family: "微软雅黑";
  color: #fff;
  text-align: center;
  vertical-align: middle;
  background: #3366cc;
}

.personTable .handsontable table t {
  font-size: 16px;
  font-family: "微软雅黑";
  color: #fff;
  text-align: center;
  vertical-align: middle;
  background: #3366cc;
}
</style>