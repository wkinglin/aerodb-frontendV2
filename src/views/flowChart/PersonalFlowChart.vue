<template>
 
 
  <div class="content">
    <!-- <el-button @click="download()">导出</el-button> -->
    <div class="app-stencil" ref="stencilContainer">
    </div>
    <div class="app-content" ref="container">
    </div>
  </div>
 
</template>
 
<script>
import { Graph, Shape, Addon, DataUri } from '@antv/x6/lib';

const { Stencil } = Addon;
 
const { Rect, Circle } = Shape;
 
export default {
  data(){
    return{
      
    }
  },
  name: "index",
  mounted () {
    this.init();
  },
  methods: {
    init(){
      const graph = new Graph({
        container: this.$refs.container,
        grid: true,
        snapline: {
          enabled: true,
          sharp: true,
        },
        scroller: {
          enabled: true,
          pageVisible: false,
          pageBreak: false,
          pannable: true,
        },
        resizing: {
          enabled: true,
        },
        connecting: {
          allowBlank:false,
          allowMuti:false,
        }
      })
 
      graph.centerContent()
 
      const stencil = new Stencil({
        title: 'Components',
        target: graph,
        search: true,
        collapsable: true,
        stencilGraphWidth: 200,
        stencilGraphHeight: 180,
        groups: [
          {
            name: 'group1',
            title: 'Group(Collapsable)',
          },
          // {
          //   name: 'group2',
          //   title: 'Group',
          //   collapsable: false,
          // },
        ],
      })
 
 
      this.$refs.stencilContainer.appendChild(stencil.container)
      
      graph.on('node:dblclick', ({ e, x, y, node, view }) => {
            
      })

      graph.on('node:contextmenu', ({ e, x, y, node, view }) => {
            graph.removeNode(node.id);
      })

      graph.on('edge:contextmenu', ({ e, x, y, edge, view }) => {
            graph.removeEdge(edge.id);
      }) 
      
      graph.on('edge:connected', ({ isNew, edge }) => {
        if (isNew) {
          edge.attrs={
            line: {
              stroke: "#7c68fc", // 指定 path 元素的填充色
            },
          }
        }
      })

      const r = new Rect({
        width: 70,
        height: 40,
        attrs: {
          rect: { fill: '#ffffff', stroke: '#397cf6', strokeWidth: 2 },
          text: { text: 'rect', fill: '#000000' },
        },      
        ports: {
          groups: {
            // 输入链接桩群组定义
            in: {
              position: 'right',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: '#31d0c6',
                  strokeWidth: 2,
                  fill: '#fff',
                },
              },
            },
            out: {
              position: 'left',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: '#31d0c6',
                  strokeWidth: 2,
                  fill: '#fff',
                },
              },
            },
            
          },
          items: [
            {
              id: 'port1',
              group: 'in',
            },
            {
              id: 'port2',
              group: 'out',
            },
            
          ],
        },

       

      });

      const c = new Shape.TextBlock({
        width: 60,
        height: 60,
        attrs: {
          body: { strokeWidth: 2, stroke: '#397cf6' },
          label:{
            contenteditable: true,
          }
        },

        ports: {
          groups: {
            // 输入链接桩群组定义
            in: {
              position: 'right',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: '#31d0c6',
                  strokeWidth: 2,
                  fill: '#fff',
                },
              },
            },
            out: {
              position: 'left',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: '#31d0c6',
                  strokeWidth: 2,
                  fill: '#fff',
                },
              },
            },

            bottom: {
              position: 'bottom',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: '#31d0c6',
                  strokeWidth: 2,
                  fill: '#fff',
                },
              },
            },

            top: {
              position: 'top',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: '#31d0c6',
                  strokeWidth: 2,
                  fill: '#fff',
                },
              },
            },
            
          },
          items: [
            {
              id: 'port1',
              group: 'in',
            },
            {
              id: 'port2',
              group: 'out',
            },
            {
              id: 'port3',
              group: 'bottom',
            },
            {
              id: 'port4',
              group: 'top',
            },
          ],
        },

      })
 
      const c2 = new Circle({
        width: 60,
        height: 60,
        attrs: {
          circle: { fill: '#4B4A67', 'stroke-width': 6, stroke: '#FE854F' },
          text: { text: 'ellipse', fill: 'white' },
        },
      })
 
      const r2 = new Rect({
        width: 70,
        height: 40,
        attrs: {
          rect: { fill: '#4B4A67', stroke: '#31D0C6', strokeWidth: 6 },
          text: { text: 'rect', fill: 'white' },
        },
      })
 
      const r3 = new Rect({
        width: 70,
        height: 40,
        attrs: {
          rect: { fill: '#31D0C6', stroke: '#4B4A67', strokeWidth: 6 },
          text: { text: 'rect', fill: 'white' },
        },
      })
 
      const c3 = new Circle({
        width: 60,
        height: 60,
        attrs: {
          circle: { fill: '#FE854F', strokeWidth: 6, stroke: '#4B4A67' },
          text: { text: 'ellipse', fill: 'white' },
        },
      })
 
      stencil.load([r, c, c2, r2.clone()], 'group1')
      
    },

    download(){
        // 下载
        // graph.toJSON
    
    }
 
  }
}
 
</script>
 
<style scoped>
 
.content {
  font-family: sans-serif;
  display: flex;
  
}
 
.app-stencil {
  width: 200px;
  border: 1px solid #f0f0f0;
  position: relative;
}
 
.app-content {
  flex: 1;
  height: 740px;
  margin-left: 8px;
  margin-right: 8px;
  box-shadow: 0 0 10px 1px #e9e9e9;
}
 
.x6-graph-scroller {
  border: 1px solid #f0f0f0;
  margin-left: -1px;
}
</style>