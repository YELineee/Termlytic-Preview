<template>
  <div class="w-full max-w-lg bg-black rounded-lg shadow-2xl overflow-hidden border border-gray-600">
    <!-- Terminal Title Bar -->
    <div class="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-600">
      <div class="flex items-center space-x-2">
        <!-- Traffic Light Buttons -->
        <div class="flex space-x-2">
          <div class="w-3 h-3 bg-red-500 rounded-full"></div>
          <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span class="text-gray-300 text-sm font-mono ml-2">Command Summary {{ new Date().getFullYear() }}</span>
      </div>
    </div>

    <!-- Terminal Content Area -->
    <div class="p-6 font-mono text-sm text-green-400 bg-black min-h-96">
      <!-- Ticket Header Information -->
      <div class="mb-6">
        <div class="text-cyan-400 mb-2">
          <span class="text-gray-500">$</span> cat ~/.command_ticket_{{ ticketNumber }}
        </div>
        <div class="text-white text-lg font-bold border-b border-gray-700 pb-2">
          {{ cardName }}
        </div>
      </div>

      <!-- Main Statistics Information -->
      <div class="mb-6 space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-gray-400">Total Commands:</span>
          <span class="text-green-400 font-bold">{{ formatNumber(totalCommands) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400">Active Days:</span>
          <span class="text-blue-400 font-bold">{{ activeDays }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400">Avg Commands/Day:</span>
          <span class="text-yellow-400 font-bold">{{ Math.round(totalCommands / Math.max(activeDays, 1)) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-400">Productivity Score:</span>
          <span class="text-purple-400 font-bold">{{ calculateProductivityScore() }}/100</span>
        </div>
      </div>

      <!-- Monthly Activity Chart -->
      <div class="mb-6">
        <div class="text-white mb-3 text-xs">
          <span class="text-gray-500">$</span> Monthly Activity Pattern:
        </div>
        <div class="bg-gray-900 p-4 rounded border border-gray-700">
          <div class="flex items-end space-x-1 h-20">
            <div
              v-for="(value, index) in chartData"
              :key="index"
              class="flex-1 bg-gradient-to-t from-green-600 to-green-400 rounded-sm"
              :style="{
                height: `${Math.max(2, (value / 100) * 100)}%`,
                opacity: value > 0 ? 0.8 : 0.3
              }"
              :title="`${getMonthName(index)}: ${value}%`"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-2">
            <span>Jan</span>
            <span>Apr</span>
            <span>Jul</span>
            <span>Oct</span>
            <span>Dec</span>
          </div>
        </div>
      </div>

      <!-- System Information -->
      <div class="mb-4 space-y-1 text-xs">
        <div class="flex justify-between">
          <span class="text-gray-500">Terminal Sessions:</span>
          <span class="text-green-300">{{ Math.ceil(totalCommands / 50) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Peak Day Commands:</span>
          <span class="text-green-300">{{ Math.max(...chartData.map(v => Math.ceil(v * totalCommands / 100 / 12))) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Efficiency Rating:</span>
          <span class="text-green-300">{{ getEfficiencyRating() }}</span>
        </div>
      </div>

      <!-- Bottom Command Prompt -->
      <div class="border-t border-gray-700 pt-4 mt-4">
        <div class="flex items-center space-x-2">
          <span class="text-green-400">user@terminal:~$</span>
          <span class="text-gray-400">echo "Year {{ new Date().getFullYear() }} Summary Complete"</span>
          <span class="animate-pulse text-green-400">_</span>
        </div>
        <div class="text-gray-500 text-xs mt-1">
          Generated on {{ new Date().toLocaleDateString() }} • Ticket #{{ ticketNumber }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props definition
const props = defineProps({
  ticketNumber: {
    type: String,
    default: '240001'
  },
  cardName: {
    type: String,
    default: '2024 Command Summary'
  },
  chartData: {
    type: Array,
    default: () => [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 80, 60]
  },
  totalCommands: {
    type: Number,
    default: 1000
  },
  activeDays: {
    type: Number,
    default: 250
  },
  heatmapData: {
    type: Array,
    default: () => []
  }
})

// Methods
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const getMonthName = (index) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months[index] || ''
}

const calculateProductivityScore = () => {
  // Calculate productivity score based on command total, active days and average
  const avgPerDay = props.totalCommands / Math.max(props.activeDays, 1)
  const baseScore = Math.min(avgPerDay * 2, 80) // Base score
  const consistencyBonus = Math.min((props.activeDays / 365) * 20, 20) // Consistency bonus
  return Math.round(baseScore + consistencyBonus)
}

const getEfficiencyRating = () => {
  const score = calculateProductivityScore()
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Very Good'
  if (score >= 60) return 'Good'
  if (score >= 45) return 'Average'
  return 'Beginner'
}
</script>

<style scoped>
/* Ensure terminal font */
.font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'Courier New', monospace;
}

/* Cursor blink animation */
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.animate-pulse {
  animation: blink 1s infinite;
}

/* Scrollbar styles */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
