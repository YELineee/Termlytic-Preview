<template>
  <div class="w-full h-full bg-gray-900 rounded-lg border border-gray-800 flex flex-col">
    <!-- Title and time range selection -->
    <div class="flex items-center justify-between p-4 border-b border-gray-700">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
        <h3 class="text-sm font-medium text-white uppercase tracking-wider">COMMAND ANALYTICS</h3>
      </div>

      <div class="flex items-center space-x-2">
        <div
          v-for="option in timeRangeOptions"
          :key="option.value"
          @click="switchTimeRange(option.value)"
          :class="[
            'px-3 py-1 rounded text-xs font-medium transition-all duration-200 cursor-pointer',
            selectedTimeRange === option.value
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700'
          ]"
          :disabled="loading"
        >
          {{ option.label }}
        </div>
        <div v-if="loading" class="flex items-center text-gray-500">
          <i class="fas fa-sync-alt animate-spin text-xs mr-2"></i>
          <span class="text-xs">Loading...</span>
        </div>
      </div>
    </div>

    <div class="flex-1 flex p-4 gap-4 min-h-0">
      <!-- Statistics data area -->
      <div class="w-1/3 flex flex-col justify-center min-h-0">
        <div
          class="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center h-full flex flex-col justify-center"
        >
          <div class="mb-4">
            <div class="text-4xl font-bold text-white mb-2">{{ currentStats.total }}</div>
            <div class="text-sm text-gray-400 uppercase tracking-wider">Total Commands</div>
          </div>

          <div class="border-t border-gray-700 pt-4">
            <div class="grid grid-cols-1 gap-3">
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">Unique Commands</span>
                <span class="text-sm font-medium text-orange-400">{{
                  currentStats.uniqueCommands || 0
                }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-400">Period</span>
                <span class="text-sm font-medium text-gray-300">{{ getTimeRangeLabel() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart area -->
      <div class="flex-1 relative min-h-0">
        <div class="bg-gray-800 border border-gray-700 rounded-lg h-full p-4 min-h-0">
          <div
            v-if="loading"
            class="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-90 rounded-lg"
          >
            <div class="text-center">
              <i class="fas fa-sync-alt animate-spin text-2xl text-gray-400 mb-2"></i>
              <div class="text-gray-400 text-sm">Loading chart data...</div>
            </div>
          </div>
          <div
            v-else-if="error"
            class="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-20 rounded-lg border border-red-800"
          >
            <div class="text-center">
              <i class="fas fa-exclamation-triangle text-2xl text-red-400 mb-2"></i>
              <div class="text-red-400 text-sm">{{ error }}</div>
              <button
                @click="refreshData"
                class="mt-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
          <EChartWrapper v-else :option="chartOption" width="100%" height="100%" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import EChartWrapper from '../wrapper/EChartWrapper.vue'
import { useDataService } from '@renderer/services/dataService.js'

// Use unified data service
const { dataService, isLoading: globalLoading, error: globalError } = useDataService()

// Reactive data
const selectedTimeRange = ref('week')
const loading = ref(false)
const error = ref('')
const statsData = ref({})

// Time range options
const timeRangeOptions = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' }
]

// Computed properties
const currentStats = computed(() => {
  const data = statsData.value[selectedTimeRange.value]
  if (!data) {
    return {
      title: 'Loading...',
      total: 0,
      uniqueCommands: 0
    }
  }

  const titles = {
    day: 'Today Statistics',
    week: 'This Week Statistics',
    month: 'This Month Statistics',
    year: 'This Year Statistics'
  }

  return {
    title: titles[selectedTimeRange.value] || 'Statistics',
    total: data.totalCount || 0,
    uniqueCommands: data.periodStats?.uniqueCommands || 0
  }
})

const chartOption = computed(() => {
  const data = statsData.value[selectedTimeRange.value]
  if (!data || !data.chartData) {
    return {
      backgroundColor: 'transparent',
      title: {
        text: 'No Data Available',
        textStyle: {
          color: '#9CA3AF',
          fontSize: 14
        },
        left: 'center',
        top: 'middle'
      },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: [{ data: [], type: 'bar' }]
    }
  }

  const { chartData } = data

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1F2937',
      borderColor: '#374151',
      borderWidth: 1,
      textStyle: {
        color: '#F9FAFB'
      },
      formatter: function (params) {
        const point = params[0]
        return `<div style="padding: 4px;">
          <div style="color: #F97316; font-weight: bold;">${point.name}</div>
          <div style="margin-top: 4px;">${point.value} commands</div>
        </div>`
      }
    },
    grid: {
      left: '8%',
      right: '5%',
      bottom: '15%', // Increase bottom margin for rotated labels
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.labels,
      axisLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        interval: 'auto', // Auto interval to prevent crowding
        rotate: chartData.labels.length > 8 ? 30 : 0, // Rotate if more than 8 labels
        margin: 8,
        formatter: function(value) {
          // Truncate long labels to prevent overlap
          return value.length > 10 ? value.substring(0, 8) + '...' : value
        }
      },
      axisLine: {
        lineStyle: {
          color: '#374151'
        }
      },
      axisTick: {
        lineStyle: {
          color: '#374151'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        formatter: '{value}'
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#374151',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        data: chartData.data,
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: '#F97316' // orange-500
              },
              {
                offset: 1,
                color: '#EA580C' // orange-600
              }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: '#EA580C' // orange-600
                },
                {
                  offset: 1,
                  color: '#C2410C' // orange-700
                }
              ]
            }
          }
        },
        animationDelay: function (idx) {
          return idx * 50
        }
      }
    ],
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut'
  }
})

// Get time range label
const getTimeRangeLabel = () => {
  const labels = {
    day: 'Today',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year'
  }
  return labels[selectedTimeRange.value] || 'Unknown'
}

// Refresh data
const refreshData = () => {
  loadTimeRangeData(selectedTimeRange.value, true)
}

// Methods
const loadTimeRangeData = async (timeRange, forceRefresh = false) => {
  try {
    loading.value = true
    error.value = ''

    console.log(`Loading data for time range: ${timeRange}`)

    // Use unified data service
    const result = await dataService.getTimeRangeStats(timeRange, forceRefresh)
    
    statsData.value[timeRange] = result
    console.log(`Data loaded for ${timeRange}:`, result)
  } catch (err) {
    console.error(`Failed to load ${timeRange} data:`, err)
    error.value = err.message || 'LoadDataFailed'
  } finally {
    loading.value = false
  }
}

const switchTimeRange = async (timeRange) => {
  if (timeRange === selectedTimeRange.value || loading.value) return

  selectedTimeRange.value = timeRange

  // If no cached data, then load
  if (!statsData.value[timeRange]) {
    await loadTimeRangeData(timeRange)
  }
}

// Lifecycle
onMounted(async () => {
  // Load this week data by default
  await loadTimeRangeData('week')
})
</script>

<style scoped>
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
