<template>
  <div id="main">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-button type="primary" @click="addVariable()"  icon="el-icon-circle-plus" style="float: left;margin-top:4px">新增变量</el-button>
        <el-button type="primary" @click="deleteVariable()" icon="el-icon-delete-solid" style="float: left;margin-top:4px">删除变量</el-button>
        <el-button type="primary" @click="onSubmit('form')" icon="el-icon-success" style="float: left;margin-top:4px">提交</el-button>
        <el-button  @click="resetForm('form')" style="float: left;margin-top:4px">重置</el-button>
      </div>
      <el-form id="newform" ref="form" :model="form" :rules="rules" label-position="left" label-width="110px">
            <el-form-item label="算法名称" prop="name">
                <el-input type="input" placeholder="请输入算法名称" v-model="form.name" style="width:80%;float:left;"></el-input>
            </el-form-item>
          <div v-for="(input,index) in form.inputs" :key="input.key">  
            <el-row :gutter="50">
                <el-col :span="10">
                <el-form-item label="变量名称" :prop="'inputs.' + index + '.name'" :rules="myRules">
                    <el-input type="input.name" v-model.number="input.name" placeholder="请输入变量名称"></el-input>
                </el-form-item>
                </el-col>
                <el-col :span="10">
                    <el-form-item label="变量类型" :prop="'inputs.' + index + '.valueType'" :rules="valueType">
                        <el-select v-model="input.valueType" placeholder="请选择变量类型" popper-class="select">
                            <el-option label="整数" value="int"></el-option>
                            <el-option label="浮点数" value="double"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="50">
                <el-col :span="10">
                    <el-form-item label="是否为数组" :prop="'inputs.' + index + '.type'" :rules="type">
                        <el-radio-group v-model="input.type">
                            <el-radio label=1>数字</el-radio>
                            <el-radio label=2>数组</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col v-if="input.type==2" :span="10">
                    <el-form-item label="数组元素个数">
                        <el-input-number v-model.number="input.dimension" :min="1" label="数量"></el-input-number>
                    </el-form-item>
                </el-col> 
            </el-row>
          </div>
            <el-form-item label="算法结果">
                <el-input placeholder="请输入结果变量,将可能的结果变量用逗号隔开" v-model="form.output" style="width:80%;float:left;"></el-input>
            </el-form-item>  
            <el-form-item label="算法内容描述">
                <el-input type="textarea" :rows="4" :min="2" placeholder="请输入内容" v-model="form.discribed" style="width:80%;float:left;"></el-input>
            </el-form-item>
            <el-form-item label="算法内容" prop="context">
                <el-input type="textarea" :rows="4" :min="2" placeholder="请输入内容" v-model="form.context" style="width:80%;float:left;"></el-input>
            </el-form-item>
            <!-- <el-form-item label="可能的结果个数" label-width="150px">
                <el-input-number v-model.number="form.output" :min="1" label="数量" style="float:left;"></el-input-number>
            </el-form-item> -->
      </el-form>   
    </el-card>
  </div>    
</template>

<script>
  export default {
    data(){
        return{
            number:0,
            form:{
                name:"",
                inputs:[{
                    name:"",
                    value:"",
                    valueType:"",
                    type:"",
                    dimension:0,
                }],
                context:"",
                discribed:"",
                output:"",
            },
            myRules:[{required: true, message: "请输入变量名称", trigger: "blur"},
                    {type:'string', required: true, message: "变量名称必须为字符串", trigger: "blur" }
            ],
            rules: {
                name: [{required: true, message: "请输入算法名称", trigger: "blur"}],
                context:[{required: true, message: "请输入算法内容", trigger: "blur"}],
            },
            valueType:[{required: true, message: "请选择变量类型", trigger: "change"}],
            type:[{required: true, message: "请选择变量种类", trigger: "change"}],
        }
    },
    mounted() {
        this.init();
    },
    
    methods: {
        init() {
            if (typeof WebSocket === "undefined") {
                alert("您的浏览器不支持socket");
            } else {
                // 实例化socket
                this.socket=this.global.ws
                // 监听socket连接
                this.socket.onopen = this.open;
                // 监听socket错误信息
                this.socket.onerror = this.error;
                // 监听socket消息
                this.socket.onmessage = this.getInput;
            }
        },
        open() {
            console.log("socket连接成功");
        },
        send(ms) {
            this.socket.send(ms);
        },
        getInput(msg){
            console.log("==websocket接收数据==");
            console.log(msg.data);
            
        },
        error() {
            console.log("连接错误");
        },
        close: function () {
            this.send("close");
            console.log("socket已经关闭")
        },
        turnInt(num){
            if(num=='') return 0;
            else return parseInt(num);
        },
        addVariable(){
            this.form.inputs.push({
                name:"",
                value:"",
                valueType:"",
                type:"",
                dimension:0,
            });
        },
        deleteVariable(){
            this.form.inputs.pop();
        }, 
        onSubmit(formName){
            this.$refs[formName].validate((valid) => {  //开启校验
                if (!valid) {   // 如果校验通过，请求接口，允许提交表单
                    this.$message.error( '提交失败');
                    return false;
                }
                else{
                    var algorithm={
                        name:"",
                        path:"",
                        inputs:[],
                        output:[],
                        formula:"",
                        describe:"",
                    }
                    algorithm.name=this.form.name;
                    for(var i=0;i<this.form.inputs.length;i++){
                        algorithm.inputs.push(this.form.inputs[i]);
                        algorithm.inputs[i].value=algorithm.inputs[i].value-"0";
                        algorithm.inputs[i].type=algorithm.inputs[i].type-"0";
                    }
                    algorithm.formula=this.form.context;
                    algorithm.output=this.form.output;
                    algorithm.describe=this.form.discribed;
                    algorithm.output=this.form.output.split(",");

                    console.log(algorithm);
                    
                    var s =JSON.stringify(algorithm);
                    this.socket.send("createAlo");
                    this.socket.send(s);
                    this.$message({
                        message: '恭喜你，成功提交',
                        type: 'success'
                    });
                } 
            })
           
        },
        resetForm(formName) {
         this.$refs[formName].resetFields();
        } 
    }
  }
</script>

<style>
    .input{
        width:50%;
    }
    #newform{
        margin-left:1%;
    }
    .el-select-dropdown .el-scrollbar .el-scrollbar__wrap
    {
        overflow: scroll!important;
    }
</style>