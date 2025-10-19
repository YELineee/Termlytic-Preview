<template>
  <div class="w-full h-full flex flex-col bg-primary">
    <!-- Page Header -->
    <div class="flex items-center justify-between p-6">
      <div class="flex items-center space-x-4">
        <i class="fas fa-ticket-alt text-2xl accent-text"></i>
        <h1 class="text-2xl font-bold text-primary">Command Tickets</h1>
      </div>

      <div class="flex items-center space-x-3">
        <!-- Year Selection -->
        <select
          v-model="selectedYear"
          class="bg-secondary text-primary px-3 py-2 rounded border border-divider focus:border-accent focus:outline-none transition-colors"
        >
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>

        <!-- Save Button -->
        <button
          @click="saveTicket"
          :disabled="saving"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded transition-colors duration-200 flex items-center space-x-2"
        >
          <i :class="['fas', saving ? 'fa-spinner fa-spin' : 'fa-download']"></i>
          <span>{{ saving ? 'Saving...' : 'Save Ticket' }}</span>
        </button>

        <!-- Refresh Button -->
        <button
          @click="generateTicket"
          :disabled="loading"
          class="bg-secondary hover:bg-hover text-primary p-2 rounded transition-colors duration-200"
          title="Regenerate"
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
          class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent mb-4"
        ></div>
        <p class="text-secondary">Generating your Command Ticket...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center max-w-md">
        <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
        <h3 class="text-xl font-bold text-primary mb-2">Generation Failed</h3>
        <p class="text-secondary mb-4">{{ error }}</p>
        <button @click="generateTicket" class="btn-primary px-4 py-2 rounded transition-colors">
          Retry
        </button>
      </div>

      <!-- Ticket Display -->
      <div v-else-if="ticketData" class="ticket-container">
        <!-- Left Button - Switch Style -->
        <button
          @click="previousStyle"
          :disabled="!canGoPreviousStyle"
          class="nav-button left-button"
          :class="{ 'opacity-50': !canGoPreviousStyle }"
          :title="
            canGoPreviousStyle ? `Switch to ${ticketStyles[currentStyleIndex - 1].description}` : ''
          "
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <!-- Dynamic Component Rendering -->
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

        <!-- Right Button - Switch Style -->
        <button
          @click="nextStyle"
          :disabled="!canGoNextStyle"
          class="nav-button right-button"
          :class="{ 'opacity-50': !canGoNextStyle }"
          :title="
            canGoNextStyle ? `Switch to ${ticketStyles[currentStyleIndex + 1].description}` : ''
          "
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- No data state -->
      <div v-else class="text-center max-w-md">
        <i class="fas fa-inbox text-6xl text-tertiary mb-4"></i>
        <h3 class="text-xl font-bold text-primary mb-2">No Data Available</h3>
        <p class="text-secondary mb-4">{{ selectedYear }}Year: No command usage records</p>
        <button @click="generateTicket" class="btn-primary px-4 py-2 rounded transition-colors">
          Check Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import html2canvas from 'html2canvas-pro'
import TerminalCard from './ticket-style/TerminalCard.vue'
import HeatmapCard from './ticket-style/HeatmapCard.vue'
import StatsCard from './ticket-style/StatsCard.vue'
import TimelineCard from './ticket-style/TimelineCard.vue'
import CompactCard from './ticket-style/CompactCard.vue'
import { useDataService } from '@renderer/services/dataService.js'

// Use unified data service
const { dataService } = useDataService()

// Reactive data
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const selectedYear = ref(new Date().getFullYear())
const availableYears = ref([])
const ticketData = ref(null)
const currentStyleIndex = ref(0)
const ticketElement = ref(null)

// Card style configuration
const ticketStyles = [
  {
    name: 'Terminal',
    component: TerminalCard,
    description: 'Terminal style'
  },
  {
    name: 'Heatmap',
    component: HeatmapCard,
    description: 'Heatmap style'
  },
  {
    name: 'Stats',
    component: StatsCard,
    description: 'Statistics card style'
  },
  {
    name: 'Timeline',
    component: TimelineCard,
    description: 'Timeline style'
  },
  {
    name: 'Compact',
    component: CompactCard,
    description: 'Compact card style'
  },
]

// Computed properties
const currentStyle = computed(() => ticketStyles[currentStyleIndex.value])
const canGoPreviousStyle = computed(() => currentStyleIndex.value > 0)
const canGoNextStyle = computed(() => currentStyleIndex.value < ticketStyles.length - 1)

// Check if ticket has valid data
const hasValidTicketData = computed(() => {
  return ticketData.value && ticketData.value.totalCommands > 0
})

// Load available years
const loadAvailableYears = async () => {
  try {
    const years = await dataService.getAvailableYears()
    availableYears.value = years

    // Auto-select most recent year if current selection is invalid
    if (years.length > 0 && !years.includes(selectedYear.value)) {
      selectedYear.value = years[0]
    }

    return years
  } catch (err) {
    const errorMsg = err?.message || 'Unknown error'
    error.value = `Failed to load years: ${errorMsg}`
    throw err
  }
}

// Generate ticket data
const generateTicket = async () => {
  if (!selectedYear.value) return

  try {
    loading.value = true
    error.value = ''

    const result = await dataService.generateCommandTicket(selectedYear.value)
    ticketData.value = result
  } catch (err) {
    const errorMsg = err?.message || 'Unknown error'
    error.value = `Failed to generate ticket: ${errorMsg}`
    ticketData.value = null
  } finally {
    loading.value = false
  }
}

// Wait for render completion
const waitForRender = (ms = 1000) => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, ms)
      })
    })
  })
}

// Convert canvas to blob
const canvasToBlob = (canvas, type = 'image/png', quality = 0.95) => {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality)
  })
}

// Download blob as file
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

// Save ticket as image
const saveTicket = async () => {
  if (!ticketData.value || !ticketElement.value) {
    error.value = 'No ticket data to save'
    return
  }

  try {
    saving.value = true
    error.value = ''

    // Wait for all content to render
    await waitForRender(1000)

    // Generate canvas
    const canvas = await html2canvas(ticketElement.value, {
      backgroundColor: '#000000',
      scale: 4,
      useCORS: true,
      allowTaint: true,
      logging: false
    })

    // Convert to blob
    const blob = await canvasToBlob(canvas)

    if (!blob) {
      throw new Error('Failed to generate image')
    }

    // Download file
    const fileName = `command-ticket-${selectedYear.value}-${currentStyle.value.name.toLowerCase()}.png`
    downloadBlob(blob, fileName)
  } catch (err) {
    const errorMsg = err?.message || 'Unknown error'
    error.value = `Save failed: ${errorMsg}`

    // Auto-clear error after 5 seconds
    setTimeout(() => {
      error.value = ''
    }, 5000)
  } finally {
    saving.value = false
  }
}

// Style navigation
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

// Watch year changes and regenerate ticket
watch(selectedYear, (newYear, oldYear) => {
  if (newYear !== oldYear && newYear) {
    generateTicket()
  }
})

// Initialize on mount
onMounted(async () => {
  try {
    const years = await loadAvailableYears()
    if (years.length > 0) {
      await generateTicket()
    }
  } catch (err) {
    // Error already handled in loadAvailableYears
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

/* Responsive design */
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
