import { defineStore } from 'pinia'

// 定义表格数据接口
interface TableItem {
    name: string;
    valid: boolean;
    headers: any[];
    headersType: any[];
    colnum: number;
    rownum: number;
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
            this.tableData.push({
                name: "表格" + this.count,
                valid: true,
                headers: [],
                headersType: [],
                colnum: 0,
                rownum: 0,
            })
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
    }
})