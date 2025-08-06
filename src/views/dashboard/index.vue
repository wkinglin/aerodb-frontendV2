<template>
  <div>
    <el-card class="box-card" style="border-radius: 16px; padding: 32px 24px;">
      <h2
        style="font-size: 2rem; font-weight: bold; margin-bottom: 18px; letter-spacing: 2px; color: #2d3a4b; text-align: center;">
        可靠性评估软件
      </h2>
      <p style="font-size: 1.25rem; color: #4b5563; text-align: center; margin-bottom: 0;">
        本软件具有创建算法，查看算法，输出算法结果，保存算法数据库等功能
      </p>
    </el-card>
    <div class="small-box">
      <el-row class="rowLayout" :gutter="20">
        <el-col :span="8">
          <div
            class="card-hover bg-white p-6 rounded-xl cursor-pointer transition-all duration-300 border border-gray-200"
            @click="goTo('algTable')">
            <div class="flex items-center space-x-4">
              <el-icon class="w-8 h-8 text-blue-500 transition-transform duration-300">
                <List />
              </el-icon>
              <span class="text-lg font-semibold text-gray-800">查看算法</span>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div
            class="card-hover bg-white p-6 rounded-xl cursor-pointer transition-all duration-300 border border-gray-200"
            @click="goTo('newTable')">
            <div class="flex items-center space-x-4">
              <el-icon class="w-8 h-8 text-green-500 transition-transform duration-300">
                <Plus />
              </el-icon>
              <span class="text-lg font-semibold text-gray-800">新建数据库</span>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div
            class="card-hover bg-white p-6 rounded-xl cursor-pointer transition-all duration-300 border border-gray-200"
            @click="goTo('/create')">
            <div class="flex items-center space-x-4">
              <el-icon class="w-8 h-8 text-purple-500 transition-transform duration-300">
                <Edit />
              </el-icon>
              <span class="text-lg font-semibold text-gray-800">创建算法</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="small-box">
      <el-row :gutter="20">
        <el-col :span="8">
          <div
            class="card-hover bg-white p-6 rounded-xl cursor-pointer transition-all duration-300 border border-gray-200"
            @click="goTo('/flowChart')">
            <div class="flex items-center space-x-4">
              <el-icon class="w-8 h-8 text-indigo-500 transition-transform duration-300">
                <View />
              </el-icon>
              <span class="text-lg font-semibold text-gray-800">查看流程</span>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div
            class="card-hover bg-white p-6 rounded-xl cursor-pointer transition-all duration-300 border border-gray-200"
            @click="goTo('/upLoad')">
            <div class="flex items-center space-x-4">
              <el-icon class="w-8 h-8 text-orange-500 transition-transform duration-300">
                <Top />
              </el-icon>
              <span class="text-lg font-semibold text-gray-800">上传文件</span>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div
            class="card-hover bg-white p-6 rounded-xl cursor-pointer transition-all duration-300 border border-gray-200"
            @click="goTo('/flowChart')">
            <div class="flex items-center space-x-4">
              <el-icon class="w-8 h-8 text-teal-500 transition-transform duration-300">
                <Edit />
              </el-icon>
              <span class="text-lg font-semibold text-gray-800">查看产品树</span>
            </div>
          </div>
        </el-col>

      </el-row>
    </div>

    <div class="small-box">
      <el-row :gutter="20">
        <el-col :span="8">
          <div
            class="card-hover bg-white p-6 rounded-xl cursor-pointer transition-all duration-300 border border-gray-200"
            @click="goTo('/seeRect')">
            <div class="flex items-center space-x-4">
              <el-icon class="w-8 h-8 text-pink-500 transition-transform duration-300">
                <Place />
              </el-icon>
              <span class="text-lg font-semibold text-gray-800">自定义框图</span>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div
            class="card-hover bg-white p-6 rounded-xl cursor-pointer transition-all duration-300 border border-gray-200"
            @click="goTo('/calHotAndCold')">
            <div class="flex items-center space-x-4">
              <el-icon class="w-8 h-8 text-red-500 transition-transform duration-300">
                <Place />
              </el-icon>
              <span class="text-lg font-semibold text-gray-800">计算冷热备份可靠度</span>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div
            class="card-hover bg-white p-6 rounded-xl cursor-pointer transition-all duration-300 border border-gray-200"
            @click="goTo('/document')">
            <div class="flex items-center space-x-4">
              <el-icon class="w-8 h-8 text-yellow-500 transition-transform duration-300">
                <Document />
              </el-icon>
              <span class="text-lg font-semibold text-gray-800">查看用户手册</span>
            </div>
          </div>
        </el-col>

      </el-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goTo = (pa: string) => {
  router.push({
    path: pa,
  })
}
</script>

<style>
.rowLayout {
  width: auto;
}

.small-box {
  margin-left: 50px;
  margin-top: 20px;
  margin-right: 50px;
}

/* 自定义卡片 hover 效果 */
.card-hover {
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(0);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.card-hover:hover {
  /* 明显的阴影效果 */
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1);
  /* 向上移动 */
  transform: translateY(-6px);
  /* 背景渐变变化 */
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
  /* 边框颜色变化 */
  border-color: #e2e8f0;
}

/* 图标 hover 动画 */
.card-hover:hover .transition-transform {
  transform: scale(1.15) rotate(5deg);
}

/* 文字 hover 效果 */
.card-hover:hover span {
  color: #1f2937;
  font-weight: 700;
}

/* 添加一些额外的动画效果 */
.card-hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 0.75rem;
  pointer-events: none;
}

.card-hover:hover::before {
  opacity: 1;
}

/* 确保内容在伪元素之上 */
.card-hover>* {
  position: relative;
  z-index: 1;
}
</style>