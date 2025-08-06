<template>
  <div>
    <el-card class="box-card">
        <div slot="header" class="coit" style="font-family:'微软雅黑';font-size:16px;">
          <span>计算冷热备份可靠度</span>
          <div>
            <el-switch v-model="hotOrCold" active-text="热备份" inactive-text="冷备份" active-color="red" inactive-color="#409EFF">
            </el-switch>
          </div>
        </div>
        <div>
            <el-form ref="form" :model="form" label-width="120px">
                <el-form-item label="单元个数n" >
                    <el-input v-model="form.n" style="float:left;width: 40%;"></el-input>
                </el-form-item>
                <el-form-item label="取值k">
                    <el-input v-model="form.k" style="float:left;width: 40%;"></el-input>
                </el-form-item>
                <el-form-item label="单元可靠度R">
                    <el-input v-model="form.R" style="float:left;width:40%;margin-right:3%;"></el-input>
                    <el-input v-model="form.fR" :disabled="true" style="float:left;width:40%;"></el-input>
                </el-form-item>
                <el-form-item label="系统可靠性Rsys">
                    <el-input v-model="form.Rsys" :disabled="true" style="float:left;width:40%;margin-right:3%;"></el-input>
                    <el-input v-model="form.fRsys" style="float:left;width:40%;"></el-input>
                </el-form-item>
            </el-form>
            <el-button type="primary" @click="calRsys()">计算Rsys</el-button>
            <el-button type="primary" @click="calR()">反算R</el-button>
        </div>
    </el-card>

    <el-card class="box-card">
        <div slot="header" class="coit" style="font-family:'微软雅黑';font-size:16px;">
          <span>计算指数单元可靠度</span>
        </div>
        <el-form ref="form" :model="form" label-width="120px">
                <el-form-item label="λ(fit)" >
                    <el-input v-model="formE.lamda" style="float:left;width:40%;margin-right:3%;"></el-input>
                    <el-input v-model="formE.flamda" :disabled="true" style="float:left;width:40%;"></el-input>
                </el-form-item>
                <el-form-item label="时间t(h)">
                    <el-input v-model="formE.t" style="float:left;width:40%;margin-right:3%;"></el-input>
                    <el-input v-model="formE.ft"  style="float:left;width:40%;"></el-input>
                </el-form-item>
                <el-form-item label="可靠度R">
                    <el-input v-model="formE.R" :disabled="true" style="float:left;width:40%;margin-right:3%;"></el-input>
                    <el-input v-model="formE.fR" style="float:left;width:40%;"></el-input>
                </el-form-item>
            </el-form>
            <el-button type="primary" @click="calER()">计算可靠度</el-button>
            <el-button type="primary" @click="calELamda()">反算失效率</el-button>
    </el-card>
  </div>
</template>

<script>
import {Cold_Cmd_R_Click,Cold_Cmd_Rsys_Click} from "./cold"
import {Hot_Cmd_R_Click,Hot_Cmd_Rsys_Click} from "./hot"

export default {
  data(){
    return {
      form: {
        n:"",
        k:"",
        R:"",
        Rsys:"",
        fR:"",
        fRsys:"",
      },
      formE:{
        lamda:"",
        t:"",
        R:"",
        flamda:"",
        ft:"",
        fR:"",
      },
      hotOrCold:false,
    }
  },
  mounted() {
      this.init();
  },
  methods: {
    init() {
        
    },
    calRsys() {
        if(this.hotOrCold){
            this.form.Rsys=Hot_Cmd_Rsys_Click(this.form.n,this.form.k,this.form.R);
        }
        else{
            this.form.Rsys=Cold_Cmd_Rsys_Click(this.form.n,this.form.k,this.form.R);
        }
        
    },
    calR(){
        if(this.hotOrCold){
            this.form.fR=Hot_Cmd_R_Click(this.form.n,this.form.k,this.form.fRsys);
        }
        else{
            this.form.fR=Cold_Cmd_R_Click(this.form.n,this.form.k,this.form.fRsys);
        }
    },
    calER(){
        this.formE.R=Math.exp(-1*this.formE.lamda*this.formE.t);
    },
    calELamda(){
        this.formE.flamda=(-1*Math.log(this.formE.fR))/this.formE.ft;
    },
  }

}
</script>

<style></style>