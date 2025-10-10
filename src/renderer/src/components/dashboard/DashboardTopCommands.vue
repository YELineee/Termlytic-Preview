<template>
  <div
    class="w-full h-full rounded-lg p-4 sm:p-3 xs:p-2 flex flex-col min-h-0 overflow-hidden"
    :style="{ 
      backgroundColor: 'var(--bgSecondary)', 
      border: '1px solid var(--borderPrimary)' 
    }"
  >
    <!-- Title -->
    <div class="flex items-center space-x-2 mb-4 sm:mb-3 xs:mb-2 flex-shrink-0">
      <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: 'var(--textSecondary)' }"></div>
      <div
        class="text-xs sm:text-2xs uppercase tracking-wider font-medium"
        :style="{ color: 'var(--textTertiary)' }"
      >
        <span class="sm:hidden">TOP COMMANDS</span>
        <span class="hidden sm:inline xs:hidden">MOST USED</span>
        <span class="hidden xs:inline">TOP</span>
      </div>
    </div>

    <!-- Main Values -->
    <div class="mb-4 sm:mb-3 xs:mb-2 flex-shrink-0">
      <div class="text-3xl sm:text-2xl xs:text-xl font-bold mb-1 sm:mb-0.5"
           :style="{ color: 'var(--textPrimary)' }">
        {{ formatMainValue(topCommands[0]?.count || 0) }}
      </div>
      <div class="flex items-center space-x-2 sm:space-x-1">
        <span class="text-sm sm:text-xs xs:text-2xs" :style="{ color: 'var(--textSecondary)' }">×</span>
        <span class="text-xs sm:text-2xs uppercase tracking-wider" 
              :style="{ color: 'var(--textSecondary)' }">{{
          topCommands[0]?.command || 'N/A'
        }}</span>
      </div>
    </div>

    <!-- Command List -->
    <div
      class="flex-1 space-y-2 sm:space-y-1 mb-4 sm:mb-3 xs:mb-2 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2"
    >
      <div
        v-for="(cmd, index) in topCommands.slice(0, 15)"
        :key="cmd.command"
        class="flex items-center justify-between flex-shrink-0 group p-1 rounded transition-colors hover-item"
        :style="{ '--hover-bg': 'var(--bgHover)' }"
      >
        <div class="flex items-center space-x-3 sm:space-x-2 flex-1 min-w-0">
          <div class="text-xs sm:text-2xs w-5 sm:w-4 flex-shrink-0 text-center"
               :style="{ color: 'var(--textTertiary)' }">
            {{ index + 1 }}
          </div>
          <div class="text-sm sm:text-xs xs:text-2xs font-mono truncate min-w-0"
               :style="{ color: 'var(--textPrimary)' }">
            {{ cmd.command }}
          </div>
        </div>
        <div class="flex items-center space-x-3 sm:space-x-2 flex-shrink-0">
          <div
            class="h-1.5 rounded-full transition-all duration-300"
            :style="{ 
              width: `${Math.max(8, (cmd.count / maxCount) * 40)}px`,
              backgroundColor: 'var(--textPrimary)'
            }"
          ></div>
          <div class="text-xs sm:text-2xs font-bold w-10 sm:w-8 text-right"
               :style="{ color: 'var(--textPrimary)' }">
            {{ formatCount(cmd.count) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Total -->
    <div
      class="flex items-center justify-between text-xs sm:text-2xs pt-3 sm:pt-2 flex-shrink-0"
      :style="{ borderTop: '1px solid var(--borderPrimary)' }"
    >
      <span :style="{ color: 'var(--textTertiary)' }">TOTAL EXECUTIONS</span>
      <span class="font-mono" :style="{ color: 'var(--textSecondary)' }">{{ formatNumber(totalExecutions) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useShellData } from '@renderer/composables/useShellData.js'

// Use global data store
const { getTopCommands, isLoading } = useShellData()

const topCommands = ref([])

// Computed properties
const maxCount = computed(() => (topCommands.value.length > 0 ? topCommands.value[0].count : 1))

const totalExecutions = computed(() => topCommands.value.reduce((sum, cmd) => sum + cmd.count, 0))

// Format numbers for display
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

// Format main value (top command count)
const formatMainValue = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Format count for each command
const formatCount = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K'
  }
  return num.toString()
}

// Load top commands data
const loadTopCommands = async () => {
  try {
    const result = await getTopCommands(15) // Get top 15 commands
    topCommands.value = result || []
  } catch (err) {
    console.error('Failed to load top commands:', err)
    topCommands.value = []
  }
}

onMounted(() => {
  loadTopCommands()
})
</script>

<style scoped>
.hover-item:hover {
  background-color: var(--hover-bg);
}
</style>