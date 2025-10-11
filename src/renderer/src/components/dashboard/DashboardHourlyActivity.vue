<template>
  <div class="card">
    <!-- Title -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <div
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: 'var(--textSecondary)' }"
        ></div>
        <h3
          class="text-xs text-secondary uppercase tracking-wider font-medium dashboard-truncate-responsive"
        >
          <span class="responsive-hide-small">HOURLY ACTIVITY</span>
          <span class="hidden responsive-hide-small responsive-hide-xs">HOURLY</span>
          <span class="hidden responsive-hide-xs">HOUR</span>
        </h3>
      </div>
    </div>

    <!-- Chart container -->
    <div class="flex-1 flex flex-col">
      <!-- Main Values -->
      <div class="mb-4">
        <div class="text-3xl font-bold text-primary mb-1">
          {{ formatMainValue(maxCommands) }}
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-secondary">/</span>
          <span class="text-xs accent-text uppercase tracking-wider">{{ getTimeUnit() }}</span>
        </div>
      </div>

      <!-- EChart chart area -->
      <div class="flex-1 min-h-0">
        <EChartWrapper v-if="!loading" :option="chartOption" width="100%" height="100%" />
        <div v-else class="flex items-center justify-center h-full">
          <div class="text-xs text-secondary">Loading...</div>
        </div>
      </div>
    </div>

    <!-- Statistics information -->
    <div class="flex items-center justify-between text-xs mt-4 pt-3 border-t border-divider">
      <span class="text-tertiary">Peak: {{ mostActiveHour }}:00</span>
      <span class="text-primary">{{ averagePerHour }}/H</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import EChartWrapper from '../wrapper/EChartWrapper.vue'
import dataCenter from '../../utils/dataProcessingCenter.js'
import { getIntensityColor } from '../../composables/useChartTheme'
import { useTheme } from '../../composables/useTheme'

const { currentThemeMode } = useTheme()

const commands = ref(Array(24).fill(0))
const loading = ref(false)
const mostActiveHour = ref(0)
const totalCommands = ref(0)

// Computed properties
const maxCommands = computed(() => {
  if (!Array.isArray(commands.value) || commands.value.length === 0) {
    return 0
  }
  return Math.max(...commands.value)
})
const averagePerHour = computed(() => Math.round(totalCommands.value / 24))

// EChart configuration
const chartOption = computed(() => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
  const isDark = currentThemeMode.value === 'dark'

  // Pre-calculate colors for use in callbacks
  const textColor = isDark ? '#9CA3AF' : '#6B7280'
  const labelColor = isDark ? '#D1D5DB' : '#374151'
  const tooltipBg = isDark ? '#1F2937' : '#FFFFFF'
  const tooltipBorder = isDark ? '#374151' : '#E5E7EB'
  const axisColor = isDark ? '#374151' : '#E5E7EB'

  // Pre-calculate max value for color intensity
  const maxValue = maxCommands.value || 1
  const dataArray = Array.isArray(commands.value) ? commands.value : Array(24).fill(0)

  // Dynamic font size - smaller for compact display
  const xAxisFontSize = 8
  const tooltipFontSize = 11

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: isDark ? '#F9FAFB' : '#111827',
        fontSize: tooltipFontSize
      },
      extraCssText: `
        box-shadow: ${
          isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        };
        border-radius: 6px;
        padding: 6px 10px;
      `,
      formatter: function (params) {
        const point = params[0]
        return `<div style="padding: 2px;">
          <div style="color: ${labelColor}; font-weight: 600; font-size: 11px;">${point.name}</div>
          <div style="margin-top: 2px; color: ${textColor}; font-size: 10px;">${point.value} commands</div>
        </div>`
      }
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '18%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLabel: {
        fontSize: xAxisFontSize,
        color: textColor,
        interval: 3, // Show every 4th hour (0, 6, 12, 18)
        rotate: 0,
        margin: 6
      },
      axisLine: {
        lineStyle: {
          color: axisColor,
          width: 1
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: axisColor,
          width: 1
        },
        length: 3
      }
    },
    yAxis: {
      type: 'value',
      show: false,
      splitNumber: 4
    },
    series: [
      {
        data: dataArray,
        type: 'bar',
        barWidth: '70%',
        itemStyle: {
          color: function (params) {
            const value = params.value
            return getIntensityColor(value, maxValue, isDark)
          },
          borderRadius: [2, 2, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: isDark ? '#FFFFFF' : '#000000',
            shadowBlur: 10,
            shadowColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
          }
        },
        animationDelay: function (idx) {
          return idx * 10
        }
      }
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }
})

// Format main values
const formatMainValue = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1)
  }
  return num.toString()
}

// Get time unit
const getTimeUnit = () => {
  const max = maxCommands.value || 0
  if (max >= 1000) {
    return 'K'
  }
  return 'HR'
}

// Load hourly distribution data (using optimized data center)
const loadHourlyStats = async () => {
  try {
    loading.value = true

    const hourlyStats = await dataCenter.getSpecificStats('hourly')

    // Validate return data format
    if (hourlyStats && Array.isArray(hourlyStats.data)) {
      commands.value = hourlyStats.data
      mostActiveHour.value = hourlyStats.mostActive || 0
      totalCommands.value = hourlyStats.total || 0
    } else {
      console.warn('Invalid hourly stats format:', hourlyStats)
      // Use default value
      commands.value = Array(24).fill(0)
      mostActiveHour.value = 0
      totalCommands.value = 0
    }
  } catch (err) {
    console.error('Failed to load hourly stats:', err)
    // Ensure default value
    commands.value = Array(24).fill(0)
    mostActiveHour.value = 0
    totalCommands.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadHourlyStats()
})
</script>

<style scoped>
/* Keep it simple */
</style>
