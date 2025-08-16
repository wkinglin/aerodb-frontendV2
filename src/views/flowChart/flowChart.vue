<template>
  <div class="flowchart-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon class="title-icon">
              <Grid />
            </el-icon>
            <span class="title-text">产品树管理</span>
          </div>
          <div class="header-actions">
            <el-button-group>
              <el-button type="primary" :icon="Plus" @click="addVisible = true">添加</el-button>
              <el-button type="danger" :icon="Delete" @click="deleteVisible = true">删除</el-button>
              <el-button type="warning" :icon="Operation" @click="beginMove()">移动</el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <div class="control-panel">
        <div class="control-left">
          <el-select v-model="value" placeholder="请选择系统" class="system-select" clearable>
            <el-option v-for="item in systems" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-button type="primary" :icon="Search" @click="select()" class="query-btn">查询</el-button>
        </div>
        <div class="control-right">
          <el-input v-model="input" placeholder="请输入搜索的系统" class="search-input" clearable @keyup.enter="search()">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
          <el-button type="primary" :icon="Search" @click="search()" class="search-btn">搜索</el-button>
        </div>
      </div>

      <div class="chart-container">
        <div id="Flow" class="flow-chart"></div>
      </div>
    </el-card>

    <!-- 添加系统或产品对话框 -->
    <el-dialog title="添加系统或产品模块" v-model="addVisible" width="500px" center>
      <el-form label-width="150px" label-position="left" :model="addForm">
        <el-form-item label="选择添加的模块">
          <el-radio-group v-model="radio">
            <el-radio label="1">添加系统</el-radio>
            <el-radio label="2">添加产品</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="radio === '2'" label="添加到哪一个系统中">
          <el-select v-model="addForm.sysId" placeholder="请选择系统" style="width: 100%">
            <el-option v-for="item in systems" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="radio === '2'" label="产品类型">
          <el-input v-model="addForm.type" placeholder="请输入产品类型" clearable></el-input>
        </el-form-item>
        <el-form-item label="系统或产品名称">
          <el-input v-model="addForm.name" placeholder="请输入名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="系统或产品描述">
          <el-input type="textarea" v-model="addForm.description" :rows="4" placeholder="请输入描述"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addVisible = false">取 消</el-button>
          <el-button type="primary" @click="addSysOrPro()">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 删除系统或产品对话框 -->
    <el-dialog title="删除系统或产品模块" v-model="deleteVisible" width="500px" center>
      <el-form label-width="150px" label-position="left" :model="deleteForm">
        <el-form-item label="选择删除的模块">
          <el-radio-group v-model="dRadio">
            <el-radio label="1">删除系统</el-radio>
            <el-radio label="2">删除产品</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="dRadio === '1'" label="删除哪一个系统">
          <el-select v-model="deleteForm.sysId" placeholder="请选择系统" style="width: 100%">
            <el-option v-for="item in systems" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="dRadio === '2'" label="删除哪一个产品">
          <el-select v-model="deleteForm.sysId" placeholder="请选择系统" @change="selectSys()"
            style="width: 100%; margin-bottom: 12px">
            <el-option v-for="item in systems" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
          <el-select v-if="proVisible" v-model="deleteForm.proId" placeholder="请选择产品" style="width: 100%">
            <el-option v-for="item in products" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelDelete">取 消</el-button>
          <el-button type="primary" @click="delSysOrPro()">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 移动或解绑产品对话框 -->
    <el-dialog title="移动或解绑产品" v-model="moveVisible" width="500px" center>
      <el-form label-width="150px" label-position="left" :model="moveForm">
        <el-form-item label="选择操作">
          <el-radio-group v-model="mRadio">
            <el-radio label="1">移动产品</el-radio>
            <el-radio label="2">解除绑定</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="mRadio === '1'" label="移动哪一个产品">
          <el-select v-model="moveForm.proId" placeholder="请选择产品" style="width: 100%">
            <el-option v-for="item in products" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="mRadio === '1'" label="移动到哪一个系统">
          <el-select v-model="moveForm.toSystemId" placeholder="请选择系统" style="width: 100%">
            <el-option v-for="item in systems" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="mRadio === '2'" label="产品解除绑定">
          <el-select v-model="moveForm.proId" placeholder="请选择产品" style="width: 100%">
            <el-option v-for="item in products" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="moveVisible = false">取 消</el-button>
          <el-button type="primary" @click="moveProduct()">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus,
  Delete,
  Setting as Operation,
  Search,
  Grid
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useMainStore } from '@/store'
import globalWebSocket from '@/global'
import { Graph } from '@antv/g6'

// 格式化数值，超过五位小数的保留五位小数
const formatNumber = (value: any): string => {
  if (value == null || value === undefined || value === '') return ''
  const num = parseFloat(value)
  if (isNaN(num)) return value?.toString() || ''

  // 检查是否有小数部分
  if (num % 1 === 0) {
    return num.toString()
  }

  // 检查小数位数
  const str = num.toString()
  const decimalIndex = str.indexOf('.')
  if (decimalIndex !== -1 && str.length - decimalIndex - 1 > 5) {
    return num.toFixed(5)
  }

  return str
}

// 构建描述信息
const buildDescription = (R: any, DR: any, H: any, Z: any): string => {
  return `R:${formatNumber(R)} DR:${formatNumber(DR)} H:${formatNumber(H)} Z:${formatNumber(Z)}`
}

// 安全解析JSON数据
const safeParseJSON = (data: string): any => {
  try {
    return JSON.parse(data)
  } catch (error) {
    console.error('JSON解析失败:', error, 'data:', data)
    return null
  }
}

// 验证系统数据完整性
const validateSystemData = (item: any): boolean => {
  return item && typeof item === 'object' && item.name && typeof item.name === 'string'
}

// 验证产品数据完整性
const validateProductData = (item: any): boolean => {
  return item && typeof item === 'object' && item.name && typeof item.name === 'string'
}

// 验证算法数据完整性
const validateAlgorithmData = (item: any): boolean => {
  return item && typeof item === 'object' && item.name && typeof item.name === 'string'
}

// 响应式数据
const input = ref('')
const graph = ref<any>(null)
const data = ref<any>([])
const json = ref<any[]>([])
const systems = ref<any[]>([])
const products = ref<any[]>([])
const value = ref('')
const addVisible = ref(false)
const deleteVisible = ref(false)
const proVisible = ref(false)
const moveVisible = ref(false)
const radio = ref('1')
const dRadio = ref('1')
const mRadio = ref('1')
const pictureName = ref('')
const isSystem = ref(false)
const sysAndProId = ref<any>({})

// 表单数据
const addForm = reactive({
  sysId: '',
  name: '',
  type: '',
  description: ''
})

const deleteForm = reactive({
  sysId: '',
  proId: ''
})

const moveForm = reactive({
  proId: '',
  toSystemId: ''
})

// 获取路由和store实例
const router = useRouter()
const store = useMainStore()
const socket = ref<WebSocket | null>(null)

// 生命周期钩子
onMounted(() => {
  initializeChart()
})

onActivated(() => {
  init()
  send('systemAll')
})

onUnmounted(() => {
  if (graph.value) {
    graph.value.destroy()
  }
  if (socket.value) {
    socket.value.close()
  }
})

// 初始化图表
const initializeChart = () => {
  newGraph(1200, 550)
  if (graph.value) {
    graph.value.fitCenter()
    graph.value.fitView(10)
  }
}

// WebSocket相关方法
const init = () => {
  socket.value = globalWebSocket.ws as WebSocket
  if (socket.value) {
    socket.value.onerror = error
    socket.value.onmessage = getMessage
  }
}

const error = () => {
  console.error('WebSocket连接错误')
  ElMessage.error('连接失败，请检查网络')
}

const send = (ms: string) => {
  if (socket.value) {
    socket.value.send(ms)
  } else {
    ElMessage.error('连接未建立，请稍后重试')
  }
}

// 接收WebSocket数据
const getMessage = (msg: MessageEvent) => {
  try {
    if (msg.data === 'instruction undefined') return

    // 处理成功消息
    const successMessages = {
      'delete success': '成功删除',
      'add success': '成功添加',
      'move success': '成功移动',
      'delete relation success': '成功解除绑定'
    }

    if (successMessages[msg.data as keyof typeof successMessages]) {
      ElMessage.success(successMessages[msg.data as keyof typeof successMessages])
      // 刷新数据
      setTimeout(() => {
        send('systemAll')
      }, 500)
      return
    }

    const parsedData = safeParseJSON(msg.data)
    if (!parsedData) {
      ElMessage.error('数据格式错误')
      return
    }

    json.value = Array.isArray(parsedData) ? parsedData : []
    console.log("json.value", json.value)

    // 清空并重新填充系统列表
    systems.value = []
    json.value.forEach((item: any, index: number) => {
      if (!validateSystemData(item)) {
        console.warn('系统数据无效:', item)
        return
      }

      systems.value.push({
        value: `选项${index}`,
        label: item.name,
        id: item.id,
        R: item.R,
        DR: item.DR,
        H: item.H,
        Z: item.Z
      })
    })

  } catch (error) {
    console.error('解析消息失败:', error)
    ElMessage.error('数据解析失败')
  }
}

const beginMove = () => {
  moveVisible.value = true
  if (socket.value) {
    socket.value.onmessage = getProducts
  }
  send('productAll')
}

const getProducts = (msg: MessageEvent) => {
  try {
    const parsedData = safeParseJSON(msg.data)
    if (parsedData) {
      products.value = Array.isArray(parsedData.products) ?
        parsedData.products.filter(validateProductData) : []
    } else {
      products.value = []
    }
  } catch (error) {
    console.error('获取产品数据失败:', error)
    ElMessage.error('获取产品数据失败')
    products.value = []
  }
  if (socket.value) {
    socket.value.onmessage = getMessage
  }
}

const selectSys = () => {
  const targetId = deleteForm.sysId || moveForm.toSystemId
  const system = json.value.find((item: any) => validateSystemData(item) && item.id === targetId)

  if (system && Array.isArray(system.pro)) {
    products.value = system.pro.filter(validateProductData)
    proVisible.value = products.value.length > 0
  } else {
    products.value = []
    proVisible.value = false
  }
}

// 对话框取消操作
const cancelDelete = () => {
  deleteVisible.value = false
  deleteForm.sysId = ''
  deleteForm.proId = ''
  proVisible.value = false
}

// 系统和产品管理方法
const addSysOrPro = () => {
  // 验证表单数据
  if (!addForm.name.trim()) {
    ElMessage.warning('请输入名称')
    return
  }

  if (radio.value === '2' && !addForm.sysId) {
    ElMessage.warning('请选择系统')
    return
  }

  addVisible.value = false
  let data: any

  if (radio.value === '1') {
    data = {
      name: addForm.name.trim(),
      description: addForm.description.trim()
    }
    send('addSystem')
  } else if (radio.value === '2') {
    data = {
      ...addForm,
      name: addForm.name.trim(),
      description: addForm.description.trim(),
      type: addForm.type.trim()
    }
    send('addProduct')
  }

  send(JSON.stringify(data))

  // 重置表单
  Object.assign(addForm, { sysId: '', name: '', type: '', description: '' })
}

const delSysOrPro = () => {
  // 验证删除数据
  if (dRadio.value === '1' && !deleteForm.sysId) {
    ElMessage.warning('请选择要删除的系统')
    return
  }

  if (dRadio.value === '2' && !deleteForm.proId) {
    ElMessage.warning('请选择要删除的产品')
    return
  }

  deleteVisible.value = false
  proVisible.value = false

  let data: any
  if (dRadio.value === '1') {
    data = { id: deleteForm.sysId }
    send('deleteSystem')
  } else if (dRadio.value === '2') {
    data = { id: deleteForm.proId }
    send('deleteProduct')
  }

  send(JSON.stringify(data))

  // 重置表单
  deleteForm.sysId = ''
  deleteForm.proId = ''
}

const moveProduct = () => {
  // 验证移动数据
  if (!moveForm.proId) {
    ElMessage.warning('请选择要操作的产品')
    return
  }

  if (mRadio.value === '1' && !moveForm.toSystemId) {
    ElMessage.warning('请选择目标系统')
    return
  }

  moveVisible.value = false

  let data: any
  if (mRadio.value === '1') {
    data = {
      sysId: moveForm.toSystemId,
      proId: moveForm.proId
    }
    send('moveProduct')
  } else if (mRadio.value === '2') {
    data = { proId: moveForm.proId }
    send('deleteRelation')
  }

  send(JSON.stringify(data))

  // 重置表单
  moveForm.proId = ''
  moveForm.toSystemId = ''
}

// 查询和搜索方法
const select = () => {
  if (!value.value) {
    ElMessage.warning('请先选择一个系统')
    return
  }

  const systemIndex = parseInt(value.value.replace('选项', ''))
  if (systemIndex >= 0 && systemIndex < json.value.length) {
    buildTreeData(systemIndex)
  }
}

const search = () => {
  if (!input.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }

  const systemIndex = json.value.findIndex((item: any) => item && item.name === input.value.trim())
  if (systemIndex !== -1) {
    value.value = `选项${systemIndex}`
    buildTreeData(systemIndex)
  } else {
    ElMessage.error('未找到匹配的系统')
  }
}

// 构建树形数据
const buildTreeData = (systemIndex: number) => {
  // 安全检查系统索引
  if (systemIndex < 0 || systemIndex >= json.value.length) {
    ElMessage.error('系统索引无效')
    return
  }

  const sys = json.value[systemIndex]
  if (!validateSystemData(sys)) {
    console.warn('系统数据无效:', sys)
    ElMessage.error('系统数据无效')
    return
  }

  const nodes: any[] = []
  const edges: any[] = []

  // 根节点（系统节点）
  const rootId = `sys${sys.id}`
  nodes.push({
    id: rootId,
    data: {
      label: sys.name,
      description: buildDescription(sys.R, sys.DR, sys.H, sys.Z),
      R: sys.R,
      DR: sys.DR,
      H: sys.H,
      Z: sys.Z
    }
  })

  let nodeCount = 1

  // 安全检查产品数组
  const products = Array.isArray(sys.pro) ? sys.pro : []

  // 构建产品节点
  products.forEach((pro: any) => {
    if (!validateProductData(pro)) {
      console.warn('产品数据无效:', pro)
      return
    }

    const productId = `pro${pro.id}`
    nodes.push({
      id: productId,
      data: {
        label: pro.name,
        description: buildDescription(pro.R, pro.DR, pro.H, pro.Z),
        R: pro.R,
        DR: pro.DR,
        H: pro.H,
        Z: pro.Z
      }
    })

    // 添加系统到产品的边
    edges.push({
      id: `edge_${rootId}_${productId}`,
      source: rootId,
      target: productId,
      data: {}
    })

    nodeCount++

    // 安全检查算法数组
    const algorithms = Array.isArray(pro.alo) ? pro.alo : []

    // 构建算法节点
    algorithms.forEach((algorithm: any) => {
      if (!validateAlgorithmData(algorithm)) {
        console.warn('算法数据无效:', algorithm)
        return
      }

      let aloName = algorithm.name
      const index = aloName.indexOf('_')
      let description = ''

      if (index !== -1) {
        description = aloName.substring(0, index)
        aloName = aloName.substring(index + 1)
      }

      if (aloName.length > 16) {
        aloName = aloName.substring(0, 16) + '...'
      }

      const algorithmId = `alo${pro.id}aloID${algorithm.id}`
      nodes.push({
        id: algorithmId,
        data: {
          label: aloName,
          description: description || undefined,
          algorithmId: algorithm.id
        }
      })

      // 添加产品到算法的边
      edges.push({
        id: `edge_${productId}_${algorithmId}`,
        source: productId,
        target: algorithmId,
        data: {}
      })

      nodeCount++
    })

    if (algorithms.length === 0) nodeCount++
  })

  // 更新图表数据
  data.value = { nodes, edges }
  console.log(data.value)

  // 重新创建图表
  if (graph.value) {
    graph.value.destroy()
  }

  const minNodes = Math.max(nodeCount, 3)
  newGraph(900, 60 * minNodes)

  if (graph.value) {
    graph.value.setData(data.value)
    graph.value.render()
    graph.value.fitCenter()
    addNodeClickHandlers()
  }
}

// 创建G6图表
const newGraph = (width: number, height: number) => {
  // 创建上下文菜单
  const contextMenu = {
    type: 'contextmenu',
    // 只在节点上开启右键菜单，默认全部元素都开启
    enable: (e: any) => e.targetType === 'node',
    getItems: () => {
      return [{ name: '解除绑定', value: 'detail' }];
    },
    onClick: (value: any) => {
      if (value === 'detail') {
        deleteRelation(value)
      }
    },
  }

  const container = document.getElementById('Flow')
  if (!container) {
    console.error('找不到图表容器')
    return
  }

  const containerWidth = container.scrollWidth || width
  const containerHeight = height

  graph.value = new Graph({
    container: container,
    width: containerWidth,
    height: containerHeight,

    // 数据
    // data: data.value,

    // 插件配置
    plugins: [contextMenu],

    // 布局配置
    layout: {
      type: 'mindmap',
      direction: 'LR',
      preventOverlap: true,
      getVGap: () => 20,
      getHGap: () => 100
    },

    // 节点配置 - 使用最简单的rect样式
    // node: {
    //   type: 'rect',
    //   style: (model: any) => {
    //     const { data } = model;
    //     const isAlgorithm = model.id.startsWith('alo');
    //     const isSystem = model.id.startsWith('sys');
    //     const isProduct = model.id.startsWith('pro');

    //     // 确定节点类型和颜色
    //     let nodeColor = '#52c41a';
    //     let nodeTypeName = '算法';
    //     if (isSystem) {
    //       nodeColor = '#1890ff';
    //       nodeTypeName = '系统';
    //     } else if (isProduct) {
    //       nodeColor = '#fa8c16';
    //       nodeTypeName = '产品';
    //     }

    //     // 构建显示文本
    //     let displayName = data?.label || '未命名';
    //     if (displayName.length > 10) {
    //       displayName = displayName.substring(0, 10) + '...';
    //     }

    //     // 构建详细信息文本
    //     let detailText = '';
    //     if (isAlgorithm) {
    //       const desc = data.description || '无';
    //       detailText = desc.length > 12 ? desc.substring(0, 12) + '...' : desc;
    //     } else {
    //       detailText = `R:${formatNumber(data.R)} DR:${formatNumber(data.DR)}\nH:${formatNumber(data.H)} Z:${formatNumber(data.Z)}`;
    //     }

    //     // 组合显示文本
    //     const combinedText = `${displayName}\n[${nodeTypeName}]\n${detailText}`;

    //     return {
    //       size: [200, 60],
    //       fill: nodeColor,
    //       stroke: '#ffffff',
    //       lineWidth: 2,
    //       radius: 6,
    //       cursor: 'pointer',
    //       labelText: combinedText,
    //       labelFill: '#ffffff',
    //       labelFontSize: 10,
    //       labelFontWeight: 'bold',
    //       labelTextAlign: 'center',
    //       labelTextBaseline: 'middle',
    //       labelLineHeight: 12,
    //       labelPlacement: 'center'
    //     };
    //   },
    //   state: {
    //     selected: {
    //       stroke: '#ffff00',
    //       lineWidth: 3,
    //     }
    //   }
    // },

    // 边配置 - 简化
    // edge: {
    //   type: 'line',
    //   style: {
    //     stroke: '#ccc',
    //     lineWidth: 1,
    //     endArrow: true,
    //   }
    // },

    // behaviors: [{
    //   type: 'click-select',
    //   onClick: (e: any) => {
    //     console.log(e)
    //   }
    // }],
  })
}

// 添加节点点击处理器
const addNodeClickHandlers = () => {
  if (!graph.value) return

  graph.value.on('node:click', (e: any) => {
    try {
      // 获取节点信息
      const nodeId = e.itemId || e.target?.id
      if (!nodeId) {
        console.warn('无法获取节点ID')
        return
      }

      const nodeData = graph.value.getNodeData(nodeId)
      if (!nodeData) {
        console.warn('无法获取节点数据')
        return
      }

      const nodeName = nodeData?.data?.label || ''
      console.log('节点点击:', { nodeId, nodeName })

      // 处理算法节点点击
      if (nodeId.startsWith('alo')) {
        const aloIdMatch = nodeId.match(/aloID(\d+)/)
        if (aloIdMatch) {
          jumpToAlgorithm(parseInt(aloIdMatch[1]))
        }
      } else {
        // 处理系统/产品节点点击
        handleSystemProductClick(nodeId, nodeName)
      }
    } catch (error) {
      console.error('节点点击处理失败:', error)
    }
  })
}

// 跳转到算法页面
const jumpToAlgorithm = (algoId: number) => {
  store.aloId = algoId
  router.push({ path: 'alg' })
}

// 处理系统/产品节点点击
const handleSystemProductClick = (nodeId: string, nodeName: string) => {
  try {
    if (!value.value) {
      ElMessage.warning('请先选择系统')
      return
    }

    pictureName.value = nodeName

    const systemIndex = parseInt(value.value.replace('选项', ''))
    if (systemIndex < 0 || systemIndex >= json.value.length) {
      ElMessage.error('系统索引无效')
      return
    }

    const sys = json.value[systemIndex]
    if (!validateSystemData(sys)) {
      ElMessage.error('系统数据无效')
      return
    }

    const sysId = sys.id
    let proId = 0

    if (nodeId.startsWith('pro')) {
      const match = nodeId.match(/pro(\d+)/)
      if (match) {
        proId = parseInt(match[1])
      }
      isSystem.value = false
    } else if (nodeId.startsWith('sys')) {
      proId = -1
      isSystem.value = true
    }

    sysAndProId.value = { sysId, proId }
    store.changeSysAndProId(sysAndProId.value)

    // 查找或创建图表
    send('findAllGraph')
    if (socket.value) {
      socket.value.onmessage = getRectAll
    }
  } catch (error) {
    console.error('处理节点点击失败:', error)
    ElMessage.error('处理节点点击失败')
  }
}

// 获取所有矩形图表
const getRectAll = (msg: MessageEvent) => {
  try {
    const rectData = safeParseJSON(msg.data)
    if (!Array.isArray(rectData)) {
      console.error('图表数据格式错误')
      ElMessage.error('图表数据格式错误')
      return
    }

    const existingRect = rectData.find((item: any) => item && item.name === pictureName.value)

    if (existingRect) {
      navigateToFlow(existingRect.id)
    } else {
      // 创建新图表
      const newGraphData = {
        name: pictureName.value,
        message: '',
        sysId: sysAndProId.value.sysId,
        proId: sysAndProId.value.proId
      }

      send('addGraph')
      send(JSON.stringify(newGraphData))

      if (socket.value) {
        socket.value.onmessage = getRectId
      }
    }
  } catch (error) {
    console.error('获取图表数据失败:', error)
    ElMessage.error('获取图表数据失败')
  } finally {
    // 确保恢复消息处理器
    if (socket.value) {
      setTimeout(() => {
        if (socket.value) {
          socket.value.onmessage = getMessage
        }
      }, 1000)
    }
  }
}

// 获取新创建的图表ID
const getRectId = (msg: MessageEvent) => {
  navigateToFlow(msg.data)
}

// 导航到流程图页面
const navigateToFlow = (rectId: string) => {
  const rectValue = {
    pictureName: pictureName.value,
    id: rectId,
    isSystem: isSystem.value
  }

  store.changeRectValue(rectValue)
  router.push({ path: 'flow' })

  if (socket.value) {
    socket.value.onmessage = getMessage
  }
}

// 删除关系
const deleteRelation = (nodeId: string) => {
  try {
    const match = nodeId.match(/pro(\d+)/)
    if (match) {
      const proId = match[1]
      const data = { proId }
      send('deleteRelation')
      send(JSON.stringify(data))
    }
  } catch (error) {
    console.error('删除关系失败:', error)
    ElMessage.error('删除关系失败')
  }
}
</script>

<style scoped>
/* 主容器样式 */
.flowchart-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 20px;
  font-family: "微软雅黑", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.main-card {
  max-width: 100%;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
  border: 1px solid #dbeafe;
  overflow: hidden;
  background: white;
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 16px 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1e40af;
  font-weight: 600;
  font-size: 18px;
}

.title-icon {
  font-size: 24px;
  color: #3b82f6;
}

.title-text {
  font-size: 18px;
  font-weight: 600;
}

.header-actions .el-button-group {
  border-radius: 8px;
  overflow: hidden;
}

.header-actions .el-button {
  border-radius: 0;
  font-weight: 500;
  transition: all 0.3s ease;
}

.header-actions .el-button:first-child {
  border-radius: 8px 0 0 8px;
}

.header-actions .el-button:last-child {
  border-radius: 0 8px 8px 0;
}

.header-actions .el-button:hover {
  transform: translateY(-1px);
}

/* 控制面板样式 */
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 20px;
}

.control-left,
.control-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.system-select {
  width: 200px;
}

.search-input {
  width: 280px;
}

.query-btn,
.search-btn {
  border-radius: 8px;
  font-weight: 500;
}

/* 图表容器样式 */
.chart-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
  min-height: 600px;
}

.flow-chart {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 550px;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
}

/* 对话框样式优化 */
:deep(.el-dialog__header) {
  padding: 24px 24px 0;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.dialog-footer) {
  text-align: right;
  padding: 16px 24px 24px;
}

:deep(.dialog-footer .el-button) {
  margin-left: 12px;
  border-radius: 6px;
  font-weight: 500;
  padding: 10px 20px;
}

/* 上下文菜单样式 */
:deep(.context-menu) {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  font-size: 13px;
  color: #606266;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 120px;
}

:deep(.context-menu h3) {
  cursor: pointer;
  margin: 0;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

:deep(.context-menu h3:hover) {
  color: #409eff;
  background: #f0f9ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .flowchart-container {
    padding: 12px;
  }

  .control-panel {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .control-left,
  .control-right {
    justify-content: center;
    flex-wrap: wrap;
  }

  .system-select,
  .search-input {
    width: 100%;
    min-width: 200px;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-title {
    justify-content: center;
  }

  .header-actions {
    display: flex;
    justify-content: center;
  }

  .chart-container {
    padding: 16px;
  }

  .flow-chart {
    min-height: 400px;
  }
}

@media (max-width: 480px) {
  .control-panel {
    padding: 16px;
  }

  .header-actions .el-button {
    font-size: 12px;
    padding: 8px 12px;
  }

  .title-text {
    font-size: 16px;
  }
}

/* 动画效果 */
.main-card {
  animation: fadeInUp 0.3s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* G6图表节点状态样式 */
:deep(.g6-tooltip) {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  backdrop-filter: blur(4px);
}
</style>