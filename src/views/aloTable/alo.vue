<template>
  <div id="main">
    <el-card class="box-card">
      <el-form id="formInput" ref="formInput" :model="form" label-position="left" label-width="180px">
        <!-- <el-scrollbar style="height:150px"> -->
        <div style="margin-bottom:50px;" v-for="(item, index) in form.input" :key="index">
          <el-form-item :label="form.inputSee[index]">
            <el-input style="width:300px;float:left" v-model="item.value"></el-input>
          </el-form-item>
          <el-form-item label="变量名称">
            <label style="float:left;font-size:16px">{{ item.name }}</label>
          </el-form-item>
          <el-form-item v-if="item.description != null" label="变量描述">
            <label style="float:left;">{{ item.description }}</label>
          </el-form-item>
          <el-form-item v-if="item.type == 2" label="数组维数">
            <el-input style="width:300px;float:left" v-model="item.dimension"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <div style="color:red;text-align:left;margin:10px 20px;font-size:16px;">（算法变量若为数组,输入要用英文逗号隔开）</div>
      <!-- </el-scrollbar> -->
      <el-form id="formOutput" ref="formOutput" :model="form" label-position="left" label-width="160px">
        <el-form-item label="算法的具体描述">
          <el-input :rows="5" :max="10" type="textarea" v-model="form.describe" placeholder="请根据提示输入变量"></el-input>
        </el-form-item>

        <el-form-item label="算法的具体内容">
          <el-input :rows="8" :max="10" type="textarea" v-model="form.con" placeholder="请输入内容"></el-input>
        </el-form-item>

        <!-- <el-scrollbar style="height:150px"> -->
        <el-form-item label="算法输出结果">
          <el-input v-model="form.output" :rows="4" type="textarea" readOnly='true' placeholder="结果"></el-input>
        </el-form-item>
        <!-- </el-scrollbar> -->
        <el-form-item>
          <el-button type="primary" @click="reviseAlo">修改算法</el-button>
          <el-button type="primary" @click="onSubmit">开始运行算法</el-button>
          <el-button type="primary" @click="history">打开算法历史运行记录</el-button>
        </el-form-item>
      </el-form>
      <el-drawer v-model="drawer" :direction="direction" size="70%">
        <el-table :data="tableData" stripe class="tableLimit">
          <el-table-column prop="input" label="算法输入"></el-table-column>
          <el-table-column prop="output" label="算法输出" :show-overflow-tooltip='true'></el-table-column>
          <el-table-column prop="lastTime" label="上一次运行时间"></el-table-column>
          <el-table-column prop="success" label="算法是否成功"></el-table-column>
          <el-table-column prop="reason" label="失败原因"></el-table-column>
        </el-table>
      </el-drawer>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAlgorithmStore } from '../../store/algorithm';
import globalWebSocket from '../../global';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';

const route = useRoute();
const socket = ref<WebSocket | null>(null);

const form = ref({
  input: [] as any[],
  inputSee: [] as any[],
  con: '',
  output: "",
  describe: "",
});

// 定义表格数据的类型
interface TableDataItem {
  input: string;
  output: string;
  lastTime: string;
  success: string;
  reason: string;
}

const tableData = ref<TableDataItem[]>([]);
const drawer = ref(false);
const direction = ref('rtl');
const type = ref(0);
const id = ref(route.query.id as string);
const row = ref<any>(null);
const json = ref<any>(null);

onMounted(() => {
  console.log("完整的路由对象:", route);
  console.log("查询参数对象:", route.query);
  console.log("ID值:", route.query.id);
  init();
  globalWebSocket.ws?.send("findAll");
});

const init = () => {
  if (typeof WebSocket === "undefined") {
    alert("您的浏览器不支持socket");
  } else {
    // 实例化socket
    socket.value = globalWebSocket.ws as WebSocket
    socket.value.onmessage = getInput;
  }
}

// 接收消息
const getInput = (msg: any) => {
  console.log("==websocket接收数据==");
  console.log(msg.data);
  if (msg.data == "修改算法成功") return;
  json.value = JSON.parse(msg.data);
  // 确保 id.value 是数字类型
  const idValue = typeof id.value === 'string' ? parseInt(id.value as string) : id.value;
  row.value = json.value.find((item: any) => item.id == idValue);
  form.value.input = JSON.parse(row.value.input);

  // 去掉注释（以%开头的行）
  let str = row.value.formula;
  while (str.startsWith('%')) {
    const end = str.indexOf('\n');
    if (end === -1) {
      str = '';
      break;
    }
    str = str.substring(end + 1).trimStart();
  }
  form.value.con = str;

  //设置输入变量
  form.value.input = form.value.input.map((item: any) => {
    if (item.type == "2") {
      console.log(item.value)
      if (item.value.length > 1) {
        item.value = item.value.join(",");
      }
    }
    return item;
  });

  form.value.inputSee = form.value.input.map((item: any, index: number) => {
    if (item.valueType == "int") return (index + 1) + ".算法变量的值 (整数)";
    if (item.valueType == "double") return (index + 1) + ".算法变量的值 (实数)";
    return (index + 1) + ".算法变量的值"; // 默认值
  });

  console.log(form.value);

  form.value.describe = row.value.describe + "请根据提示输入变量的值";
}


//算法提交
const onSubmit = () => {

  let str = {
    id: row.value.id,
    describe: form.value.describe,
    formula: form.value.con,
    input: [] as any[]
  }

  str.input = JSON.parse(JSON.stringify(form.value.input));

  for (let i = 0; i < str.input.length; i++) {
    if (str.input[i].type == 2) {
      let s = str.input[i].value + "";
      if (s.length != 1) str.input[i].value = str.input[i].value.split(',');
    }
  }

  if (socket.value) {
    socket.value.send("exec");
    socket.value.send(JSON.stringify(str));
    socket.value.onmessage = getOutput;
  }
}

const getOutput = (msg: any) => {
  type.value = 1;
  try {
    // 直接尝试解析数据
    let obj = typeof msg.data === 'string' ? JSON.parse(msg.data.replace(/\\n\\n\\n/g, ';').replace(/["\\n' ']/g, '')) : msg.data;
    form.value.output = JSON.stringify(obj.result);
    let aloValue = {
      R: obj.R,
      DR: 0,
      H: 0,
      Z: 0,
    };
    useAlgorithmStore().setAloValue(aloValue);
  } catch (e) {
    form.value.output = JSON.stringify(msg.data);
  }
}

const history = () => {
  if (socket.value) {
    socket.value.send("findAllRecords");
    const idToSend = typeof row.value.id === 'string' ? parseInt(row.value.id) : row.value.id;
    socket.value.send(idToSend.toString());
    socket.value.onmessage = getHistory;
  }
  drawer.value = true;
}

const getHistory = (msg: any) => {
  // 解析历史记录数据
  const historyJson = JSON.parse(msg.data);

  // 保证 tableData.value 的类型正确
  if (!Array.isArray(tableData.value)) {
    tableData.value = [];
  }

  // 补齐 tableData.value 的长度
  const needLength = historyJson.length - tableData.value.length;
  for (let i = 0; i < needLength; i++) {
    tableData.value.push({
      input: "",
      output: "",
      lastTime: "",
      success: "",
      reason: ""
    } as any); // 修复类型错误，使用 any 规避类型“never”的问题
  }

  // 填充表格数据
  for (let i = 0; i < historyJson.length; i++) {
    const record = historyJson[i];
    let inputStr = '';

    if (record.input === "no input") {
      inputStr = 'No input';
    } else {
      try {
        // 尽量用 JSON.parse 替代 eval，若格式不符则回退
        let js;
        try {
          js = JSON.parse(record.input);
        } catch {
          js = eval(record.input);
        }
        if (Array.isArray(js)) {
          inputStr = js.map((item: any) => item.value).join(';');
        } else {
          inputStr = '';
        }
      } catch (e) {
        inputStr = '';
      }
    }

    // 更新表格数据
    tableData.value[i] = {
      input: inputStr,
      output: record.output,
      lastTime: record.date,
      success: record.success,
      reason: record.message
    };
  }
}

const reviseAlo = () => {
  if (socket.value && row.value) {
    socket.value.send("changeAloFormula");
    var alo = {
      id: row.value.id,
      formula: form.value.con,
      input: form.value.input,
      output: form.value.output
    }
    console.log(alo);
    socket.value.send(JSON.stringify(alo));
    ElMessage({
      message: '修改成功',
      type: 'success'
    });
  }
}

// ---- 核心修改：使用 watch 替代 onMounted 中的逻辑 ----
watch(() => route.query.id, (newId: any, oldId: any) => {
  if (newId && newId !== oldId) {
    console.log("路由 ID 从", oldId, "变为", newId);
    id.value = newId as string;
    init();
    globalWebSocket.ws?.send("findAll");
  }
}, { immediate: true }
);


</script>

<style>
.el-drawer {
  padding: 20px;
}

.el-tooltip__popper {
  max-width: 40%;
}

.el-tooltip__popper,
.el-tooltip__popper.is-dark {
  background: #3399ff !important;
  color: #fff !important;
  line-height: 24px;
  font-size: 15px;
}

.tableLimit tr td .cell {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  /*可以显示的行数，超出部分用...表示 */
  -webkit-box-orient: vertical;
}

body .el-scrollbar__wrap {
  overflow-x: hidden;
}

#main {
  margin-top: 0px;
  font-size: 18px;
  font-family: "微软雅黑";
}

#word {
  width: 20%;
  height: 50px;
  line-height: 50px;
  font-size: 15px;
  margin-right: 0px;
}

#form {
  margin-top: 40px;
  margin-right: 20px;
  margin-left: 20px;
  width: 90%
}

.el-form-item__label {
  font-size: 15px !important;
}

.el-form-item__content {
  font-size: 16px !important;
}
</style>