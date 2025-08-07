import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '../layout/index.vue'

// 页面组件懒加载
const Dashboard = () => import('../views/dashboard/index.vue')
const AlgTable = () => import('../views/aloTable/aloTable.vue')
const Alg = () => import('../views/aloTable/alo.vue')
const NewTable = () => import('../views/newTable/newTable.vue')
const Table = () => import('../views/newTable/Table.vue')
const Create = () => import('../views/aloTable/create.vue')
const FlowChart = () => import('../views/flowChart/flowChart.vue')
const UpLoad = () => import('../views/upLoad/upLoad.vue')
const SeePicture = () => import('../views/rectangle/seeRect.vue')
const Flow = () => import('../views/rectangle/rectangle.vue')
const CalHotAndCold = () => import('../views/calHotAndCold/cal.vue')
const Document = () => import('../views/document/document.vue')

// 路由配置
const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: Layout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: '首页',
                component: Dashboard,
                meta: {
                    keepAlive: true,
                    title: '首页'
                }
            },
            {
                path: 'algTable',
                name: '算法库',
                component: AlgTable,
                meta: {
                    keepAlive: true,
                    title: '算法库'
                }
            },
            {
                path: 'newTable',
                name: '新建数据库',
                component: NewTable,
                meta: {
                    title: '新建数据库'
                }
            },
            {
                path: '/alg',
                name: '执行算法',
                component: Alg,
                meta: {
                    keepAlive: true,
                    title: '执行算法'
                }
            },
            {
                path: '/table',
                name: '建立数据库',
                component: Table,
                meta: {
                    keepAlive: true,
                    title: '建立数据库'
                }
            },
            {
                path: '/create',
                name: '创建新算法',
                component: Create,
                meta: {
                    keepAlive: true,
                    title: '创建新算法'
                }
            },
            {
                path: '/flowChart',
                name: '查看产品树',
                component: FlowChart,
                meta: {
                    keepAlive: true,
                    title: '查看产品树'
                }
            },
            {
                path: '/upLoad',
                name: '上传文件',
                component: UpLoad,
                meta: {
                    keepAlive: true,
                    title: '上传文件'
                }
            },
            {
                path: '/seeRect',
                name: '自定义框图',
                component: SeePicture,
                meta: {
                    keepAlive: true,
                    title: '自定义框图'
                }
            },
            {
                path: '/flow',
                name: '查看框图',
                component: Flow,
                meta: {
                    keepAlive: false,
                    title: '查看框图'
                }
            },
            {
                path: '/calHotAndCold',
                name: '计算冷热备份可靠度',
                component: CalHotAndCold,
                meta: {
                    keepAlive: true,
                    title: '计算冷热备份可靠度'
                }
            },
            {
                path: '/document',
                name: '查看文档',
                component: Document,
                meta: {
                    keepAlive: true,
                    title: '查看文档'
                }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
    // 设置页面标题
    if (to.meta?.title) {
        document.title = `${to.meta.title} - 可靠性评估软件`
    } else {
        document.title = '可靠性评估软件'
    }
    
    next()
})

router.afterEach((to) => {
    // 页面跳转后的处理
    console.log(`导航到: ${to.path}`)
})

export default router
