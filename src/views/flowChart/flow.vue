<template>
  <div>
    <el-card class="box-card" >
        <div slot="header" class="clearfix" style="height:40px;" >
          <div class="titleName">产品树</div>
        </div>
        <div style="display:inline-block;width:100%">
            <el-input style="width:30%" v-model="addAloName" placeholder="请输入添加框图对应的算法名称"></el-input>
            <el-input style="width:25%" v-model.number="Xplace" placeholder="请输入添加框图的x坐标"></el-input>
            <el-input style="width:25%" v-model.number="Yplace" placeholder="请输入添加框图的y坐标"></el-input>
            <el-button type="primary" style="margin-top:9px;margin-left:1%;" @click="addRect()">添加框图</el-button>
            <br>
            <el-input style="width:30%" v-model="addLineFrom" placeholder="请输入边的起点"></el-input>
            <el-input style="width:30%" v-model="addLineTo" placeholder="请输入边的终点"></el-input>
            <el-button type="primary" style="margin-top:9px;margin-left:1%;" @click="addLine()">添加边</el-button>
        </div>
        
        
      <div id="Flow" class="flow"></div>
    </el-card>
  </div>
</template>

<script>
import G6 from "@antv/g6";

export default {
  data() {
    return {
      Xplace:'',
      Yplace:'',
      addAloName:"",
      addLineFrom:"",
      addLineTo:"",
      input:"",
      graph:'',
      data:[],
      title:"",
      json:"",
      systems:[],
      products:[],
      value:"",
    };
  },
  
  mounted() {
    this.data = {
        nodes:[
            {
                id:"node1",
                label:"node1",
                x:100,
                y:100,    
            },
            {
                id:"node2",
                label:"node2",
                x:300,
                y:100, 
            }
            
        ],
        edges:[
            {
                source:"node1",
                target:"node2"
            }
        ]
  
    };
    
    this.newGraph(800,500);

    //读取数据
    this.graph.data(this.data);
    
    // 渲染图
    this.graph.render();
    this.graph.fitCenter();
    
    this.init();

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
          console.log(msg.data);
          this.json=eval(msg.data);
          for(var i=0;i<this.json.length;i++){
            this.systems.push({
              value:"选项"+i,
              label:this.json[i].name,
            })
          }
      },
      addRect(){
        let model = {
            id: this.addAloName,
            label: this.addAloName,
            x:this.Xplace,
            y:this.Yplace,
        };

        this.graph.addItem('node', model);
        
      },
      addLine(){
        let model = {
            source:this.addLineFrom,
            target:this.addLineTo,
        };
        this.graph.addItem('edge', model);

        
        
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
        });
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

        this.graph= new G6.Graph({
          container: 'Flow', // 指定挂载点
          width: a,
          height: b,
          linkCenter: true,
          
          layout: {                
            type: 'dagre',
            rankdir:"LR",
            align: 'DL', // 可选
            nodesep: 20, // 可选
            ranksep: 50, // 可选
            controlPoints: true, // 可选
            sortByCombo:true,
          },
          
          defaultNode: {
            type: "modelRect",
            size: [150, 60],
            style: {
              stoken: "#003366",
            },
            labelCfg: {
              // 节点上的标签文本样式配置
              offset:25,
              style: {
                // fill: "#000", // 节点标签文字颜色
                fontSize:14,
                lineWidth:1,
                fontFamily:"黑体",
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
    overflow:auto;
  }
  .titleName{
    font-size:16px;
    font-family:微软雅黑;
    display:inline-block;
    margin-right:90%;
    line-height:30px !important;
  }
</style>



