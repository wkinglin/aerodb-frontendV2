<template>
    <div>
      <el-card class="card" >
          <div slot="header"  style="height:40px;display:flex;justify-content:space-between;align-items:center;" >
            <div class="titleName">产品树</div>
            <div>
              <el-button type="primary" icon="el-icon-plus" @click="addVisible=true;">添加</el-button>
              <el-button type="primary" icon="el-icon-delete" @click="deleteVisible=true;">删除</el-button>
              <el-button type="primary" @click="beginMove()">移动</el-button>
            </div>
          </div>
          <div style="width:100%">
            <el-select v-model="value" placeholder="系统选择" style="float:left;margin-top:5px;">
              <el-option v-for="item in systems" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <el-button type="primary" style="float:left;margin-top:9px;margin-left:1%;" @click="select()">查询</el-button>
            <!-- <el-select v-model="value" placeholder="产品选择" style="float:left;margin-top:5px;margin-left:1%">
              <el-option v-for="item in products" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select> -->
              <el-button type="primary" style="float:right;margin-top:9px;margin-left:1%;" @click="search()">查询</el-button>
              <el-input v-model="input" style="width:30%;float:right;margin-top:4px;" placeholder="请输入搜索的系统"></el-input>
          </div>
  
          <div id="Flow" class="flow"></div>
      </el-card>
  
      <el-dialog title="添加系统或产品模块"  :visible.sync="addVisible" >
        <el-form label-width="150px" label-position="left" :model="addForm" style="margin:0px 50px;">
          <el-form-item label="选择添加的模块">
            <el-radio v-model="radio" label="1">添加系统</el-radio>
            <el-radio v-model="radio" label="2">添加产品</el-radio>
          </el-form-item>
          <el-form-item v-if="radio=='2'" label="添加到哪一个系统中">
            <el-select v-model="addForm.sysId" placeholder="系统选择">
              <el-option v-for="item in systems" :key="item.id" :label="item.label" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="radio=='2'" label="产品类型">
            <el-input v-model="addForm.type" placeholder="请输入产品类型"></el-input>
          </el-form-item>
          <el-form-item label="系统或产品名称">
            <el-input v-model="addForm.name" placeholder="请输入名称"></el-input>
          </el-form-item>
          <el-form-item label="系统或产品描述">
            <el-input type="textarea" v-model="addForm.description" :row="4" placeholder="请输入描述"></el-input>
          </el-form-item>
          
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addVisible = false">取 消</el-button>
          <el-button type="primary" @click="addSysOrPro()">确 定</el-button>
        </span>
      </el-dialog>
  
      <el-dialog title="删除系统或产品模块"  :visible.sync="deleteVisible" >
        <el-form label-width="150px" label-position="left" :model="deleteForm" style="margin:0px 50px;">
          <el-form-item label="选择删除的模块">
            <el-radio v-model="dRadio" label="1">删除系统</el-radio>
            <el-radio v-model="dRadio" label="2">删除产品</el-radio>
          </el-form-item>
          <el-form-item v-if="dRadio=='1'" label="删除哪一个系统">
            <el-select v-model="deleteForm.sysId" placeholder="系统选择">
              <el-option v-for="item in systems" :key="item.id" :label="item.label" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="dRadio=='2'" label="删除哪一个产品">
            <el-select v-model="deleteForm.sysId" placeholder="系统选择" @change="selectSys()">
              <el-option v-for="item in systems" :key="item.id" :label="item.label" :value="item.id"></el-option>
            </el-select>
            <el-select v-if="proVisible" v-model="deleteForm.proId" placeholder="产品选择">
              <el-option v-for="item in products" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
  
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addVisible = false;deleteForm.sysId='';deleteForm.proId=''">取 消</el-button>
          <el-button type="primary" @click="delSysOrPro()">确 定</el-button>
        </span>
      </el-dialog>
  
      <el-dialog title="移动或解绑产品"  :visible.sync="moveVisible" >
        <el-form label-width="150px" label-position="left" :model="deleteForm" style="margin:0px 50px;">
          <el-form-item label="选择操作">
            <el-radio v-model="mRadio" label="1">移动产品</el-radio>
            <el-radio v-model="mRadio" label="2">解除绑定</el-radio>
          </el-form-item>
          <el-form-item v-if="mRadio=='1'" label="移动哪一个产品">
            <el-select  v-model="moveForm.proId" placeholder="产品选择">
              <el-option v-for="item in products" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
  
          <el-form-item v-if="mRadio=='1'" label="移动到哪一个系统">
            <el-select v-model="moveForm.toSystemId" placeholder="系统选择">
              <el-option v-for="item in systems" :key="item.id" :label="item.label" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
  
          <el-form-item v-if="mRadio=='2'" label="产品解除绑定">
            <el-select  v-model="moveForm.proId" placeholder="产品选择">
              <el-option v-for="item in products" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
  
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="moveVisible = false;">取 消</el-button>
          <el-button type="primary" @click="moveProduct()">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import G6 from "@antv/g6";
  
  export default {
    data() {
      return {
        input:"",
        graph:'',
        data:[],
        title:"",
        json:"",
        systems:[],
        products:[],
        value:"",
        addVisible:false,
        deleteVisible:false,
        proVisible:false,
        moveVisible:false,
        radio:"1",
        dRadio:"1",
        mRadio:"1",
        addForm:{
          sysId:"",    //对应系统
          name:"",
          type:"",
          description:"",
        },
        deleteForm:{
          sysId:"",
          proId:"",
        },
        moveForm:{
          proId:"",
          toSystemId:"",
        },
        recId:0,
        pictureName:"",
        isSystem:false,
        sysAndProId:{},
      };
    },
    
    mounted() {
      // this.data = {
      //   id: 'root',
      //   label: "例子：供配电",
         
       
      //   children: [
      //     {
      //       id:"node1",
      //       label: "太阳翼",
      //       children: [{
      //           id: "leaves1",
      //           label: "成败型单元可靠性评估",
                
                
      //         },
      //         {
      //           id: "leaves2",
      //           label: "应力-强度型单元可靠性评估",
                
              
      //         },
      //         {
      //           id: "leaves3",
      //           label: "性能正态型单元可靠性评估",
                
                
      //         },]
      //     }
      //   ]
      //  };
      
      this.newGraph(1200,550);
  
      // //读取数据
      // this.graph.data(this.data);
      
      // // 渲染图
      // this.graph.render();
      this.graph.fitCenter();
      this.graph.fitView(10);
  
      this.init();
      this.send("systemAll");
    },
    methods:{
      init() {
          // 实例化socket
            this.socket=this.global.ws
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
        getMessage(msg){
            if(msg.data=="instruction undefined") return;
            if(msg.data=="delete success"){
              this.$message({
                message: '成功删除',
                type: 'success'
              });
              return;
            }
            if(msg.data=="add success"){
              this.$message({
                message: '成功添加',
                type: 'success'
              });
              return;
            }
            if(msg.data=="move success"){
              this.$message({
                message: '成功移动',
                type: 'success'
              });
              return;
            }
            if(msg.data=="delete relation success"){
              this.$message({
                message: '成功解除绑定',
                type: 'success'
              });
              return;
            }
            this.json=eval(msg.data);
            for(var i=0;i<this.json.length;i++){
              this.systems.push({
                value:"选项"+i,
                label:this.json[i].name,
                id:this.json[i].id,
                R:this.json[i].R,
                DR:this.json[i].DR,
                H:this.json[i].H,
                Z:this.json[i].Z
              })
            }
        },
        beginMove(){
          this.moveVisible=true;
          this.socket.onmessage=this.getProducts;
          this.send("productAll");
        },
        getProducts(msg){
          let data;
          data=JSON.parse(msg.data);
          this.products=data.products;
          this.socket.onmessage=this.getMessage;
        },
        selectSys(){
          for(var i=0;i<this.json.length;i++){
            if(this.json[i].id==this.deleteForm.sysId||this.json[i].id==this.moveForm.sysId){
              this.products=this.json[i].pro;
              break;
            }
          }
          console.log(this.products);
          this.proVisible=true;
        },
        addSysOrPro(){
          this.addVisible=false;
          let data;
          if(this.radio==1){
            data={
              name:this.addForm.name,
              description:this.addForm.description
            }
          }
          else if(this.radio=='2'){
            data=this.addForm;
          }
          var s =JSON.stringify(data);
          if(this.radio=='1'){
            this.socket.send("addSystem");
          } 
          else if(this.radio=='2'){
            this.socket.send("addProduct");
          } 
          this.socket.send(s);
          console.log(s);
        },
        delSysOrPro(){
          this.deleteVisible=false;
          this.proVisible=false;
          let data;
          if(this.dRadio==1){
            data={
              id:this.deleteForm.sysId,
            }
          }
          else if(this.dRadio=='2'){
            data={
              id:this.deleteForm.proId,
            }
          }
          var s =JSON.stringify(data);
          if(this.dRadio=='1'){
            this.socket.send("deleteSystem");
          } 
          else if(this.dRadio=='2'){
            this.socket.send("deleteProduct");
          } 
          this.socket.send(s);
          console.log(s);
          this.deleteForm.sysId='';
          this.deleteForm.proId='';
          
        },
        moveProduct(){
          this.moveVisible=false;
          this.proVisible=false;
  
          let data;
          
          if(this.mRadio==1){
            data={
                sysId:this.moveForm.toSystemId,
                proId:this.moveForm.proId,
            }
  
            var s =JSON.stringify(data);
  
            this.socket.send("moveProduct");
            this.socket.send(s);
          }
          else if(this.mRadio=='2'){
            data={
                proId:this.moveForm.proId,
            }
            var s =JSON.stringify(data);
  
            this.socket.send("deleteRelation");
            this.socket.send(s);
          }
          this.moveForm.proId='';
          this.moveForm.toSystemId='';
        },
        select(){
            var cnt=this.value[2];
            var num=0;
            // this.title=this.json[cnt].name;
    
            // var a=100;
            // var b=500;
            // var c=a+600;
            // var d=b-500;
  
            //
              var sys=this.json[cnt];
              console.log(sys);
              var root={
                id: "sys"+sys.id,
                label: sys.name,
                description:"R:"+sys.R+"  DR:"+sys.DR+"  H:"+sys.H+"  Z:"+sys.Z,
                R:sys.R,
                DR:sys.DR,
                H:sys.H,
                Z:sys.Z,
                children:[],
              }
              
              // a+=300;
              // b-=400;
              for(var j=0; j<sys.pro.length;j++){
                var pro=sys.pro[j];
                console.log(pro);
                // b+=100;
                
                var fz={
                  id: "pro"+pro.id,
                  label: pro.name,
                  description:"R:"+pro.R+"  DR:"+pro.DR+"  H:"+pro.H+"  Z:"+pro.Z,
                  R:pro.R,
                  DR:pro.DR,
                  H:pro.H,
                  Z:pro.Z,
                  children:[],
                }
  
                if(pro.alo.length==0) num++;
                for(var i=0;i<pro.alo.length;i++){
                  var algorithm=pro.alo[i];
                  var aloId=algorithm.id;
                  var aloName=algorithm.name;
                  var index=aloName.indexOf('_');
                  var description=aloName.substring(0,index);
                  aloName=aloName.substring(index+1,aloName.length);
                  if(aloName.length>16){
                    aloName=aloName.substring(0,16);
                    aloName+="...";
                  }
                  num++;
                  // d+=100;
  
                  if(index!=-1){
                    fz.children.push({
                      id: "alo"+pro.id+"aloID"+aloId,
                      label: aloName,
                      description:description,
                      // x: c,
                      // y: d,
                    });
                  }
                  else{
                    fz.children.push({
                      id: "alo"+pro.id+"aloID"+aloId,
                      label: aloName,
                      // x: c,
                      // y: d,
                    });
                  }
                  
                  // this.data.edges.push({
                  //   source: "pro"+pro.id,
                  //   target: "alo"+pro.id+aloId,
                  // })
  
                }
                root.children.push(fz);
              }
              // a+=100
            
  
            // for(var i = 0; i < this.data.edges.length;i++){
            //   console.log(this.data.edges[i].source);
            //   console.log(this.data.edges[i].target);
            // }
  
            // for(var i = 0; i < this.data.nodes.length;i++){
            //   console.log(this.data.nodes[i].label);
            // }
            
            this.data=[];
            this.data=root;
            console.log(this.data);
            
            console.log(num);
            this.graph.destroy();
            if(num<3) num=3;
            this.newGraph(1100,120*num);
  
            this.graph.data(this.data);
  
            // 渲染图
            this.graph.render();
            this.graph.fitCenter();
  
            this.addAlo();
        },
  
        search(){
          var s;
          for(var i=0;i<this.json.length;i++){
            if(this.json[i].name==this.input){
              s=i;
              console.log(s);
              break;
            }
          }
          this.value="选项"+i;
          this.select();
        },
  
        deleteRelation(id){
          let data = {
            proId:id.split("")[3]-""
          };
          var s =JSON.stringify(data);
          console.log(s);
          this.socket.send("deleteRelation");
          this.socket.send(s);
  
        },
        addAlo(){
          this.graph.on('node:click', (e) => {
            // 先将所有当前是 click 状态的节点置为非 click 状态
            const clickNodes = this.graph.findAllByState('node', 'click');
            clickNodes.forEach((cn) => {
              this.graph.setItemState(cn, 'click', false);
            });
            const nodeItem = e.item; // 获取被点击的节点元素对象
            var name=nodeItem._cfg.id;
            console.log(nodeItem._cfg);
            console.log(name);
            this.graph.setItemState(nodeItem, 'click', true); // 设置当前节点的 click 状态为 true
            if (name[0]=="a"&&name[1]=="l"&&name[2]=="o"){
              var index=name.indexOf("aloID");
              var id=0;
              for(var i=index+5;i<name.length;i++){
                id=id*10+(name[i]-'0');
              }
              this.Jump(id);
            }
            else{
              this.pictureName=nodeItem._cfg.model.label;
  
              var cnt=this.value[2];
              var sys=this.json[cnt];
              var sysId=sys.id;
              var proId=0;
              for(var i=3;i<name.length;i++){
                proId=proId*10+(name[i]-'0');
              }
  
              if (name[0]=="s"&&name[1]=="y"&&name[2]=="s"){
                this.isSystem=true;
                proId=-1;
              }
              else this.isSystem=false;
  
              this.sysAndProId={
                sysId:sysId,
                proId:proId,
              }
              this.$store.commit("changeSysAndProId",this.sysAndProId);
              console.log(this.sysAndProId)
  
              this.send("findAllGraph");
              this.socket.onmessage = this.getRectAll;
            }
  
          });
        },
        getRectAll(msg){
          var json=eval(msg.data);
          console.log(json)
          
          var flag=0;
          for(var i=0;i<json.length;i++){
              if(json[i].name==this.pictureName){
                this.recId=json[i].id;
                flag=1;
              }
          }
  
          if(flag==0){
  
            this.send("addGraph");
            this.send(JSON.stringify({name:this.pictureName,message:"",sysId:this.sysAndProId.sysId,proId:this.sysAndProId.proId}));
            this.socket.onmessage = this.getRectId;
          }
          else{  
            let rectValue={
                  pictureName: this.pictureName,
                  id: this.recId,
                  isSystem:this.isSystem
            }
            this.$store.commit("changeRectValue",rectValue);
  
            this.$router.push({
              path: `flow`,
            })
  
            this.socket.onmessage= this.getMessage;
          }
        },
        getRectId(msg) {
            console.log(msg.data);
  
            let rectValue={
                  pictureName: this.pictureName,
                  id: msg.data,
                  isSystem:this.isSystem
              }
  
            this.$store.commit("changeRectValue",rectValue);
  
            this.$router.push({
              path: `flow`,
            })
  
            this.socket.onmessage= this.getMessage;
        },
        Jump(id){
          console.log(id);
          this.$store.state.aloId=id;
          this.$router.push({
              path: `alg`,
            })
        },
        newGraph(a,b){
          G6.registerEdge('hvh', {
            draw(cfg, group) {
              const startPoint = cfg.startPoint;
              const endPoint = cfg.endPoint;
              const shape = group.addShape('path', {
                attrs: {
                  stroke: "#409EFF", // 边描边颜色
                  lineWidth: 1.5,
                  path: [
                    ['M', startPoint.x, startPoint.y],
                    ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, startPoint.y], // 三分之一处
                    ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, endPoint.y], // 三分之二处
                    ['L', endPoint.x, endPoint.y],
                  ],
                },
                // must be assigned in G6 3.3 and later versions. it can be any value you want
                name: 'path-shape',
              });
              return shape;
            },
          });
          const contextMenu = new G6.Menu({
            className:"context-menu",
            getContent(evt) {
              let header;
              header = '解除绑定';
              return `
              <h3>${header}</h3>
              `
            },
            handleMenuClick: (target, item) => {
              console.log(item);
              console.log(target.innerText)
              if(target.innerText=="解除绑定"){
                  this.deleteRelation(item._cfg.id);
              }
            },
            // offsetX and offsetY include the padding of the parent container
            // 需要加上父级容器的 padding-left 16 与自身偏移量 10
            offsetX: -70,
            // 需要加上父级容器的 padding-top 24 、画布兄弟元素高度、与自身偏移量 10
            offsetY: -200,
            // the types of items that allow the menu show up
            // 在哪些类型的元素上响应
            itemTypes: ['node'],
          });
          const container = document.getElementById('Flow');
          const width = container.scrollWidth;
          const height = b;
  
          this.graph= new G6.TreeGraph({
            container: container,
            width: width,
            height: height,
            linkCenter: true,
            plugins: [contextMenu],
            fitView:true,
            
            layout: {
              // type: 'dendrogram',
              // direction: 'LR', 
              // nodeSep: 100,
              // rankSep: 300,
            
              type: "mindmap",
              direction: "LR",
              preventOverlap: true, // 防止节点重叠
  
              // 节点纵向间距的回调函数
              getVGap: function getVGap() {
                return 40;
              },
              // 节点横向间距的回调函数
              getHGap: function getHGap() {
                return 120;
              },
  
            },
  
            defaultNode: {
              type: "modelRect",
              size: [270, 60],
              style: {
                stoken: "#003366",
                cursor:"pointer",
              },
              labelCfg: {
                // 节点上的标签文本样式配置
                offset:25,
                style: {
                  // fill: "#000", // 节点标签文字颜色
                  fontSize:14,
                  lineWidth:1,
                  fontFamily:"黑体",
                  cursor:"pointer",
                },
              },
              descriptionCfg:{
                style: {
                  fill: "#999", // 节点标签文字颜色
                  fontSize:13,
                  lineWidth:1,
                  fontFamily:"黑体",
                  cursor:"pointer",
                },
              },
              stateIcon: {
                show:false, 
              }
            },
  
            //边的样式配置
            defaultEdge: {
              type: "hvh",
              // 边样式配置
              style: {
                stroke: "#409EFF", // 边描边颜色
                lineWidth: 1.5,
              },
            },
  
          });
          
        }
      
    }
  };
  </script>
  
  <style>
    .treeTitle{
      height:50px;
      font-size: 18px;
      font-weight: bold;
    }
    .flow{
      position: relative;
      overflow: auto;
      height:100%;
      width:100%;
    }
    .titleName{
      font-size:16px;
      font-family:微软雅黑;
      line-height:30px ;
    }
    .context-menu{
      border: 1px solid #e2e2e2;
      border-radius: 4px;
      font-size: 12px;
      color: #545454;
      background-color: rgba(255, 255, 255, 0.9);
      padding: 10px 8px;
      box-shadow: rgb(174, 174, 174) 0px 0px 10px;
    }
    .context-menu h3{
      cursor: pointer;
    } 
    .context-menu h3:hover{
      color:#298DF8;
    }
    .card{
      overflow: auto;
    }
  </style>
  
  
  
  