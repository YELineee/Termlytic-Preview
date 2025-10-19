<template>
  <div
    class="w-full max-w-sm bg-secondary border border-divider rounded-lg shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] hover:-translate-y-0.5 hover:border-accent"
  >
    <!-- Compact Header with Icon -->
    <div class="px-5 py-4 bg-primary border-b border-divider">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 rounded-lg bg-accent-gradient flex items-center justify-center flex-shrink-0"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-semibold text-primary truncate">{{ title }}</h3>
            <p class="text-xs text-tertiary truncate">{{ subtitle }}</p>
          </div>
        </div>
        <div
          v-if="badge"
          class="ml-2 px-2 py-1 rounded-md text-xs font-medium bg-accent/10 text-accent border border-accent/20 flex-shrink-0"
        >
          {{ badge }}
        </div>
      </div>
    </div>

    <!-- Compact Content -->
    <div class="p-5 space-y-4">
      <!-- Main Metric -->
      <div class="flex items-baseline justify-between">
        <div>
          <div class="text-3xl font-bold text-accent font-mono">{{ mainValue }}</div>
          <div class="text-xs text-secondary mt-1 uppercase tracking-wide">{{ mainLabel }}</div>
        </div>
        <div
          v-if="trend !== 0"
          class="flex items-center space-x-1 px-2 py-1 rounded-md"
          :class="trend > 0 ? 'bg-success/10' : 'bg-error/10'"
        >
          <svg
            v-if="trend > 0"
            class="w-3.5 h-3.5 text-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
          <svg
            v-else
            class="w-3.5 h-3.5 text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          <span :class="trend > 0 ? 'text-success' : 'text-error'" class="text-xs font-medium">
            {{ Math.abs(trend) }}%
          </span>
        </div>
      </div>

      <!-- Mini Stats Grid -->
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="(stat, index) in miniStats"
          :key="index"
          class="bg-tertiary rounded-lg p-3 border border-divider hover:border-accent transition-colors duration-200"
        >
          <div class="text-lg font-bold text-primary font-mono">{{ stat.value }}</div>
          <div class="text-xs text-secondary mt-0.5 uppercase tracking-wide">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Progress Indicator (Optional) -->
      <div v-if="showProgress" class="space-y-2">
        <div class="flex justify-between text-xs text-secondary">
          <span>{{ progressLabel }}</span>
          <span class="font-mono">{{ progressValue }}/{{ progressMax }}</span>
        </div>
        <div class="w-full bg-primary rounded-full h-1.5 overflow-hidden">
          <div
            class="h-full bg-accent-gradient rounded-full transition-all duration-500"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Compact Footer -->
    <div class="px-5 py-3 bg-tertiary border-t border-divider">
      <div class="flex items-center justify-between text-xs text-tertiary">
        <span class="flex items-center space-x-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ lastUpdated }}</span>
        </span>
        <span class="font-mono">#{{ id }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface MiniStat {
  label: string
  value: string | number
}

interface Props {
  title?: string
  subtitle?: string
  badge?: string
  mainValue?: string | number
  mainLabel?: string
  miniStats?: MiniStat[]
  trend?: number
  showProgress?: boolean
  progressLabel?: string
  progressValue?: number
  progressMax?: number
  lastUpdated?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Command Summary',
  subtitle: 'Quick overview',
  badge: '',
  mainValue: '3,847',
  mainLabel: 'Commands',
  miniStats: () => [
    { label: 'Today', value: '84' },
    { label: 'Avg/Day', value: '127' }
  ],
  trend: 0,
  showProgress: false,
  progressLabel: 'Daily Goal',
  progressValue: 84,
  progressMax: 100,
  lastUpdated: 'Just now',
  id: 'CPT-001'
})

const progressPercent = computed(() => {
  if (!props.showProgress) return 0
  return Math.min(Math.round((props.progressValue / props.progressMax) * 100), 100)
})
</script>

<style scoped>
.bg-accent-gradient {
  background: linear-gradient(135deg, var(--accentPrimary) 0%, var(--accentSecondary) 100%);
}
</style>
