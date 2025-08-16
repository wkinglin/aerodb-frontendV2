<template>
  <div class="dashboard-container">
    <!-- 页面头部 -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <el-icon class="main-icon">
            <TrendCharts />
          </el-icon>
        </div>
        <h1 class="hero-title">
          可靠性评估软件
        </h1>
        <p class="hero-description">
          提供算法创建、数据管理、流程分析和可靠性计算的专业平台
        </p>
        <div class="hero-features">
          <span class="feature-tag">算法管理</span>
          <span class="feature-tag">数据分析</span>
          <span class="feature-tag">可靠性计算</span>
          <span class="feature-tag">流程可视化</span>
        </div>
      </div>
      <div class="hero-background">
        <div class="bg-shape shape-1"></div>
        <div class="bg-shape shape-2"></div>
        <div class="bg-shape shape-3"></div>
      </div>
    </div>

    <!-- 功能模块 -->
    <div class="modules-container">
      <!-- 核心功能 -->
      <div class="module-section">
        <div class="section-header">
          <h3 class="section-title">
            <el-icon class="section-icon">
              <Setting />
            </el-icon>
            核心功能
          </h3>
          <p class="section-subtitle">算法管理和数据处理</p>
        </div>

        <div class="cards-grid core-grid">
          <div class="feature-card primary" @click="goTo('/algTable')">
            <div class="card-icon primary-icon">
              <el-icon>
                <List />
              </el-icon>
            </div>
            <div class="card-content">
              <h4 class="card-title">查看算法</h4>
              <p class="card-description">浏览和管理已创建的算法</p>
            </div>
            <div class="card-arrow">
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>

          <div class="feature-card success" @click="goTo('/create')">
            <div class="card-icon success-icon">
              <el-icon>
                <Plus />
              </el-icon>
            </div>
            <div class="card-content">
              <h4 class="card-title">创建算法</h4>
              <p class="card-description">设计和配置新的计算算法</p>
            </div>
            <div class="card-arrow">
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>

          <div class="feature-card info" @click="goTo('/newTable')">
            <div class="card-icon info-icon">
              <el-icon>
                <Plus />
              </el-icon>
            </div>
            <div class="card-content">
              <h4 class="card-title">新建数据库</h4>
              <p class="card-description">创建和配置数据存储</p>
            </div>
            <div class="card-arrow">
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 分析工具 -->
      <div class="module-section">
        <div class="section-header">
          <h3 class="section-title">
            <el-icon class="section-icon">
              <DataAnalysis />
            </el-icon>
            分析工具
          </h3>
          <p class="section-subtitle">数据可视化和流程分析</p>
        </div>

        <div class="cards-grid analysis-grid">
          <div class="feature-card warning" @click="goTo('/flowChart')">
            <div class="card-icon warning-icon">
              <el-icon>
                <View />
              </el-icon>
            </div>
            <div class="card-content">
              <h4 class="card-title">查看流程</h4>
              <p class="card-description">可视化工作流程图</p>
            </div>
            <div class="card-arrow">
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>

          <div class="feature-card danger" @click="goTo('/seeRect')">
            <div class="card-icon danger-icon">
              <el-icon>
                <Grid />
              </el-icon>
            </div>
            <div class="card-content">
              <h4 class="card-title">自定义框图</h4>
              <p class="card-description">创建个性化流程图表</p>
            </div>
            <div class="card-arrow">
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>

          <div class="feature-card purple" @click="goTo('/flowChart')">
            <div class="card-icon purple-icon">
              <el-icon>
                <Share />
              </el-icon>
            </div>
            <div class="card-content">
              <h4 class="card-title">查看产品树</h4>
              <p class="card-description">分析产品结构层次</p>
            </div>
            <div class="card-arrow">
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 实用工具 -->
      <div class="module-section">
        <div class="section-header">
          <h3 class="section-title">
            <el-icon class="section-icon">
              <Tools />
            </el-icon>
            实用工具
          </h3>
          <p class="section-subtitle">文件管理和计算工具</p>
        </div>

        <div class="cards-grid tools-grid">
          <div class="feature-card orange" @click="goTo('/upLoad')">
            <div class="card-icon orange-icon">
              <el-icon>
                <UploadFilled />
              </el-icon>
            </div>
            <div class="card-content">
              <h4 class="card-title">上传文件</h4>
              <p class="card-description">导入数据文件和资源</p>
            </div>
            <div class="card-arrow">
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>

          <div class="feature-card pink" @click="goTo('/calHotAndCold')">
            <div class="card-icon pink-icon">
              <el-icon>
                <Operation />
              </el-icon>
            </div>
            <div class="card-content">
              <h4 class="card-title">可靠度计算</h4>
              <p class="card-description">计算冷热备份可靠度</p>
            </div>
            <div class="card-arrow">
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>

          <div class="feature-card cyan" @click="goTo('/document')">
            <div class="card-icon cyan-icon">
              <el-icon>
                <Document />
              </el-icon>
            </div>
            <div class="card-content">
              <h4 class="card-title">用户手册</h4>
              <p class="card-description">查看详细使用说明</p>
            </div>
            <div class="card-arrow">
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部统计信息 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">
            <el-icon>
              <TrendCharts />
            </el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.algorithms }}</div>
            <div class="stat-label">算法数量</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <el-icon>
              <List />
            </el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.databases }}</div>
            <div class="stat-label">数据库</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <el-icon>
              <Document />
            </el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.files }}</div>
            <div class="stat-label">文件数量</div>
          </div>
        </div>

        <div class="stat-item">
          <div class="stat-icon">
            <el-icon>
              <Operation />
            </el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.calculations }}</div>
            <div class="stat-label">计算任务</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  List,
  Plus,
  View,
  UploadFilled,
  Grid,
  Document,
  TrendCharts,
  Setting,
  DataAnalysis,
  Tools,
  Share,
  Operation,
  ArrowRight
} from '@element-plus/icons-vue'

const router = useRouter()

// 统计数据
const stats = reactive({
  algorithms: 0,
  databases: 0,
  files: 0,
  calculations: 0
})

// 导航方法
const goTo = (path: string) => {
  router.push({ path })
}

// 模拟获取统计数据
const fetchStats = async () => {
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 500))

  stats.algorithms = Math.floor(Math.random() * 50) + 10
  stats.databases = Math.floor(Math.random() * 10) + 5
  stats.files = Math.floor(Math.random() * 100) + 20
  stats.calculations = Math.floor(Math.random() * 200) + 50
}

// 组件挂载时获取数据
onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
/* 页面容器 */
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: "微软雅黑", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* 英雄区域 */
.hero-section {
  position: relative;
  padding: 80px 40px 60px;
  text-align: center;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.hero-icon {
  margin-bottom: 24px;
}

.main-icon {
  font-size: 64px;
  color: rgba(255, 255, 255, 0.9);
  animation: float 3s ease-in-out infinite;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 20px 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: slideInUp 0.8s ease-out;
}

.hero-description {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 32px 0;
  line-height: 1.6;
  animation: slideInUp 0.8s ease-out 0.2s both;
}

.hero-features {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  animation: slideInUp 0.8s ease-out 0.4s both;
}

.feature-tag {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.feature-tag:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 背景装饰 */
.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  background: white;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  background: white;
  top: 20%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  background: white;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

/* 模块容器 */
.modules-container {
  padding: 40px 40px 80px;
  background: #f8fafc;
}

.module-section {
  max-width: 1200px;
  margin: 0 auto 60px;
}

.module-section:last-child {
  margin-bottom: 0;
}

/* 区域头部 */
.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.section-icon {
  font-size: 32px;
  color: #667eea;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  margin: 0;
}

/* 卡片网格 */
.cards-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

.core-grid {
  grid-template-columns: repeat(3, 1fr);
}

.analysis-grid,
.tools-grid {
  grid-template-columns: repeat(3, 1fr);
}

/* 功能卡片 */
.feature-card {
  display: flex;
  align-items: center;
  padding: 28px 32px;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-card:hover::before {
  opacity: 1;
}

/* 卡片图标 */
.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  flex-shrink: 0;
  font-size: 28px;
  transition: all 0.3s ease;
}

.feature-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
}

/* 卡片内容 */
.card-content {
  flex: 1;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
  transition: color 0.3s ease;
}

.card-description {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* 卡片箭头 */
.card-arrow {
  font-size: 20px;
  color: #94a3b8;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateX(-10px);
}

.feature-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* 主题色彩 */
.primary::before {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1));
}

.primary-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.primary:hover .card-title {
  color: #2563eb;
}

.primary:hover .card-arrow {
  color: #2563eb;
}

.success::before {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(21, 128, 61, 0.1));
}

.success-icon {
  background: linear-gradient(135deg, #22c55e, #15803d);
  color: white;
}

.success:hover .card-title {
  color: #15803d;
}

.success:hover .card-arrow {
  color: #15803d;
}

.info::before {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(8, 145, 178, 0.1));
}

.info-icon {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: white;
}

.info:hover .card-title {
  color: #0891b2;
}

.info:hover .card-arrow {
  color: #0891b2;
}

.warning::before {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1));
}

.warning-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.warning:hover .card-title {
  color: #d97706;
}

.warning:hover .card-arrow {
  color: #d97706;
}

.danger::before {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
}

.danger-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.danger:hover .card-title {
  color: #dc2626;
}

.danger:hover .card-arrow {
  color: #dc2626;
}

.purple::before {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.1));
}

.purple-icon {
  background: linear-gradient(135deg, #a855f7, #9333ea);
  color: white;
}

.purple:hover .card-title {
  color: #9333ea;
}

.purple:hover .card-arrow {
  color: #9333ea;
}

.orange::before {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(234, 88, 12, 0.1));
}

.orange-icon {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
}

.orange:hover .card-title {
  color: #ea580c;
}

.orange:hover .card-arrow {
  color: #ea580c;
}

.pink::before {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(219, 39, 119, 0.1));
}

.pink-icon {
  background: linear-gradient(135deg, #ec4899, #db2777);
  color: white;
}

.pink:hover .card-title {
  color: #db2777;
}

.pink:hover .card-arrow {
  color: #db2777;
}

.cyan::before {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(6, 182, 212, 0.1));
}

.cyan-icon {
  background: linear-gradient(135deg, #22d3ee, #06b6d4);
  color: white;
}

.cyan:hover .card-title {
  color: #06b6d4;
}

.cyan:hover .card-arrow {
  color: #06b6d4;
}

/* 统计区域 */
.stats-section {
  background: white;
  padding: 60px 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 32px;
  max-width: 1000px;
  margin: 0 auto;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 24px;
  background: #f8fafc;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: #f1f5f9;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

/* 动画 */
@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-20px);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {

  .cards-grid,
  .core-grid,
  .analysis-grid,
  .tools-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .hero-section {
    padding: 60px 20px 40px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .modules-container {
    padding: 30px 20px 60px;
  }

  .cards-grid,
  .core-grid,
  .analysis-grid,
  .tools-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .feature-card {
    padding: 20px 24px;
  }

  .stats-section {
    padding: 40px 20px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .feature-card {
    flex-direction: column;
    text-align: center;
  }

  .card-icon {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .card-arrow {
    display: none;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>