<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span style="float:left;font-family:'微软雅黑';font-size:16px">上传文件</span> 
        <el-button type=primary @click="dialogVisible=true" style="float: right;margin-top:7px">上传文件</el-button>
      </div>
      <el-upload class="upload-demo" drag action="" :file-list="fileList" :on-change="handleChange" multiple>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em>。只能上传csv文件</div>
      </el-upload>

    <el-dialog title="名称"  :visible.sync="dialogVisible" width="50%">
        <el-form :model="form">
            <el-form-item label="数据库名称">
                <el-input v-model="form.filename" style="width:50%" placeholder="请输入上传文件名称"></el-input>
            </el-form-item>
            <el-form-item label="是否上传到已有数据库中">
                <el-radio v-model="form.isMerge" label="true">是</el-radio>
                <el-radio v-model="form.isMerge" label="false">否</el-radio>
            </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="UploadFile()">确 定</el-button>
        </span>
    </el-dialog>

    </el-card>
  </div>
</template>

<script>
    export default {
        data() {
            return{
                dialogVisible:false,
                form:{
                    filename:"",
                    isMerge:"",
                },
                fileList:[],
                blob:"",
            }
        },
        mounted() {
            //初始化
            this.init();
	    },
        methods: {
            init() {
                // 实例化socket
                this.socket=this.global.ws;
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
            getMessage(msg){

            },
            async handleChange (file) {
                this.fileList = [file],
                this.blob = new Blob([JSON.stringify(file)], { type: 'application/json' });
                console.log('blob', this.blob);
            },
            

            async UploadFile () {
                var binaryString;
                if(this.fileList.length <= 0){
                    this.$message.error('请选择文件');
                    return
                }
                var reader = new FileReader();
                for(var i = 0; i < this.fileList.length; i++){
                    // console.log(JSON.stringify(this.fileList[i]));
                    // let blob = new Blob(JSON.stringify(this.fileList[i]));

                    this.send("upLoadCsv");
                    reader.readAsText(this.fileList[i].raw);
                    console.log(this.fileList[i].raw);
                    this.send(JSON.stringify({
                            name:this.form.filename,
                            isMerge:this.form.isMerge,
                            path:this.fileList[i].raw.path,
                        }));
                    
                    // reader.onload = (evt)=> {
                    //     binaryString=evt.target.result;
                    //     console.log(binaryString);
                    //     this.send(binaryString);
                    // }
                }
                this.dialogVisible=false;
                this.$message({
                    message: '成功上传',
                    type: 'success'
                });
            }

        }

    }
</script>

<style>
    .upload-demo{
        font-family:"微软雅黑"
    }
</style>
