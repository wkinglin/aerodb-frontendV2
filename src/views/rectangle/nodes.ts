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