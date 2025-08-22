<template>
  <div class="w-full h-full bg-gray-900 flex flex-col">
    <!-- Page Header -->
    <div class="flex items-center justify-between p-6">
      <div class="flex items-center space-x-4">
        <i class="fas fa-ticket-alt text-2xl text-amber-400"></i>
        <h1 class="text-2xl font-bold text-white">Command Tickets</h1>
      </div>

      <div class="flex items-center space-x-3">
        <!-- Year Selection -->
        <select
          v-model="selectedYear"
          @change="generateTicket"
          class="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-amber-500 focus:outline-none"
        >
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>

        <!-- Save Button -->
        <button
          @click="saveTicket"
          :disabled="saving"
          class="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200 flex items-center space-x-2"
        >
          <i :class="['fas', saving ? 'fa-spinner fa-spin' : 'fa-download']"></i>
          <span>{{ saving ? 'Saving...' : 'Save Ticket' }}</span>
        </button>

        <!-- Refresh Button -->
        <button
          @click="generateTicket"
          :disabled="loading"
          class="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-colors duration-200"
          title="重新生成"
        >
          <i :class="['fas fa-sync-alt', { 'animate-spin': loading }]"></i>
        </button>
      </div>
    </div>

    <!-- Main content area -->
    <div class="flex-1 flex items-center justify-center p-8">
      <!-- Loading state -->
      <div v-if="loading" class="text-center">
        <div
          class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mb-4"
        ></div>
        <p class="text-gray-400">正在生成您的 Command Ticket...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center max-w-md">
        <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
        <h3 class="text-xl font-bold text-white mb-2">生成Failed</h3>
        <p class="text-gray-400 mb-4">{{ error }}</p>
        <button
          @click="generateTicket"
          class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded transition-colors"
        >
          重试
        </button>
      </div>

      <!-- Ticket 展示 -->
      <div v-else-if="ticketData" class="ticket-container">
        <!-- 左侧按钮 - 切换样式 -->
        <button
          @click="previousStyle"
          :disabled="!canGoPreviousStyle"
          class="nav-button left-button"
          :class="{ 'opacity-50': !canGoPreviousStyle }"
          :title="
            canGoPreviousStyle ? `切换到 ${ticketStyles[currentStyleIndex - 1].description}` : ''
          "
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <!-- 动态组件渲染 -->
        <div ref="ticketElement">
          <component
            :is="currentStyle.component"
            :ticketNumber="ticketData.number"
            :cardName="ticketData.name"
            :chartData="ticketData.chartData"
            :totalCommands="ticketData.totalCommands"
            :activeDays="ticketData.activeDays"
            :heatmapData="ticketData.heatmapData"
            :year="selectedYear"
          />
        </div>

        <!-- 右侧按钮 - 切换样式 -->
        <button
          @click="nextStyle"
          :disabled="!canGoNextStyle"
          class="nav-button right-button"
          :class="{ 'opacity-50': !canGoNextStyle }"
          :title="canGoNextStyle ? `切换到 ${ticketStyles[currentStyleIndex + 1].description}` : ''"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- No data state -->
      <div v-else class="text-center max-w-md">
        <i class="fas fa-inbox text-6xl text-gray-500 mb-4"></i>
        <h3 class="text-xl font-bold text-white mb-2">暂无Data</h3>
        <p class="text-gray-400 mb-4">{{ selectedYear }}Year: No command usage records</p>
        <button
          @click="generateTicket"
          class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded transition-colors"
        >
          重新检查
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import html2canvas from 'html2canvas-pro'
import TerminalCard from './ticket-style/TerminalCard.vue'
import HeatmapCard from './ticket-style/HeatmapCard.vue'
import { useDataService } from '@renderer/services/dataService.js'

// 使用统一Data服务
const { dataService, isLoading: globalLoading, error: globalError } = useDataService()

// Reactive data
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const selectedYear = ref(new Date().getFullYear())
const availableYears = ref([])
const ticketData = ref(null)
const currentStyleIndex = ref(0) // 当前样式索引
const ticketElement = ref(null) // Ticket 元素引用

// 样式配置
const ticketStyles = [
  {
    name: 'Terminal',
    component: TerminalCard,
    description: '终端风格样式'
  },
  {
    name: 'Heatmap',
    component: HeatmapCard,
    description: '热力图样式'
  }
]

// Computed properties
const currentStyle = computed(() => ticketStyles[currentStyleIndex.value])
const canGoPreviousStyle = computed(() => currentStyleIndex.value > 0)
const canGoNextStyle = computed(() => currentStyleIndex.value < ticketStyles.length - 1)

// Load可用年份
const loadAvailableYears = async () => {
  try {
    console.log('Loading available years...')
    
    // 使用统一Data服务
    const years = await dataService.getAvailableYears()
    
    availableYears.value = years

    // If the currently selected year is not in available years, select the latest year
    if (years.length > 0 && !years.includes(selectedYear.value)) {
      selectedYear.value = years[0]
    }
    
    console.log('Available years loaded:', years)
  } catch (err) {
    console.error('Failed to load available years:', err)
    error.value = `Load年份Failed: ${err.message}`
  }
}

// 生成 Ticket Data
const generateTicket = async () => {
  try {
    loading.value = true
    error.value = ''

    console.log(`Generating ticket for year ${selectedYear.value}`)

    // 使用统一Data服务
    const result = await dataService.generateCommandTicket(selectedYear.value)
    
    ticketData.value = result
    console.log('Ticket generated successfully:', ticketData.value)
  } catch (err) {
    console.error('Failed to generate ticket:', err)
    error.value = `生成Failed: ${err.message}`
  } finally {
    loading.value = false
  }
}

// 保存 Ticket
const saveTicket = async () => {
  if (!ticketData.value || !ticketElement.value) return

  try {
    saving.value = true
    console.log('开始保存 Ticket 为图片...')

    // 等待动态内容完全Load并渲染
    await new Promise((resolve) => {
      // 等待下一个渲染周期确保所有内容都已渲染
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 1000) // 额外等待1秒确保所有样式生效
        })
      })
    })

    // 使用简化的 html2canvas-pro 配置
    const canvas = await html2canvas(ticketElement.value, {
      backgroundColor: '#000000',
      scale: 4,
      useCORS: true,
      allowTaint: true,
      logging: true
    })

    console.log('Canvas 生成Success，尺寸:', canvas.width, 'x', canvas.height)

    // 将 canvas 转换为 blob
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png', 0.95)
    })

    if (blob) {
      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const fileName = `command-ticket-${
        selectedYear.value
      }-${currentStyle.value.name.toLowerCase()}.png`

      link.href = url
      link.download = fileName

      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // 清理 URL
      URL.revokeObjectURL(url)

      console.log(`Ticket 图片保存Success: ${fileName}`)
    } else {
      throw new Error('无法生成图片 blob')
    }
  } catch (err) {
    console.error('保存 Ticket Failed:', err)
    error.value = `保存Failed: ${err.message}`

    // 5秒后清除Error消息
    setTimeout(() => {
      error.value = ''
    }, 5000)
  } finally {
    saving.value = false
  }
}

// 样式导航方法
const previousStyle = () => {
  if (canGoPreviousStyle.value) {
    currentStyleIndex.value--
  }
}

const nextStyle = () => {
  if (canGoNextStyle.value) {
    currentStyleIndex.value++
  }
}

// 组件挂载
onMounted(async () => {
  console.log('TicketBoard component mounted')
  await loadAvailableYears()
  if (availableYears.value.length > 0) {
    await generateTicket()
  }
})
</script>

<style scoped>
.ticket-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  max-width: 900px;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(75, 85, 99, 0.8);
  border: 2px solid #374151;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 5;
  backdrop-filter: blur(10px);
}

.nav-button:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.8);
  border-color: #3b82f6;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.nav-button:disabled {
  cursor: not-allowed;
  background: rgba(75, 85, 99, 0.3);
  border-color: rgba(55, 65, 81, 0.3);
}

.left-button {
  left: -80px;
}

.right-button {
  right: -80px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-button {
    display: none;
  }

  .ticket-container {
    flex-direction: column;
  }

  .left-button,
  .right-button {
    position: static;
    transform: none;
    margin: 10px;
  }
}

@media (max-width: 640px) {
  .style-indicator {
    margin-bottom: 1rem;
  }

  .ticket-info {
    margin-top: 1rem;
  }
}
</style>
