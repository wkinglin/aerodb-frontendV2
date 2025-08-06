<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-button type=primary @click="creatTables()" style="float: left;margin-top:4px">新建数据库</el-button>
        <!-- <el-button type=primary @click="deleteTables()" style="float: left;margin-top:4px">删除数据库</el-button> -->
        <el-button type=primary plain @click="seeAll()" style="float:right;margin-top:4px">取消</el-button>
        <el-button type=primary @click="searchTables()" style="float:right;margin-top:4px">
          <el-icon>
            <Search />
          </el-icon>
          搜索
        </el-button>
        <el-input type="input" placeholder="请输入数据库名称" v-model="search"
          style="width:auto;float:right;margin-left:1%;margin-right: 1%"></el-input>
      </div>
      <el-table :data="this.$store.state.tableData" style="font-size: 18px" border stripe>
        <el-table-column prop="name" label="数据库名称"></el-table-column>
        <el-table-column label="操作" width="200">
          <el-button type=primary @click="watchTables(index)" style="margin-top:4px">查看数据库</el-button>
        </el-table-column>
      </el-table>
      <lazy-render :data="this.tableData" :time="300" :limit="1" track-by-data>
        <div v-for="(item, index) in this.tableData" :key="index" class="text">
          <div class="item">
            <div>{{ item.name }}</div>
            <div>
              <el-button type=primary @click="watchTables(index)" style="margin-top:4px">查看数据库</el-button>
              <el-button type=primary @click="changeTablesName(index)" style="margin-top:4px">修改数据库名字</el-button>
              <el-button type=primary @click="deleteRows(index)" style="margin-top:4px">删除</el-button>
            </div>
          </div>
          <el-divider></el-divider>
        </div>
      </lazy-render>
    </el-card>

    <el-dialog title="改名" :visible.sync="dialogVisible" width="50%" :before-close="handleClose">
      <el-form>
        <el-form-item prop="name" :rules="rule">
          <el-input v-model="name" placeholder="请输入名称"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onSubmitName()">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import Table from '@/components/Table/index.vue'

export default {
  data() {
    return {
      tablenumbers: 0,
      tableName: [],
      search: '',
      dialogVisible: false,
      name: "",
      index: 0,
      rule: {
        name: [{ required: true, message: '名称不能为空' }],
      },
      tableData: [],
    }
  },
  components: {
    // Table,
  },
  mounted() {
    //初始化
    this.init();
    this.send("getAllUserTables");
  },

  methods: {
    init() {
      // 实例化socket
      this.socket = this.global.ws
      // 监听socket连接
      this.socket.onopen = this.open;
      // 监听socket错误信息
      this.socket.onerror = this.error;
      // 监听socket消息
      this.socket.onmessage = this.getMessage;
    },
    open() {
      console.log("socket连接成功");
    },
    // socket连接失败
    error() {
      console.log("连接错误");
    },
    // 发送数据
    send(ms) {
      this.socket.send(ms);
    },
    close: function () {
      this.send("close");
      console.log("socket已经关闭")
    },
    //接收数据
    getMessage(msg) {
      var arr = [];
      arr = eval(msg.data)
      var l = arr.length;

      for (var i = 0; i < l; i++) {
        var f = 1;
        // console.log(this.$store.state.tableData);
        // console.log("长度"+this.$store.state.tableData.length);
        if (this.$store.state.tableData.length > 1) {
          for (var j = 0; j < this.$store.state.tableData.length; j++) {
            if (this.$store.state.tableData[j].name == arr[i]) {
              f = 0;
            }
          }
        }
        if (f == 0) continue;
        //增加数据库
        this.$store.commit("increment", this.$store.state);
        //修改数据库名字
        this.$store.commit({
          type: 'changeTableName',
          i: i,
          name: arr[i],
        });
        //取消显示设置表单
        this.$store.commit({
          type: "changeTableValid",
          i: i,
          valid: false,
        });
      }
      this.$store.state.newTableValible = false;

      // for(var i=0;i<l;i++){
      //   this.tableData.push({
      //     name:arr[i],
      //   });
      // }

      this.tableData = this.$store.state.tableData;
      console.log(this.tableData);

    },
    creatTables() {
      this.tablenumbers++;
      this.$store.commit("increment", this.$store.state)
    },
    deleteTables() {
      this.tablenumbers--;
      this.$store.commit("decrement", this.$store.state);

    },
    watchTables(row) {
      console.log(this.$store.state.tableData[row]);
      this.$store.state.row = row + 1;
      this.$router.push({
        path: `table`,
      })
    },
    changeTablesName(index) {
      this.dialogVisible = true;
      this.index = index;
    },
    onSubmitName() {
      console.log(this.index);
      this.send("changeTableName");
      var s = {
        oldname: this.$store.state.tableData[this.index].name,
        newname: this.name,
      }
      this.send(JSON.stringify(s));
      this.$store.commit({
        type: 'changeTableName',
        i: this.index,
        name: this.name,
      });
      this.dialogVisible = false;
    },
    searchTables() {
      this.tableData = [];
      for (var i = 0; i < this.$store.state.tableData.length; i++) {
        if (this.$store.state.tableData[i].name.startsWith(this.search)) {
          this.tableData.push(this.$store.state.tableData[i]);
        }
      }
    },
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done();
        })
        .catch(_ => { });
    },
    seeAll() {
      this.tableData = this.$store.state.tableData;
      this.search = "";
    },
    deleteRows(index) {
      console.log(index);
      console.log(this.$store.state.tableData[index].name);
      //向后端传递删除信息
      var UserTable = {
        name: this.$store.state.tableData[index].name,
      }
      this.send("deleteUserTable");
      this.send(JSON.stringify(UserTable));

      //执行删除操作
      this.$store.commit({
        type: 'deleteTableData',
        i: index,
      });
      this.$message({
        message: '删除成功',
        type: 'success'
      });

    }
  }
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
