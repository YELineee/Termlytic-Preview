<template>
  <div class="flex-1 items-center justify-center w-full h-full min-h-0" 
       :style="{ backgroundColor: 'var(--bgPrimary)' }">
    <div class="grid grid-cols-4 grid-rows-5 gap-3 w-full h-full p-4 min-h-0 overflow-hidden">
      <!-- Top Left: Overall Statistics and Daily Statistics - High Priority, Show Immediately -->
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

      <!-- Main Report Area - High Priority -->
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

      <!-- Top Command Statistics - High Priority -->
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

      <!-- Weekly Activity Distribution - Low Priority -->
      <div class="col-span-1 row-span-2 min-h-0">
        <ProgressiveLoader :delay="400" :priority="3" loading-text="Weekly Activity">
          <DashboardWeeklyActivity />
        </ProgressiveLoader>
      </div>

      <!-- Reserved Extension Area - Static Content, Show Immediately -->
      <div
        class="rounded-lg col-span-2 row-span-1 flex items-center justify-center min-h-0"
        :style="{ 
          backgroundColor: 'var(--bgSecondary)', 
          border: '1px solid var(--borderPrimary)' 
        }"
      >
        <div class="text-center">
          <div class="text-xs uppercase tracking-wider font-medium mb-2"
               :style="{ color: 'var(--textTertiary)' }">
            CUSTOM DASHBOARD
          </div>
          <div class="text-2xl" :style="{ color: 'var(--textMuted)' }">+</div>
          <div class="text-xs mt-1" :style="{ color: 'var(--textMuted)' }">ADD WIDGET</div>
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

// Use global loading state management
const { setGlobalLoading } = useLoadingState()

// Page lifecycle management
onMounted(() => {
  console.log('📊 Dashboard page mounted')
  setGlobalLoading('dashboard', true)
  
  // Automatically clear dashboard loading state after 3 seconds
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
/* Tailwind handles most styles */
</style>
