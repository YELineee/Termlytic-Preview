<template>
  <div class="card h-full flex-col">
    <!-- Title - fixed, no scroll -->
    <h4 class="text-md font-medium mb-4 flex items-center shrink-0" :style="{ color: 'var(--textPrimary)' }">
      <div class="w-2 h-2 rounded-full mr-2" :style="{ backgroundColor: 'var(--textSecondary)' }"></div>
      Statistics Analysis
      <span v-if="selectedDate" class="ml-2 text-sm" :style="{ color: 'var(--textTertiary)' }">
        {{ selectedDate.formattedDate }}
      </span>
    </h4>

    <!-- No data state -->
    <div
      v-if="!selectedDate || !selectedDate.stats"
      class="flex-1 flex flex-col items-center justify-center"
      :style="{ color: 'var(--textTertiary)' }"
    >
      <svg class="w-12 h-12 mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
      <div>{{ !selectedDate ? 'Click on heatmap to select a date' : 'No data available' }}</div>
    </div>

    <!-- Statistics content - scrollable -->
    <div v-else class="flex-1 min-h-0 overflow-y-auto">
      <div class="space-y-6">
        <!-- Terminal type distribution -->
        <div v-if="shellStats.length > 0" class="rounded-lg p-4" :style="{ backgroundColor: 'var(--bgTertiary)', border: '1px solid var(--borderSecondary)' }">
          <div class="text-sm font-medium mb-3 flex items-center" :style="{ color: 'var(--textPrimary)' }">
            <div class="w-1.5 h-1.5 rounded-full mr-2" :style="{ backgroundColor: 'var(--textSecondary)' }"></div>
            Terminal Distribution
          </div>
          <div class="space-y-3">
            <div
              v-for="stat in shellStats"
              :key="stat.shell"
              class="flex items-center justify-between"
            >
              <div class="flex items-center flex-1">
                <span class="text-xs font-medium uppercase w-12" :style="{ color: 'var(--textSecondary)' }">
                  {{ stat.shell }}
                </span>
                <div class="flex-1 mx-3 rounded-full h-2" :style="{ backgroundColor: 'var(--bgSecondary)' }">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :style="{ 
                      width: `${stat.percentage}%`,
                      backgroundColor: getShellGradient(stat.shell)
                    }"
                  ></div>
                </div>
              </div>
              <div class="flex items-center ml-2">
                <span class="text-sm font-bold w-10 text-right" :style="{ color: 'var(--textPrimary)' }">{{ stat.count }}</span>
                <span class="text-xs ml-2 w-12 text-right" :style="{ color: 'var(--textTertiary)' }">{{ stat.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Command category statistics -->
        <div v-if="categoryStats.length > 0" class="rounded-lg p-4" :style="{ backgroundColor: 'var(--bgTertiary)', border: '1px solid var(--borderSecondary)' }">
          <div class="text-sm font-medium mb-3 flex items-center" :style="{ color: 'var(--textPrimary)' }">
            <div class="w-1.5 h-1.5 rounded-full mr-2" :style="{ backgroundColor: 'var(--textSecondary)' }"></div>
            Command Categories
          </div>
          <EChartWrapper :option="pieChartOption" height="200px" />
        </div>

        <!-- Time distribution heatmap -->
        <div v-if="hourlyDistribution.length > 0" class="rounded-lg p-4" :style="{ backgroundColor: 'var(--bgTertiary)', border: '1px solid var(--borderSecondary)' }">
          <div class="text-sm font-medium mb-3 flex items-center" :style="{ color: 'var(--textPrimary)' }">
            <div class="w-1.5 h-1.5 rounded-full mr-2" :style="{ backgroundColor: 'var(--textSecondary)' }"></div>
            24-Hour Activity
          </div>
          <div class="grid grid-cols-8 gap-2">
            <div v-for="(count, hour) in hourlyDistribution" :key="hour" class="relative group">
              <div
                class="w-full h-12 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
                :style="getHourIntensityStyle(count, maxHourlyCount)"
                :title="`${String(hour).padStart(2, '0')}:00 - ${count} commands`"
              >
                <div class="text-xs font-bold opacity-90">{{ String(hour).padStart(2, '0') }}</div>
                <div class="text-xs opacity-70 mt-0.5">{{ count || '-' }}</div>
              </div>
            </div>
          </div>
          <div class="text-xs mt-3 flex items-center justify-between" :style="{ color: 'var(--textTertiary)' }">
            <span>Peak: {{ peakHour }}:00</span>
            <span>{{ maxHourlyCount }} commands</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import EChartWrapper from '../wrapper/EChartWrapper.vue'
import { useTheme } from '../../composables/useTheme'

const { currentTheme } = useTheme()

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
    Others: { count: 0, color: '#9CA3AF', commands: [] }
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
  const isDark = currentTheme.value === 'dark'
  
  // Pre-calculate colors
  const tooltipBg = isDark ? '#1F2937' : '#FFFFFF'
  const tooltipBorder = isDark ? '#374151' : '#E5E7EB'
  const tooltipTextColor = isDark ? '#F3F4F6' : '#111827'
  const labelColor = isDark ? '#D1D5DB' : '#4B5563'
  const pieColors = isDark
    ? ['#F3F4F6', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151']
    : ['#111827', '#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF']
  const shadowColor = isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)'
  
  // Dynamic font size based on category count
  const categoryCount = categoryStats.value.length
  const labelFontSize = categoryCount > 6 ? 10 : 11
  const tooltipFontSize = 11

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: tooltipTextColor,
        fontSize: tooltipFontSize
      },
      extraCssText: `
        box-shadow: ${isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
        border-radius: 6px;
        padding: 6px 10px;
      `,
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [
      {
        name: 'Command Categories',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '40%'],
        data: categoryStats.value.map((item, index) => ({
          value: item.count,
          name: item.name,
          itemStyle: {
            color: pieColors[index % pieColors.length]
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: shadowColor
          }
        },
        labelLine: {
          show: false
        },
        label: {
          show: true,
          position: 'center',
          fontSize: labelFontSize,
          color: labelColor
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
const getShellGradient = (shell) => {
  // 使用灰度渐变，从深到浅
  const gradients = {
    bash: '#9CA3AF',    // gray-400
    zsh: '#6B7280',     // gray-500
    fish: '#4B5563',    // gray-600
    sh: '#374151'       // gray-700
  }
  return gradients[shell.toLowerCase()] || '#9CA3AF'
}

const getHourIntensityStyle = (count, max) => {
  if (!count || count === 0) {
    return {
      backgroundColor: 'var(--bgSecondary)',
      color: 'var(--textMuted)',
      border: '1px solid var(--borderSecondary)'
    }
  }

  const ratio = count / max
  // 使用灰度，根据强度调整
  let bgColor, textColor
  
  if (ratio >= 0.8) {
    bgColor = '#374151'  // gray-700
    textColor = '#F3F4F6' // gray-100
  } else if (ratio >= 0.6) {
    bgColor = '#4B5563'  // gray-600
    textColor = '#F3F4F6'
  } else if (ratio >= 0.4) {
    bgColor = '#6B7280'  // gray-500
    textColor = '#F9FAFB'
  } else if (ratio >= 0.2) {
    bgColor = '#9CA3AF'  // gray-400
    textColor = '#1F2937'
  } else {
    bgColor = '#D1D5DB'  // gray-300
    textColor = '#374151'
  }
  
  return {
    backgroundColor: bgColor,
    color: textColor,
    border: '1px solid var(--borderSecondary)'
  }
}
</script>

<style scoped>
/* Hide scrollbar but keep scroll functionality */
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
