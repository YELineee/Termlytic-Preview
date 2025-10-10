<template>
  <div
    class="w-full max-w-lg bg-primary rounded-lg shadow-2xl overflow-hidden border border-divider"
  >
    <!-- Terminal Title Bar -->
    <div class="bg-secondary px-4 py-2 flex items-center justify-between border-b border-divider">
      <div class="flex items-center space-x-2">
        <!-- Traffic Light Buttons - Grayscale -->
        <div class="flex space-x-2">
          <div class="w-3 h-3 bg-gray-600 rounded-full"></div>
          <div class="w-3 h-3 bg-gray-500 rounded-full"></div>
          <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
        </div>
        <span class="text-primary text-sm font-mono ml-2"
          >Command Summary {{ new Date().getFullYear() }}</span
        >
      </div>
    </div>

    <!-- Terminal Content Area -->
    <div class="p-6 font-mono text-sm success-text bg-primary min-h-96">
      <!-- Ticket Header Information -->
      <div class="mb-6">
        <div class="accent-text mb-2">
          <span class="text-tertiary">$</span> cat ~/.command_ticket_{{ ticketNumber }}
        </div>
        <div class="text-primary text-lg font-bold border-b border-divider pb-2">
          {{ cardName }}
        </div>
      </div>

      <!-- Main Statistics Information -->
      <div class="mb-6 space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-secondary">Total Commands:</span>
          <span class="success-text font-bold">{{ formatNumber(totalCommands) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-secondary">Active Days:</span>
          <span class="accent-text font-bold">{{ activeDays }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-secondary">Avg Commands/Day:</span>
          <span class="accent-text font-bold">{{
            Math.round(totalCommands / Math.max(activeDays, 1))
          }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-secondary">Productivity Score:</span>
          <span class="accent-text font-bold">{{ calculateProductivityScore() }}/100</span>
        </div>
      </div>

      <!-- Monthly Activity Chart -->
      <div class="mb-6">
        <div class="text-primary mb-3 text-xs">
          <span class="text-tertiary">$</span> Monthly Activity Pattern:
        </div>
        <div class="bg-secondary p-4 rounded border border-divider">
          <div class="flex items-end space-x-1 h-20">
            <div
              v-for="(value, index) in chartData"
              :key="index"
              class="flex-1 accent-gradient rounded-sm"
              :style="{
                height: `${Math.max(2, (value / 100) * 100)}%`,
                opacity: value > 0 ? 0.8 : 0.3
              }"
              :title="`${getMonthName(index)}: ${value}%`"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-tertiary mt-2">
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
          <span class="text-tertiary">Terminal Sessions:</span>
          <span class="success-text">{{ Math.ceil(totalCommands / 50) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-tertiary">Peak Day Commands:</span>
          <span class="success-text">{{
            Math.max(...chartData.map((v) => Math.ceil((v * totalCommands) / 100 / 12)))
          }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-tertiary">Efficiency Rating:</span>
          <span class="success-text">{{ getEfficiencyRating() }}</span>
        </div>
      </div>

      <!-- Bottom Command Prompt -->
      <div class="border-t border-divider pt-4 mt-4">
        <div class="flex items-center space-x-2">
          <span class="success-text">user@terminal:~$</span>
          <span class="text-secondary"
            >echo "Year {{ new Date().getFullYear() }} Summary Complete"</span
          >
          <span class="animate-pulse success-text">_</span>
        </div>
        <div class="text-tertiary text-xs mt-1">
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
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
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
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
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
