<template>
  <div
    class="w-full h-full rounded-lg p-4 flex flex-col justify-between dashboard-card ripple-container"
    :style="{
      backgroundColor: 'var(--bgSecondary)',
      border: '1px solid var(--borderPrimary)'
    }"
    @click="createRipple"
  >
    <!-- Title -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <div
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: 'var(--textSecondary)' }"
        ></div>
        <div
          class="text-xs uppercase tracking-wider font-medium"
          :style="{ color: 'var(--textTertiary)' }"
        >
          COMPLETED TASKS
        </div>
      </div>
      <div class="text-xs" :style="{ color: 'var(--textMuted)' }">∞</div>
    </div>

    <!-- Main Values with Animated Counter -->
    <div class="flex-1 flex flex-col justify-center">
      <div class="text-4xl font-bold mb-1" :style="{ color: 'var(--textPrimary)' }">
        {{ isLoading ? '...' : formattedMainNumber }}
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-sm" :style="{ color: 'var(--textSecondary)' }">/</span>
        <span class="text-xs uppercase tracking-wider" :style="{ color: 'var(--textSecondary)' }">{{
          mainUnit
        }}</span>
      </div>
    </div>

    <!-- Secondary Metrics -->
    <div class="space-y-1">
      <div class="flex items-center justify-between text-xs">
        <span :style="{ color: 'var(--textTertiary)' }">Active Days</span>
        <span :style="{ color: 'var(--textSecondary)' }">{{ stats.activeDays }}</span>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span :style="{ color: 'var(--textTertiary)' }">Unique Cmds</span>
        <span :style="{ color: 'var(--textSecondary)' }">{{
          formatNumber(stats.uniqueCommands)
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useShellData } from '@renderer/composables/useShellData.js'
import { useAnimatedCounter } from '@renderer/composables/useAnimatedCounter.js'

// Use global data store
const { getStats, isLoading } = useShellData()

// Animated counter
const animatedCount = useAnimatedCounter(0, 1200)

// Reactive data
const stats = ref({
  totalCommands: 0,
  activeDays: 0,
  uniqueCommands: 0
})

// Computed properties for formatted display
const formattedMainNumber = computed(() => {
  const num = animatedCount.displayValue.value
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1)
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1)
  }
  return num.toString()
})

const mainUnit = computed(() => {
  const num = stats.value.totalCommands
  if (num >= 1000000) {
    return 'M'
  } else if (num >= 1000) {
    return 'K'
  }
  return ''
})

// Methods
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

// Format main numbers (more prominent display)
const formatMainNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1)
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1)
  }
  return num.toString()
}

// Get main unit
const getMainUnit = (num) => {
  if (num >= 1000000) {
    return 'M'
  } else if (num >= 1000) {
    return 'K'
  }
  return ''
}

const loadStats = async () => {
  try {
    const result = await getStats()
    stats.value = result
    // Animate counter when data loads
    animatedCount.setValue(result.totalCommands)
  } catch (err) {
    console.error('Failed to load stats:', err)
  }
}

// Ripple effect
const createRipple = (event) => {
  const card = event.currentTarget
  const ripple = document.createElement('span')
  ripple.classList.add('ripple-effect')

  const rect = card.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2

  ripple.style.width = ripple.style.height = size + 'px'
  ripple.style.left = x + 'px'
  ripple.style.top = y + 'px'

  card.appendChild(ripple)

  setTimeout(() => {
    ripple.remove()
  }, 600)
}

// Watch for stat changes
watch(() => stats.value.totalCommands, (newVal) => {
  animatedCount.setValue(newVal)
})

// Load data when component mounts
onMounted(() => {
  loadStats()
})
</script>
