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
              <el-button type="primary" :icon="Plus" @click="openAddDialog()">添加</el-button>
              <el-button type="danger" :icon="Delete" @click="deleteVisible = true">删除</el-button>
              <!-- <el-button type="warning" :icon="Operation" @click="beginMove()">移动</el-button> -->
            </el-button-group>
          </div>
        </div>
      </template>

      <div class="control-panel-tree">
        <div class="control-left">
          <el-select v-model="selectedSystemId" placeholder="请选择系统" class="system-select" clearable>
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


    <!-- 添加系统、产品或算法对话框 -->
    <el-dialog title="添加系统、产品或算法模块" v-model="addVisible" width="500px" center>
      <el-form label-width="150px" label-position="left" :model="addForm">
        <el-form-item label="选择添加的模块">
          <el-radio-group v-model="radio">
            <el-radio label="1">添加系统</el-radio>
            <el-radio label="2">添加产品</el-radio>
            <el-radio label="3">添加算法</el-radio>
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

        <!-- 算法相关字段 -->
        <el-form-item v-if="radio === '3'" label="关联系统">
          <el-select v-model="addForm.sysId" placeholder="请选择系统" @change="onSystemChange" style="width: 100%">
            <el-option v-for="item in systems" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="radio === '3' && addForm.sysId" label="关联产品">
          <el-select v-model="addForm.proId" placeholder="请选择产品" style="width: 100%">
            <el-option v-for="item in availableProducts" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="radio === '3'" label="选择算法">
          <el-select v-model="addForm.algorithmId" placeholder="请选择算法" style="width: 100%">
            <el-option v-for="item in algorithms" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item v-if="radio === '1' || radio === '2'"
          :label="radio === '1' ? '系统名称' : radio === '2' ? '产品名称' : '算法名称'">
          <el-input v-model="addForm.name"
            :placeholder="radio === '1' ? '请输入系统名称' : radio === '2' ? '请输入产品名称' : '请输入算法名称'" clearable></el-input>
        </el-form-item>
        <el-form-item v-if="radio === '1' || radio === '2'"
          :label="radio === '1' ? '系统描述' : radio === '2' ? '产品描述' : '算法描述'">
          <el-input type="textarea" v-model="addForm.description" :rows="4"
            :placeholder="radio === '1' ? '请输入系统描述' : radio === '2' ? '请输入产品描述' : '请输入算法描述'"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addVisible = false">取 消</el-button>
          <el-button type="primary" @click="addSysOrPro()">确 定</el-button>
        </div>
      </template>
    </el-dialog>


    <!-- 删除系统、产品或算法对话框 -->
    <el-dialog title="删除系统、产品或算法模块" v-model="deleteVisible" width="500px" center>
      <el-form label-width="150px" label-position="left" :model="deleteForm">
        <el-form-item label="选择删除的模块">
          <el-radio-group v-model="dRadio">
            <el-radio label="1">删除系统</el-radio>
            <el-radio label="2">删除产品</el-radio>
            <el-radio label="3">删除算法</el-radio>
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
        <el-form-item v-if="dRadio === '3'" label="删除哪一个算法">
          <el-select v-model="deleteForm.sysId" placeholder="请选择系统" @change="selectSys()"
            style="width: 100%; margin-bottom: 12px">
            <el-option v-for="item in systems" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
          <el-select v-if="proVisible" v-model="deleteForm.proId" placeholder="请选择产品" @change="selectPro()"
            style="width: 100%; margin-bottom: 12px">
            <el-option v-for="item in products" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
          <el-select v-if="aloVisible" v-model="deleteForm.algorithmId" placeholder="请选择算法" style="width: 100%">
            <el-option v-for="item in algorithms" :key="item.id" :label="item.name" :value="item.id"></el-option>
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
import { ref, reactive, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'
import { useRouter } from 'vue-router'
import { useWebSocket } from '@/composables/useWebSocket'
import {
  Plus,
  Delete,
  Search,
  Grid
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import G6 from '@antv/g6'

// 响应式数据
const input = ref('')

// 图表数据
const graph = ref<any>(null)
const treeData = ref<any>([])

// 系统、产品、算法数据
const json = ref<any[]>([])
const systems = ref<any[]>([])
const products = ref<any[]>([])
const algorithms = ref<any[]>([])
const availableProducts = ref<any[]>([])
const selectedSystemId = ref('')


// 节点数据
const pictureName = ref('')
const isSystem = ref(false)
const sysAndProId = ref<any>({})
const recId = ref(0)

// 表单数据
const addVisible = ref(false)
const deleteVisible = ref(false)
const proVisible = ref(false)
const aloVisible = ref(false)
const moveVisible = ref(false)

const radio = ref('1')
const dRadio = ref('1')
const mRadio = ref('1')

// 表单数据
const addForm = reactive({
  sysId: '',
  proId: '',
  algorithmId: '',
  name: '',
  type: '',
  description: ''
})

const deleteForm = reactive({
  sysId: '',
  proId: '',
  algorithmId: ''
})

const moveForm = reactive({
  proId: '',
  toSystemId: ''
})

// 获取路由实例
const router = useRouter()
const { sendCommand, setMessageHandler, clearMessageHandler } = useWebSocket()

// 生命周期钩子
onMounted(() => {

})

onActivated(() => {
  selectedSystemId.value = ''
  if (graph.value) {
    graph.value.destroy()
  }

  // 重新设置当前页面的消息处理器，确保覆盖其他页面的处理器
  setMessageHandler(getMessage)
  sendCommand('systemAll')

  setTimeout(() => {
    setMessageHandler(handleAlgorithmMessage)
    sendCommand("findAll")
  }, 1000)
})

onDeactivated(() => {
  console.log('flowChart_old页面失活，清理WebSocket处理器')
  // 页面切换时清理消息处理器，避免影响其他页面
  clearMessageHandler()
})

onUnmounted(() => {
  if (graph.value) {
    graph.value.destroy()
  }
  // 组件卸载时也清理处理器
  clearMessageHandler()
})

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

// 接收WebSocket数据
const getMessage = (msg: MessageEvent) => {
  try {
    if (msg.data === 'instruction undefined') return

    // 处理成功消息
    const successMessages = {
      'add success': '成功添加',
      'add relation success': '成功添加算法关联',
      'move success': '成功移动',
      'delete success': '成功删除',
      'delete relation success': '成功解除绑定'
    }

    if (successMessages[msg.data as keyof typeof successMessages]) {
      ElMessage.success(successMessages[msg.data as keyof typeof successMessages])
      sendCommand('systemAll')
      // 刷新树图
      setTimeout(() => {
        select()
      }, 500)
      return
    }

    const parsedData = safeParseJSON(msg.data)
    if (!parsedData) {
      ElMessage.error('数据格式错误')
      return
    }

    console.log('parsedData', parsedData)

    json.value = Array.isArray(parsedData) ? parsedData : []

    // 清空并重新填充系统列表
    systems.value = []
    json.value.forEach((item: any) => {
      if (!validateSystemData(item)) {
        console.warn('系统数据无效:', item)
        return
      }

      systems.value.push({
        value: item.id,
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

// 处理算法数据消息
const handleAlgorithmMessage = (msg: MessageEvent) => {
  try {
    const parsedData = safeParseJSON(msg.data)
    if (!parsedData) {
      console.error('算法数据解析失败')
      return
    }

    console.log('算法数据:', parsedData)
    algorithms.value = Array.isArray(parsedData) ? parsedData.filter(validateAlgorithmData) : []

  } catch (error) {
    console.error('处理算法消息失败:', error)
    ElMessage.error('加载算法数据失败')
  } finally {
    setMessageHandler(getMessage)
  }
}

// 系统选择变更处理（用于算法关联）
const onSystemChange = () => {
  // 清空产品选择
  addForm.proId = ''
  availableProducts.value = []

  if (!addForm.sysId) {
    return
  }

  // 根据选择的系统获取对应的产品列表
  const selectedSystem = json.value.find((system: any) => system.id === addForm.sysId)
  if (selectedSystem && Array.isArray(selectedSystem.pro)) {
    availableProducts.value = selectedSystem.pro.filter(validateProductData)
    console.log('可用产品列表:', availableProducts.value.length, '个产品')
  }
}

// 打开添加对话框
const openAddDialog = () => {
  // 重置表单数据
  Object.assign(addForm, {
    sysId: '',
    proId: '',
    algorithmId: '',
    name: '',
    type: '',
    description: ''
  })

  // 清空可用产品列表
  availableProducts.value = []

  // 重置单选框为添加系统
  radio.value = '1'

  // 显示对话框
  addVisible.value = true
}

// const beginMove = () => {
//   moveVisible.value = true
//   setMessageHandler(getProducts)
//   sendCommand('productAll')
// }

// const getProducts = (msg: MessageEvent) => {
//   try {
//     const parsedData = safeParseJSON(msg.data)
//     if (parsedData) {
//       products.value = Array.isArray(parsedData.products) ?
//         parsedData.products.filter(validateProductData) : []
//     } else {
//       products.value = []
//     }
//   }
//   catch (error) {
//     console.error('获取产品数据失败:', error)
//     ElMessage.error('获取产品数据失败')
//     products.value = []
//   }
//   finally {
//     setMessageHandler(getMessage)
//   }
// }

const selectSys = () => {
  const targetId = deleteForm.sysId || moveForm.toSystemId
  const system = json.value.find((item: any) => validateSystemData(item) && item.id === targetId)
  if (system && Array.isArray(system.pro)) {
    products.value = system.pro.filter(validateProductData)
    proVisible.value = products.value.length > 0

    // 如果是删除算法，需要重置算法相关状态
    if (dRadio.value === '3') {
      aloVisible.value = false
      deleteForm.proId = ''
      deleteForm.algorithmId = ''
      algorithms.value = []
    }
  } else {
    products.value = []
    proVisible.value = false
    aloVisible.value = false
  }
}

const selectPro = () => {
  if (!deleteForm.proId) {
    aloVisible.value = false
    algorithms.value = []
    deleteForm.algorithmId = ''
    return
  }

  // 根据选择的产品获取对应的算法列表
  const selectedProduct = products.value.find((product: any) => product.id === deleteForm.proId)
  if (selectedProduct && Array.isArray(selectedProduct.alo)) {
    algorithms.value = selectedProduct.alo.filter(validateAlgorithmData)
    aloVisible.value = algorithms.value.length > 0
    console.log('可用算法列表:', algorithms.value.length, '个算法')
  } else {
    algorithms.value = []
    aloVisible.value = false
  }

  // 重置算法选择
  deleteForm.algorithmId = ''
}

// 对话框取消操作
const cancelDelete = () => {
  deleteVisible.value = false
  deleteForm.sysId = ''
  deleteForm.proId = ''
  deleteForm.algorithmId = ''
  proVisible.value = false
  aloVisible.value = false
  products.value = []
  algorithms.value = []
}

// 系统、产品和算法管理方法
const addSysOrPro = () => {
  // 验证表单数据
  if (!addForm.name.trim() && radio.value !== '3') {
    ElMessage.warning('请输入名称')
    return
  }

  if (radio.value === '2' && !addForm.sysId) {
    ElMessage.warning('请选择系统')
    return
  }

  if (radio.value === '3') {
    // 算法添加验证
    if (!addForm.sysId) {
      ElMessage.warning('请选择关联系统')
      return
    }
    if (!addForm.proId) {
      ElMessage.warning('请选择关联产品')
      return
    }
    if (!addForm.algorithmId) {
      ElMessage.warning('请选择算法')
      return
    }
  }

  addVisible.value = false
  let data: any

  if (radio.value === '1') {
    // 添加系统
    data = {
      name: addForm.name.trim(),
      description: addForm.description.trim()
    }
    sendCommand('addSystem')
  } else if (radio.value === '2') {
    // 添加产品
    data = {
      ...addForm,
      name: addForm.name.trim(),
      description: addForm.description.trim(),
      type: addForm.type.trim()
    }
    sendCommand('addProduct')
  } else if (radio.value === '3') {
    // 添加算法关联
    data = {
      sysId: addForm.sysId,
      proId: addForm.proId,
      aloId: addForm.algorithmId
    }
    //TODO 添加算法关联
    sendCommand('addProAloRelation')
  }

  console.log("data", data)
  sendCommand(JSON.stringify(data))

  // 重置表单
  Object.assign(addForm, {
    sysId: '',
    proId: '',
    algorithmId: '',
    name: '',
    type: '',
    description: ''
  })

  // 清空可用产品列表
  availableProducts.value = []
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

  if (dRadio.value === '3' && !deleteForm.algorithmId) {
    ElMessage.warning('请选择要删除的算法')
    return
  }

  deleteVisible.value = false
  proVisible.value = false
  aloVisible.value = false

  let data: any
  if (dRadio.value === '1') {
    data = { id: deleteForm.sysId }
    sendCommand('deleteSystem')
  } else if (dRadio.value === '2') {
    data = { id: deleteForm.proId }
    sendCommand('deleteProduct')
  } else if (dRadio.value === '3') {
    // 删除算法关联
    data = {
      sysId: deleteForm.sysId,
      proId: deleteForm.proId,
      aloId: deleteForm.algorithmId
    }
    sendCommand('deleteProAloRelation')
  }

  console.log("data", data)
  sendCommand(JSON.stringify(data))

  // 重置表单和状态
  deleteForm.sysId = ''
  deleteForm.proId = ''
  deleteForm.algorithmId = ''
  proVisible.value = false
  aloVisible.value = false
  products.value = []
  algorithms.value = []
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
    sendCommand('moveProduct')
  } else if (mRadio.value === '2') {
    data = { proId: moveForm.proId }
    sendCommand('deleteRelation')
  }

  sendCommand(JSON.stringify(data))

  // 重置表单和状态
  moveForm.proId = ''
  moveForm.toSystemId = ''
  products.value = []
}

// 查询和搜索方法
const select = () => {
  if (!selectedSystemId.value) {
    ElMessage.warning('请先选择一个系统')
    return
  }

  const systemIndex = json.value.findIndex((it: any) => it?.id === selectedSystemId.value)
  if (systemIndex >= 0) buildTreeData(systemIndex)
  else if (graph.value) graph.value.destroy()
}

const search = () => {
  if (!input.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }

  const keyword = input.value.trim()
  const systemIndex = json.value.findIndex((item: any) => item && (item.name === keyword || String(item.id) === keyword))
  if (systemIndex !== -1) {
    selectedSystemId.value = json.value[systemIndex]?.id
    buildTreeData(systemIndex)
  }
}

// 构建树形数据 - 使用Vue 3现代语法优化
const buildTreeData = (systemIndex: number) => {
  // 使用computed进行响应式数据验证
  const isValidSystemIndex = (index: number) =>
    index >= 0 && index < json.value.length

  if (!isValidSystemIndex(systemIndex)) {
    ElMessage.error('系统索引无效')
    return
  }

  const sys = json.value[systemIndex]
  if (!validateSystemData(sys)) {
    console.warn('系统数据无效:', sys)
    ElMessage.error('系统数据无效')
    return
  }

  console.log('构建系统树:', sys)

  // 使用现代化对象构建方式
  const createSystemNode = (system: any) => ({
    id: `sys${system.id}`,
    label: system.name,
    description: buildDescription(system.R, system.DR, system.H, system.Z),
    R: system.R,
    DR: system.DR,
    H: system.H,
    Z: system.Z,
    children: [] as any[]
  })

  const createProductNode = (product: any) => ({
    id: `pro${product.id}`,
    label: product.name,
    description: buildDescription(product.R, product.DR, product.H, product.Z),
    R: product.R,
    DR: product.DR,
    H: product.H,
    Z: product.Z,
    children: [] as any[]
  })

  const createAlgorithmNode = (algorithm: any, productId: number) => {
    const processAlgorithmName = (name: string) => {
      const separatorIndex = name.indexOf('_')
      if (separatorIndex === -1) return { displayName: name, description: '' }

      const description = name.substring(0, separatorIndex)
      let displayName = name.substring(separatorIndex + 1)

      if (displayName.length > 16) {
        displayName = displayName.substring(0, 16) + '...'
      }

      return { displayName, description }
    }

    const { displayName, description } = processAlgorithmName(algorithm.name)

    const node = {
      id: `alo${productId}aloID${algorithm.id}`,
      label: displayName
    } as any

    if (description) {
      node.description = description
    }

    return node
  }

  // 构建根节点
  const root = createSystemNode(sys)
  let nodeCount = 1

  // 使用现代数组方法处理产品数据
  const validProducts = Array.isArray(sys.pro)
    ? sys.pro.filter(validateProductData)
    : []

  validProducts.forEach((product: any) => {
    const productNode = createProductNode(product)

    // 使用现代数组方法处理算法数据
    const validAlgorithms = Array.isArray(product.alo)
      ? product.alo.filter(validateAlgorithmData)
      : []

    if (validAlgorithms.length === 0) {
      nodeCount++
    }

    validAlgorithms.forEach((algorithm: any) => {
      const algorithmNode = createAlgorithmNode(algorithm, product.id)
      productNode.children.push(algorithmNode)
      nodeCount++
    })

    root.children.push(productNode)
  })

  // 更新响应式数据
  treeData.value = root

  // 重新创建图表
  if (graph.value) {
    graph.value.destroy()
  }

  const minNodeCount = Math.max(nodeCount, 3)
  newGraph(1000, 80 * minNodeCount)

  if (graph.value) {
    graph.value.data(treeData.value)
    graph.value.render()
    graph.value.fitCenter()

    // 注册点击事件监听器
    graph.value.on('node:click', handleNodeClick)
  }
}

// 删除关系
const deleteRelation = (id: string) => {
  try {
    const proId = id.split("")[3] + ""
    const data = { proId }
    sendCommand('deleteRelation')
    sendCommand(JSON.stringify(data))
  } catch (error) {
    console.error('删除关系失败:', error)
    ElMessage.error('删除关系失败')
  }
}

// 使用现代化的事件处理方式
const handleNodeClick = (e: any) => {
  try {
    // 清除之前的点击状态
    const clearPreviousSelection = () => {
      const clickNodes = graph.value.findAllByState('node', 'click')
      clickNodes.forEach((node: any) => {
        graph.value.setItemState(node, 'click', false)
      })
    }

    clearPreviousSelection()

    const nodeItem = e.item
    const nodeId = nodeItem._cfg.id

    console.log('节点点击事件:', {
      nodeId,
      nodeConfig: nodeItem._cfg
    })

    // 设置当前节点为选中状态
    graph.value.setItemState(nodeItem, 'click', true)

    // 使用现代化的条件判断
    const isAlgorithmNode = nodeId.startsWith('alo')

    if (isAlgorithmNode) {
      handleAlgorithmNodeClick(nodeId)
    }
    else {
      handleSystemProductNodeClick(nodeId, nodeItem)
    }

  } catch (error) {
    console.error('节点点击处理失败:', error)
    ElMessage.error('节点点击处理失败')
  }
}

// 处理算法节点点击
const handleAlgorithmNodeClick = (nodeId: string) => {
  const extractAlgorithmId = (id: string): number => {
    const match = id.match(/aloID(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }

  const algorithmId = extractAlgorithmId(nodeId)
  if (algorithmId > 0) {
    jumpToAlgorithmPage(algorithmId)
  } else {
    console.error('无法提取算法ID:', nodeId)
  }
}

// 处理系统/产品节点点击
const handleSystemProductNodeClick = (nodeId: string, nodeItem: any) => {
  if (!selectedSystemId.value) {
    ElMessage.warning('请先选择系统')
    return
  }

  pictureName.value = nodeItem._cfg.model.label

  const systemIndex = json.value.findIndex((item: any) => item?.id === selectedSystemId.value)
  if (systemIndex === -1) {
    ElMessage.error('系统索引无效')
    return
  }

  const sys = json.value[systemIndex]
  if (!validateSystemData(sys)) {
    ElMessage.error('系统数据无效')
    return
  }

  const { sysId, proId, isSystemNode } = extractNodeInfo(nodeId, sys.id)

  // 更新响应式状态
  isSystem.value = isSystemNode
  sysAndProId.value = { sysId, proId }
  console.log('节点信息更新:', sysAndProId.value)

  // 查找或创建图表
  initializeGraphSearch()
}

// 提取节点信息的现代化函数
const extractNodeInfo = (nodeId: string, sysId: number) => {
  const isSystemNode = nodeId.startsWith('sys')

  if (isSystemNode) {
    return {
      sysId,
      proId: -1,
      isSystemNode: true
    }
  }

  // 产品节点 - 使用正则表达式提取ID
  const productMatch = nodeId.match(/pro(\d+)/)
  const proId = productMatch ? parseInt(productMatch[1], 10) : 0

  return {
    sysId,
    proId,
    isSystemNode: false
  }
}

// 初始化图表搜索
const initializeGraphSearch = () => {
  setMessageHandler(getRectAll)
  sendCommand('findAllGraph')
}

// 跳转到算法页面
const jumpToAlgorithmPage = (algorithmId: number) => {
  router.push({
    path: 'alg',
    query: { id: algorithmId.toString() }
  })
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

    console.log(rectData)

    let flag = 0
    for (let i = 0; i < rectData.length; i++) {
      if (rectData[i] && rectData[i].name === pictureName.value) {
        recId.value = rectData[i].id
        flag = 1
        break
      }
    }

    if (flag === 0) {
      const gotoRectangle = (msg: MessageEvent) => {
        router.push({
          path: '/rectangle',
          query: {
            pictureName: pictureName.value,
            id: msg.data,
            isSystem: isSystem.value.toString(),
            sysId: sysAndProId.value.sysId?.toString() || '',
            proId: sysAndProId.value.proId?.toString() || ''
          }
        })
      }

      setMessageHandler(gotoRectangle)
      sendCommand("addGraph")
      sendCommand(JSON.stringify({
        name: pictureName.value,
        message: "",
        sysId: sysAndProId.value.sysId,
        proId: sysAndProId.value.proId
      }))
    } else {
      router.push({
        path: '/rectangle',
        query: {
          pictureName: pictureName.value,
          id: recId.value,
          isSystem: isSystem.value.toString(),
          sysId: sysAndProId.value.sysId?.toString() || '',
          proId: sysAndProId.value.proId?.toString() || ''
        }
      })
    }
  }
  catch (error) {
    console.error('获取图表数据失败:', error)
    ElMessage.error('获取图表数据失败')
  }
}


// 创建G6图表 - 保持原有的antvg6逻辑
const newGraph = (_width: number, b: number) => {
  G6.registerEdge('hvh', {
    draw(cfg: any, group: any) {
      const startPoint = cfg.startPoint
      const endPoint = cfg.endPoint
      const shape = group.addShape('path', {
        attrs: {
          stroke: "#409EFF",
          lineWidth: 1.5,
          path: [
            ['M', startPoint.x, startPoint.y],
            ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, startPoint.y],
            ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, endPoint.y],
            ['L', endPoint.x, endPoint.y],
          ],
        },
        name: 'path-shape',
      })
      return shape
    },
  })

  const contextMenu = new (G6 as any).Menu({
    className: "context-menu",
    getContent(_evt: any) {
      const header = '解除绑定'
      return `<h3>${header}</h3>`
    },
    handleMenuClick: (target: any, item: any) => {
      console.log(item)
      console.log(target.innerText)
      if (target.innerText === "解除绑定") {
        deleteRelation(item._cfg.id)
      }
    },
    offsetX: -70,
    offsetY: -200,
    itemTypes: ['node'],
  })

  const container = document.getElementById('Flow')
  if (!container) {
    console.error('找不到图表容器')
    return
  }

  const width = container.scrollWidth
  const height = b

  graph.value = new (G6 as any).TreeGraph({
    container: container,
    width: width,
    height: height,
    linkCenter: true,
    plugins: [contextMenu],
    fitView: true,

    layout: {
      type: "mindmap",
      direction: "LR",
      preventOverlap: true,
      getVGap: function getVGap() {
        return 40
      },
      getHGap: function getHGap() {
        return 120
      },
    },

    defaultNode: {
      type: "modelRect",
      size: [270, 60],
      style: {
        stoken: "#003366",
        cursor: "pointer",
      },
      labelCfg: {
        offset: 25,
        style: {
          fontSize: 14,
          lineWidth: 1,
          fontFamily: "黑体",
          cursor: "pointer",
        },
      },
      descriptionCfg: {
        style: {
          fill: "#999",
          fontSize: 13,
          lineWidth: 1,
          fontFamily: "黑体",
          cursor: "pointer",
        },
      },
      stateIcon: {
        show: false,
      }
    },

    defaultEdge: {
      type: "hvh",
      style: {
        stroke: "#409EFF",
        lineWidth: 1.5,
      },
    },
  })
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
.control-panel-tree {
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

  .control-panel-tree {
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
  .control-panel-tree {
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
