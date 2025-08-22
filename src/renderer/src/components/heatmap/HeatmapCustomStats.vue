<template>
  <div class="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
    <!-- Title - fixed, no scroll -->
    <h4 class="text-md font-medium text-gray-200 mb-3 flex items-center shrink-0">
      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path
          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
        />
      </svg>
      StatisticsAnalysis
      <span v-if="selectedDate" class="ml-2 text-sm text-gray-400">
        ({{ selectedDate.formattedDate }})
      </span>
    </h4>

    <!-- No data state -->
    <div
      v-if="!selectedDate || !selectedDate.stats"
      class="flex-1 text-gray-400 flex flex-col items-center justify-center"
    >
      <svg class="w-12 h-12 mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
      <div>{{ !selectedDate ? 'Please click on the heatmap to select a date' : 'No statistics data available' }}</div>
    </div>

    <!-- Statistics content - scrollable -->
    <div v-else class="flex-1 min-h-0 overflow-y-auto">
      <div class="space-y-6">
        <!-- Terminal type distribution -->
        <div v-if="shellStats.length > 0">
          <div class="text-sm text-gray-300 mb-3 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                clip-rule="evenodd"
              />
            </svg>
            Terminal Type Distribution
          </div>
          <div class="space-y-2">
            <div
              v-for="stat in shellStats"
              :key="stat.shell"
              class="flex items-center justify-between text-sm"
            >
              <div class="flex items-center">
                <span
                  class="inline-block w-3 h-3 rounded-full mr-2"
                  :class="getShellColor(stat.shell)"
                ></span>
                <span class="text-gray-300 font-medium">{{ stat.shell.toUpperCase() }}</span>
              </div>
              <div class="flex items-center">
                <div class="w-20 bg-gray-700 rounded-full h-2 mr-3">
                  <div
                    class="h-2 rounded-full"
                    :class="getShellColor(stat.shell)"
                    :style="{ width: `${stat.percentage}%` }"
                  ></div>
                </div>
                <span class="text-gray-300 w-8 text-right font-medium">{{ stat.count }}</span>
                <span class="text-gray-500 text-xs ml-1">({{ stat.percentage }}%)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Command category statistics -->
        <div v-if="categoryStats.length > 0">
          <div class="text-sm text-gray-300 mb-3 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fill-rule="evenodd"
                d="M4 5a2 2 0 012-2v1a1 1 0 001 1h6a1 1 0 001-1V3a2 2 0 012 2v6.5a1.5 1.5 0 01-1.5 1.5H13v.5a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 017 13v-.5H5.5A1.5 1.5 0 014 11.5V5zm7 2V6H9v1h2zm-2 3h2v1H9v-1zm2 3H9v1h2v-1z"
                clip-rule="evenodd"
              />
            </svg>
            Command Category Statistics
          </div>
          <EChartWrapper :option="pieChartOption" height="200px" />
        </div>

        <!-- Time distribution heatmap -->
        <div v-if="hourlyDistribution.length > 0">
          <div class="text-sm text-gray-300 mb-3 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clip-rule="evenodd"
              />
            </svg>
            24-Hour Activity Distribution
          </div>
          <div class="grid grid-cols-12 gap-1">
            <div v-for="(count, hour) in hourlyDistribution" :key="hour" class="relative group">
              <div
                class="w-full h-8 rounded text-xs flex flex-col items-center justify-center cursor-pointer"
                :class="getHourIntensityClass(count, maxHourlyCount)"
                :title="`${String(hour).padStart(2, '0')}:00 - ${count}  commands`"
              >
                <div class="text-xs font-medium">{{ String(hour).padStart(2, '0') }}</div>
                <div class="text-xs opacity-80">{{ count || '' }}</div>
              </div>
            </div>
          </div>
          <div class="text-xs text-gray-500 mt-2 text-center">
            Peak hours: {{ peakHour }}:00 ({{ maxHourlyCount }}  commands)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import EChartWrapper from '../wrapper/EChartWrapper.vue'

// Props
const props = defineProps({
  selectedDate: {
    type: Object,
    default: null
  }
})

// Computed properties
const shellStats = computed(() => {
  if (!props.selectedDate?.stats?.shellStats) return []

  const stats = props.selectedDate.stats.shellStats
  const total = Object.values(stats).reduce((sum, count) => sum + count, 0)

  return Object.entries(stats)
    .map(([shell, count]) => ({
      shell,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
})

const categoryStats = computed(() => {
  if (!props.selectedDate?.commands) return []

  const categories = {
    'File Operations': {
      count: 0,
      color: '#60A5FA',
      commands: ['ls', 'cd', 'pwd', 'mkdir', 'rmdir', 'rm', 'cp', 'mv', 'find', 'locate', 'tree']
    },
    'Development Tools': {
      count: 0,
      color: '#C084FC',
      commands: [
        'git',
        'npm',
        'yarn',
        'node',
        'python',
        'java',
        'gcc',
        'make',
        'cmake',
        'docker',
        'code'
      ]
    },
    'System Management': {
      count: 0,
      color: '#F87171',
      commands: [
        'ps',
        'top',
        'htop',
        'kill',
        'killall',
        'sudo',
        'chmod',
        'chown',
        'systemctl',
        'service'
      ]
    },
    'Others': { count: 0, color: '#9CA3AF', commands: [] }
  }

  props.selectedDate.commands.forEach((cmd) => {
    const mainCommand = cmd.command.split(' ')[0]
    let categorized = false

    for (const [categoryName, category] of Object.entries(categories)) {
      if (categoryName === 'Others') continue
      if (category.commands.includes(mainCommand)) {
        category.count++
        categorized = true
        break
      }
    }

    if (!categorized) {
      categories['Others'].count++
    }
  })

  return Object.entries(categories)
    .map(([name, data]) => ({ name, count: data.count, color: data.color }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
})

const pieChartOption = computed(() => {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#374151',
      borderColor: '#6B7280',
      textStyle: {
        color: '#F3F4F6'
      },
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [
      {
        name: 'Command Categories',
        type: 'pie',
        radius: ['40%', '70%'], // Donut chart
        center: ['50%', '40%'],
        data: categoryStats.value.map((item) => ({
          value: item.count,
          name: item.name,
          itemStyle: {
            color: item.color
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        label: {
          show: true,
          position: 'center',
          fontSize: 12,
          color: '#D1D5DB'
        }
      }
    ]
  }
})

const hourlyDistribution = computed(() => {
  if (!props.selectedDate?.stats?.hourlyDistribution) return []
  return props.selectedDate.stats.hourlyDistribution
})

const maxHourlyCount = computed(() => {
  return Math.max(...hourlyDistribution.value, 1)
})

const peakHour = computed(() => {
  const maxCount = maxHourlyCount.value
  const peakIndex = hourlyDistribution.value.indexOf(maxCount)
  return peakIndex >= 0 ? String(peakIndex).padStart(2, '0') : '00'
})

// Methods
const getShellColor = (shell) => {
  const colors = {
    bash: 'bg-blue-500',
    zsh: 'bg-green-500',
    fish: 'bg-purple-500',
    sh: 'bg-gray-500'
  }
  return colors[shell.toLowerCase()] || 'bg-gray-400'
}

const getHourIntensityClass = (count, max) => {
  if (!count || count === 0) return 'bg-gray-700 text-gray-500'

  const ratio = count / max
  if (ratio >= 0.8) return 'bg-green-500 text-white'
  if (ratio >= 0.6) return 'bg-green-400 text-white'
  if (ratio >= 0.4) return 'bg-green-300 text-gray-800'
  if (ratio >= 0.2) return 'bg-green-200 text-gray-800'
  return 'bg-green-100 text-gray-700'
}
</script>

<style scoped>
/* 隐藏滚动条但保留滚动功能 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.5);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}
</style>
