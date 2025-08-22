<template>
  <div class="flex-1 items-center justify-center w-full h-full bg-gray-950 min-h-0">
    <div class="grid grid-cols-4 grid-rows-5 gap-3 w-full h-full p-4 min-h-0 overflow-hidden">
      <!-- 左上：总体Statistics和今日Statistics - 高优先级，立即显示 -->
      <div class="grid grid-cols-1 grid-rows-2 gap-3 col-span-1 row-span-2 min-h-0">
        <div class="col-span-1 row-span-1 min-h-0">
          <ProgressiveLoader :delay="0" :priority="1" loading-text="Total Stats">
            <DashboardTotalStats />
          </ProgressiveLoader>
        </div>
        <div class="col-span-1 row-span-1 min-h-0">
          <ProgressiveLoader :delay="100" :priority="1" loading-text="Daily Stats">
            <DashboardDailyStats />
          </ProgressiveLoader>
        </div>
      </div>

      <!-- Time activity heatmap - medium priority -->
      <div class="col-span-1 row-span-2 min-h-0">
        <ProgressiveLoader :delay="200" :priority="2" loading-text="Hourly Activity">
          <DashboardHourlyActivity />
        </ProgressiveLoader>
      </div>

      <!-- 主要报告区域 - 高优先级 -->
      <div class="col-span-2 row-span-2 min-h-0">
        <ProgressiveLoader :delay="150" :priority="1" loading-text="Main Report">
          <DashboardRepor />
        </ProgressiveLoader>
      </div>

      <!-- Extreme value statistics - medium priority -->
      <div class="col-span-1 row-span-1 min-h-0">
        <ProgressiveLoader :delay="300" :priority="2" loading-text="Extreme Stats">
          <DashboardExtremeStats />
        </ProgressiveLoader>
      </div>

      <!-- Recent commands - medium priority -->
      <div class="col-span-1 row-span-3 min-h-0">
        <ProgressiveLoader :delay="250" :priority="2" loading-text="Recent Commands">
          <DashboardRecently />
        </ProgressiveLoader>
      </div>

      <!-- Top CommandStatistics - 高优先级 -->
      <div class="col-span-1 row-span-2 min-h-0">
        <ProgressiveLoader :delay="50" :priority="1" loading-text="Top Commands">
          <DashboardTopCommands />
        </ProgressiveLoader>
      </div>

      <!-- Terminal distribution statistics - medium priority -->
      <div class="col-span-1 row-span-2 min-h-0">
        <ProgressiveLoader :delay="350" :priority="2" loading-text="Shell Distribution">
          <DashboardShellDistribution />
        </ProgressiveLoader>
      </div>

      <!-- 星期活跃Distribution - 低优先级 -->
      <div class="col-span-1 row-span-2 min-h-0">
        <ProgressiveLoader :delay="400" :priority="3" loading-text="Weekly Activity">
          <DashboardWeeklyActivity />
        </ProgressiveLoader>
      </div>

      <!-- 预留扩展区域 - 静态内容，立即显示 -->
      <div
        class="bg-gray-900 rounded-lg col-span-2 row-span-1 flex items-center justify-center border border-gray-800 min-h-0"
      >
        <div class="text-center">
          <div class="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">
            CUSTOM DASHBOARD
          </div>
          <div class="text-2xl text-gray-600">+</div>
          <div class="text-xs text-gray-500 mt-1">ADD WIDGET</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import ProgressiveLoader from './common/ProgressiveLoader.vue'
import DashboardTotalStats from './dashboard/DashboardTotalStats.vue'
import DashboardRepor from './dashboard/DashboardRepor.vue'
import DashboardRecently from './dashboard/DashboardRecently.vue'
import DashboardDailyStats from './dashboard/DashboardDailyStats.vue'
import DashboardHourlyActivity from './dashboard/DashboardHourlyActivity.vue'
import DashboardExtremeStats from './dashboard/DashboardExtremeStats.vue'
import DashboardTopCommands from './dashboard/DashboardTopCommands.vue'
import DashboardShellDistribution from './dashboard/DashboardShellDistribution.vue'
import DashboardWeeklyActivity from './dashboard/DashboardWeeklyActivity.vue'
import { useLoadingState } from '@renderer/composables/useLoadingState.js'
import { onMounted, onUnmounted } from 'vue'

// 使用全局Load状态管理
const { setGlobalLoading } = useLoadingState()

// 页面生命周期管理
onMounted(() => {
  console.log('📊 Dashboard page mounted')
  setGlobalLoading('dashboard', true)
  
  // 3秒后自动清除仪表板Load状态
  setTimeout(() => {
    setGlobalLoading('dashboard', false)
    console.log('✅ Dashboard loading completed')
  }, 3000)
})

onUnmounted(() => {
  console.log('📊 Dashboard page unmounted')
  setGlobalLoading('dashboard', false)
})
</script>

<style>
/* Tailwind 已经处理大部分样式 */
</style>
