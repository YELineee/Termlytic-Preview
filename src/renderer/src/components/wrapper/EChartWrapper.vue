<!-- components/EChartsWrapper.vue -->
<template>
  <div ref="chartContainer" :style="{ width, height }"></div>
</template>
<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { init, connect, disconnect, dispose, registerTheme } from 'echarts/core'
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  TimelineComponent,
  ToolboxComponent,
  BrushComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的组件
import { use } from 'echarts/core'
use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  TimelineComponent,
  ToolboxComponent,
  BrushComponent,
  CanvasRenderer
])

const echarts = { init, connect, disconnect, dispose, registerTheme }

const props = defineProps({
  option: {
    type: Object,
    required: true
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '400px'
  }
})

const chartContainer = ref(null)
let chartInstance = null
let resizeObserver = null

// 初始化图表
const initChart = () => {
  if (chartContainer.value && props.option) {
    console.log('Initializing chart with option:', props.option)
    chartInstance = echarts.init(chartContainer.value)
    chartInstance.setOption(props.option)
    console.log('Chart initialized successfully')
  } else {
    console.log('Chart init failed:', {
      container: !!chartContainer.value,
      option: !!props.option
    })
  }
}

// 处理图表大小调整
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听配置变化
watch(
  () => props.option,
  (newVal) => {
    if (chartInstance && newVal) {
      console.log('Updating chart with new option:', newVal)
      chartInstance.setOption(newVal, true) // true 表示不合并，完全替换
    }
  },
  { deep: true }
)

// 监听容器尺寸变化
const setupResizeObserver = () => {
  if (chartContainer.value && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartContainer.value)
  }
}

// 在组件挂载后初始化
onMounted(() => {
  console.log('EChartWrapper mounted')
  setTimeout(() => {
    initChart()
    setupResizeObserver()
  }, 100) // 延迟初始化确保DOM已准备好

  // 添加窗口大小变化监听作为备用
  window.addEventListener('resize', handleResize)
})

// 生命周期
onBeforeUnmount(() => {
  // 清理图表实例
  chartInstance?.dispose()

  // 清理监听器
  resizeObserver?.disconnect()
  window.removeEventListener('resize', handleResize)
})
</script>
