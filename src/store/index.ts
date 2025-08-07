import { defineStore } from 'pinia'

// 定义表格数据接口
interface TableItem {
    id: string;
    name: string;
    valid: boolean;
    headers: any[];
    headersType: any[];
    colnum: number;
    rownum: number;
    createdAt: Date;
}

// 定义主 store
export const useMainStore = defineStore('main', {
    state: () => ({
        count: 0,
        row: 0,
        tableData: [] as TableItem[],
        newTableValible: true,
        algId: 0,
        aloId: 0,
        isCollapsed: true,
        recId: 0,
        aloValue: {} as any,
        rectValue: {} as any,
        isTurnAlo: false,
        sysAndProId: {} as any,
    }),

    actions: {
        increment() {
            this.count++
            const newTable: TableItem = {
                id: `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: "表格" + this.count,
                valid: true,
                headers: [],
                headersType: [],
                colnum: 0,
                rownum: 0,
                createdAt: new Date(),
            }
            this.tableData.push(newTable)
        },

        decrement() {
            if (this.count > 0) {
                this.count--
                this.tableData.pop()
            }
        },

        changeTableData(payload: { row: number; i: number; element: any; colnum: number; rownum: number }) {
            this.tableData[payload.row - 1].headers[payload.i] = payload.element
            this.tableData[payload.row - 1].colnum = payload.colnum
            this.tableData[payload.row - 1].rownum = payload.rownum
        },

        changeTableType(payload: { row: number; i: number; element: any }) {
            this.tableData[payload.row - 1].headersType[payload.i] = payload.element
        },

        changeTableName(payload: { i: number; name: string }) {
            this.tableData[payload.i].name = payload.name
        },

        changeTableValid(payload: { i: number; valid: boolean }) {
            this.tableData[payload.i].valid = payload.valid
        },

        deleteTableData(payload: { i: number }) {
            this.tableData.splice(payload.i, 1)
        },

        deleteTableHeader(payload: { i: number }) {
            this.tableData[payload.i].headers.pop()
        },

        addTableHeader(payload: { i: number }) {
            this.tableData[payload.i].headers.push("")
        },

        changeCollapsed(bool: boolean) {
            this.isCollapsed = bool
        },

        changeAloValue(aloValue: any) {
            this.aloValue = aloValue
        },

        changeRectValue(rectValue: any) {
            this.rectValue = rectValue
        },

        changeSysAndProId(value: any) {
            this.sysAndProId = value
        },

        // 根据ID查找表格
        findTableById(id: string): TableItem | undefined {
            return this.tableData.find(table => table.id === id)
        },

        // 根据ID获取表格索引
        findTableIndexById(id: string): number {
            return this.tableData.findIndex(table => table.id === id)
        },

        // 根据ID删除表格
        deleteTableById(id: string) {
            const index = this.findTableIndexById(id)
            if (index !== -1) {
                this.tableData.splice(index, 1)
            }
        },

        // 根据ID更新表格名称
        changeTableNameById(id: string, name: string) {
            const table = this.findTableById(id)
            if (table) {
                table.name = name
            }
        },

        // 根据ID更新表格状态
        changeTableValidById(id: string, valid: boolean) {
            const table = this.findTableById(id)
            if (table) {
                table.valid = valid
            }
        },
    }
})