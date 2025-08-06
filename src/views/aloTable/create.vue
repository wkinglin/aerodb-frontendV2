<template>
    <div id="main">
        <el-card class="box-card">
            <template #header>
                <div class="clearfix">
                    <el-button type="primary" @click="addVariable()" style="float: left;margin-top:4px">新增变量</el-button>
                    <el-button type="primary" @click="deleteVariable()" style="float: left;margin-top:4px">删除变量</el-button>
                    <el-button type="primary" @click="onSubmit('form')" style="float: left;margin-top:4px">提交</el-button>
                    <el-button @click="resetForm('form')" style="float: left;margin-top:4px">重置</el-button>
                </div>
            </template>
            <el-form id="newform" ref="formRef" :model="form" :rules="rules" label-position="left" label-width="110px">
                <el-form-item label="算法名称" prop="name">
                    <el-input type="input" placeholder="请输入算法名称" v-model="form.name"
                        style="width:80%;float:left;"></el-input>
                </el-form-item>
                <div v-for="(input, index) in form.inputs" :key="input.key">
                    <el-row :gutter="50">
                        <el-col :span="10">
                            <el-form-item label="变量名称" :prop="'inputs.' + index + '.name'" :rules="myRules">
                                <el-input type="input.name" v-model="input.name"
                                    placeholder="请输入变量名称"></el-input>
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
                                    <el-radio :label="1">数字</el-radio>
                                    <el-radio :label="2">数组</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                        <el-col v-if="input.type === 2" :span="10">
                            <el-form-item label="数组元素个数">
                                <el-input-number v-model="input.dimension" :min="1" label="数量"></el-input-number>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
                <el-form-item label="算法结果">
                    <el-input placeholder="请输入结果变量,将可能的结果变量用逗号隔开" v-model="form.output"
                        style="width:80%;float:left;"></el-input>
                </el-form-item>
                <el-form-item label="算法内容描述">
                    <el-input type="textarea" :rows="4" :min="2" placeholder="请输入内容" v-model="form.discribed"
                        style="width:80%;float:left;"></el-input>
                </el-form-item>
                <el-form-item label="算法内容" prop="context">
                    <el-input type="textarea" :rows="4" :min="2" placeholder="请输入内容" v-model="form.context"
                        style="width:80%;float:left;"></el-input>
                </el-form-item>
                <!-- <el-form-item label="可能的结果个数" label-width="150px">
                <el-input-number v-model="form.output" :min="1" label="数量" style="float:left;"></el-input-number>
            </el-form-item> -->
            </el-form>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import globalWebSocket from '@/global'

// 响应式数据
const number = ref(0)
const form = reactive({
    name: "",
    inputs: [{
        key: 0, // 添加key属性用于v-for
        name: "",
        value: "",
        valueType: "",
        type: 1, // 改为数字类型
        dimension: 0,
    }],
    context: "",
    discribed: "",
    output: "",
})

const myRules = [
    { required: true, message: "请输入变量名称", trigger: "blur" },
    { type: 'string', required: true, message: "变量名称必须为字符串", trigger: "blur" }
]

const rules = reactive({
    name: [{ required: true, message: "请输入算法名称", trigger: "blur" }],
    context: [{ required: true, message: "请输入算法内容", trigger: "blur" }],
})

const valueType = [{ required: true, message: "请选择变量类型", trigger: "change" }]
const type = [{ required: true, message: "请选择变量种类", trigger: "change" }]

// 表单引用
const formRef = ref()

// WebSocket相关
const socket = ref<WebSocket | null>(null)

// 组件挂载时初始化
onMounted(() => {
    init()
})

const init = () => {
    if (typeof WebSocket === "undefined") {
        alert("您的浏览器不支持socket")
    } else {
        // 实例化socket
        socket.value = globalWebSocket.ws as WebSocket
        // 监听socket连接
        socket.value.onopen = open
        // 监听socket错误信息
        socket.value.onerror = error
        // 监听socket消息
        socket.value.onmessage = getInput
    }
}

const open = () => {
    console.log("socket连接成功")
}

const send = (ms: string) => {
    if (socket.value) {
        socket.value.send(ms)
    }
}

const getInput = (msg: any) => {
    console.log("==websocket接收数据==")
    console.log(msg.data)
}

const error = () => {
    console.log("连接错误")
}

const close = () => {
    send("close")
    console.log("socket已经关闭")
}

const turnInt = (num: string | number) => {
    if (num == '') return 0
    else return parseInt(num.toString())
}

const addVariable = () => {
    form.inputs.push({
        key: form.inputs.length, // 添加唯一的key
        name: "",
        value: "",
        valueType: "",
        type: 1, // 改为数字类型
        dimension: 0,
    })
}

const deleteVariable = () => {
    form.inputs.pop()
}

const onSubmit = (formName: string) => {
    formRef.value?.validate((valid: boolean) => {
        if (!valid) {
            ElMessage.error('提交失败')
            return false
        } else {
            var algorithm = {
                name: "",
                path: "",
                inputs: [] as any[],
                output: [] as any[],
                formula: "",
                describe: "",
            }
            algorithm.name = form.name
            for (var i = 0; i < form.inputs.length; i++) {
                algorithm.inputs.push(form.inputs[i])
                // 修复类型转换
                algorithm.inputs[i].value = String(algorithm.inputs[i].value || "0")
                algorithm.inputs[i].type = String(algorithm.inputs[i].type || "0")
            }
            algorithm.formula = form.context
            algorithm.describe = form.discribed
            // 修复output赋值
            algorithm.output = form.output ? form.output.split(",") : []

            console.log(algorithm)

            var s = JSON.stringify(algorithm)
            send("createAlo")
            send(s)
            ElMessage({
                message: '恭喜你，成功提交',
                type: 'success'
            })
        }
    })
}

const resetForm = (formName: string) => {
    formRef.value?.resetFields()
}
</script>



<style scoped>
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both
}

.input {
    width: 50%;
}

#newform {
    margin-left: 1%;
}
</style>

<style> 
.el-select-dropdown .el-scrollbar .el-scrollbar__wrap {
    overflow: scroll !important;
}
</style>