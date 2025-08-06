<template>
  <div>
    <el-dialog title="表格" :visible.sync="dialogVisible" width="50%">
      <el-form ref="form" :model="form" label-width="130px" :label-position="labelPosition" :rules="rules">
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
      <span slot="footer" class="dialog-footer">
        <el-button @click="resetForm('form')">重置</el-button>
        <el-button type="primary" @click="onSubmit('form')">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="提示" :visible.sync="dialogVisible2" width="50%">
      <el-form ref="form" label-width="130px" :label-position="labelPosition">
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
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2 = false">取消</el-button>
        <el-button type="primary" @click="onSubmit2">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="提示" :visible.sync="dialogVisible3" width="50%">
      <el-form ref="form" label-width="130px" :label-position="labelPosition">
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
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2 = false">取消</el-button>
        <el-button type="primary" @click="onSubmit3">确定</el-button>
      </span>
    </el-dialog>

    <el-card class="box-card">
      <div slot="header" class="clearfix">
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
      <!-- <HotTable class="personTable" ref="hot" :settings="hotSettings"></HotTable> -->
    </el-card>
  </div>
</template>

<script>
//import Table from '@/components/Table/index.vue'
// import {HotTable, HotColumn} from '@handsontable/vue';
// import 'handsontable/dist/handsontable.full.min.css';
// import 'handsontable/dist/languages/zh-CN.js';

export default {
  data() {
    let num = /^[a-zA-Z]/;
    let validatePass = (rule, value, callback) => {
      if (!num.test(value)) {
        return callback(new Error('不能以数字开头'))
      }
      else {
        callback()
      }
    };
    return {
      set: {
        title: '123'
      },
      path: "ws://127.0.0.1:9090/",
      dialogVisible: false,
      dialogVisible2: false,
      dialogVisible3: false,
      IfUpdateData: false,
      labelPosition: "left",
      form: {
        name: '',
        columnNumbers: '',
        rowNumbers: '',
        resourceColumns: '',
        resourceRows: '',
        colHeadersData: [],
        colHeadersType: [],
      },
      row: 0,
      tableData: {
        name: '',
        header: [],
      },
      ccN: {
        name: "",
        oldname: [],
        newname: [],
      },
      SourceData: [],
      hotData: [],
      hotDataId: [],
      newName: "",
      newType: 0,
      hotSettings: {
        licenseKey: 'non-commercial-and-evaluation',
        rowHeaders: true,
        colHeaders: true,
        columnHeaderHeight: 30,
        rowHeights: 50,
        colWidths: 100,
        stretchH: 'all',
        width: "100%",
        height: "auto",
        language: "zh-CN",
        contextMenu: true,
        mergeCells: true,
        allowInsertColumn: true,
        allowremoveColumn: true,
        cells: function (row, col, prop) {
          const cellProperties = { readOnly: false, className: '' };  // 初始化属性和类名
          const visualRowIndex = this.instance.toVisualRow(row);  // 获取行号
          const visualColIndex = this.instance.toVisualColumn(col);  // 获取列号
          cellProperties.className = "cellStyle"
          return cellProperties;
        },
      },
      rules: {
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
      },

    }
  },
  mounted() {
    //获得数据库行号
    this.row = this.$store.state.row;
    this.dialogVisible = this.$store.state.tableData[this.row - 1].valid;
    //初始化
    this.init();
    if (!this.$store.state.tableData[this.row - 1].valid) {
      this.send("getUserTable");
      this.send(this.$store.state.tableData[this.row - 1].name);
    }
    //重新渲染表格
    if (!this.dialogVisible) {
      setTimeout(() => {
        this.renderTable();
      }, 0.01);
    };
    //添加数据
    this.form.colHeadersData = this.$store.state.tableData[this.row - 1].headers;
    if (!this.$store.state.tableData[this.row - 1].valid) {
      this.$refs['hot'].hotInstance.addHook('afterRemoveRow', this.deleteRows);
      // this.$refs['hot'].hotInstance.addHook('beforeRemoveRow', this.addRows);
      // this.$refs['hot'].hotInstance.addHook('beforeRemoveCol', this.addCols);
    }
  },
  components: {
    // HotTable,
    // HotColumn,
  },

  methods: {
    init() {
      if (typeof WebSocket === "undefined") {
        alert("您的浏览器不支持socket");
      }
      else {
        console.log("start")
        // 实例化socket
        this.socket = this.global.ws;
        this.socket.onmessage = this.getInput;
      }
    },
    // socket连接成功
    open() {
      console.log("socket连接成功");
    },
    // socket发送消息
    send(ms) {
      this.socket.send(ms);
    },
    // socket连接错误
    error() {
      console.log("连接错误");
    },
    close: function () {
      this.send("close");
      console.log("socket已经关闭");
    },
    // socket连接失败
    getInput(msg) {
      console.log("==websocket接收数据==");
      if (msg != null) {
        this.IfUpdateData = true;
      }
      var json = "";
      var js = "";
      js = eval(msg.data);
      json = js[0];
      console.log(json);
      let colnum = json.column.length;
      let rownum = json.data.length;

      //删除以前的数据
      for (let i = 0; i < this.$store.state.tableData[this.row - 1].headers.length; i++) {
        this.$store.commit({
          type: "deleteTableHeader",
          i: this.row - 1,
        });
      }

      //重新输入数据
      for (var i = 0; i < json.column.length; i++) {
        this.$store.commit({
          type: 'changeTableData',
          row: this.row,
          i: i,
          colnum: colnum,
          rownum: rownum,
          element: json.column[i].name,
        });
      }
      this.hotDataId = json.id;
      this.hotData = json.data;
      console.log(this.hotData);
      console.log(this.$store.state.tableData[this.row - 1].headers);
      // for (var i = 0; i <json.data.length; i++){
      //   this.hotData.push([]);
      //   for (var j = 1;j<json.data[i].length; j++){
      //     this.hotData[i].push(json.data[i][j]);
      //   }
      // }
    },

    getMessage(msg) {
      console.log("==websocket接收数据==");
      var js = "";
      js = msg.data;

      //是否建表成功
      if (js != 'create table success') {
        this.$message.error('建表失败');
        this.$store.commit({
          type: 'deleteTableData',
          i: this.row - 1,
        });
        this.socket = new WebSocket(this.path);
        this.global.setWs(this.socket);
      }
      else {
        this.$message({
          message: '恭喜你，建表成功',
          type: 'success'
        });
      }
      this.socket.onmessage = this.getInput;
    },
    addRows() {
      var row = this.$refs['hot'].hotInstance.countVisibleRows();
      if (row == 1) {
        this.$refs['hot'].hotInstance.alter('insert_row');
      }
    },
    addCols() {
      var col = this.$refs['hot'].hotInstance.countVisibleCols();
      if (col == 1) {
        this.$refs['hot'].hotInstance.alter('insert_col');
      }
    },
    //添加行数
    addNewRow() {
      this.$store.state.tableData[this.row - 1].rownum++;
      this.$refs['hot'].hotInstance.alter('insert_row');
      this.$refs['hot'].hotInstance.render();
    },
    //删除行数
    removeRow() {
      var rownum = this.$refs['hot'].hotInstance.countVisibleRows();
      this.$store.state.tableData[this.row - 1].rownum--;
      this.$refs['hot'].hotInstance.alter('remove_row');
      this.$refs['hot'].hotInstance.render();
    },
    addNewCol() {
      var colnum = this.$refs['hot'].hotInstance.countVisibleCols();
      this.$refs['hot'].hotInstance.alter('insert_col', colnum);
      this.$refs['hot'].hotInstance.render();
      this.dialogVisible3 = true;
    },
    removeCol() {
      var colnum = this.$refs['hot'].hotInstance.countVisibleCols();
      console.log(this.$store.state.tableData[this.row - 1].headers)

      //传送数据
      this.send("delColumn");
      var delCol = {
        name: this.$store.state.tableData[this.row - 1].name,
        column: this.$store.state.tableData[this.row - 1].headers[colnum - 1]
      }
      this.send(JSON.stringify(delCol));

      //修改表格
      this.$refs['hot'].hotInstance.alter('remove_col');
      this.$refs['hot'].hotInstance.render();

      //减一行
      if (colnum != 1) {
        this.$store.state.tableData[this.row - 1].colnum--;
        this.$store.commit({
          type: "deleteTableHeader",
          i: this.row - 1,
        });
      }


      console.log(this.$store.state.tableData[this.row - 1].headers);
    },
    //提交表单1
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.changeColAndRow(this.form.columnNumbers, this.form.rowNumbers);

          //记录数据
          this.$store.commit({
            type: 'changeTableName',
            i: this.row - 1,
            name: this.form.name,
          })
          this.getColHeaders();
          this.dialogVisible = false;
          this.renderPage = true;

        } else {
          this.$message.error('提交失败');
          return false;
        }
      });

    },
    save() {
      var colnum = this.$refs['hot'].hotInstance.countVisibleCols();
      var rownum = this.$refs['hot'].hotInstance.countVisibleRows();
      var array = [];

      console.log(this.$refs['hot'].hotInstance.getSourceDataArray(0, 0, rownum - 1, colnum - 1));
      //获得表格数据
      array = this.$refs['hot'].hotInstance.getSourceDataArray(0, 0, rownum - 1, colnum - 1);
      this.SourceData = [];
      for (var i = 0; i < rownum; i++) {
        this.SourceData.push([]);
        for (var j = 0; j < colnum; j++) {
          this.SourceData[i].push(array[i][j])
        }
      }

      // 传递表头数据
      if (this.$store.state.tableData[this.row - 1].valid == true) {
        this.tableData.name = this.$store.state.tableData[this.row - 1].name;
        for (var i = 0; i < colnum; i++) {
          console.log(this.$store.state.tableData[this.row - 1].headers[i]);
          this.tableData.header.push({
            key: this.$store.state.tableData[this.row - 1].headers[i],
            type: this.form.colHeadersType[i],
          });
        }
        let temp = JSON.stringify(this.tableData);
        this.send("creatTable");
        this.send(temp);
      }

      //传递表格数据
      let data = {
        name: this.$store.state.tableData[this.row - 1].name,
        data: this.SourceData,
      }
      let tmp = JSON.stringify(data);
      this.send("insert");
      this.send(tmp);

      if (this.$store.state.tableData[this.row - 1].valid == true) this.socket.onmessage = this.getMessage;
      else {
        this.$message({
          message: '恭喜你，保存成功',
          type: 'success'
        });
      }

      //改变表格状态
      this.$store.commit({
        type: "changeTableValid",
        i: this.row - 1,
        valid: false,
      });


    },
    getColHeaders() {
      //获得行数和列数
      var colnum = this.$refs['hot'].hotInstance.countVisibleCols();
      var rownum = this.$refs['hot'].hotInstance.countVisibleRows();
      console.log(colnum);
      console.log(rownum);

      //修改表格数据
      for (var i = 0; i < this.form.colHeadersData.length; i++) {
        this.$store.commit({
          type: 'changeTableData',
          row: this.row,
          i: i,
          colnum: colnum,
          rownum: rownum,
          element: this.form.colHeadersData[i]
        });
      }

      console.log(this.$store.state.tableData[this.row - 1]);
      this.$refs['hot'].hotInstance.updateSettings({
        colHeaders: this.makeColHeaders()
      })
    },
    turnInt(num) {
      if (num == '') return 0;
      else return parseInt(num);
    },
    //修改表头按钮函数
    changeColHeaders() {
      this.ccN.oldname = JSON.parse(JSON.stringify(this.$store.state.tableData[this.row - 1].headers))
      //重新赋值
      this.form.colHeadersData = this.$store.state.tableData[this.row - 1].headers;
      this.form.colHeadersType = this.$store.state.tableData[this.row - 1].headersType;

      this.dialogVisible2 = true;
    },
    //提交表单2
    onSubmit2() {
      //重新渲染表头
      this.getColHeaders();

      //传送数据
      this.send("changeColumnName");
      this.ccN.newname = this.$store.state.tableData[this.row - 1].headers;
      this.ccN.name = this.$store.state.tableData[this.row - 1].name;
      this.send(JSON.stringify(this.ccN));

      //关闭dialog
      this.dialogVisible2 = false;
    },
    //修改表头
    makeColHeaders() {
      return this.$store.state.tableData[this.row - 1].headers;
    },
    //重新渲染
    renderTable() {
      console.log(this.$store.state.tableData[this.row - 1].headers);
      console.log(this.$store.state.tableData[this.row - 1].headers.length);
      console.log(this.$store.state.tableData[this.row - 1].rownum);

      //重新渲染表格
      this.$refs['hot'].hotInstance.updateSettings({
        startCols: this.$store.state.tableData[this.row - 1].headers.length,
        startRows: this.$store.state.tableData[this.row - 1].rownum,
        colHeaders: this.makeColHeaders()
      })
      if (this.IfUpdateData) {
        // if(this.hotData.length == 1&&this.hotData[0].length == 0);
        this.$refs['hot'].hotInstance.updateData(this.hotData);
      }
    },
    changeColAndRow(colnum, rownum) {
      //修改列数
      if (colnum > 5) {
        for (var i = 0; i < colnum - 5; i++) {
          this.$refs['hot'].hotInstance.alter('insert_col');
        }
      }
      else if (colnum < 5) {
        if (colnum == 0) colnum++;
        for (var i = 0; i < 5 - colnum; i++) {
          this.$refs['hot'].hotInstance.alter('remove_col');
        }
      }
      //修改行数
      if (rownum > 5) {
        for (var i = 0; i < rownum - 5; i++) {
          this.$refs['hot'].hotInstance.alter('insert_row');
        }
      }
      else if (rownum < 5) {
        if (rownum == 0) rownum++;
        for (var i = 0; i < 5 - rownum; i++) {
          this.$refs['hot'].hotInstance.alter('remove_row');
        }
      }
    },
    deleteRows(index) {
      this.send("deleteUserLine");
      var json = {
        name: this.$store.state.tableData[this.row - 1].name,
        id: this.hotDataId[index],
      }
      var js = JSON.stringify(json);
      this.send(js);
    },
    onSubmit3() {
      var colnum = this.$refs['hot'].hotInstance.countVisibleCols();
      var rownum = this.$refs['hot'].hotInstance.countVisibleRows();

      this.$store.commit({
        type: 'changeTableData',
        row: this.row,
        i: colnum - 1,
        colnum: colnum,
        rownum: rownum,
        element: this.newName,
      });
      this.$store.commit({
        type: 'changeTableType',
        row: this.row,
        i: colnum - 1,
        element: this.newType,
      });

      this.$refs['hot'].hotInstance.updateSettings({
        colHeaders: this.makeColHeaders()
      })
      this.send("addColumn");
      var newcol = {
        name: this.$store.state.tableData[this.row - 1].name,
        column: this.newName,
        type: this.newType,
      }
      this.send(JSON.stringify(newcol));
      this.newName = "",
        this.newType = 0,
        this.dialogVisible3 = false;
      console.log(this.$store.state.tableData[this.row - 1].headers);
    },

    //重置表单
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

  }
}
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