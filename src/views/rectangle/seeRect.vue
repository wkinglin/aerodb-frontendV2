<template>
   <div>
    <el-card class="box-card">
        <div slot="header" class="coit" style="font-family:'微软雅黑';font-size:16px;">
            <span>查看框图</span> 
            <el-button type=primary @click="dialogVisible=true;" style="float: right;margin-top:4px">新建框图</el-button>
        </div> 
        
            <div v-for="(item,index) in name" :key="index">
                <div class="wrap">
                    <span style="margin:0px 10px;font-size:18px">{{item}}</span>    
                    <div class="button">
                        <!-- <el-button type="primary" @click="changeOldMessage(index)" size="medium">修改</el-button> -->
                        <el-button type="primary" @click="seePicture(index)" size="large" icon="el-icon-edit" circle></el-button>     
                        <el-button type="danger" @click="deletePicture(index)" size="large" icon="el-icon-delete" circle></el-button>     
                    </div>
                </div>
                <el-divider></el-divider>   
            </div>
        
    </el-card>

    <el-dialog title="提示" :visible.sync="dialogVisible" width="50%">
      <el-input style="width:80%" v-model="newName" placeholder="请输入框图名称"></el-input>
      <el-input style="width:80%" v-model="newMessage" placeholder="请输入框图备注"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit()">确定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="提示" :visible.sync="dialogVisible2" width="50%">
        <el-input style="width:80%" v-model="changeName" placeholder="请输入新名称"></el-input>
        <el-input style="width:80%" v-model="changeMessage" placeholder="请输入新备注"></el-input>
    <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editPicture()">确定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
    data() {
        return{
            dialogVisible:false,
            dialogVisible2:false,
            newName:"",
            newMessage:"",
            changeName:"",
            changeMessage:"",
            messageIndex:0,
            id:[],
            name:[1,2,3],
            message:["haha","lele","heihei"],
            sysId:[],
            proId:[],
        }
    },
    mounted() {
        this.init();
        this.send("findAllGraph");

    },
    methods: {
       init() {
        // 实例化socket
        this.socket=this.globalWebSocket.ws;
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
       //接收数据
       getMessage(msg){
           console.log(msg.data);
           if(msg.data=="delete success"||msg.data=="update success"||msg.data=="add success"){
                this.$message({
                    message: '成功',
                    type: 'success'
                });
            }
            else if(msg.data=="delete fail"||msg.data=="update fail"||msg.data=="add faill"){
                this.$message.error('出错');
            }
            else{
                var json=eval(msg.data);
                console.log(json)
                if(json.length!=undefined){
                    this.id=[];
                    this.name=[];
                    this.message=[];
                    this.sysId=[];
                    this.proId=[];    
                
                    for(var i=0;i<json.length;i++){
                        this.id.push(json[i].id);
                        this.name.push(json[i].name);
                        this.message.push(json[i].message);
                        this.sysId.push(json[i].sysId);
                        this.proId.push(json[i].proId);
                    }
                }
            }
           console.log(this.id);
        },
        judgeMessage(msg){
            var json=eval(msg.data);
            if(json=="delete success"||json=="update success"||json=="add seccess"){
                this.$message({
                    message: '成功删除',
                    type: 'success'
                });
            }
            else{
                this.$message.error('删除失败');
            }
        },
        seePicture(index){
            this.$router.push({ 
                name:'查看框图',
                params: {
                    name: this.name[index],
                    id: this.id[index],
                    }
                })

            var sys=this.sysId[index];
            var pro=this.proId[index];

            //设置系统和产品的编号
            var sysAndProId={
                sysId:sys,
                proId:pro,
            }
            this.$store.commit("changeSysAndProId",sysAndProId);
            
            var isSys=false;
            if(pro==-1) isSys=true;
            //设置传值
            let rectValue={
                pictureName: this.name[index],
                id: this.id[index],
                isSystem:isSys,
            }

            this.$store.commit("changeRectValue",rectValue);

        },
        deletePicture(index){
            // this.socket.onmessage = this.judgeMessage;
            
            this.name.splice(index,1);
            this.message.splice(index,1);
            this.send("deleteGraph");
            
            this.send(this.id[index]);
            
            // this.socket.onmessage = this.getMessage;
            
        },
        submit(){
            // this.socket.onmessage = this.judgeMessage;
            this.name.push(this.newName);
            this.message.push(this.newMessage);
            this.dialogVisible=false;
            this.send("addGraph");
            this.send(JSON.stringify({name:this.newName,message:""}));
            // this.socket.onmessage = this.getMessage;
            
        },
        changeOldMessage(index){
            this.dialogVisible2=true;
            this.messageIndex=index;
            this.changeMessage=this.message[index];
            this.changeName=this.name[index];
        },
        editPicture(){
            // this.socket.onmessage = this.judgeMessage;
            this.dialogVisible2=false;
            this.message[this.messageIndex] = this.changeMessage;
            this.name[this.messageIndex] =this.changeName;
            this.send("updateGraph");
            this.send(JSON.stringify({
                id:this.id[this.messageIndex],
                name:this.name[this.messageIndex],
                message:this.message[this.messageIndex]
            }));
            
                // this.socket.onmessage = this.getMessage;
            
        }
    },
}
</script>

<style>
    .button{
        margin: 0px 10px;
    }
    .wrap{
        display:flex; 
        justify-content:space-between;
    }
    .coit{
        display:flex; 
        justify-content:space-between;
    }
    .el-collapse-item{
        
        font-family: "微软雅黑";
    }
    .el-collapse-item__header{
        font-size:18px !important;
    }
    .el-collapse-item__content{
        font-size:14px !important;
        /* background-color: #F5F5F5!important; */
    }
</style>