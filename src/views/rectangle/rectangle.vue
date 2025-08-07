<template>
    <div>
    <el-card style="margin:30px 20px;height:680px;">
        <div class="container">
            <div id="myDiagramDiv" class="left" style="height:600px;width:100%;border:1px solid black;margin-top:10px;"></div>
            <div class="right">

                <div style="margin-bottom:20px;margin-top:10px;">
                    <el-select v-model="value" :placeholder="sysplaceholder">
                        <el-option v-for="item in alo" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                    <el-select v-model="valueGroup" placeholder="请选择对应的组">
                        <div v-for="(item,index) in nodes" :key="index" :label="item.key">
                            <el-option v-if="item.isGroup==true" :value="item.name"></el-option>
                        </div>
                    </el-select>
                    <div class="wrapped">
                        <div>
                            <span style="font-family:'微软雅黑';font-size:16px;">颜色</span>
                            <v-swatches swatches="text-advanced" v-model="valueColor"></v-swatches>
                        </div>
                        <el-button type="primary" style="margin-top:9px;margin-left:1%;" @click="addRect()">添加框图</el-button>
                    </div>
                </div>
                <div style="margin-bottom:10px;">
                    <el-select v-model="edgeValue" placeholder="请选择备份方式">
                        <!-- <el-option label="无备份" value="1"></el-option> -->
                        <el-option label="热备份" value="2"></el-option>
                        <el-option label="冷备份" value="3"></el-option>
                    </el-select>
                    <el-input v-model="groupName" placeholder="请输入名称" style="width:220px;"></el-input>
                    <el-button type="primary" style="margin-top:9px;margin-left:1%;" @click="addGroup()">添加组</el-button>
                    <el-button type="primary" style="margin-top:9px;margin-left:1%;" @click="addLine()">添加边</el-button>
                </div>

                <div style="margin-bottom:20px;">
                    <el-select v-model="addLineFrom" placeholder="请选择边的起点">
                        <div v-for="(item,index) in nodes" :key="index">
                            <el-option v-if="item.group==null" :value="item.key" :label="item.name"></el-option>
                        </div>
                    </el-select>
                    <el-select v-model="addLineTo" placeholder="请选择边的终点">
                        <div v-for="(item,index) in nodes" :key="index">
                            <el-option v-if="item.group==null" :value="item.key" :label="item.name"></el-option>
                        </div>
                    </el-select>
                </div>
                <div class="wrapped">
                    <el-button type="primary" style="margin-top:4px;" @click="count()">计算</el-button>
                    <el-button type="primary" style="float: right;margin-top:4px" @click="submit()">保存</el-button>
                </div>
                <el-button type="primary" style="float: left;margin-top:4px;margin-left:35px;" @click="addCircle()">添加虚拟节点</el-button>
                <el-button type="primary" style="float: left;margin-top:4px;margin-left:35px;" @click="openExcel()">打开excel</el-button>
                
            </div>
        </div> 
    </el-card>

    <el-dialog title="计算结果" :visible.sync="dialogVisible" width="30%" top="240px">
        <el-descriptions :column="1">
            <el-descriptions-item label="系统可靠度">{{RHZvalue.R}}</el-descriptions-item>
            <!-- <el-descriptions-item label="H值">{{RHZvalue.H}}</el-descriptions-item>
            <el-descriptions-item label="Z值">{{RHZvalue.Z}}</el-descriptions-item> -->
        </el-descriptions>
        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
        </span>
    </el-dialog>
    
    <el-dialog title="修改输入值" :visible.sync="changeNodeVisible" width="40%" top="240px">
        <el-form  label-width="150px" label-position="left" :model="aloForm">
            <el-form-item label="系统可靠度">
                <el-input v-model="aloForm.R"></el-input>
            </el-form-item>
            <!-- <el-form-item label="DR值">
                <el-input v-model="aloForm.DR"></el-input>
            </el-form-item>
            <el-form-item label="H值">
                <el-input v-model="aloForm.H"></el-input>
            </el-form-item>
            <el-form-item label="Z值">
                <el-input v-model="aloForm.Z"></el-input>
            </el-form-item> -->
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="changeNodeVisible = false">取 消</el-button>
            <el-button type="primary" @click="changeNodeValue()">确 定</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
import go from "gojs";
const $ = go.GraphObject.make;
import VSwatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.css'



export default {
    components: { VSwatches },
    data() {
        return{
            visible:false,
            groupName: '',
            edgeValue:"",
            value:"",
            valueColor:"pink",
            valueGroup:"",
            alo:[],
            id:0,
            recId:0,
            dialogVisible:false,
            changeNodeVisible:false,
            pictureName:"",
            addAloName:"",
            addColor:"",
            addLineFrom:"",
            addLineTo:"",
            diagram:"",
            diagramModel:"",
            contextMenu:"",
            contextMenuGroup:"",
            message:[],
            rec:[],
            RHZvalue:{
                R:"",
                H:"",
                Z:""
            },
            changeNodeId:"",
            //0无备份 1热备份 2冷备份
            nodeData:{ 
                R:0,
                DR:0,
                H:0,
                Z:0,
                backup:0,
                key:"",
            },
            aloForm:{
                R:"",
                DR:"",
                H:"",
                Z:"",
            },
            nodes:[ // 节点
                
            ],
            edges:[ // 连线
                
            ],
            color: [

            ],
            group:[
                "无"
            ],
            isSystem:false,
            sysplaceholder:"请选择算法",
            productName:"",
        }
    },
    mounted() {
        this.pictureName=this.$store.state.rectValue.pictureName;
        this.id=this.$store.state.rectValue.id;
        if(this.$store.state.rectValue.isSystem!=undefined){
            this.isSystem=this.$store.state.rectValue.isSystem;
        }
        
        console.log(this.pictureName);
        console.log(this.id);
        
        this.setImage();
        this.init();
    },
    methods: {
        openExcel() {
                let path = require("path")

                let exec = require('child_process').exec;
                // exec('explorer.exe /select,"D:\\1.xls"')
                var sysAndProId=this.$store.state.sysAndProId;
                var name;
                // if(sysAndProId.proId!=-1) name=`D:\\sys${sysAndProId.sysId}pro${sysAndProId.proId}.xls`;
                if(sysAndProId.proId!=-1) name= path.resolve(__dirname,`../../../../file/${sysAndProId.sysId}pro${sysAndProId.proId}.xls`);
                else name=name= path.resolve(__dirname,`../../../../file/sys${sysAndProId.sysId}.xls`);

                //打包版本位置
                //if(sysAndProId.proId!=-1) name=`resources\\AloData\\sys${sysAndProId.sysId}pro${sysAndProId.proId}.xls`;
                //else name=`resources\\AloData\\sys${sysAndProId.sysId}.xls`;

                console.log(name)

                // exec('fsutil file createnew "D:\\2.xls" 0')
                // exec('explorer "D:\\2.xls"')
                exec(`fsutil file createnew ${name} 0`)
                exec(`explorer ${name}`)
        },
        changeNodeValue(){
            this.changeNodeVisible=false;
            for(var i=0;i<this.nodes.length;i++){
                if(this.nodes[i].recId==this.changeNodeId){
                    this.nodes[i].R="R:"+this.aloForm.R;
                    this.nodes[i].DR="DR:"+this.aloForm.DR;
                    this.nodes[i].H="H:"+this.aloForm.H;
                    this.nodes[i].Z="Z:"+this.aloForm.Z;
                }
            }
            this.diagramModel =  new go.GraphLinksModel(this.nodes,this.edges);
            this.diagram.model = this.diagramModel;
            this.aloForm.R="";
            this.aloForm.DR="";
            this.aloForm.H="";
            this.aloForm.Z="";
        },
        makeButton(text, action, visiblePredicate) {
            return $("ContextMenuButton",
                $(go.TextBlock, text),
                { click: action },
                // don't bother with binding GraphObject.visible if there's no predicate
                visiblePredicate ? new go.Binding("visible", "", (o, e) => o.diagram ? visiblePredicate(o, e) : false).ofObject() : {});
        },
        init() {
            
            // 实例化socket
            this.socket=this.globalWebSocket.ws
            // 监听socket连接
            this.socket.onopen = this.open;
            // 监听socket错误信息
            this.socket.onerror = this.error;
            // 监听socket消息
            this.socket.onmessage = this.getAlo;
            
            if(this.isSystem){
                this.send("systemAll");
            }
            else{
                this.send("findAll");
            }
            
            
            // 绑定数据
            // this.diagramModel =  new go.GraphLinksModel(this.nodes,this.edges);
            // this.diagram.model = this.diagramModel;
       },
        // getRectAll(msg){
        //         var json=eval(msg.data);
        //         console.log(json)
                
        //         var recId;
        //         for(var i=0;i<json.length;i++){
        //             if(json[i].name==this.productName){
        //                 recId=json[i].id;
        //             }
        //         }
    
        //         let rectValue={
        //                 pictureName: this.productName,
        //                 id: recId,
        //                 isSystem:false,
        //         }
        //         this.$store.commit("changeRectValue",rectValue);

        //         this.$router.go(0)

        // },
       setImage(){
            var $ = go.GraphObject.make;  // for conciseness in defining templates

        //    this.diagram = new go.Diagram("myDiagramDiv");

            this.diagram =  $(go.Diagram, "myDiagramDiv",  // create a Diagram for the DIV HTML element
            {
                "linkingTool.isEnabled": false,  // invoked explicitly by drawLink function, below
                "linkingTool.direction": go.LinkingTool.ForwardsOnly,  // only draw "from" towards "to"
            });

           this.contextMenu=$("ContextMenu",
                this.makeButton("删除",
                (e, obj) => e.diagram.commandHandler.deleteSelection(),
                o => o.diagram.commandHandler.canDeleteSelection()),
                this.makeButton(this.isSystem?"跳转产品":"跳转算法",(e, obj) =>{
                    var contextmenu = obj.part;  // the Button is in the context menu Adornment
			        var part = contextmenu.adornedPart;
                    var node=part.data;

                    //系统框图和产品框图
                    if(this.isSystem){
                        this.$router.push("/seeRect")
                        // var proId;
                        // for(var i=0;i<this.alo.length;i++){
                        //     if(node.name.startsWith(this.alo[i].name)){
                        //         proId=this.alo[i].id;
                        //         this.productName=this.alo[i].name;
                        //         break;
                        //     }
                        // }

                        // var sysAndProId={
                        //     sysId:this.$store.state.sysAndProId.sysId,
                        //     proId:proId,
                        // }
                        // this.$store.commit("changeSysAndProId",sysAndProId);
                        // console.log(sysAndProId)

                        // this.send("findAllGraph");
                        // this.socket.onmessage = this.getRectAll;
                    }
                    else{
                        this.$store.state.aloId=node.id;
                        this.$store.state.aloValue=undefined;
                        this.$store.state.recId=node.recId;
                        this.$store.state.isTurnAlo=true;
                        this.$router.push({
                            path: `alg`,
                        })
                    }
                }),
                this.makeButton("修改取值",(e, obj) =>{
                    var contextmenu = obj.part;  // the Button is in the context menu Adornment
			        var part = contextmenu.adornedPart;
                    var node=part.data;
                    this.changeNodeId=node.recId;
                    this.changeNodeVisible=true;
                }),

            )

            this.contextMenuGroup=$("ContextMenu",
                this.makeButton("删除",
                    (e, obj) => e.diagram.commandHandler.deleteSelection(),
                    o => o.diagram.commandHandler.canDeleteSelection()
                )
            )
            
    
            this.diagram.linkTemplate=$(go.Link,
                // { reshapable: true, resegmentable: true },
                // { adjusting: go.Link.Stretch },
                $(go.Shape,
                    { strokeWidth: 2},
                    new go.Binding("stroke", "color")),
                $(go.Shape,  // arrowhead
                    { toArrow: "Triangle", scale: 1 },
                    new go.Binding("stroke", "color"),
                    new go.Binding("fill", "color"),)
                );
        
            this.diagram.nodeTemplate = $(go.Node, "Auto",
                // { desiredSize: new go.Size(200, 100)},
                { contextMenu: this.contextMenu },
                {
                    linkConnected: function(node, link, port) {
                    if (link.fromNode !== null) link.fromNode.invalidateConnectedLinks();
                    if (link.toNode !== null) link.toNode.invalidateConnectedLinks();
                    },
                    linkDisconnected: function(node, link, port) {
                    if (link.fromNode !== null) link.fromNode.invalidateConnectedLinks();
                    if (link.toNode !== null) link.toNode.invalidateConnectedLinks();
                    },
                    locationSpot: go.Spot.Center
                },
                $(go.Panel, "Spot", 

								// {background: "#F5F5F5"},
							$(go.Shape, "RoundedRectangle", new go.Binding("fill", "color"),
                            new go.Binding("figure", "figure"),
                            new go.Binding("width","width"),
                            new go.Binding("height","height"),
                            {
								width: 120,
								height: 120,

                                portId: "",
                                // fromSpot: go.Spot.AllSides, 
                                fromLinkable: true,
                                fromLinkableDuplicates: true, 
                                fromLinkableSelfNode: true,
                                // toSpot: go.Spot.AllSides,
                                toLinkable: true,
                                toLinkableDuplicates: true, 
                                toLinkableSelfNode: true
							}),
							$(go.TextBlock,
                            new go.Binding("text", "name"),
                            new go.Binding("width","textwidth"),
                            { //控制文字显示
								font: "bold 10pt Microsoft YaHei, Arial, sans-serif",
								stroke: "#5687b3",
								width: 90,
								alignment: go.Spot.Center,
							}),
							// $(go.Shape, "RoundedRectangle", {
							// 	width: 30,
							// 	height: 30,
							// 	alignment: go.Spot.TopLeft,
							// 	fill: "#ffda92",
							// 	stroke: null
							// }),
							// $(go.TextBlock, { //控制文字显示
							// 	font: "10pt Microsoft YaHei, Arial, sans-serif",
							// 	stroke: "#5687b3",
							// 	alignment: go.Spot.TopLeft,
							// 	textAlign: "center",
							// }, new go.Binding("text","R")),
                            // $(go.Shape, "RoundedRectangle", {
							// 	width: 30,
							// 	height: 30,
							// 	alignment: go.Spot.TopRight,
							// 	fill: "#ffda92",
							// 	stroke: null
							// }),
							// $(go.TextBlock, { //控制文字显示
							// 	font: "10pt Microsoft YaHei, Arial, sans-serif",
							// 	stroke: "#5687b3",
							// 	alignment: go.Spot.TopRight,
							// 	textAlign: "center",
							// }, new go.Binding("text","DR")),
                            // $(go.Shape, "RoundedRectangle", {
							// 	width: 30,
							// 	height: 30,
							// 	alignment: go.Spot.BottomLeft,
							// 	fill: "#ffda92",
							// 	stroke: null
							// }),
							// $(go.TextBlock, { //控制文字显示
							// 	font: "10pt Microsoft YaHei, Arial, sans-serif",
							// 	stroke: "#5687b3",
							// 	alignment: go.Spot.BottomLeft,
							// 	textAlign: "center",
							// }, new go.Binding("text","H")),
                            // $(go.Shape, "RoundedRectangle", {
							// 	width: 30,
							// 	height: 30,
							// 	alignment: go.Spot.BottomRight,
							// 	fill: "#ffda92",
							// 	stroke: null
							// }),
							// $(go.TextBlock, { //控制文字显示
							// 	font: "10pt Microsoft YaHei, Arial, sans-serif",
							// 	stroke: "#5687b3",
							// 	alignment: go.Spot.BottomRight,
							// 	textAlign: "center",
							// }, new go.Binding("text","Z"))
						), //go.Panel的括号

                // $(go.TextBlock, new go.Binding("text", "key")),
                new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify)
            )

                this.diagram.nodeTemplate.selectionAdornmentTemplate =
                $(go.Adornment, "Spot",
                    $(go.Panel, "Auto",
                        $(go.Shape, { stroke: "dodgerblue", strokeWidth: 2, fill: null }),
                        $(go.Placeholder)
                    ),
                     $(go.Panel, "Horizontal",
                        { alignment: go.Spot.Top, alignmentFocus: go.Spot.Bottom },
                        $("Button",
                            { // drawLink is defined below, to support interactively drawing new links
                                click: this.drawLink,  // click on Button and then click on target node
                                actionMove: this.drawLink  // drag from Button to the target node
                            },
                            $(go.Shape,
                                { geometryString: "M0 0 L8 0 8 12 14 12 M12 10 L14 12 12 14" }
                            )
                        ),
                     )

                )

                this.diagram.groupTemplate =
                $(go.Group, "Vertical",
                    {
                        selectionObjectName: "PANEL",  // selection handle goes around shape, not label
                        ungroupable: true  // enable Ctrl-Shift-G to ungroup a selected Group
                    },
                    $(go.TextBlock,
                        {
                            //alignment: go.Spot.Right,
                            font: "bold 19px sans-serif",
                            isMultiline: false,  // don't allow newlines in text
                            editable: true  // allow in-place editing by user
                        },
                        new go.Binding("text", "name").makeTwoWay()),
                    $(go.Panel, "Auto",
                        { name: "PANEL" },
                        $(go.Shape, "Rectangle",  // the rectangular shape around the members
                            {
                                fill: "white",strokeWidth: 3,
                            },new go.Binding("stroke", "stroke")),
                        $(go.Placeholder, {margin: 10, background: "transparent" })  // represents where the members are
                    ),
                    { // this tooltip Adornment is shared by all groups
                        
                        // the same context menu Adornment is shared by all groups
                        contextMenu: this.contextMenuGroup,
                    }
                )
            
       },
        drawLink(e, button) {
            console.log(button)
            var node = button.part.adornedPart;
            console.log(node);
            var tool = e.diagram.toolManager.linkingTool;
            tool.startObject = node.port;
            e.diagram.currentTool = tool;
            tool.doActivate();
        },
       addRect(){
           console.log(this.value)
           console.log(this.diagramModel)
           this.recId++;
            var name;
            for (var i=0; i<this.alo.length; i++) {
                if(this.alo[i].id==this.value){
                    console.log(this.alo[i]);
                    name=this.alo[i].name;
                }
            }

            var stroke;
            // if(this.edgeValue==1) stroke=null;
            // else if(this.edgeValue==2) stroke="red";
            // else if(this.edgeValue==3) stroke="blue";
            
            var group_key;
            for(var i=0; i<this.nodes.length; i++){
                if(this.nodes[i].isGroup&&this.nodes[i].name==this.valueGroup){
                    group_key=this.nodes[i].key;
                }
            }

            if(this.valueGroup=="无"||this.valueGroup==""){
                this.diagramModel.addNodeData({ name:name,recId: this.recId,key:this.recId, color:this.valueColor, id:this.value,R:"R:0.5",DR:"DR:2",H:"H:3",Z:"Z:4",cold:false,hot:false});
            }
            else{
                this.diagramModel.addNodeData({ name:name,recId: this.recId,key:this.recId, color:this.valueColor, id:this.value,R:"R:0.5",DR:"DR:2",H:"H:3",Z:"Z:4",group:group_key,cold:false,hot:false});
            }
            this.value="";
            this.valueGroup="";
            
       },
       addCircle(){
        this.recId++
        this.diagramModel.addNodeData({name:this.recId,recId: this.recId,key:this.recId,figure:"circle",color:"#fff",width:20,textwidth:10,height:20});
       },
       addGroup(){
            var stroke;
            var cold=false,hot=false;
            if(this.edgeValue==1) stroke=null;
            else if(this.edgeValue==2){
                stroke="red";
                cold=true;
            } 
            else if(this.edgeValue==3){
                stroke="blue";
                hot=true;
            } 
            this.group.push(this.groupName);
            this.diagramModel.addNodeData({name:this.groupName, key: this.recId,stroke:stroke,isGroup: true,R:"R:0.5",DR:"DR:2",H:"H:3",Z:"Z:4",cold:cold,hot:hot});
            this.groupName="";
            this.edgeValue="";
            this.recId++;
       },
       addLine(){
            var color;
            if(this.edgeValue) color="red";
            else color="blue";
            this.diagramModel.addLinkData({ from:this.addLineFrom, to:this.addLineTo,color:"black" })
            this.addLineFrom="";
            this.addLineTo="";
       },
       submit() {
            this.send("updateGraph");
            this.send(JSON.stringify({
                id:this.id,
                name:this.pictureName,
                message:this.diagram.model.toJson()
            }));
  
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
           if(msg.data=="update success"){
                this.$message({
                    message: '成功提交',
                    type: 'success'
                });
               
               return 
           }
           if(msg.data==""){
               this.nodes=[]
               this.edges=[]
           }
           else{
                var json=eval("("+msg.data+")");
                console.log(json)
                this.nodes=json.nodeDataArray;
                this.edges=json.linkDataArray;
                console.log(this.nodes);
                console.log(this.edges);
           }

           for(var i=0;i<this.nodes.length;i++){
            if(this.nodes[i].recId>=this.recId) this.recId=this.nodes[i].recId+1;

            if(this.nodes[i].id==this.$store.state.aloId){

                if(this.$store.state.aloValue!=undefined){
                    this.nodes[i].R="R:"+this.$store.state.aloValue.R;
                    this.nodes[i].DR="DR:"+this.$store.state.aloValue.DR;
                    this.nodes[i].H="H:"+this.$store.state.aloValue.H;
                    this.nodes[i].Z="Z:"+this.$store.state.aloValue.Z;
                }
                else{
                    this.nodes[i].R="R:0";
                    this.nodes[i].DR="DR:0";
                    this.nodes[i].H="H:0";
                    this.nodes[i].Z="Z:0";
                }

                // this.nodes[i].name=this.nodes[i].name.split("\n\n")[0];
                // console.log(this.nodes[i].name)

                if(this.$store.state.aloValue!=undefined&&this.nodes[i].name.indexOf("\n\n")==-1&&!this.isSystem){
                    this.nodes[i].name=this.nodes[i].name+"\n\n可靠度:"+this.$store.state.aloValue.R;
                }
                // else{
                //     this.nodes[i].name=this.nodes[i].name+"\n\n可靠度:0";
                // }

                
            }

            if(this.isSystem){
                for(var j=0;j<this.alo.length;j++){
                    if(parseInt(this.nodes[i].name)) continue;
                    if(this.nodes[i].name.startsWith(this.alo[j].name)&&this.nodes[i].name.indexOf("\n\n")==-1){
                        this.nodes[i].name=this.nodes[i].name+"\n\n可靠度:"+this.alo[j].R;
                        this.nodes[i].R = this.alo[j].R
                    }
                }        
            }
           }

           //   清除保存记录
           this.$store.commit("changeAloValue",undefined);

           this.diagramModel =  new go.GraphLinksModel(this.nodes,this.edges);
           this.diagram.model = this.diagramModel;

           //找出所有group
            // for (var i = 0; i <this.nodes.length;i++){
            //     console.log(this.nodes[i].group)
            //     if (this.nodes[i].group!=undefined){
            //         var f=0;
            //         for(var j = 0;j<this.group.length;j++){
            //             if(this.group[j]==this.nodes[i].group) {
            //                 f=1;
            //                 break;
            //             }
            //         }
            //         if(!f) this.group.push(this.nodes[i].group);
            //     }
            // }
        },
        getSystem(msg){
            var json=eval(msg.data);
            
        },
        getAlo(msg){
           var json=eval(msg.data);
           console.log(json);
           if(this.isSystem){
                var sysAndProId=this.$store.state.sysAndProId;
                this.alo=json[sysAndProId.sysId-1].pro;
                this.sysplaceholder="请选择产品"
           }
           else{
            this.alo=json;
           }
           console.log(this.alo);


           this.socket.onmessage = this.getMessage;
           this.send("checkGraph");
           this.send(this.id);
        },
        count(){
            // this.message=[];
            // console.log(this.nodes);
            // console.log(this.edges);
            // var f=[];
            // var nl=this.nodes.length;
            // var el=this.edges.length;
            // //初始化f数组
            // for(var i=0;i<this.nodes.length;i++){
            //     f.push(0);
            // }

            // /**
            //  *判断是否为直线头部
            //  *若为f[i]为0
            //  */
            // for(var i=0;i<this.edges.length;i++){
            //     for(var j=0; j<this.nodes.length;j++){
            //         if(this.edges[i].to==this.nodes[j].key){
            //             f[j]=1;
            //             break;
            //         }    
            //     }
            // }


            // /**
            //  * 在组里的默认全为1 
            //  * 
            // */
            // for(i=0;i<this.nodes.length;i++){
            //     if(this.nodes[i].group!=null) f[i]=1;
            // }
            
            // /**
            //  * 给组赋值
            //  */
            // for(var i=0;i<nl;i++){
            //     if(this.nodes[i].isGroup){
            //         for(var j=0;j<nl;j++){
            //             if(this.nodes[i].key==this.nodes[j].group){
            //                 this.nodes[i].R=this.nodes[j].R;
            //                 this.nodes[i].DR=this.nodes[j].DR;
            //                 this.nodes[i].H=this.nodes[j].H;
            //                 this.nodes[i].Z=this.nodes[j].Z;
            //                 break;
            //             }
            //         }
            //     }
            // }

            // /**
            //  * 初始化图矩阵
            //  */
            
            // for(var i=0;i<nl;i++){
            //     this.rec[i]=[];
            //     for(var j=0;j<nl;j++){
            //         this.rec[i][j]=0;
            //     }
            // }

            // /**
            //  * 图矩阵赋值
            //  */
            // for(var i=0;i<nl;i++){
            //     var key=this.nodes[i].key;
            //     for(var j=0;j<el;j++){
            //         if(key==this.edges[j].from){
            //             for(var k=0;k<nl;k++){
            //                 if(this.nodes[k].key==this.edges[j].to){
            //                     this.rec[i][k]=1;
            //                     break;
            //                 }
            //             }
            //         }
            //     }
            // }
            
            // /**
            //  * 深度搜索
            //  */
            // for(var i=0;i<f.length;i++){
            //     if(f[i]==0){
            //         this.setValue(i);
            //         this.deepSearch(i);
            //     }
            // }

            // console.log(this.message);
            
            this.send("calR");
            this.send(JSON.stringify(this.id));

            this.socket.onmessage = this.getValue;
        },
        setValue(i){
            this.nodeData.R=this.nodes[i].R;
            this.nodeData.DR=this.nodes[i].DR;
            this.nodeData.H=this.nodes[i].H;
            this.nodeData.Z=this.nodes[i].Z;
            this.nodeData.key=this.nodes[i].key;
            if(this.nodes[i].isGroup==true){
                if(this.nodes[i].stroke=="red") this.nodeData.backup=1;
                else if(this.nodes[i].stroke=="blue") this.nodeData.backup=2;
                else this.nodeData.backup=0;
            }
            this.message.push(this.nodeData);
            this.message=JSON.parse(JSON.stringify(this.message));
        },
        deepSearch(x){
            var k=-1;
            for(var i=0;i<this.nodes.length;i++){
                if(this.rec[x][i]==1){
                    this.setValue(i);
                    k=i;
                    break;
                }
            }
            if(k!=-1){
                this.deepSearch(k);
            }
        },
        getValue(msg){
            //只返回R值
            console.log(msg.data);
            var json=eval("("+msg.data+")");
                       
            console.log(json);

            this.RHZvalue.R=json;
            console.log(this.RHZvalue);
            
            this.dialogVisible=true;
            
            var sysAndProId=this.$store.state.sysAndProId;
            
            this.send("updateProduct");
            var data={
                id:this.id,
                sysId:sysAndProId.sysId,
                proId:sysAndProId.proId,
                R:json,
                DR:0,
                H:0,
                Z:0,
            }
            this.send(JSON.stringify(data));
            console.log(data);

            this.socket.onmessage = this.updateProduct;
            
        },
        updateProduct(msg){
            console.log(msg.data);
            this.socket.onmessage = this.getMessage;
        }
    },

}
</script>

<style>
    .vue-swatches{
        vertical-align: middle !important;
        width:40px;
        height:40px;
        margin-right:25px;
    }
    .container{
        display:flex;
        justify-content: center;
    }
    .left{
        width: 70%;
    }
    .right{
        width: 30%;
    }
    .wrapped{
        display:flex;
        justify-content:center;
    }
</style>