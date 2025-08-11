// 分组类型定义
export type GroupType = 'hot' | 'cold' | 'normal'

// 节点类型定义
export interface CustomData {
  label: string
  R?: string | number
  DR?: string | number
  H?: string | number
  Z?: string | number
  color?: string
  name?: string
  id?: string | number
  groupType?: GroupType
  onCustomEvent?: (event: MouseEvent) => void
  onNavigate?: (event: MouseEvent) => void
}

export interface CustomEvents {
  onCustomEvent: (event: MouseEvent) => void
  onNodeDoubleClick?: (event: MouseEvent) => void
  onNodeClick?: (event: MouseEvent) => void
}

// 自定义节点类型
export type CustomNodeTypes = 'custom' | 'special' | 'algorithm' | 'system' | 'product' | 'group'

export interface Node{
  // 节点id
  id: number
  // 矩形id
  recId: number
  // 节点名称
  name: string
  // 节点key
  key: number
  // 节点位置
  loc: string


  // 是否是组
  type: 'group' | 'pro' | 'alo'
  isGroup: boolean
  // 组id
  group: number
  // 冷热备份度
  groupType: GroupType
  isHot: boolean

  // 属性值
  R: string
  DR: string
  H: string
  Z: string

  // 置信度
  reliability: string
}

export interface Edge {
  from: string
  to: string
  color: string
}

export interface Alo {
  id: number
  name: string
}

export interface Pro {
  id: number
  name: string
  R: string
  DR: string
  H: string
  Z: string
  alo: Alo[]
}

export interface System {
  id: number
  name: string
  description: string
  R: string
  DR: string
  H: string
  Z: string
  pro: Pro[]
}