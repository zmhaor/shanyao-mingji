<script lang="ts" setup>
import type { ToolStats, UserStats, UserToolUsage } from "@/common/apis/admin/stats/index"
import { Refresh, Timer, Tools, User, UserFilled } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { computed, onMounted, ref } from "vue"
import { statsApi } from "@/common/apis/admin/stats/index"

const loading = ref(false)
const userStats = ref<UserStats>({ total: 0, active: 0, newToday: 0, newThisWeek: 0, newThisMonth: 0, activeDuration: 0 })
const toolStats = ref<ToolStats>({ totalDuration: 0, topTools: [] })
const userToolUsage = ref<UserToolUsage[]>([])

// 热门工具名称
const topToolName = computed(() => {
  return toolStats.value.topTools?.[0]?.name || "暂无"
})

// 格式化停留时长
function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0秒"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}小时${m}分`
  if (m > 0) return `${m}分${s}秒`
  return `${s}秒`
}

// 加载所有统计数据
async function loadAllStats() {
  loading.value = true
  try {
    // 并行请求所有统计数据
    const [userRes, toolRes, usageRes] = await Promise.all([
      statsApi.getUserStats(),
      statsApi.getToolStats(),
      statsApi.getUserToolUsage()
    ])

    userStats.value = userRes.data
    toolStats.value = toolRes.data
    userToolUsage.value = usageRes.data?.userUsage || []
  } catch (error: any) {
    ElMessage.error("加载统计数据失败")
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAllStats()
})
</script>

<template>
  <div class="stats-manager">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据统计</span>
          <el-button type="primary" @click="loadAllStats">
            <el-icon><Refresh /></el-icon> 刷新数据
          </el-button>
        </div>
      </template>

      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-card class="stats-card" shadow="hover">
          <div class="stats-card-header">
            <span class="stats-card-title">总用户数</span>
            <el-icon class="stats-card-icon">
              <User />
            </el-icon>
          </div>
          <div class="stats-card-value">
            {{ userStats.total || 0 }}
          </div>
          <div class="stats-card-footer">
            <span class="stats-card-label">今日新增: {{ userStats.newToday || 0 }}</span>
            <span class="stats-card-label">本周新增: {{ userStats.newThisWeek || 0 }}</span>
          </div>
        </el-card>

        <el-card class="stats-card" shadow="hover">
          <div class="stats-card-header">
            <span class="stats-card-title">活跃用户</span>
            <el-icon class="stats-card-icon">
              <UserFilled />
            </el-icon>
          </div>
          <div class="stats-card-value">
            {{ userStats.active || 0 }}
          </div>
          <div class="stats-card-footer">
            <span class="stats-card-label">本月新增: {{ userStats.newThisMonth || 0 }}</span>
            <span class="stats-card-label">近7天停留: {{ formatDuration(userStats.activeDuration) }}</span>
          </div>
        </el-card>

        <el-card class="stats-card" shadow="hover">
          <div class="stats-card-header">
            <span class="stats-card-title">工具停留总时长</span>
            <el-icon class="stats-card-icon">
              <Tools />
            </el-icon>
          </div>
          <div class="stats-card-value">
            {{ formatDuration(toolStats.totalDuration) }}
          </div>
          <div class="stats-card-footer">
            <span class="stats-card-label">热门工具: {{ topToolName }}</span>
          </div>
        </el-card>

        <el-card class="stats-card" shadow="hover">
          <div class="stats-card-header">
            <span class="stats-card-title">工具使用总次数</span>
            <el-icon class="stats-card-icon">
              <Timer />
            </el-icon>
          </div>
          <div class="stats-card-value">
            {{ toolStats.topTools?.reduce((sum, t) => sum + (t.uses || 0), 0) || 0 }}
          </div>
          <div class="stats-card-footer">
            <span class="stats-card-label">热门工具: {{ topToolName }}</span>
          </div>
        </el-card>
      </div>

      <!-- 图表区域 -->
      <div class="charts-container">
        <!-- 工具使用统计 -->
        <el-card class="chart-card">
          <template #header>
            <span>工具使用统计</span>
          </template>
          <div class="chart-content">
            <el-table :data="toolStats.topTools || []" v-loading="loading">
              <el-table-column prop="name" label="工具名称" width="150" />
              <el-table-column prop="uses" label="使用次数" width="100" />
              <el-table-column prop="duration" label="停留时长" width="120">
                <template #default="{ row }">
                  {{ formatDuration(row.duration) }}
                </template>
              </el-table-column>
              <el-table-column prop="percentage" label="占比" width="100">
                <template #default="{ row }">
                  {{ row.percentage }}%
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

        <!-- 用户工具使用时长排行 -->
        <el-card class="chart-card">
          <template #header>
            <span>用户使用时长排行</span>
          </template>
          <div class="chart-content">
            <el-table :data="userToolUsage" v-loading="loading">
              <el-table-column type="index" label="排名" width="70" />
              <el-table-column prop="nickname" label="用户" width="130" />
              <el-table-column prop="totalDuration" label="总时长" width="120">
                <template #default="{ row }">
                  {{ formatDuration(row.totalDuration) }}
                </template>
              </el-table-column>
              <el-table-column prop="totalVisits" label="访问次数" width="100" />
            </el-table>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.stats-manager {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stats-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.stats-card-title {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.stats-card-icon {
  font-size: 24px;
  color: #409eff;
}

.stats-card-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin: 20px 0;
}

.stats-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #909399;
}

.stats-card-label {
  margin-right: 10px;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
}

.chart-card {
  height: 100%;
}

.chart-content {
  min-height: 300px;
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .charts-container {
    grid-template-columns: 1fr;
  }
}
</style>
