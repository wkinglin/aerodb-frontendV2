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

    <el-dialog title="计算结果" v-model="dialogVisible" width="30%" top="240px">
        <el-descriptions :column="1">
            <el-descriptions-item label="系统可靠度">{{RHZvalue.R}}</el-descriptions-item>
            <!-- <el-descriptions-item label="H值">{{RHZvalue.H}}</el-descriptions-item>
            <el-descriptions-item label="Z值">{{RHZvalue.Z}}</el-descriptions-item> -->
        </el-descriptions>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
            </span>
        </template>
    </el-dialog>
    
    <el-dialog title="修改输入值" v-model="changeNodeVisible" width="40%" top="240px">
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
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="changeNodeVisible = false">取 消</el-button>
                <el-button type="primary" @click="changeNodeValue()">确 定</el-button>
            </span>
        </template>
    </el-dialog>

  </div>
</template>

<script setup>
import go from "gojs";
const $ = go.GraphObject.make;
import VSwatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.css'
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const globalWebSocket = inject('globalWebSocket')
const $store = inject('$store')

const visible = ref(false)
const groupName = ref('')
const edgeValue = ref('')
const value = ref('')
const valueColor = ref('pink')
const valueGroup = ref('')
const alo = ref([])
const id = ref(0)
const recId = ref(0)
const dialogVisible = ref(false)
const changeNodeVisible = ref(false)
const pictureName = ref('')
const addAloName = ref('')
const addColor = ref('')
const addLineFrom = ref('')
const addLineTo = ref('')
const diagram = ref('')
const diagramModel = ref('')
const contextMenu = ref('')
const contextMenuGroup = ref('')
const message = ref([])
const rec = ref([])
const RHZvalue = ref({
    R: '',
    H: '',
    Z: ''
})
const changeNodeId = ref('')
const nodeData = ref({ 
    R: 0,
    DR: 0,
    H: 0,
    Z: 0,
    backup: 0,
    key: '',
})
const aloForm = ref({
    R: '',
    DR: '',
    H: '',
    Z: '',
})
const nodes = ref([])
const edges = ref([])
const color = ref([])
const group = ref(['无'])
const isSystem = ref(false)
const sysplaceholder = ref('请选择算法')
const productName = ref('')
const socket = ref(null)

onMounted(() => {
    pictureName.value = $store.state.rectValue.pictureName
    id.value = $store.state.rectValue.id
    if($store.state.rectValue.isSystem !== undefined){
        isSystem.value = $store.state.rectValue.isSystem
    }
    
    console.log(pictureName.value)
    console.log(id.value)
    
    setImage()
    init()
})

const openExcel = () => {
    let path = require("path")

    let exec = require('child_process').exec
    // exec('explorer.exe /select,"D:\\1.xls"')
    var sysAndProId = $store.state.sysAndProId
    var name
    // if(sysAndProId.proId!=-1) name=`D:\\sys${sysAndProId.sysId}pro${sysAndProId.proId}.xls`;
    if(sysAndProId.proId !== -1) name = path.resolve(__dirname,`../../../../file/${sysAndProId.sysId}pro${sysAndProId.proId}.xls`)
    else name = path.resolve(__dirname,`../../../../file/sys${sysAndProId.sysId}.xls`)

    //打包版本位置
    //if(sysAndProId.proId!=-1) name=`resources\\AloData\\sys${sysAndProId.sysId}pro${sysAndProId.proId}.xls`;
    //else name=`resources\\AloData\\sys${sysAndProId.sysId}.xls`;

    console.log(name)

    // exec('fsutil file createnew "D:\\2.xls" 0')
    // exec('explorer "D:\\2.xls"')
    exec(`fsutil file createnew ${name} 0`)
    exec(`explorer ${name}`)
}

const changeNodeValue = () => {
    changeNodeVisible.value = false
    for(var i=0; i<nodes.value.length; i++){
        if(nodes.value[i].recId === changeNodeId.value){
            nodes.value[i].R = "R:" + aloForm.value.R
            nodes.value[i].DR = "DR:" + aloForm.value.DR
            nodes.value[i].H = "H:" + aloForm.value.H
            nodes.value[i].Z = "Z:" + aloForm.value.Z
        }
    }
    diagramModel.value = new go.GraphLinksModel(nodes.value, edges.value)
    diagram.value.model = diagramModel.value
    aloForm.value.R = ''
    aloForm.value.DR = ''
    aloForm.value.H = ''
    aloForm.value.Z = ''
}

const makeButton = (text, action, visiblePredicate) => {
    return $("ContextMenuButton",
        $(go.TextBlock, text),
        { click: action },
        // don't bother with binding GraphObject.visible if there's no predicate
        visiblePredicate ? new go.Binding("visible", "", (o, e) => o.diagram ? visiblePredicate(o, e) : false).ofObject() : {});
}

const init = () => {
    // 实例化socket
    socket.value = globalWebSocket.ws
    // 监听socket连接
    socket.value.onopen = open
    // 监听socket错误信息
    socket.value.onerror = error
    // 监听socket消息
    socket.value.onmessage = getAlo
    
    if(isSystem.value){
        send("systemAll")
    }
    else{
        send("findAll")
    }
}

const setImage = () => {
    var $ = go.GraphObject.make;  // for conciseness in defining templates

    diagram.value = $(go.Diagram, "myDiagramDiv",  // create a Diagram for the DIV HTML element
    {
        "linkingTool.isEnabled": false,  // invoked explicitly by drawLink function, below
        "linkingTool.direction": go.LinkingTool.ForwardsOnly,  // only draw "from" towards "to"
    });

   contextMenu.value = $("ContextMenu",
        makeButton("删除",
        (e, obj) => e.diagram.commandHandler.deleteSelection(),
        o => o.diagram.commandHandler.canDeleteSelection()),
        makeButton(isSystem.value?"跳转产品":"跳转算法",(e, obj) =>{
            var contextmenu = obj.part;  // the Button is in the context menu Adornment
            var part = contextmenu.adornedPart;
            var node = part.data;

            //系统框图和产品框图
            if(isSystem.value){
                router.push("/seeRect")
            }
            else{
                $store.state.aloId = node.id;
                $store.state.aloValue = undefined;
                $store.state.recId = node.recId;
                $store.state.isTurnAlo = true;
                router.push({
                    path: `alg`,
                })
            }
        }),
        makeButton("修改取值",(e, obj) =>{
            var contextmenu = obj.part;  // the Button is in the context menu Adornment
            var part = contextmenu.adornedPart;
            var node = part.data;
            changeNodeId.value = node.recId;
            changeNodeVisible.value = true;
        }),

    )

    contextMenuGroup.value = $("ContextMenu",
        makeButton("删除",
            (e, obj) => e.diagram.commandHandler.deleteSelection(),
            o => o.diagram.commandHandler.canDeleteSelection()
        )
    )
    

    diagram.value.linkTemplate = $(go.Link,
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

    diagram.value.nodeTemplate = $(go.Node, "Auto",
        // { desiredSize: new go.Size(200, 100)},
        { contextMenu: contextMenu.value },
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
                    ), //go.Panel的括号

            // $(go.TextBlock, new go.Binding("text", "key")),
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify)
        )

        diagram.value.nodeTemplate.selectionAdornmentTemplate =
        $(go.Adornment, "Spot",
            $(go.Panel, "Auto",
                $(go.Shape, { stroke: "dodgerblue", strokeWidth: 2, fill: null }),
                $(go.Placeholder)
            ),
             $(go.Panel, "Horizontal",
                { alignment: go.Spot.Top, alignmentFocus: go.Spot.Bottom },
                $("Button",
                    { // drawLink is defined below, to support interactively drawing new links
                        click: drawLink,  // click on Button and then click on target node
                        actionMove: drawLink  // drag from Button to the target node
                    },
                    $(go.Shape,
                        { geometryString: "M0 0 L8 0 8 12 14 12 M12 10 L14 12 12 14" }
                    )
                ),
             )

        )

        diagram.value.groupTemplate =
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
                contextMenu: contextMenuGroup.value,
            }
        )
}

const drawLink = (e, button) => {
    console.log(button)
    var node = button.part.adornedPart;
    console.log(node);
    var tool = e.diagram.toolManager.linkingTool;
    tool.startObject = node.port;
    e.diagram.currentTool = tool;
    tool.doActivate();
}

const addRect = () => {
   console.log(value.value)
   console.log(diagramModel.value)
   recId.value++;
    var name;
    for (var i=0; i<alo.value.length; i++) {
        if(alo.value[i].id === value.value){
            console.log(alo.value[i]);
            name = alo.value[i].name;
        }
    }

    var stroke;
    
    var group_key;
    for(var i=0; i<nodes.value.length; i++){
        if(nodes.value[i].isGroup && nodes.value[i].name === valueGroup.value){
            group_key = nodes.value[i].key;
        }
    }

    if(valueGroup.value === "无" || valueGroup.value === ""){
        diagramModel.value.addNodeData({ name:name,recId: recId.value,key:recId.value, color:valueColor.value, id:value.value,R:"R:0.5",DR:"DR:2",H:"H:3",Z:"Z:4",cold:false,hot:false});
    }
    else{
        diagramModel.value.addNodeData({ name:name,recId: recId.value,key:recId.value, color:valueColor.value, id:value.value,R:"R:0.5",DR:"DR:2",H:"H:3",Z:"Z:4",group:group_key,cold:false,hot:false});
    }
    value.value = "";
    valueGroup.value = "";
}

const addCircle = () => {
    recId.value++
    diagramModel.value.addNodeData({name:recId.value,recId: recId.value,key:recId.value,figure:"circle",color:"#fff",width:20,textwidth:10,height:20});
}

const addGroup = () => {
    var stroke;
    var cold = false, hot = false;
    if(edgeValue.value === 1) stroke = null;
    else if(edgeValue.value === 2){
        stroke = "red";
        cold = true;
    } 
    else if(edgeValue.value === 3){
        stroke = "blue";
        hot = true;
    } 
    group.value.push(groupName.value);
    diagramModel.value.addNodeData({name:groupName.value, key: recId.value,stroke:stroke,isGroup: true,R:"R:0.5",DR:"DR:2",H:"H:3",Z:"Z:4",cold:cold,hot:hot});
    groupName.value = "";
    edgeValue.value = "";
    recId.value++;
}

const addLine = () => {
    var color;
    if(edgeValue.value) color = "red";
    else color = "blue";
    diagramModel.value.addLinkData({ from:addLineFrom.value, to:addLineTo.value,color:"black" })
    addLineFrom.value = "";
    addLineTo.value = "";
}

const submit = () => {
    send("updateGraph");
    send(JSON.stringify({
        id:id.value,
        name:pictureName.value,
        message:diagram.value.model.toJson()
    }));
}

const open = () => {
    console.log("socket连接成功");
}

const error = () => {
    console.log("连接错误");
}

const send = (ms) => {
    socket.value.send(ms);
}

const close = () => {
    send("close");
    console.log("socket已经关闭")
}

const getMessage = (msg) => {
   console.log(msg.data);
   if(msg.data === "update success"){
        ElMessage({
            message: '成功提交',
            type: 'success'
        });
       
       return 
   }
   if(msg.data === ""){
       nodes.value = []
       edges.value = []
   }
   else{
        var json = eval("("+msg.data+")");
        console.log(json)
        nodes.value = json.nodeDataArray;
        edges.value = json.linkDataArray;
        console.log(nodes.value);
        console.log(edges.value);
   }

   for(var i=0; i<nodes.value.length; i++){
    if(nodes.value[i].recId >= recId.value) recId.value = nodes.value[i].recId + 1;

    if(nodes.value[i].id === $store.state.aloId){

        if($store.state.aloValue !== undefined){
            nodes.value[i].R = "R:" + $store.state.aloValue.R;
            nodes.value[i].DR = "DR:" + $store.state.aloValue.DR;
            nodes.value[i].H = "H:" + $store.state.aloValue.H;
            nodes.value[i].Z = "Z:" + $store.state.aloValue.Z;
        }
        else{
            nodes.value[i].R = "R:0";
            nodes.value[i].DR = "DR:0";
            nodes.value[i].H = "H:0";
            nodes.value[i].Z = "Z:0";
        }

        if($store.state.aloValue !== undefined && nodes.value[i].name.indexOf("\n\n") === -1 && !isSystem.value){
            nodes.value[i].name = nodes.value[i].name + "\n\n可靠度:" + $store.state.aloValue.R;
        }
        
    }

    if(isSystem.value){
        for(var j=0; j<alo.value.length; j++){
            if(parseInt(nodes.value[i].name)) continue;
            if(nodes.value[i].name.startsWith(alo.value[j].name) && nodes.value[i].name.indexOf("\n\n") === -1){
                nodes.value[i].name = nodes.value[i].name + "\n\n可靠度:" + alo.value[j].R;
                nodes.value[i].R = alo.value[j].R
            }
        }        
    }
   }

   //   清除保存记录
   $store.commit("changeAloValue",undefined);

   diagramModel.value = new go.GraphLinksModel(nodes.value, edges.value);
   diagram.value.model = diagramModel.value;
}

const getSystem = (msg) => {
    var json = eval(msg.data);
}

const getAlo = (msg) => {
   var json = eval(msg.data);
   console.log(json);
   if(isSystem.value){
        var sysAndProId = $store.state.sysAndProId;
        alo.value = json[sysAndProId.sysId-1].pro;
        sysplaceholder.value = "请选择产品"
   }
   else{
    alo.value = json;
   }
   console.log(alo.value);

   socket.value.onmessage = getMessage;
   send("checkGraph");
   send(id.value);
}

const count = () => {
    send("calR");
    send(JSON.stringify(id.value));

    socket.value.onmessage = getValue;
}

const setValue = (i) => {
    nodeData.value.R = nodes.value[i].R;
    nodeData.value.DR = nodes.value[i].DR;
    nodeData.value.H = nodes.value[i].H;
    nodeData.value.Z = nodes.value[i].Z;
    nodeData.value.key = nodes.value[i].key;
    if(nodes.value[i].isGroup === true){
        if(nodes.value[i].stroke === "red") nodeData.value.backup = 1;
        else if(nodes.value[i].stroke === "blue") nodeData.value.backup = 2;
        else nodeData.value.backup = 0;
    }
    message.value.push(nodeData.value);
    message.value = JSON.parse(JSON.stringify(message.value));
}

const deepSearch = (x) => {
    var k = -1;
    for(var i=0; i<nodes.value.length; i++){
        if(rec.value[x][i] === 1){
            setValue(i);
            k = i;
            break;
        }
    }
    if(k !== -1){
        deepSearch(k);
    }
}

const getValue = (msg) => {
    //只返回R值
    console.log(msg.data);
    var json = eval("("+msg.data+")");
                   
    console.log(json);

    RHZvalue.value.R = json;
    console.log(RHZvalue.value);
    
    dialogVisible.value = true;
    
    var sysAndProId = $store.state.sysAndProId;
    
    send("updateProduct");
    var data = {
        id:id.value,
        sysId:sysAndProId.sysId,
        proId:sysAndProId.proId,
        R:json,
        DR:0,
        H:0,
        Z:0,
    }
    send(JSON.stringify(data));
    console.log(data);

    socket.value.onmessage = updateProduct;
}

const updateProduct = (msg) => {
    console.log(msg.data);
    socket.value.onmessage = getMessage;
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