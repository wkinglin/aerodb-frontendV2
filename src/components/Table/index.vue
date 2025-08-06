<template>
  <div>
    <HotTable ref="hot" :settings="hotSettings"></HotTable>
  </div>
</template>

<script>
import { HotTable } from '@handsontable/vue3';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';

// register Handsontable's modules
registerAllModules();

export default {
  data() {
    return {
      hotSettings: {
        licenseKey: 'non-commercial-and-evaluation',
        rowHeaders: true,
        colHeaders: this.makeColHeaders(),
        colWidths: 100,
        stretchH: 'all',
        rowHeights: 40,
        width: "100%",
        height: "auto",
        language: "zh-CN",
        contextMenu: true,
        mergeCells: true,
        allowInsertColumn: true,
        allowremoveColumn: true,
        cells: function (row, col, prop) {
          const cellProperties = { readOnly: false, className: '' };  // 初始化属性和类名
          const visualRowIndex = this.instance.toVisualRow(row);  // 获取行号
          const visualColIndex = this.instance.toVisualColumn(col);  // 获取列号
          cellProperties.className = "cellStyle"
          return cellProperties;
        },
      },
    }
  },
  components: {
    HotTable
  },
  methods: {
    addNewRow() {
      this.$refs['hot'].hotInstance.alter('insert_row');
    },
    removeRow() {
      this.$refs['hot'].hotInstance.alter('remove_row');
    },
    addNewColumn() {
      this.$refs['hot'].hotInstance.alter('insert_col');
    },
    removeColumn() {
      this.$refs['hot'].hotInstance.alter('remove_col');
    },
    colsNumbers() {
      return this.$refs['hot'].hotInstance.countVisibleCols();
    },
    rowsNumbers() {
      return this.$refs['hot'].hotInstance.countVisibleRows();
    },
    getColData(dis) {
      return this.$refs['hot'].hotInstance.getDataAtCol(dis);
    },
    makeColHeaders() {
      return this.$store.state.colData[this.$store.state.row];
    },
    renderAgain() {
      this.$refs['hot'].hotInstance.render();
    }
  }
}
</script>
