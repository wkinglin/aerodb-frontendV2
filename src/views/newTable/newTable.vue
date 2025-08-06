<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="clearfix">
          <el-button type="primary" @click="creatTables()" style="float: left;margin-top:4px">新建数据库</el-button>
          <!-- <el-button type="primary" @click="deleteTables()" style="float: left;margin-top:4px">删除数据库</el-button> -->
          <el-button type="primary" plain @click="seeAll()" style="float:right;margin-top:4px">取消</el-button>
          <el-button type="primary" @click="searchTables()" style="float:right;margin-top:4px">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
          <el-input type="input" placeholder="请输入数据库名称" v-model="search"
            style="width:auto;float:right;margin-left:1%;margin-right: 1%"></el-input>
        </div>
      </template>
      <div v-for="(item, index) in tableData" :key="index" class="text">
        <div class="item">
          <div>{{ item.name }}</div>
          <div>
            <el-button type="primary" @click="watchTables(index)" style="margin-top:4px">查看数据库</el-button>
            <el-button type="primary" @click="changeTablesName(index)" style="margin-top:4px">修改数据库名字</el-button>
            <el-button type="primary" @click="deleteRows(index)" style="margin-top:4px">删除</el-button>
          </div>
        </div>
        <el-divider></el-divider>
      </div>
    </el-card>

    <el-dialog title="改名" v-model="dialogVisible" width="50%" :before-close="handleClose">
      <el-form>
        <el-form-item prop="name" :rules="rule">
          <el-input v-model="name" placeholder="请输入名称"></el-input>
        </el-form-item>
      </el-form>
      <span>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onSubmitName()">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import globalWebSocket from '@/global'
import { useMainStore } from '@/store'

// 响应式数据
const tablenumbers = ref(0)
const search = ref('')
const dialogVisible = ref(false)
const name = ref('')
const index = ref(0)
const tableData = ref([] as any[])

// 表单验证规则
const rule = reactive({
  name: [{ required: true, message: '名称不能为空' }]
})

// 获取路由和store实例
const router = useRouter()
const store = useMainStore()

// 初始化socket
const socket = ref<WebSocket | null>(null)

// 组件挂载时初始化
onMounted(() => {
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
  var arr = []
  arr = eval(msg.data)
  var l = arr.length

  for (var i = 0; i < l; i++) {
    var f = 1
    if (store.tableData.length > 1) {
      for (var j = 0; j < store.tableData.length; j++) {
        if (store.tableData[j].name == arr[i]) {
          f = 0
        }
      }
    }
    if (f == 0) continue
    //增加数据库
    store.increment()
    //修改数据库名字
    store.changeTableName({
      i: i,
      name: arr[i],
    })
    //取消显示设置表单
    store.changeTableValid({
      i: i,
      valid: false,
    })
  }
  store.newTableValible = false

  tableData.value = store.tableData
}

const creatTables = () => {
  tablenumbers.value++
  store.increment()
}

const deleteTables = () => {
  tablenumbers.value--
  store.decrement()
}

const watchTables = (row: number) => {
  router.push({
    path: `table`,
    query: {
      table_id: row + 1
    }
  })
}

const changeTablesName = (idx: number) => {
  dialogVisible.value = true
  index.value = idx
}

const onSubmitName = () => {
  send("changeTableName")
  var s = {
    oldname: store.tableData[index.value].name,
    newname: name.value,
  }
  send(JSON.stringify(s))
  store.changeTableName({
    i: index.value,
    name: name.value,
  })
  dialogVisible.value = false
}

const searchTables = () => {
  tableData.value = []
  for (var i = 0; i < store.tableData.length; i++) {
    if (store.tableData[i].name.startsWith(search.value)) {
      tableData.value.push(store.tableData[i])
    }
  }
}

const handleClose = (done: any) => {
  ElMessageBox.confirm('确认关闭？').then(() => {
    done()
  }).catch(() => { })
}

const seeAll = () => {
  tableData.value = store.tableData
  search.value = ""
}

const deleteRows = (idx: number) => {
  //向后端传递删除信息
  var UserTable = {
    name: store.tableData[idx].name,
  }
  send("deleteUserTable")
  send(JSON.stringify(UserTable))

  //执行删除操作
  store.deleteTableData({
    i: idx,
  })
  ElMessage({
    message: '删除成功',
    type: 'success'
  })
}
</script>

<style>
.text {
  font-size: 16px;
  font-family: "微软雅黑";
}

.textarea {
  text-align: left;
  padding-left: 10px;
  padding-right: 45%;
  width: 20%;
  display: inline-block;
}

.button {
  /* display:inline-block; */
  float: right;
}

.el-divider--horizontal {
  margin: 10px 0;
}

.item {
  margin-bottom: 1px;
  display: flex;
  justify-content: space-between;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}

.box-card {
  margin: 50px;
}
</style>
