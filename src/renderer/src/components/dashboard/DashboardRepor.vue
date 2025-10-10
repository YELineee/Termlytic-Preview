<template>
  <div class="card flex-col">
    <!-- Title and time range selection -->
    <div class="flex items-center justify-between p-4 border-b border-divider">
      <div class="flex items-center space-x-2">
        <div
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: 'var(--textSecondary)' }"
        ></div>
        <h3 class="text-sm font-medium text-primary uppercase tracking-wider">COMMAND ANALYTICS</h3>
      </div>

      <div class="flex items-center space-x-2">
        <div
          v-for="option in timeRangeOptions"
          :key="option.value"
          @click="switchTimeRange(option.value)"
          :class="[
            'px-3 py-1 rounded text-xs font-medium transition-all duration-200 cursor-pointer',
            selectedTimeRange === option.value
              ? 'btn-primary shadow-sm'
              : 'bg-secondary text-secondary hover:text-primary hover:bg-hover border border-divider'
          ]"
          :disabled="loading"
        >
          {{ option.label }}
        </div>
        <div v-if="loading" class="flex items-center text-tertiary">
          <i class="fas fa-sync-alt animate-spin text-xs mr-2"></i>
          <span class="text-xs">Loading...</span>
        </div>
      </div>
    </div>

    <div class="flex-1 flex p-4 gap-4 min-h-0">
      <!-- Statistics data area -->
      <div class="w-1/3 flex flex-col justify-center min-h-0">
        <div
          class="bg-secondary border border-divider rounded-lg p-6 text-center h-full flex flex-col justify-center"
        >
          <div class="mb-4">
            <div class="text-4xl font-bold text-primary mb-2">{{ currentStats.total }}</div>
            <div class="text-sm text-secondary uppercase tracking-wider">Total Commands</div>
          </div>

          <div class="border-t border-divider pt-4">
            <div class="grid grid-cols-1 gap-3">
              <div class="flex justify-between items-center">
                <span class="text-xs text-secondary">Unique Commands</span>
                <span class="text-sm font-medium accent-text">{{
                  currentStats.uniqueCommands || 0
                }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-secondary">Period</span>
                <span class="text-sm font-medium text-primary">{{ getTimeRangeLabel() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chart area -->
      <div class="flex-1 relative min-h-0">
        <div class="bg-secondary border border-divider rounded-lg h-full p-4 min-h-0">
          <div
            v-if="loading"
            class="absolute inset-0 flex items-center justify-center bg-secondary bg-opacity-90 rounded-lg"
          >
            <div class="text-center">
              <i class="fas fa-sync-alt animate-spin text-2xl text-secondary mb-2"></i>
              <div class="text-secondary text-sm">Loading chart data...</div>
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
import { ref, computed, watch, onMounted } from 'vue'
import EChartWrapper from '../wrapper/EChartWrapper.vue'
import { DataService } from '../../services/dataService.js'
import { useTheme } from '../../composables/useTheme'

const { currentTheme } = useTheme()

// Create dataService instance
const dataService = new DataService()

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
  const isDark = currentTheme.value === 'dark'

  // Pre-calculate colors for use in callbacks
  const textColor = isDark ? '#9CA3AF' : '#6B7280'
  const labelColor = isDark ? '#D1D5DB' : '#374151'
  const tooltipBg = isDark ? '#1F2937' : '#FFFFFF'
  const tooltipBorder = isDark ? '#374151' : '#E5E7EB'
  const tooltipTextColor = isDark ? '#F9FAFB' : '#111827'
  const axisColor = isDark ? '#374151' : '#E5E7EB'

  if (!data || !data.chartData) {
    return {
      backgroundColor: 'transparent',
      title: {
        text: 'No Data Available',
        textStyle: {
          color: textColor,
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

  // Dynamic font size based on label count
  const labelCount = chartData.labels.length
  const fontSize = labelCount > 12 ? 8 : labelCount > 8 ? 9 : 10
  const yAxisFontSize = labelCount > 12 ? 9 : 10
  const shouldRotate = labelCount > 10
  const rotateAngle = labelCount > 15 ? 45 : labelCount > 10 ? 30 : 0

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: tooltipTextColor,
        fontSize: 12
      },
      extraCssText: `
        box-shadow: ${
          isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        };
        border-radius: 6px;
        padding: 8px 12px;
      `,
      formatter: function (params) {
        const point = params[0]
        return `<div style="padding: 4px;">
          <div style="color: ${labelColor}; font-weight: 600;">${point.name}</div>
          <div style="margin-top: 4px; color: ${textColor};">${point.value} commands</div>
        </div>`
      }
    },
    grid: {
      left: '8%',
      right: '5%',
      bottom: shouldRotate ? '20%' : '15%', // More space when rotated
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.labels,
      axisLabel: {
        fontSize: fontSize,
        color: isDark ? '#9CA3AF' : '#6B7280',
        interval: labelCount > 20 ? Math.floor(labelCount / 12) : 'auto',
        rotate: rotateAngle,
        margin: 8,
        formatter: function (value) {
          // Adaptive truncation based on label count
          const maxLength = labelCount > 15 ? 6 : labelCount > 10 ? 8 : 10
          return value.length > maxLength ? value.substring(0, maxLength - 2) + '..' : value
        }
      },
      axisLine: {
        lineStyle: {
          color: isDark ? '#374151' : '#E5E7EB'
        }
      },
      axisTick: {
        lineStyle: {
          color: isDark ? '#374151' : '#E5E7EB'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: yAxisFontSize,
        color: isDark ? '#9CA3AF' : '#6B7280',
        formatter: function (value) {
          // Format large numbers
          if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k'
          }
          return value
        }
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: isDark ? '#374151' : '#E5E7EB',
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
                color: isDark ? '#D1D5DB' : '#4B5563'
              },
              {
                offset: 1,
                color: isDark ? '#9CA3AF' : '#374151'
              }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: isDark ? '#FFFFFF' : '#000000',
            shadowBlur: 10,
            shadowColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
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

    // Use DataService to get time range stats
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
