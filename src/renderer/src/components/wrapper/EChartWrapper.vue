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

// Register necessary components
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

// Initialize chart
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

// Handle chart resize
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// Watch configuration changes
watch(
  () => props.option,
  (newVal) => {
    if (chartInstance && newVal) {
      console.log('Updating chart with new option:', newVal)
      chartInstance.setOption(newVal, true) // true means not merge, completely replace
    }
  },
  { deep: true }
)

// Watch container size changes
const setupResizeObserver = () => {
  if (chartContainer.value && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartContainer.value)
  }
}

// Initialize after component mounting
onMounted(() => {
  console.log('EChartWrapper mounted')
  setTimeout(() => {
    initChart()
    setupResizeObserver()
  }, 100) // Delayed initialization to ensure DOM is ready

  // Add window resize listener as backup
  window.addEventListener('resize', handleResize)
})

// Lifecycle
onBeforeUnmount(() => {
  // Clean up chart instance
  chartInstance?.dispose()

  // Clean up listeners
  resizeObserver?.disconnect()
  window.removeEventListener('resize', handleResize)
})
</script>
