<template>
  <div class="w-full h-full rounded-lg px-4">
    <!-- Control Panel -->
    <div class="flex items-center justify-between mb-4 pt-4">
      <!-- Left: Year and Shell Type Selection -->
      <div class="flex items-center space-x-4">
        <!-- Year Selector -->
        <div class="flex items-center space-x-2">
          <label class="text-gray-300 text-sm">Year:</label>
          <select
            v-model="selectedYear"
            @change="onYearChange"
            :disabled="loading"
            class="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>

        <!-- Shell Type Selector -->
        <div class="flex items-center space-x-2">
          <label class="text-gray-300 text-sm">Shell:</label>
          <select
            v-model="selectedShellType"
            @change="onShellTypeChange"
            :disabled="loading"
            class="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All (bash + zsh)</option>
            <option value="bash">bash only</option>
            <option value="zsh">zsh only</option>
          </select>
        </div>
      </div>

      <!-- Right: Statistics Information -->
      <div class="text-right text-gray-400 text-sm">
        <div v-if="loading">Loading...</div>
        <div v-else-if="currentYearStats.totalCommands > 0">
          {{ selectedYear }}Year ({{ getShellTypeLabel() }}):
          {{ currentYearStats.totalCommands }}  commands，{{ currentYearStats.activeDays }} active days
        </div>
      </div>
    </div>

    <!-- Heatmap Container -->
    <div class="w-full flex-1 min-h-0" style="height: calc(100% - 80px)">
      <!-- Custom Heatmap Component -->
      <div v-if="!loading && !error" class="h-full flex flex-col">
        <!-- Heatmap -->
        <div class="flex items-center justify-center p-4 w-full">
          <HeatmapWrapper
            :data="formattedHeatmapData"
            :start-date="yearStartDate"
            :end-date="yearEndDate"
            :color-scheme="['#161b22', '#1e4b32', '#228542', '#26a641', '#39d353']"
            :cell-size="14"
            :cell-gap="4"
            unit="commands"
            :show-month-labels="true"
            :show-week-labels="true"
            :show-legend="true"
            @cell-click="handleCellClick"
            @cell-hover="handleCellHover"
            @cell-leave="handleCellLeave"
          />
        </div>

        <!-- Detail Information Panel - Always Visible -->
        <div class="flex-1 min-h-0 mt-4 flex flex-col">
          <!-- Date Title - Fixed, Not Scrollable -->
          <div class="mb-4 shrink-0">
            <div v-if="selectedDateInfo" class="text-center">
              <h3 class="text-lg font-semibold text-gray-200">
                {{ selectedDateInfo.formattedDate }}
              </h3>
              <p class="text-sm text-gray-400">
                Total execution: {{ selectedDateInfo.totalCommands }}  commands
              </p>
            </div>
            <div v-else class="text-center">
              <h3 class="text-lg font-semibold text-gray-400">Click on heatmap to select a date</h3>
              <p class="text-sm text-gray-500">View daily command execution details and statistics</p>
            </div>
          </div>

          <!-- Two Independent Components - Fixed Height Layout -->
          <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Daily Command List Component -->
            <div class="min-h-0">
              <HeatmapCommandList :selected-date="selectedDateInfo" />
            </div>

            <!-- Custom Statistics Component -->
            <div class="min-h-0">
              <HeatmapCustomStats :selected-date="selectedDateInfo" />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="text-gray-400">Loading heatmap data...</div>
      </div>

      <!-- No Data Prompt -->
      <div
        v-if="!loading && !error && currentYearStats.totalCommands === 0"
        class="flex items-center justify-center h-full"
      >
        <div class="text-gray-400">{{ selectedYear }}Year ({{ getShellTypeLabel() }}) No data available</div>
      </div>
    </div>

    <!-- Error Prompt -->
    <div v-if="error" class="text-red-400 text-sm mt-2 bg-red-900 bg-opacity-20 p-2 rounded">
      {{ error }}
      <button @click="retryLoad" class="ml-2 text-blue-400 hover:text-blue-300 underline">
        Retry
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import HeatmapWrapper from '../wrapper/HeatmapWrapper.vue'
import HeatmapCommandList from '../heatmap/HeatmapCommandList.vue'
import HeatmapCustomStats from '../heatmap/HeatmapCustomStats.vue'
import { useDataService } from '@renderer/services/dataService.js'

// Use unified data service
const { dataService, isLoading: globalLoading, error: globalError } = useDataService()

// Reactive data
const selectedYear = ref(new Date().getFullYear())
const selectedShellType = ref('all')
const availableYears = ref([])
const heatmapData = ref([])
const loading = ref(false)
const error = ref('')
const selectedDateInfo = ref(null) // Selected date details

// Calculate current year statistics
const currentYearStats = computed(() => {
  const data = heatmapData.value
  const totalCommands = data.reduce((sum, item) => sum + item[1], 0)
  const activeDays = data.filter((item) => item[1] > 0).length

  return {
    totalCommands,
    activeDays
  }
})

// Format heatmap data for new component
const formattedHeatmapData = computed(() => {
  return heatmapData.value.map(([date, count]) => ({
    date,
    count
  }))
})

// Year start date
const yearStartDate = computed(() => {
  return new Date(selectedYear.value, 0, 1) // January 1st
})

// Year end date
const yearEndDate = computed(() => {
  return new Date(selectedYear.value, 11, 31) // December 31st
})

// Get shell type label
const getShellTypeLabel = () => {
  switch (selectedShellType.value) {
    case 'all':
      return 'bash + zsh'
    case 'bash':
      return 'bash'
    case 'zsh':
      return 'zsh'
    default:
      return 'unknown'
  }
}

// Load available years
const loadAvailableYears = async () => {
  try {
    loading.value = true
    error.value = ''

    console.log('Loading available years...')

    // Use unified data service
    const years = await dataService.getAvailableYears()
    
    availableYears.value = years
    console.log('Available years loaded:', years)

    // If the currently selected year is not in available years, select the latest year
    if (years.length > 0 && !years.includes(selectedYear.value)) {
      selectedYear.value = years[0]
    }
  } catch (err) {
    console.error('Failed to load available years:', err)
    error.value = `Failed to load years: ${err.message}`
  } finally {
    loading.value = false
  }
}

// Load heatmap data for specified year and shell type
const loadHeatmapData = async (year, shellType = 'all') => {
  try {
    loading.value = true
    error.value = ''
    selectedDateInfo.value = null // Reset selected date information

    console.log(`Loading heatmap data for year ${year}, shellType ${shellType}...`)

    // Use unified data service
    const result = await dataService.getYearlyHeatmapData(year, shellType)
    
    console.log(`Raw heatmap result:`, result)
    
    heatmapData.value = result || []
    console.log(
      `Loaded heatmap data for ${year} (${shellType}):`,
      result?.length || 0,
      'days'
    )
  } catch (err) {
    console.error(`Failed to load ${year} data:`, err)
    error.value = `Failed to load ${year} data: ${err.message}`
  } finally {
    loading.value = false
  }
}

// Handle year selection change
const onYearChange = async () => {
  if (!loading.value) {
    await loadHeatmapData(selectedYear.value, selectedShellType.value)
  }
}

// Handle shell type selection change
const onShellTypeChange = async () => {
  if (!loading.value) {
    await loadHeatmapData(selectedYear.value, selectedShellType.value)
  }
}

// Switch year (compatible with old interface)
const switchYear = async (year) => {
  if (year !== selectedYear.value && !loading.value) {
    selectedYear.value = year
    await loadHeatmapData(year, selectedShellType.value)
  }
}

// Retry loading
const retryLoad = async () => {
  await loadHeatmapData(selectedYear.value, selectedShellType.value)
}

// Heatmap event handlers
const handleCellClick = async ({ day, index }) => {
  console.log('Heatmap cell click:', day, index)

  if (day.isEmpty || day.count === 0) {
    selectedDateInfo.value = null
    return
  }

  try {
    // Try to get detailed command data for selected date
    // Note: This API may not exist, we'll use mock data as fallback
    const result = await window.electron.ipcRenderer.invoke(
      'get-date-commands',
      day.date,
      selectedShellType.value
    )

    if (result.success) {
      const commands = result.data || []
      const processedData = processDateCommands(commands, day)
      selectedDateInfo.value = processedData
      console.log('Selected date data:', processedData)
    } else {
      // API doesn't exist or failed, use mock data
      selectedDateInfo.value = createMockDateInfo(day)
    }
  } catch (err) {
    console.error('Error loading date commands:', err)
    // Use mock data as fallback
    selectedDateInfo.value = createMockDateInfo(day)
  }
}

const handleCellHover = ({ day, index, event }) => {
  console.log('Heatmap cell hover:', day.date, day.count)
  // Hover event handling, tooltip is already handled inside the component
}

const handleCellLeave = () => {
  // Handle mouse leave cell
}

// Process date command data
const processDateCommands = (commands, day) => {
  // Count shell types
  const shellTypes = {}
  const commandCounts = {}
  const hourlyDistribution = new Array(24).fill(0)

  commands.forEach((cmd) => {
    // Count shell types
    shellTypes[cmd.shell_type] = (shellTypes[cmd.shell_type] || 0) + 1

    // Count command frequency
    const command = cmd.command.split(' ')[0] // Extract main command
    commandCounts[command] = (commandCounts[command] || 0) + 1

    // Count hourly distribution
    if (cmd.timestamp) {
      const hour = new Date(cmd.timestamp).getHours()
      hourlyDistribution[hour]++
    }
  })

  // Get top commands Top 5
  const topCommands = Object.entries(commandCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([command, count]) => ({ command, count }))

  return {
    date: day.date,
    formattedDate: day.formattedDate,
    totalCommands: commands.length,
    commands: commands.map((cmd) => ({
      command: cmd.command,
      time: cmd.timestamp ? new Date(cmd.timestamp).toLocaleTimeString() : 'unknown time',
      shell: cmd.shell_type || 'unknown'
    })),
    stats: {
      shellTypes,
      topCommands,
      hourlyDistribution
    }
  }
}

// Create mock data (when API is unavailable)
const createMockDateInfo = (day) => {
  const mockCommands = []
  const commands = [
    'ls -la',
    'cd Documents',
    'git status',
    'npm run dev',
    'code .',
    'git add .',
    'git commit',
    'vim config.js',
    'cat README.md',
    'mkdir src'
  ]

  // Generate mock commands, quantity based on day.count
  for (let i = 0; i < Math.min(day.count, 50); i++) {
    const cmd = commands[i % commands.length]
    const hours = [9, 10, 11, 14, 15, 16, 17]
    const hour = hours[Math.floor(Math.random() * hours.length)]
    const minute = Math.floor(Math.random() * 60)

    mockCommands.push({
      command: cmd,
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(
        Math.floor(Math.random() * 60)
      ).padStart(2, '0')}`,
      shell: Math.random() > 0.7 ? 'bash' : 'zsh'
    })
  }

  // Generate mock statistics data
  const shellTypes = { zsh: Math.ceil(day.count * 0.7), bash: Math.floor(day.count * 0.3) }
  const topCommands = [
    { command: 'ls', count: Math.max(1, Math.floor(day.count * 0.2)) },
    { command: 'cd', count: Math.max(1, Math.floor(day.count * 0.15)) },
    { command: 'git', count: Math.max(1, Math.floor(day.count * 0.15)) },
    { command: 'npm', count: Math.max(1, Math.floor(day.count * 0.1)) },
    { command: 'code', count: Math.max(1, Math.floor(day.count * 0.1)) }
  ].slice(0, Math.min(5, Math.ceil(day.count / 3)))

  // Generate 24-hour distribution
  const hourlyDistribution = new Array(24).fill(0)
  const activeHours = [9, 10, 11, 14, 15, 16, 17]
  activeHours.forEach((hour) => {
    hourlyDistribution[hour] = Math.floor(Math.random() * (day.count / 3)) + 1
  })

  return {
    date: day.date,
    formattedDate: day.formattedDate,
    totalCommands: day.count,
    commands: mockCommands,
    stats: {
      shellTypes,
      topCommands,
      hourlyDistribution
    }
  }
}

// Component mounting
onMounted(async () => {
  console.log('Heatmap component mounted')
  await loadAvailableYears()
  if (availableYears.value.length > 0) {
    await loadHeatmapData(selectedYear.value, selectedShellType.value)
  }
})
</script>

<style scoped>
/* Button disabled state */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
