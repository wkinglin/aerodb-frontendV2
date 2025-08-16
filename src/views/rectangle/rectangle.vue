<template>
    <div class="rectangle-page">
        <!-- 左右分栏布局 -->
        <div class="layout-container">

            <!-- 左侧画布区域 -->
            <div class="canvas-area">
                <div class="flow-container">
                    <VueFlow v-model:nodes="flowNodes" v-model:edges="flowEdges" :fit-view-on-init="true"
                        :nodes-draggable="true" :nodes-connectable="true" :elements-selectable="true"
                        :nodes-focusable="true" @connect="onConnect" class="vue-flow-instance">

                        <!-- 自定义节点模板 -->
                        <template #node-custom="customNodeProps">
                            <div class="custom-node" :style="{
                                backgroundColor: (customNodeProps as any).data?.color || '#f3f4f6',
                                borderColor: (customNodeProps as any).selected ? '#3b82f6' : '#d1d5db'
                            }" @click="handleCustomNodeClick($event, customNodeProps)">
                                <Handle type="target" :position="Position.Top" class="custom-handle" />

                                <div class="node-content">
                                    <div class="node-title">{{ customNodeProps.data?.name || '节点' }}</div>
                                    <div class="node-tit text-blue-600 font-semibold text-sm mb-1"
                                        v-if="(customNodeProps as any).data?.reliability">
                                        可靠度: {{ (customNodeProps as any).data?.reliability }}
                                    </div>

                                    <div class="kv-grid">
                                        <div class="kv-item">
                                            <span class="kv-label">R</span>
                                            <span class="kv-value"
                                                :title="getFormattedValue((customNodeProps as any).data?.R)">{{
                                                    getFormattedValue((customNodeProps as any).data?.R) }}</span>
                                        </div>
                                        <div class="kv-item">
                                            <span class="kv-label">DR</span>
                                            <span class="kv-value"
                                                :title="getFormattedValue((customNodeProps as any).data?.DR)">{{
                                                    getFormattedValue((customNodeProps as any).data?.DR) }}</span>
                                        </div>
                                        <div class="kv-item">
                                            <span class="kv-label">H</span>
                                            <span class="kv-value"
                                                :title="getFormattedValue((customNodeProps as any).data?.H)">{{
                                                    getFormattedValue((customNodeProps as any).data?.H) }}</span>
                                        </div>
                                        <div class="kv-item">
                                            <span class="kv-label">Z</span>
                                            <span class="kv-value"
                                                :title="getFormattedValue((customNodeProps as any).data?.Z)">{{
                                                    getFormattedValue((customNodeProps as any).data?.Z) }}</span>
                                        </div>
                                    </div>

                                    <button class="nav-btn"
                                        @click.stop="handleNavigate($event, customNodeProps)">跳转</button>
                                </div>

                                <Handle type="source" :position="Position.Bottom" class="custom-handle" />
                            </div>
                        </template>

                        <!-- 组节点模板 -->
                        <template #node-group="groupNodeProps">
                            <NodeResizer :min-width="300" :min-height="200"
                                :is-visible="(groupNodeProps as any).selected"
                                @resize="onGroupNodeResize($event, groupNodeProps)" />

                            <div class="group-node-container" @click="handleCustomNodeClick($event, groupNodeProps)"
                                :style="{
                                    backgroundColor: (groupNodeProps as any).data?.backgroundColor || 'rgba(107, 114, 128, 0.08)',
                                    borderColor: (groupNodeProps as any).data?.borderColor || '#6b7280',
                                    borderStyle: 'solid',
                                    borderWidth: '3px',
                                    borderRadius: '16px',
                                    width: '100%',
                                    height: '100%',
                                    padding: '20px',
                                    position: 'relative'
                                }">
                                <!-- 连接点 -->
                                <Handle type="target" :position="Position.Top" class="group-handle" />
                                <Handle type="source" :position="Position.Bottom" class="group-handle" />
                                <Handle type="target" :position="Position.Left" class="group-handle" />
                                <Handle type="source" :position="Position.Right" class="group-handle" />

                                <div class="group-header">
                                    <div class="group-header-left">
                                        <h4 class="group-title">{{ (groupNodeProps as any).data?.name }}</h4>
                                        <span class="group-badge"
                                            :class="getGroupBadgeClass((groupNodeProps as any).data?.groupType)">
                                            {{ (groupNodeProps as any).data?.typeLabel || '普通' }}
                                        </span>
                                    </div>

                                    <!-- 组节点属性值显示 -->
                                    <div class="group-values">
                                        <div class="group-kv-grid">
                                            <div class="group-kv-item">
                                                <span class="group-kv-label">R</span>
                                                <span class="group-kv-value"
                                                    :title="getFormattedValue((groupNodeProps as any).data?.R)">{{
                                                        getFormattedValue((groupNodeProps as any).data?.R) }}</span>
                                            </div>
                                            <div class="group-kv-item">
                                                <span class="group-kv-label">DR</span>
                                                <span class="group-kv-value"
                                                    :title="getFormattedValue((groupNodeProps as any).data?.DR)">{{
                                                        getFormattedValue((groupNodeProps as any).data?.DR) }}</span>
                                            </div>
                                            <div class="group-kv-item">
                                                <span class="group-kv-label">H</span>
                                                <span class="group-kv-value"
                                                    :title="getFormattedValue((groupNodeProps as any).data?.H)">{{
                                                        getFormattedValue((groupNodeProps as any).data?.H) }}</span>
                                            </div>
                                            <div class="group-kv-item">
                                                <span class="group-kv-label">Z</span>
                                                <span class="group-kv-value"
                                                    :title="getFormattedValue((groupNodeProps as any).data?.Z)">{{
                                                        getFormattedValue((groupNodeProps as any).data?.Z) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>



                                <div class="group-content">
                                    <!-- 组内容区域，子节点会自动渲染在这里 -->
                                </div>
                            </div>
                        </template>
                    </VueFlow>
                </div>
            </div>

            <!-- 右侧控制面板 -->
            <div class="control-panel">
                <div class="panel-header">
                    <h3>控制面板</h3>
                </div>

                <div class="panel-content">

                    <!-- 产品选择组 -->
                    <div v-if="isSystem" class="control-group">
                        <h4 class="group-title">产品选择</h4>
                        <div class="form-item">
                            <label class="form-label">产品选择</label>
                            <el-select v-model="select.product" placeholder="请选择产品" class="form-control"
                                style="flex: 1;">
                                <el-option v-for="item in pro" :key="item.id" :label="item.name"
                                    :value="item.id"></el-option>
                            </el-select>
                        </div>

                        <div class="form-item">
                            <label class="form-label">选择组</label>
                            <el-select v-model="select.group" placeholder="请选择对应的组" class="form-control">
                                <div v-for="(item, index) in nodes" :key="index" :label="item.key">
                                    <el-option v-if="item.isGroup == true" :value="item.name"></el-option>
                                </div>
                            </el-select>
                        </div>

                        <el-button type="primary" class="action-btn primary-btn" @click="addProduct()">添加框图</el-button>
                    </div>

                    <!-- 算法选择组 -->
                    <div v-else class="control-group">
                        <h4 class="group-title">算法配置</h4>
                        <div class="form-item">
                            <label class="form-label" style="margin-bottom: 0; min-width: 70px;">算法选择</label>
                            <el-select v-model="select.alo" placeholder="请选择算法" class="form-control" style="flex: 1;">
                                <el-option v-for="item in alo" :key="item.id" :label="item.name"
                                    :value="item.id"></el-option>
                            </el-select>
                        </div>

                        <div class="form-item">
                            <label class="form-label">选择组</label>
                            <el-select v-model="select.group" placeholder="请选择对应的组" class="form-control">
                                <div v-for="(item, index) in nodes" :key="index" :label="item.key">
                                    <el-option v-if="item.isGroup == true" :value="item.name"></el-option>
                                </div>
                            </el-select>
                        </div>

                        <el-button type="primary" class="action-btn primary-btn" @click="addAlo()">添加框图</el-button>
                    </div>

                    <!-- 组配置 -->
                    <div class="control-group">
                        <h4 class="group-title">组配置</h4>
                        <div class="form-item">
                            <label class="form-label">备份方式</label>
                            <el-select v-model="select.backup" placeholder="请选择备份方式" class="form-control">
                                <el-option label="热备份" value="hot"></el-option>
                                <el-option label="冷备份" value="cold"></el-option>
                            </el-select>
                        </div>

                        <div class="form-item">
                            <label class="form-label">组名称</label>
                            <el-input v-model="select.groupName" placeholder="请输入名称" class="form-control"></el-input>
                        </div>

                        <el-button type="success" class="action-btn" @click="addGroup()">添加组</el-button>
                    </div>

                    <!-- 连线操作 -->
                    <div class="control-group">
                        <h4 class="group-title">连线操作</h4>
                        <div class="form-item">
                            <label class="form-label">起点</label>
                            <el-select v-model="select.addLineFrom" placeholder="请选择边的起点" class="form-control">
                                <div v-for="(item, index) in nodes" :key="index">
                                    <el-option v-if="item.group == null" :value="item.key"
                                        :label="item.name"></el-option>
                                </div>
                            </el-select>
                        </div>

                        <div class="form-item">
                            <label class="form-label">终点</label>
                            <el-select v-model="select.addLineTo" placeholder="请选择边的终点" class="form-control">
                                <div v-for="(item, index) in nodes" :key="index">
                                    <el-option v-if="item.group == null" :value="item.key"
                                        :label="item.name"></el-option>
                                </div>
                            </el-select>
                        </div>

                        <div class="button-row">
                            <el-button type="warning" class="action-btn" @click="addLine()">添加边</el-button>
                            <el-button type="danger" class="action-btn" @click="deleteSelected()">删除选中</el-button>
                        </div>
                    </div>

                    <!-- 主要操作 -->
                    <div class="control-group main-actions">
                        <h4 class="group-title">主要操作</h4>
                        <div class="main-buttons">
                            <el-button type="primary" size="large" class="main-action-btn" @click="count()">
                                计算
                            </el-button>
                            <el-button type="primary" size="large" class="main-action-btn" @click="submit()">
                                保存
                            </el-button>
                            <!-- <el-button type="success" size="large" class="main-action-btn" @click="openExcel()">
                                打开Excel
                            </el-button> -->
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <!-- 对话框保持不变 -->
        <el-dialog title="计算结果" v-model="dialogVisible" width="30%" top="240px">
            <el-descriptions :column="1">
                <el-descriptions-item label="系统可靠度">{{ RHZvalue.R }}</el-descriptions-item>
            </el-descriptions>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
                </span>
            </template>
        </el-dialog>

        <el-dialog title="修改输入值" v-model="changeNodeVisible" width="40%" top="240px">
            <el-form label-width="150px" label-position="left" :model="aloForm">
                <el-form-item label="R">
                    <el-input v-model="aloForm.R"></el-input>
                </el-form-item>
                <el-form-item label="DR">
                    <el-input v-model="aloForm.DR"></el-input>
                </el-form-item>
                <el-form-item label="H">
                    <el-input v-model="aloForm.H"></el-input>
                </el-form-item>
                <el-form-item label="Z">
                    <el-input v-model="aloForm.Z"></el-input>
                </el-form-item>
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

<script setup lang="ts">
import { ref, onActivated, Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useWebSocket } from '@/composables/useWebSocket'

import { VueFlow, Handle, Position } from '@vue-flow/core'
import type { Connection, Node as VFNode, Edge as VFEdge } from '@vue-flow/core'
import { NodeResizer } from '@vue-flow/node-resizer'


// vue-flow 样式
import '@vue-flow/core/dist/style.css'
import '@vue-flow/node-resizer/dist/style.css'

import { GroupType, Node, Edge, System, Pro, Alo } from './nodes'

// 类型定义
interface SysAndProId {
    sysId: number
    proId: number
}

interface AloData {
    aloId: number
    aloValue: any
    recId: number
    isTurnAlo: boolean
}

interface RHZValue {
    R: string | number
    H: string | number
    Z: string | number
}

interface AloForm {
    recId: string
    reliability: string
    R: string
    DR: string
    H: string
    Z: string
}

const router = useRouter()
const route = useRoute()
const { sendCommand, setMessageHandler } = useWebSocket()

// 从路由参数获取数据
const pictureName: Ref<string> = ref('')
const id: Ref<number> = ref(0)
const isSystem: Ref<boolean> = ref(false) // 是否是系统节点
const sysAndProId: Ref<SysAndProId> = ref({ sysId: 0, proId: 0 })
const currentAloData: Ref<AloData> = ref({ aloId: 0, aloValue: null, recId: 0, isTurnAlo: false })

// 算法和产品的数据
const alo: Ref<Alo[]> = ref([])
const pro: Ref<Pro[]> = ref([])
const system: Ref<System | null> = ref(null)

// 框图的相关数据
const nodes: Ref<Node[]> = ref([])
const edges: Ref<Edge[]> = ref([])
const group: Ref<Node[]> = ref([])

// 选择框的数据
const select: Ref<any> = ref({
    product: '',
    group: '',
    alo: '',
    backup: '',
    groupName: '',
    addLineFrom: '',
    addLineTo: '',
})

// 框图的全局id
const recId: Ref<number> = ref(0)

// 对话框的显示
const dialogVisible: Ref<boolean> = ref(false)
const changeNodeVisible: Ref<boolean> = ref(false)


// vue-flow 数据
const flowNodes = ref<VFNode[]>([])
const flowEdges = ref<VFEdge[]>([])


const RHZvalue: Ref<RHZValue> = ref({
    R: '',
    H: '',
    Z: ''
})
const aloForm: Ref<AloForm> = ref({
    recId: '',
    reliability: '',
    R: '',
    DR: '',
    H: '',
    Z: '',
})


onActivated(() => {
    // 清空之前的数据状态，避免缓存问题
    nodes.value = []
    edges.value = []
    flowNodes.value = []
    flowEdges.value = []
    group.value = []
    recId.value = 0

    // 从路由query参数获取数据，不再依赖store
    pictureName.value = route.query.pictureName as string || ''
    id.value = parseInt(route.query.id as string || '0')
    isSystem.value = route.query.isSystem === 'true'
    sysAndProId.value = {
        sysId: parseInt(route.query.sysId as string || '0'),
        proId: parseInt(route.query.proId as string || '0')
    }
    console.log(pictureName.value, id.value, isSystem.value, sysAndProId.value)

    // 获取数据
    setMessageHandler(getAloAndPro)
    sendCommand("systemAll")
})

// 获取算法和产品数据函数
const getAloAndPro = (msg: MessageEvent): void => {
    const json = JSON.parse(msg.data);
    console.log(json)

    system.value = json.find((item: any) => item.id === sysAndProId.value.sysId)
    pro.value = system.value?.pro || []
    alo.value = pro.value.find((item: any) => item.id === sysAndProId.value.proId)?.alo || []

    setMessageHandler(getMessage)
    sendCommand("checkGraph");
    sendCommand(String(id.value));
}

// 获取框图数据函数
const getMessage = (msg: MessageEvent): void => {
    if (msg.data === "update success") {
        ElMessage({
            message: '成功提交',
            type: 'success'
        });
        return
    }

    if (msg.data === "修改成功") {
        return
    }

    // 如果数据为空，则返回
    if (!msg.data) {
        return
    }

    try {
        const json = JSON.parse(msg.data)
        console.log("框图数据", json)
        nodes.value = json.nodeDataArray || []
        edges.value = json.linkDataArray || []

        // 处理节点数据，确保响应式更新
        nodes.value = nodes.value.map((node: Node) => {
            const newNode = { ...node } // 创建新对象确保响应式
            if (newNode.recId >= recId.value) recId.value = newNode.recId + 1;

            // 如果当前节点是算法节点，则更新节点值
            if (newNode.id === currentAloData.value.aloId) {
                if (currentAloData.value.aloValue !== undefined) {
                    newNode.R = getFormattedValue(currentAloData.value.aloValue.R);
                    newNode.DR = getFormattedValue(currentAloData.value.aloValue.DR);
                    newNode.H = getFormattedValue(currentAloData.value.aloValue.H);
                    newNode.Z = getFormattedValue(currentAloData.value.aloValue.Z);
                }
                else {
                    newNode.R = getFormattedValue(0);
                    newNode.DR = getFormattedValue(0);
                    newNode.H = getFormattedValue(0);
                    newNode.Z = getFormattedValue(0);
                }
                if (currentAloData.value.aloValue !== undefined && newNode.name.indexOf("\n\n") === -1 && !isSystem.value) {
                    const formattedR = getFormattedValue(currentAloData.value.aloValue.R).replace(/^R:/, '');
                    newNode.name = newNode.name + "\n\n可靠度:" + formattedR;
                }
            }

            return newNode
        })

        const { flowNodes: nf, flowEdges: ef } = node2Flow(nodes.value, edges.value)
        flowNodes.value = nf
        flowEdges.value = ef
    } catch (e) {
        console.error('解析JSON失败:', e);
        return;
    }

    //   清除当前算法数据记录
    currentAloData.value.aloValue = undefined;
}

// 自定义点击函数
const handleCustomNodeClick = (event: MouseEvent, customNodeProps: any) => {
    const props = customNodeProps as any
    console.log('CustomNode clicked:', props.data)
    if (props.data?.onCustomEvent) {
        props.data.onCustomEvent(event, props.data)
    }
}

// 自定义跳转函数
const handleNavigate = (event: MouseEvent, customNodeProps: any) => {
    const props = customNodeProps as any
    if (props.data?.onNavigate) {
        props.data.onNavigate(event)
    }
}

// 添加产品节点函数
const addProduct = (): void => {
    const productItem = pro.value.find((item: Pro) => item.id === select.value.product)
    const groupItem = nodes.value.find((item: Node) => item.name === select.value.group && item.type === 'group')

    if (!productItem) {
        ElMessage.error('产品不存在')
        return
    }

    // 创建自定义节点
    const position = groupItem?.key
        ? { x: 50 + Math.random() * 200, y: 50 + Math.random() * 100 } // 组内节点相对位置
        : { x: 50 + Math.random() * 200, y: 50 + Math.random() * 200 } // 自由节点位置

    const node: Node = {
        id: productItem.id,
        name: productItem.name,
        recId: recId.value,
        key: recId.value,

        loc: position.toString(),

        // 是否分组
        type: groupItem ? 'group' : 'pro',
        isGroup: false,
        group: groupItem ? groupItem.key : -1,
        groupType: groupItem ? groupItem.groupType : "normal",
        hot: groupItem ? groupItem.groupType === 'hot' : false,

        // 属性值
        R: productItem.R ? getFormattedValue(productItem.R) : getFormattedValue(0),
        DR: productItem.DR ? getFormattedValue(productItem.DR) : getFormattedValue(0),
        H: productItem.H ? getFormattedValue(productItem.H) : getFormattedValue(0),
        Z: productItem.Z ? getFormattedValue(productItem.Z) : getFormattedValue(0),
        reliability: "",
    }

    flowNodes.value.push({
        id: String(recId.value),
        type: 'custom', // 使用自定义节点类型
        position: position,
        data: {
            label: productItem.name,
            ...node,
            onCustomEvent: (_e: MouseEvent, _data: any) => {
                // 打开编辑对话框
                const currentNode = nodes.value.find((n: Node) => n.recId === _data.recId)
                if (currentNode) {
                    aloForm.value.recId = String(currentNode.recId)
                    aloForm.value.R = getFormattedValue(currentNode.R)
                    aloForm.value.DR = getFormattedValue(currentNode.DR)
                    aloForm.value.H = getFormattedValue(currentNode.H)
                    aloForm.value.Z = getFormattedValue(currentNode.Z)
                }
                changeNodeVisible.value = true
            },
            onNavigate: (_e: MouseEvent) => {
                router.push({ path: '/seeRect' })
                return
            }
        },
        parentNode: groupItem ? String(groupItem.key) : undefined,
        extent: groupItem ? 'parent' as any : undefined,
    } as any)

    nodes.value.push(node)

    recId.value++
    select.value.alo = ''
    select.value.group = ''
    ElMessage.success(`节点 ${productItem.name} 已添加!`)
}

// 添加算法节点函数
const addAlo = (): void => {
    const aloItem = alo.value.find((item: Alo) => item.id === select.value.alo)
    const groupItem = nodes.value.find((item: Node) => item.name === select.value.group && item.type === 'group')

    if (!aloItem) {
        ElMessage.error('算法不存在')
        return
    }

    const position = groupItem?.key
        ? { x: 50 + Math.random() * 200, y: 50 + Math.random() * 100 } // 组内节点相对位置
        : { x: 50 + Math.random() * 200, y: 50 + Math.random() * 200 } // 自由节点位置

    const node: Node = {
        id: aloItem.id,
        name: aloItem.name,
        recId: recId.value,
        key: recId.value,

        loc: position.toString(),

        // 是否分组
        type: groupItem ? 'group' : 'alo',
        isGroup: false,
        group: groupItem ? groupItem.key : -1,
        groupType: groupItem ? groupItem.groupType : "normal",
        hot: groupItem ? groupItem.groupType === 'hot' : false,

        // 属性值
        R: aloItem.R ? getFormattedValue(aloItem.R) : getFormattedValue(0),
        DR: aloItem.DR ? getFormattedValue(aloItem.DR) : getFormattedValue(0),
        H: aloItem.H ? getFormattedValue(aloItem.H) : getFormattedValue(0),
        Z: aloItem.Z ? getFormattedValue(aloItem.Z) : getFormattedValue(0),
        reliability: "",
    }

    // 创建自定义节点
    flowNodes.value.push({
        id: String(recId.value),
        type: 'custom', // 使用自定义节点类型
        position: position,
        data: {
            label: aloItem.name,
            ...node,
            onCustomEvent: (_e: MouseEvent, _data: any) => {
                ElMessage.success(`节点 ${_data.name} 被点击!`)

                // 打开编辑对话框
                const currentNode = nodes.value.find((n: Node) => n.recId === _data.recId)
                if (currentNode) {
                    aloForm.value.recId = String(currentNode.recId)
                    aloForm.value.R = getFormattedValue(currentNode.R)
                    aloForm.value.DR = getFormattedValue(currentNode.DR)
                    aloForm.value.H = getFormattedValue(currentNode.H)
                    aloForm.value.Z = getFormattedValue(currentNode.Z)
                }
                changeNodeVisible.value = true
            },
            onNavigate: (_e: MouseEvent) => {
                // currentAloData.value = {
                //     aloId: Number(aloItem.id),
                //     aloValue: undefined,
                //     recId: recId.value,
                //     isTurnAlo: true,
                // }
                router.push({ path: 'alg', query: { id: aloItem.id } })
            }
        },
        parentNode: groupItem ? String(groupItem.key) : undefined,
        extent: groupItem ? 'parent' as any : undefined,
    } as any)

    nodes.value.push(node)

    recId.value++
    select.value.alo = ''
    select.value.group = ''
    ElMessage.success(`节点 ${aloItem.name} 已添加!`)
}

// 添加分组节点函数
const addGroup = (): void => {
    const groupType = select.value.backup === 'hot' ? 'hot' : select.value.backup === 'cold' ? 'cold' : 'normal'
    const position = { x: 50 + Math.random() * 200, y: 50 + Math.random() * 200 }
    const defaultWidth = 350
    const defaultHeight = 250

    const node: Node = {
        id: recId.value,
        name: select.value.groupName,
        recId: recId.value,
        key: recId.value,

        loc: position.toString(),

        // 是否分组
        type: 'group',
        isGroup: true,
        group: -1,
        groupType: groupType,
        hot: groupType === 'hot' ? true : false,

        // 属性值
        R: getFormattedValue(0),
        DR: getFormattedValue(0),
        H: getFormattedValue(0),
        Z: getFormattedValue(0),
        reliability: "",

        // 默认尺寸
        width: defaultWidth,
        height: defaultHeight,
    }

    const groupBg = getGroupBackgroundColor(groupType)
    const groupBorder = getGroupBorderColor(groupType)

    flowNodes.value.push({
        id: String(recId.value),
        type: 'group', // 现在我们有了group模板，可以使用group类型
        position: { x: 150 + Math.random() * 100, y: 150 + Math.random() * 100 },
        style: {
            width: defaultWidth,
            height: defaultHeight,
        },
        data: {
            label: select.value.groupName,
            typeLabel: getGroupTypeLabel(groupType),
            backgroundColor: groupBg,
            borderColor: groupBorder,
            ...node,
            onCustomEvent: (_e: MouseEvent, _data: any) => {
                ElMessage.success(`节点 ${_data.name} 被点击!`)

                // 打开编辑对话框
                const currentNode = nodes.value.find((n: Node) => n.recId === _data.recId)
                if (currentNode) {
                    aloForm.value.recId = String(currentNode.recId)
                    aloForm.value.R = getFormattedValue(currentNode.R)
                    aloForm.value.DR = getFormattedValue(currentNode.DR)
                    aloForm.value.H = getFormattedValue(currentNode.H)
                    aloForm.value.Z = getFormattedValue(currentNode.Z)
                }
                changeNodeVisible.value = true
            },
        },
    } as any)

    nodes.value.push(node)
    group.value.push(node)

    recId.value++
    select.value.groupName = ''
    select.value.backup = ''
}

// TODO： 未处理图上手动连线
// 添加连线函数
const addLine = (): void => {
    console.log(select.value.addLineFrom, select.value.addLineTo)
    const id = `e-${select.value.addLineFrom}-${select.value.addLineTo}-${Date.now()}`
    flowEdges.value.push({ id, source: String(select.value.addLineFrom), target: String(select.value.addLineTo), animated: false, type: 'default', style: { stroke: 'black', strokeWidth: 2 } } as any)
    edges.value.push({ from: String(select.value.addLineFrom), to: String(select.value.addLineTo), color: 'black' })
    select.value.addLineFrom = ''
    select.value.addLineTo = ''
}

// 打开Excel函数
// const openExcel = (): void => {
//     // 由于安全限制，浏览器环境不能直接访问文件系统
//     // 这里需要通过后端API来处理文件操作
//     const fileInfo = {
//         sysId: sysAndProId.value.sysId,
//         proId: sysAndProId.value.proId
//     }

//     ElMessage.info('文件操作需要通过后端处理')
//     console.log('Excel文件信息:', fileInfo)

//     // 可以发送请求给后端来处理Excel文件
//     // send('openExcel')
//     // send(JSON.stringify(fileInfo))
// }

// 修改节点值函数
const changeNodeValue = (): void => {
    changeNodeVisible.value = false
    const select_node = nodes.value.find((node: Node) => node.recId === Number(aloForm.value.recId))
    if (select_node) {
        select_node.R = getFormattedValue(aloForm.value.R)
        select_node.DR = getFormattedValue(aloForm.value.DR)
        select_node.H = getFormattedValue(aloForm.value.H)
        select_node.Z = getFormattedValue(aloForm.value.Z)
    }

    flowNodes.value = flowNodes.value.map((flowNode: any) => {
        if (flowNode.data.recId === Number(aloForm.value.recId)) {
            return {
                ...flowNode,
                data: {
                    ...flowNode.data,
                    R: getFormattedValue(aloForm.value.R),
                    DR: getFormattedValue(aloForm.value.DR),
                    H: getFormattedValue(aloForm.value.H),
                    Z: getFormattedValue(aloForm.value.Z)
                }
            }
        }
        return flowNode
    })

    aloForm.value = {
        recId: "",
        reliability: '',
        R: '',
        DR: '',
        H: '',
        Z: '',
    }

    ElMessage.success('节点值修改成功, 需要手动保存')
}

// 连接（串联/并联）
const onConnect = (connection: Connection) => {
    // recId
    const id = `e-${connection.source}-${connection.target}-${Date.now()}`
    flowEdges.value.push({ id, source: String(connection.source), target: String(connection.target), animated: false, type: 'default', style: { stroke: 'black', strokeWidth: 2 } })
    edges.value.push({ from: String(connection.source), to: String(connection.target), color: 'black' })
}

// 组节点大小调整事件处理
const onGroupNodeResize = (event: any, groupNodeProps: any) => {
    const nodeId = groupNodeProps.id
    const width = event.params.width
    const height = event.params.height

    // 同时更新 nodes 数组中的尺寸数据
    nodes.value = nodes.value.map(node => {
        if (String(node.recId) === nodeId && node.isGroup) {
            return {
                ...node,
                width: Math.round(width),
                height: Math.round(height)
            }
        }
        return node
    })
}

// 删除选中（根据 vue-flow 的 selected 标记）
const deleteSelected = (): void => {
    const selectedEdges = flowEdges.value.filter(e => (e as any).selected)
    if (selectedEdges.length) {
        const keys = new Set(selectedEdges.map(e => `${e.source}-${e.target}`))
        flowEdges.value = flowEdges.value.filter(e => !keys.has(`${e.source}-${e.target}`))
        edges.value = edges.value.filter(e => !keys.has(`${e.from}-${e.to}`))
        return
    }
    const selectedNodes = flowNodes.value.filter(n => (n as any).selected)
    if (selectedNodes.length) {
        const ids = new Set(selectedNodes.map(n => n.id))
        flowNodes.value = flowNodes.value.filter(n => !ids.has(n.id))
        nodes.value = nodes.value.filter(n => !ids.has(String(n.key)))
        flowEdges.value = flowEdges.value.filter(e => !ids.has(e.source) && !ids.has(e.target))
        edges.value = edges.value.filter(e => !ids.has(String(e.from)) && !ids.has(String(e.to)))
        return
    }
}

// 保存函数
const submit = (): void => {
    const payload = flow2Node(flowNodes.value as any[], flowEdges.value as any[])

    sendCommand('updateGraph')
    sendCommand(JSON.stringify({ id: id.value, name: pictureName.value, message: JSON.stringify(payload) }))
}

// 计算可靠度函数
const count = (): void => {
    sendCommand("calR");
    sendCommand(JSON.stringify(id.value));
    setMessageHandler(getValue)
}

// TODO：获取值函数
const getValue = (msg: MessageEvent): void => {
    //只返回R值
    console.log(msg.data);
    let json: any
    try {
        json = JSON.parse(msg.data);
    } catch (e) {
        console.error('解析JSON失败:', e);
        return;
    }

    RHZvalue.value.R = getFormattedValue(json);

    dialogVisible.value = true;

    setMessageHandler(getMessage)
    sendCommand("updateProduct");
    const data = {
        id: id.value,
        sysId: sysAndProId.value.sysId,
        proId: sysAndProId.value.proId,
        R: json,
        DR: 0,
        H: 0,
        Z: 0,
    }
    sendCommand(JSON.stringify(data));
}

// 分组相关工具函数
const getGroupBorderColor = (groupType?: GroupType): string => {
    switch (groupType) {
        case 'hot': return '#ef4444' // 红色 - 热备份
        case 'cold': return '#3b82f6' // 蓝色 - 冷备份
        case 'normal': return '#10b981' // 绿色 - 普通分组
        default: return '#6b7280' // 灰色 - 默认
    }
}

const getGroupBackgroundColor = (groupType?: GroupType): string => {
    switch (groupType) {
        case 'hot': return 'rgba(239, 68, 68, 0.08)'
        case 'cold': return 'rgba(59, 130, 246, 0.08)'
        case 'normal': return 'rgba(16, 185, 129, 0.08)'
        default: return 'rgba(107, 114, 128, 0.08)'
    }
}

const getGroupTypeLabel = (groupType?: GroupType): string => {
    switch (groupType) {
        case 'hot': return '热备份'
        case 'cold': return '冷备份'
        case 'normal': return '普通'
        default: return '默认'
    }
}

const getGroupBadgeClass = (groupType?: GroupType): string => {
    switch (groupType) {
        case 'hot': return 'badge-hot'
        case 'cold': return 'badge-cold'
        case 'normal': return 'badge-normal'
        default: return 'badge-default'
    }
}

// 获取H、R、DR、Z值
const getFormattedValue = (value: any): string => {
    if (value == null || value === '' || value === undefined) return '0'
    const s = String(value)
    const cleanValue = s.includes(':') ? s.split(':')[1] || '0' : s
    const num = parseFloat(cleanValue)
    if (isNaN(num)) return '0'

    // 如果是整数或小数位数少于等于5位，直接返回
    if (num % 1 === 0 || cleanValue.indexOf('.') === -1) return num.toString()

    // 截断到5位小数
    return num.toFixed(5).replace(/\.?0+$/, '')
}

// ------------ node <-> Vue Flow 转换工具 -------------
function parseLocToPos(loc?: string): { x: number; y: number } {
    if (!loc) return { x: 100 + Math.random() * 100, y: 100 + Math.random() * 100 }
    const [x, y] = String(loc).split(' ').map(Number)
    return { x: isNaN(x) ? 0 : x, y: isNaN(y) ? 0 : y }
}

function posToLocStr(pos: { x: number; y: number }): string {
    return `${Math.round(pos.x)} ${Math.round(pos.y)}`
}

function node2Flow(input_nodes: Node[], input_edges: Edge[]) {
    const flowNodes = input_nodes.map((n: Node) => {
        const position = parseLocToPos(n.loc)

        const flowNode: any = {
            id: String(n.recId),
            type: n.isGroup ? 'group' : 'custom', // 组节点使用group类型
            position,
            // 为组节点添加尺寸信息
            style: n.isGroup && n.width && n.height ? {
                width: n.width,
                height: n.height,
            } : undefined,
            data: {
                label: n.name,
                typeLabel: n.isGroup ? getGroupTypeLabel(n.groupType) : undefined,
                backgroundColor: n.isGroup ? getGroupBackgroundColor(n.groupType) : undefined,
                borderColor: n.isGroup ? getGroupBorderColor(n.groupType) : undefined,
                ...n,
                onCustomEvent: (_e: MouseEvent, _data: any) => {
                    // 打开编辑对话框
                    const currentNode = nodes.value.find((n: Node) => n.recId === _data.recId)
                    if (currentNode) {
                        aloForm.value.recId = String(currentNode.recId)
                        aloForm.value.R = getFormattedValue(currentNode.R)
                        aloForm.value.DR = getFormattedValue(currentNode.DR)
                        aloForm.value.H = getFormattedValue(currentNode.H)
                        aloForm.value.Z = getFormattedValue(currentNode.Z)
                    }
                    changeNodeVisible.value = true
                },
                onNavigate: (_e: MouseEvent) => {
                    if (n.type === 'alo') {
                        currentAloData.value = {
                            aloId: n.id,
                            aloValue: undefined,
                            recId: Number(n.recId),
                            isTurnAlo: true,
                        }
                        router.push({ path: 'alg' })
                    }
                    else if (n.type === 'pro') {
                        router.push({ path: '/seeRect' })
                    }
                }
            },
            parentNode: n.group && n.group !== -1 ? String(n.group) : undefined,
            extent: n.group && n.group !== -1 ? 'parent' as any : undefined,
        }
        return flowNode
    })
    const flowEdges = input_edges.map((e: Edge, idx: number) => ({ id: `e-${e.from}-${e.to}-${idx}`, source: String(e.from), target: String(e.to), style: { stroke: e.color ?? 'black' } }))
    return { flowNodes, flowEdges }
}

function flow2Node(flow_nodes: any[], flow_edges: any[]) {
    const nodeDataArray: Node[] = flow_nodes.map((n: any) => ({
        id: n.data?.id,
        name: n.data?.name ?? n.data?.label ?? n.id,
        recId: Number(n.id),
        key: n.id,
        loc: posToLocStr(n.position),
        type: n.data?.isGroup ? 'group' : 'alo',
        isGroup: n.data?.isGroup ?? false,
        group: n.data?.group ?? null,
        groupType: n.data?.groupType ?? 'normal',
        hot: n.data?.hot ?? n.data?.groupType === 'hot' ? true : false,

        R: getFormattedValue(n.data?.R || 0),
        DR: getFormattedValue(n.data?.DR || 0),
        H: getFormattedValue(n.data?.H || 0),
        Z: getFormattedValue(n.data?.Z || 0),
        reliability: n.data?.reliability ?? "",

        // 保存组节点尺寸信息
        width: n.data?.isGroup ? (n.style?.width || n.data?.width) : undefined,
        height: n.data?.isGroup ? (n.style?.height || n.data?.height) : undefined,
    }))
    const linkDataArray: Edge[] = flow_edges.map((e: any) => ({ from: String(e.source), to: String(e.target), color: e.style?.stroke ?? 'black' }))
    return { nodeDataArray, linkDataArray }
}
</script>

<style>
/* 全屏页面样式 - 确保100%高度 */
.rectangle-page {
    height: 100%;
    width: 100%;
    background: #f5f7fa;
}

.full-screen-card {
    height: 100%;
    width: 100%;
    margin: 0;
    border-radius: 0;
    border: none;
    box-shadow: none;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.full-screen-card :deep(.el-card__body) {
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    flex: 1;
}

/* 左右分栏布局 - 撑满父div */
.layout-container {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;
    overflow: hidden;
}

/* 左侧画布区域 - 撑满剩余空间 */
.canvas-area {
    flex: 1;
    min-width: 0;
    height: 100%;
    background: white;
    position: relative;
    overflow: hidden;
}

.flow-container {
    width: 100%;
    height: 100%;
    background: #fafbfc;
    background-image:
        linear-gradient(90deg, rgba(0, 0, 0, .03) 1px, transparent 1px),
        linear-gradient(rgba(0, 0, 0, .03) 1px, transparent 1px);
    background-size: 20px 20px;
    overflow: hidden;
    position: relative;
}

/* 右侧控制面板 - 固定宽度，撑满高度 */
.control-panel {
    width: 250px;
    min-width: 250px;
    max-width: 250px;
    height: 100%;
    background: #ffffff;
    border-left: 1px solid #e1e7ef;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: auto;
}

.panel-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 20px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
}

.panel-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.panel-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    background: #fafbfc;
    /* 隐藏滚动条但保持功能 */
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;
    /* IE/Edge */
}

.panel-content::-webkit-scrollbar {
    width: 0;
    /* Chrome/Safari */
    height: 0;
}

/* 控制组样式 - 紧凑布局 */
.control-group {
    padding: 8px 16px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafbfc;
}

.control-group:last-child {
    border-bottom: none;
}

.control-group.main-actions {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-top: 2px solid #e1e7ef;
}

.group-title {
    margin: 0 0 6px 0;
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    padding-bottom: 4px;
    border-bottom: 1px solid #e5e7eb;
}

/* 表单项样式 - 紧凑布局 */
.form-item {
    margin-bottom: 8px;
}

.form-label {
    display: block;
    margin-bottom: 4px;
    color: #374151;
    font-weight: 500;
    font-size: 12px;
}

.form-control {
    width: 100%;
}

/* 按钮样式 - 减小高度 */
.action-btn {
    width: 100%;
    margin-bottom: 6px;
    height: 28px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 6px;
    transition: all 0.3s ease;
}

.action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.primary-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.button-row {
    display: flex;
    flex-direction: row;
    gap: 6px;
    margin-bottom: 6px;
}

.button-row .action-btn {
    margin-bottom: 0;
    width: 100%;
}

/* 主要操作按钮 - 减小尺寸 */
.main-buttons {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 6px;
}

.main-action-btn {
    width: 100%;
    height: 32px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 6px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin: 0px !important;
}

.main-action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Element Plus 组件样式覆盖 */
.control-panel :deep(.el-select) {
    border-radius: 8px;
}

.control-panel :deep(.el-input) {
    border-radius: 8px;
}

.control-panel :deep(.el-select .el-input__wrapper) {
    border-radius: 8px;
    transition: all 0.3s ease;
    border: 2px solid #e5e7eb;
}

.control-panel :deep(.el-select .el-input__wrapper):hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.control-panel :deep(.el-select .el-input__wrapper.is-focus) {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.control-panel :deep(.el-input__wrapper) {
    border-radius: 8px;
    transition: all 0.3s ease;
    border: 2px solid #e5e7eb;
}

.control-panel :deep(.el-input__wrapper):hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.control-panel :deep(.el-input__wrapper.is-focus) {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.control-panel :deep(.el-color-picker__trigger) {
    border-radius: 8px;
    transition: all 0.3s ease;
    border: 2px solid #e5e7eb;
    width: 100%;
    height: 40px;
}

.control-panel :deep(.el-color-picker__trigger):hover {
    border-color: #d1d5db;
    transform: scale(1.02);
}

/* 自定义节点样式 */
.custom-node {
    width: 220px;
    height: 180px;
    padding: 12px;
    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
        0 4px 16px rgba(0, 0, 0, 0.08),
        0 1px 4px rgba(0, 0, 0, 0.05);
    position: relative;
    font-family: '微软雅黑', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    backdrop-filter: blur(10px);
    overflow: hidden;
    /* 高DPI和缩放优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    will-change: transform;
    transform-origin: center;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    /* 避免子像素渲染导致的模糊 */
    transform: translateZ(0);
    /* 提高渲染质量 */
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
}

.custom-node::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px 16px 0 0;
}

.custom-node:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.15),
        0 4px 16px rgba(102, 126, 234, 0.2);
    border-color: #667eea;
}

.custom-node.selected {
    border-color: #667eea !important;
    box-shadow:
        0 0 0 3px rgba(102, 126, 234, 0.3),
        0 8px 32px rgba(102, 126, 234, 0.2);
    transform: translateY(-2px) scale(1.01);
}

.node-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
    height: 100%;
    z-index: 1;
    position: relative;
}

.node-title {
    font-size: 14px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
    line-height: 1.3;
    white-space: pre-line;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    /* 文本渲染优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

.node-tit {
    font-size: 11px;
    font-weight: 600;
    color: #3b82f6;
    margin-bottom: 6px;
    padding: 2px 8px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 12px;
    border: 1px solid rgba(59, 130, 246, 0.2);
    backdrop-filter: blur(4px);
}

.kv-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 8px;
    width: 100%;
    margin: 8px 0;
}

.kv-item {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: center;
    transition: all 0.2s ease;
}

.kv-item:hover {
    transform: scale(1.05);
}

.kv-label {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 3px 6px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 600;
    line-height: 1;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
    /* 文本渲染优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

.kv-value {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    color: #1f2937;
    border: 1px solid #cbd5e1;
    padding: 3px 6px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 500;
    line-height: 1;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
    /* 文本渲染优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

.nav-btn {
    margin-top: 8px;
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 20px;
    border: 2px solid transparent;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.nav-btn:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
    background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
}

.nav-btn:active {
    transform: translateY(0) scale(0.98);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.custom-handle {
    width: 12px;
    height: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: 3px solid #ffffff;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

.custom-handle:hover {
    background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
    transform: scale(1.3);
    box-shadow: 0 4px 16px rgba(124, 58, 237, 0.5);
}

/* 组节点连接点样式 */
.group-handle {
    width: 12px;
    height: 12px;
    background: #10b981;
    border: 2px solid #ffffff;
    border-radius: 50%;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.group-handle:hover {
    background: #059669;
    transform: scale(1.3);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Vue Flow 实例样式 */
.vue-flow-instance {
    width: 100% !important;
    height: 100% !important;
    overflow: hidden !important;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

/* Vue Flow 节点样式优化 */
:deep(.vue-flow__node) {
    font-family: '微软雅黑', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}


:deep(.vue-flow__container) {
    overflow: hidden !important;
    width: 100% !important;
    height: 100% !important;
}

:deep(.vue-flow__pane) {
    overflow: hidden !important;
    width: 100% !important;
    height: 100% !important;
}

:deep(.vue-flow__renderer) {
    overflow: hidden !important;
}

:deep(.vue-flow__transformationpane) {
    overflow: hidden !important;
}

:deep(.vue-flow__nodesselection-rect) {
    overflow: hidden !important;
}

:deep(.vue-flow__node-default) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    border-radius: 8px;
}

:deep(.vue-flow__node-default:hover) {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
}

:deep(.vue-flow__node-default.selected) {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

/* 组节点容器样式 */
.group-node-container {
    position: relative;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;
    /* 移除固定尺寸，让NodeResizer控制 */
    min-width: 300px;
    min-height: 200px;
    /* 确保容器可以被调整 */
    resize: both;
    overflow: visible;
    display: flex;
    flex-direction: column;
}

.group-node-container:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
    transform: translateY(-2px);
}

.group-header {
    position: absolute;
    top: -12px;
    left: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background: inherit;
    padding: 8px 16px;
    border-radius: 4px;
    border: inherit;
    border-bottom: none;
    z-index: 10;
    backdrop-filter: blur(4px);
}

.group-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.group-header .group-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
}

/* 组节点属性值显示区域 */
.group-values {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 4px 8px;
    backdrop-filter: blur(6px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.group-values:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
}

.group-kv-grid {
    display: flex;
    align-items: center;
    gap: 8px;
}

.group-kv-item {
    display: flex;
    align-items: center;
    gap: 2px;
    transition: all 0.2s ease;
}

.group-kv-item:hover {
    transform: scale(1.02);
}

.group-kv-label {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1px 4px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.2;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    box-shadow: 0 1px 3px rgba(102, 126, 234, 0.3);
    /* 文本渲染优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

.group-kv-value {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    color: #1f2937;
    border: 1px solid #cbd5e1;
    padding: 1px 4px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
    line-height: 1.2;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
    min-width: 30px;
    max-width: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    /* 文本渲染优化 */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

.group-content {
    width: 100%;
    flex: 1;
    min-height: 150px;
    position: relative;
    margin-top: 30px;
    /* 为header留出空间 */
}

/* 增强分组样式 */
.enhanced-group {
    position: relative;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.enhanced-group:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
}

.group-header {
    position: absolute;
    top: -2px;
    left: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: inherit;
    padding: 6px 12px;
    border-radius: 8px;
    border: inherit;
    border-bottom: none;
    z-index: 10;
    backdrop-filter: blur(4px);
}

.group-title {
    font-size: 13px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
}

.group-badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.badge-hot {
    background: rgba(239, 68, 68, 0.2);
    color: #dc2626;
    border: 1px solid #fca5a5;
}

.badge-cold {
    background: rgba(59, 130, 246, 0.2);
    color: #2563eb;
    border: 1px solid #93c5fd;
}

.badge-normal {
    background: rgba(16, 185, 129, 0.2);
    color: #059669;
    border: 1px solid #6ee7b7;
}

.badge-default {
    background: rgba(107, 114, 128, 0.2);
    color: #4b5563;
    border: 1px solid #d1d5db;
}

.group-content {
    width: 100%;
    height: 100%;
    padding: 24px 16px 16px 16px;
    position: relative;
}

/* 迷你地图样式 */
:deep(.vue-flow__minimap) {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #e1e7ef;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 对话框样式优化 */
:deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
}

:deep(.el-dialog__header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom: none;
    padding: 20px;
    margin: 0;
}

:deep(.el-dialog__title) {
    color: white;
    font-weight: 600;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
    color: white;
    font-size: 18px;
}

:deep(.el-dialog__body) {
    padding: 24px;
}

:deep(.dialog-footer) {
    text-align: right;
    padding: 16px 24px 24px;
}

/* NodeResizer 样式优化 */
:deep(.vue-flow__resize-control) {
    background: #667eea;
    border: 2px solid #ffffff;
    border-radius: 4px;
    width: 10px;
    height: 10px;
    opacity: 0.8;
    transition: all 0.2s ease;
}

:deep(.vue-flow__resize-control:hover) {
    background: #5a67d8;
    transform: scale(1.2);
    opacity: 1;
}

:deep(.vue-flow__resize-control.vue-flow__resize-control-line) {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 0;
    transition: all 0.2s ease;
}

/* 确保resize控制点在组节点上可见 */
:deep(.vue-flow__node-group) {
    overflow: visible !important;
}

:deep(.vue-flow__node-group .vue-flow__resize-control) {
    z-index: 1000 !important;
    position: absolute !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .layout-container {
        grid-template-columns: 1fr 320px;
        /* 右侧面板稍窄 */
    }

    .control-panel {
        width: 320px;
    }

    .control-group {
        padding: 16px;
    }
}

@media (max-width: 992px) {
    .layout-container {
        display: grid;
        grid-template-rows: 60vh 40vh;
        /* 上下布局：上60%下40% */
        grid-template-columns: 1fr;
        height: 100vh;
        overflow: hidden;
    }

    .canvas-area {
        width: 100vw;
        height: 60vh;
        overflow: hidden;
    }

    .flow-container {
        width: 100vw;
        height: 60vh;
        overflow: hidden;
    }

    .vue-flow-instance {
        width: 100vw !important;
        height: 60vh !important;
    }

    :deep(.vue-flow__container) {
        width: 100vw !important;
        height: 60vh !important;
    }

    :deep(.vue-flow__pane) {
        width: 100vw !important;
        height: 60vh !important;
    }

    .control-panel {
        width: 100vw;
        height: 40vh;
        border-left: none;
        border-top: 1px solid #e1e7ef;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
        overflow: hidden;
    }
}

@media (max-width: 768px) {
    .layout-container {
        grid-template-rows: 50vh 50vh;
        /* 小屏幕上下各50% */
    }

    .canvas-area {
        height: 50vh;
    }

    .flow-container {
        height: 50vh;
    }

    .vue-flow-instance {
        height: 50vh !important;
    }

    :deep(.vue-flow__container) {
        height: 50vh !important;
    }

    :deep(.vue-flow__pane) {
        height: 50vh !important;
    }

    .control-panel {
        height: 50vh;
    }

    .control-group {
        padding: 12px;
    }

    .button-row {
        grid-template-columns: 1fr;
    }

    .main-action-btn {
        height: 38px;
        font-size: 14px;
    }
}
</style>