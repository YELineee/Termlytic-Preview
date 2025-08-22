<template>
  <div class="w-full h-full bg-gray-900 rounded-lg p-4 flex flex-col border border-gray-800">
    <!-- Title -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
        <h3
          class="text-xs text-gray-400 uppercase tracking-wider font-medium dashboard-truncate-responsive"
        >
          <span class="responsive-hide-small">HOURLY ACTIVITY</span>
          <span class="hidden responsive-hide-small responsive-hide-xs">HOURLY</span>
          <span class="hidden responsive-hide-xs">HOUR</span>
        </h3>
      </div>
    </div>

    <!-- 图表容器 -->
    <div class="flex-1 flex flex-col">
      <!-- Main Values -->
      <div class="mb-4">
        <div class="text-3xl font-bold text-white mb-1">
          {{ formatMainValue(maxCommands) }}
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-400">/</span>
          <span class="text-xs text-blue-400 uppercase tracking-wider">{{ getTimeUnit() }}</span>
        </div>
      </div>

      <!-- EChart 图表区域 -->
      <div class="flex-1 min-h-0">
        <EChartWrapper v-if="!loading" :option="chartOption" width="100%" height="100%" />
        <div v-else class="flex items-center justify-center h-full">
          <div class="text-xs text-gray-400">Loading...</div>
        </div>
      </div>
    </div>

    <!-- Statistics信息 -->
    <div class="flex items-center justify-between text-xs mt-4 pt-3 border-t border-gray-800">
      <span class="text-gray-500">Peak: {{ mostActiveHour }}:00</span>
      <span class="text-gray-300">{{ averagePerHour }}/H</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import EChartWrapper from '../wrapper/EChartWrapper.vue'
import dataCenter from '../../utils/dataProcessingCenter.js'

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

// EChart 配置
const chartOption = computed(() => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1F2937',
      borderColor: '#374151',
      borderWidth: 1,
      textStyle: {
        color: '#F9FAFB',
        fontSize: 12
      },
      formatter: function (params) {
        const point = params[0]
        return `<div style="padding: 4px;">
          <div style="color: #3B82F6; font-weight: bold;">${point.name}</div>
          <div style="margin-top: 4px;">${point.value} commands</div>
        </div>`
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLabel: {
        fontSize: 9,
        color: '#6B7280',
        interval: 3, // 只显示每4个小时的标签 (0, 6, 12, 18)
        rotate: 0
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
      show: false,
      axisLabel: {
        fontSize: 10,
        color: '#6B7280'
      }
    },
    series: [
      {
        data: Array.isArray(commands.value) ? commands.value : Array(24).fill(0),
        type: 'bar',
        barWidth: '70%',
        itemStyle: {
          color: function (params) {
            const value = params.value
            const max = maxCommands.value || 1
            const intensity = value / max

            // 根据强度返回不同的蓝色渐变
            if (intensity === 0) return '#374151' // gray-700
            if (intensity < 0.2) return '#1E3A8A' // blue-800
            if (intensity < 0.4) return '#1D4ED8' // blue-700
            if (intensity < 0.6) return '#2563EB' // blue-600
            if (intensity < 0.8) return '#3B82F6' // blue-500
            return '#60A5FA' // blue-400
          },
          borderRadius: [2, 2, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: '#60A5FA', // blue-400
            shadowBlur: 10,
            shadowColor: '#3B82F6'
          }
        },
        animationDelay: function (idx) {
          return idx * 20 // 每个柱子延迟20ms动画
        }
      }
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }
})

// 格式化主要数值
const formatMainValue = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1)
  }
  return num.toString()
}

// Get时间单位
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
    
    // 验证返回Data的格式
    if (hourlyStats && Array.isArray(hourlyStats.data)) {
      commands.value = hourlyStats.data
      mostActiveHour.value = hourlyStats.mostActive || 0
      totalCommands.value = hourlyStats.total || 0
    } else {
      console.warn('Invalid hourly stats format:', hourlyStats)
      // 使用默认值
      commands.value = Array(24).fill(0)
      mostActiveHour.value = 0
      totalCommands.value = 0
    }
  } catch (err) {
    console.error('Failed to load hourly stats:', err)
    // 确保有默认值
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
/* 保持简洁 */
</style>
