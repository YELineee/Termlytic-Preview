<template>
  <div class="heatmap-card">
    <!-- Card Container -->
    <div class="bg-gray-900 border border-gray-700 rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
      <!-- Card Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
            <i class="fas fa-chart-area text-white text-xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-white">{{ cardName }}</h2>
            <p class="text-gray-400 text-sm">Activity Heatmap • Ticket #{{ ticketNumber }}</p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-3xl font-bold text-green-400">{{ totalCommands.toLocaleString() }}</div>
          <div class="text-gray-400 text-sm">Total Commands</div>
        </div>
      </div>

      <!-- Heatmap Area -->
      <div class="bg-gray-800 rounded-xl p-6 mb-6">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-white mb-2">Command Activity Heatmap</h3>
          <p class="text-gray-400 text-sm">{{ activeDays }} active days out of {{ daysInYear }} days ({{ year }})</p>
        </div>
        
        <!-- Heatmap Component -->
        <div class="flex justify-center">
          <HeatmapWrapper
            :data="heatmapData"
            :start-date="startDate"
            :end-date="endDate"
            :cell-size="12"
            :show-month-labels="true"
            :show-week-labels="true"
            :show-legend="true"
            unit="commands"
            :color-scheme="colorScheme"
          />
        </div>
      </div>

      <!-- Statistics Information Bar -->
      <div class="grid grid-cols-3 gap-6">
        <!-- Active Days -->
        <div class="bg-gray-800 rounded-xl p-6 text-center">
          <div class="text-2xl font-bold text-blue-400 mb-2">{{ activeDays }}</div>
          <div class="text-gray-400 text-sm">Active Days</div>
          <div class="text-xs text-gray-500 mt-1">
            {{ Math.round((activeDays / daysInYear) * 100) }}% of year
          </div>
        </div>

        <!-- Average Daily Commands -->
        <div class="bg-gray-800 rounded-xl p-6 text-center">
          <div class="text-2xl font-bold text-yellow-400 mb-2">{{ avgDailyCommands }}</div>
          <div class="text-gray-400 text-sm">Avg Daily</div>
          <div class="text-xs text-gray-500 mt-1">commands per day</div>
        </div>

        <!-- Maximum Daily Commands -->
        <div class="bg-gray-800 rounded-xl p-6 text-center">
          <div class="text-2xl font-bold text-red-400 mb-2">{{ maxDailyCommands }}</div>
          <div class="text-gray-400 text-sm">Peak Day</div>
          <div class="text-xs text-gray-500 mt-1">highest activity</div>
        </div>
      </div>

      <!-- Card Footer Information -->
      <div class="mt-8 pt-6 border-t border-gray-700 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="text-gray-400 text-sm">
            <i class="fas fa-calendar-alt mr-2"></i>
            Generated on {{ new Date().toLocaleDateString() }}
          </div>
        </div>
        <div class="text-gray-500 text-xs font-mono">
          HEATMAP-{{ ticketNumber }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import HeatmapWrapper from '../wrapper/HeatmapWrapper.vue'

// Props definition
const props = defineProps({
  ticketNumber: {
    type: String,
    required: true
  },
  cardName: {
    type: String,
    required: true
  },
  totalCommands: {
    type: Number,
    required: true
  },
  activeDays: {
    type: Number,
    required: true
  },
  heatmapData: {
    type: Array,
    default: () => []
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear()
  }
})

// Calculate year date range - dynamically calculate based on selected year
const startDate = computed(() => new Date(props.year, 0, 1)) // January 1st of selected year
const endDate = computed(() => new Date(props.year, 11, 31)) // December 31st of selected year

// Color scheme - green theme
const colorScheme = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']

// Calculate total days in the year (considering leap years)
const daysInYear = computed(() => {
  const year = props.year
  return ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365
})

// Calculate statistical data
const avgDailyCommands = computed(() => {
  if (props.activeDays === 0) return 0
  return Math.round(props.totalCommands / props.activeDays)
})

const maxDailyCommands = computed(() => {
  if (!props.heatmapData || props.heatmapData.length === 0) return 0
  return Math.max(...props.heatmapData.map(day => day.count || 0))
})
</script>

<style scoped>
.heatmap-card {
  font-family: system-ui, -apple-system, sans-serif;
  width: 100%;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Heatmap style overrides */
:deep(.intensity-0) {
  background-color: #161b22;
}

:deep(.intensity-1) {
  background-color: #0e4429;
}

:deep(.intensity-2) {
  background-color: #006d32;
}

:deep(.intensity-3) {
  background-color: #26a641;
}

:deep(.intensity-4) {
  background-color: #39d353;
}

/* Responsive design */
@media (max-width: 768px) {
  .heatmap-card {
    padding: 1rem;
  }
  
  .grid-cols-3 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
