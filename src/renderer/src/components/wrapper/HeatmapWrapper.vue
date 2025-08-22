<template>
  <div class="font-sans text-gray-400 text-xs overflow-visible" ref="containerRef">
    <!-- 热力图主体容器 -->
    <div class="flex flex-col gap-1">
      <!-- 月份标签行 -->
      <div v-if="showMonthLabels" class="flex items-center h-4">
        <div class="w-8 flex-shrink-0"></div>
        <div class="grid items-center flex-1" :style="monthLabelsStyle">
          <div
            v-for="month in monthLabels"
            :key="month.index"
            class="text-xs text-gray-400 font-normal leading-4"
            :style="{
              gridColumn: `${month.startWeek + 1} / span ${month.weekSpan}`,
              textAlign: 'left'
            }"
          >
            {{ month.name }}
          </div>
        </div>
      </div>

      <!-- 热力图内容区 -->
      <div class="flex items-start gap-1">
        <!-- 星期标签列 -->
        <div v-if="showWeekLabels" class="flex flex-col w-8 flex-shrink-0">
          <div
            class="flex items-center justify-center text-xs text-gray-400 font-normal mb-1"
            :style="{ height: `${props.cellSize}px` }"
          >
            Mon
          </div>
          <div
            class="flex items-center justify-center text-xs text-gray-400 font-normal mb-1"
            :style="{ height: `${props.cellSize}px` }"
          ></div>
          <div
            class="flex items-center justify-center text-xs text-gray-400 font-normal mb-1"
            :style="{ height: `${props.cellSize}px` }"
          >
            Wed
          </div>
          <div
            class="flex items-center justify-center text-xs text-gray-400 font-normal mb-1"
            :style="{ height: `${props.cellSize}px` }"
          ></div>
          <div
            class="flex items-center justify-center text-xs text-gray-400 font-normal mb-1"
            :style="{ height: `${props.cellSize}px` }"
          >
            Fri
          </div>
          <div
            class="flex items-center justify-center text-xs text-gray-400 font-normal mb-1"
            :style="{ height: `${props.cellSize}px` }"
          ></div>
          <div
            class="flex items-center justify-center text-xs text-gray-400 font-normal"
            :style="{ height: `${props.cellSize}px` }"
          ></div>
        </div>

        <!-- 热力图网格 -->
        <div class="grid grid-flow-col content-start" ref="gridRef" :style="gridStyle">
          <div
            v-for="(day, index) in heatmapData"
            :key="`day-${day.date}`"
            class="rounded-sm cursor-pointer transition-all duration-150 relative border border-gray-800 border-opacity-20"
            :class="[
              `intensity-${day.intensity}`,
              { 'cell-empty': day.isEmpty },
              { 'cell-hover': hoveredIndex === index }
            ]"
            :style="getCellStyle(day)"
            @mouseenter="handleCellHover(day, index, $event)"
            @mouseleave="handleCellLeave"
            @click="handleCellClick(day, index)"
            :data-date="day.date"
            :data-count="day.count"
            :title="`${day.formattedDate}: ${day.count} ${unit}`"
          ></div>
        </div>
      </div>
    </div>

    <!-- 强度图例 -->
    <div v-if="showLegend" class="flex items-center mt-4 ml-9 gap-1 text-xs">
      <span class="text-gray-400 text-xs">Less</span>
      <div class="flex gap-0.5 mx-1.5">
        <div
          v-for="level in 5"
          :key="level"
          class="w-2.5 h-2.5 rounded-sm border border-gray-800 border-opacity-20"
          :class="`intensity-${level - 1}`"
        ></div>
      </div>
      <span class="text-gray-400 text-xs">More</span>
    </div>

    <!-- Tooltip -->
    <Teleport to="body">
      <div
        v-if="tooltip.visible"
        ref="tooltipRef"
        class="fixed pointer-events-none z-50"
        :style="tooltip.style"
      >
        <div
          class="bg-black bg-opacity-90 text-white px-3 py-2 rounded-md text-xs leading-snug whitespace-nowrap shadow-2xl backdrop-blur-sm border border-white border-opacity-10"
        >
          <div class="font-semibold text-green-400 mb-0.5">
            <strong>{{ tooltip.count }} {{ tooltip.unit }}</strong>
          </div>
          <div class="text-gray-300 text-xs">{{ tooltip.date }}</div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

// Props 定义
const props = defineProps({
  // Data源 - 数组格式: [{ date: '2024-01-01', count: 5 }]
  data: {
    type: Array,
    default: () => []
  },
  // 开始日期
  startDate: {
    type: [String, Date],
    default: () => {
      const date = new Date()
      date.setMonth(date.getMonth() - 12) // 默认显示过去一年
      return date
    }
  },
  // 结束日期
  endDate: {
    type: [String, Date],
    default: () => new Date()
  },
  // 颜色方案 - 5个级别的颜色
  colorScheme: {
    type: Array,
    default: () => ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']
  },
  // 单元格尺寸
  cellSize: {
    type: Number,
    default: 11
  },
  // 单元格间距
  cellGap: {
    type: Number,
    default: 3
  },
  // 最大强度值（用于计算强度等级）
  maxIntensity: {
    type: Number,
    default: null
  },
  // Data单位
  unit: {
    type: String,
    default: 'contributions'
  },
  // 是否显示月份标签
  showMonthLabels: {
    type: Boolean,
    default: true
  },
  // 是否显示星期标签
  showWeekLabels: {
    type: Boolean,
    default: true
  },
  // 是否显示强度图例
  showLegend: {
    type: Boolean,
    default: true
  }
})

// Emits 定义
const emit = defineEmits(['cell-click', 'cell-hover', 'cell-leave'])

// Reactive data
const containerRef = ref(null)
const gridRef = ref(null)
const tooltipRef = ref(null)
const hoveredIndex = ref(-1)
const tooltip = ref({
  visible: false,
  style: {},
  count: 0,
  date: '',
  unit: props.unit
})

// Computed properties - 热力图Data
const heatmapData = computed(() => {
  const result = []
  const start = new Date(props.startDate)
  const end = new Date(props.endDate)

  // 创建Data映射
  const dataMap = new Map()
  props.data.forEach((item) => {
    const dateKey =
      typeof item.date === 'string' ? item.date : item.date.toISOString().split('T')[0]
    dataMap.set(dateKey, item.count || 0)
  })

  // 计算最大值用于强度等级
  const maxValue = props.maxIntensity || Math.max(...props.data.map((d) => d.count || 0), 1)

  // 找到开始日期所在周的星期日
  const startOfWeek = new Date(start)
  const dayOfWeek = startOfWeek.getDay()
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek)

  // 生成热力图Data
  const current = new Date(startOfWeek)
  while (current <= end || current.getDay() !== 0) {
    // 确保最后一周完整
    const dateKey = current.toISOString().split('T')[0]
    const count = dataMap.get(dateKey) || 0

    // 改进强度计算：确保有Data的日期至少有强度1
    let intensity = 0
    if (count > 0) {
      if (maxValue === 1) {
        intensity = 4 // 如果只有1条Command的Data，给最高强度
      } else {
        // 使用更合理的强度分级，确保有Data时至少为1
        intensity = Math.min(4, Math.max(1, Math.ceil((count / maxValue) * 4)))
      }
    }

    const isEmpty = current < start || current > end

    result.push({
      date: dateKey,
      count: isEmpty ? 0 : count,
      intensity: isEmpty ? 0 : intensity,
      formattedDate: formatDate(current),
      dayOfWeek: current.getDay(),
      weekNumber: Math.floor((current - startOfWeek) / (7 * 24 * 60 * 60 * 1000)),
      isEmpty
    })

    current.setDate(current.getDate() + 1)
  }

  // Debug 信息
  console.log('HeatmapWrapper Debug:', {
    inputData: props.data.length,
    dateRange: `${start.toISOString().split('T')[0]} - ${end.toISOString().split('T')[0]}`,
    generatedCells: result.length,
    weeks: Math.ceil(result.length / 7),
    maxValue,
    intensityDistribution: {
      0: result.filter((d) => d.intensity === 0).length,
      1: result.filter((d) => d.intensity === 1).length,
      2: result.filter((d) => d.intensity === 2).length,
      3: result.filter((d) => d.intensity === 3).length,
      4: result.filter((d) => d.intensity === 4).length
    },
    sampleDataWithIntensity: result.filter((d) => d.count > 0).slice(0, 5)
  })

  return result
})

// Computed properties - 月份标签
const monthLabels = computed(() => {
  if (!props.showMonthLabels) return []

  const labels = []
  const weeks = Math.ceil(heatmapData.value.length / 7)
  const start = new Date(props.startDate)

  for (let week = 0; week < weeks; week++) {
    const weekStart = new Date(start)
    weekStart.setDate(start.getDate() + week * 7)

    // 只在月份的第一周显示标签
    if (week === 0 || weekStart.getDate() <= 7) {
      labels.push({
        index: week,
        name: weekStart.toLocaleDateString('en-US', { month: 'short' }),
        startWeek: week,
        weekSpan: Math.min(4, weeks - week) // 每个月标签最多跨4周
      })
    }
  }

  return labels
})

// Computed properties - 网格样式
const gridStyle = computed(() => {
  const weeks = Math.ceil(heatmapData.value.length / 7)
  return {
    gridTemplateColumns: `repeat(${weeks}, ${props.cellSize}px)`,
    gridTemplateRows: `repeat(7, ${props.cellSize}px)`,
    gap: `${props.cellGap}px`
  }
})

// Computed properties - 月份标签样式
const monthLabelsStyle = computed(() => {
  const weeks = Math.ceil(heatmapData.value.length / 7)
  return {
    gridTemplateColumns: `repeat(${weeks}, ${props.cellSize}px)`,
    gap: `${props.cellGap}px`
  }
})

// Methods - 格式化日期
const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Methods - Get单元格样式
const getCellStyle = (day) => {
  const color = props.colorScheme[day.intensity] || props.colorScheme[0]
  return {
    backgroundColor: color,
    opacity: day.isEmpty ? 0.3 : 1,
    width: `${props.cellSize}px`,
    height: `${props.cellSize}px`
  }
}

// Methods - 处理单元格悬停
const handleCellHover = (day, index, event) => {
  if (day.isEmpty) return

  hoveredIndex.value = index
  tooltip.value = {
    visible: true,
    count: day.count,
    date: day.formattedDate,
    unit: props.unit,
    style: {}
  }

  nextTick(() => {
    updateTooltipPosition(event)
  })

  emit('cell-hover', { day, index, event })
}

// Methods - 处理单元格离开
const handleCellLeave = () => {
  hoveredIndex.value = -1
  tooltip.value.visible = false
  emit('cell-leave')
}

// Methods - 处理单元格点击
const handleCellClick = (day, index) => {
  if (day.isEmpty) return
  emit('cell-click', { day, index })
}

// Methods - 更新 Tooltip 位置
const updateTooltipPosition = (event) => {
  if (!tooltipRef.value) return

  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let left = event.clientX + 10
  let top = event.clientY - tooltipRect.height - 10

  // 边界检测
  if (left + tooltipRect.width > viewportWidth) {
    left = event.clientX - tooltipRect.width - 10
  }
  if (top < 0) {
    top = event.clientY + 10
  }

  tooltip.value.style = {
    position: 'fixed',
    left: `${left}px`,
    top: `${top}px`,
    zIndex: 1000
  }
}

// 监听鼠标移动以更新 Tooltip 位置
const handleMouseMove = (event) => {
  if (tooltip.value.visible) {
    updateTooltipPosition(event)
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped>
/* 自定义强度等级颜色样式 */
.intensity-0 {
  background-color: #161b22 !important;
}

.intensity-1 {
  background-color: #0e4429 !important;
}

.intensity-2 {
  background-color: #006d32 !important;
}

.intensity-3 {
  background-color: #26a641 !important;
}

.intensity-4 {
  background-color: #39d353 !important;
}

/* 悬停和空单元格状态 */
.cell-empty {
  cursor: default;
  opacity: 0.4 !important;
}

.cell-hover {
  transform: scale(1.1);
  z-index: 10;
}

/* 单元格悬停效果 */
.grid > div:hover:not(.cell-empty) {
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
}

/* 暗色主题适配 */
@media (prefers-color-scheme: dark) {
  .grid > div {
    border-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
