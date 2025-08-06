// @ts-ignore
import { createRouter, createWebHashHistory } from "vue-router";
import Layout from '../layout/index.vue'
import Dashboard from '../views/dashboard/index.vue'
import AlgTable from '../views/aloTable/aloTable.vue'
import Alg from '../views/aloTable/alo.vue'
import NewTable from '../views/newTable/newTable.vue'
import table from '../views/newTable/Table.vue'
import create from '../views/aloTable/create.vue'
import flowChart from '../views/flowChart/flowChart.vue'
import upLoad from '../views/upLoad/upLoad.vue'
import seePicture from '../views/rectangle/seeRect.vue'
import Flow from '../views/rectangle/rectangle.vue'
import calHotAndCold from '../views/calHotAndCold/cal.vue'
import document from '../views/document/document.vue'

const router = createRouter({
    //  hash 模式。
    history: createWebHashHistory(),
    routes: [
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
                        keepAlive: true
                    }
                },
                {
                    path: 'algTable',
                    name: '算法库',
                    component: AlgTable,
                    meta: {
                        keepAlive: true
                    }
                },
                {
                    path: 'newTable',
                    name: '新建数据库',
                    component: NewTable
                },
                {
                    path: '/alg',
                    name: '执行算法',
                    // hidden: true,
                    component: Alg,
                    meta: {
                        keepAlive: true
                    }
                },
                {
                    path: '/table',
                    name: '建立数据库',
                    // hidden: true,
                    component: table,
                    meta: {
                        keepAlive: true
                    }
                },
                {
                    path: '/create',
                    name: '创建新算法',
                    component: create,
                    meta: {
                        keepAlive: true
                    }
                },
                {
                    path: '/flowChart',
                    name: '查看产品树',
                    component: flowChart,
                    meta: {
                        keepAlive: true
                    }
                },
                {
                    path: '/upLoad',
                    name: '上传文件',
                    component: upLoad,
                    meta: {
                        keepAlive: true
                    }
                },
                // {
                //   path: '/PersonalFlowChart',
                //   name: '自定义框图',
                //   component: PersonalFlowChart,
                //   meta:{
                //     keepAlive: true
                //   }
                // },
                {
                    path: '/seeRect',
                    name: '自定义框图',
                    component: seePicture,
                    meta: {
                        keepAlive: true
                    }
                },
                {
                    path: '/flow',
                    name: '查看框图',
                    component: Flow,
                    meta: {
                        keepAlive: false
                    }
                },
                {
                    path: '/calHotAndCold',
                    name: '计算冷热备份可靠度',
                    component: calHotAndCold,
                    meta: {
                        keepAlive: true
                    }
                },
                {
                    path: '/document',
                    name: '查看文档',
                    component: document,
                    meta: {
                        keepAlive: true
                    }
                }
            ]
        },
    ]
})

export default router
