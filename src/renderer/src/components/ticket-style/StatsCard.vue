<template>
  <div
    class="w-full max-w-md bg-secondary border border-divider rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:-translate-y-1"
  >
    <!-- Header with Gradient Icon -->
    <div class="p-6 border-b border-divider">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 rounded-xl bg-accent-gradient flex items-center justify-center">
            <svg
              class="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-primary">{{ title }}</h3>
            <p class="text-sm text-secondary mt-1">{{ subtitle }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Statistics Display -->
    <div class="p-8 bg-tertiary">
      <div class="text-center">
        <div class="text-6xl font-bold text-accent mb-2 font-mono tracking-tight">
          {{ mainValue }}
        </div>
        <div class="text-sm text-secondary uppercase tracking-wider">{{ mainLabel }}</div>
      </div>

      <!-- Progress Bar (Optional) -->
      <div v-if="showProgress" class="mt-6">
        <div class="flex justify-between text-xs text-secondary mb-2">
          <span>Progress</span>
          <span>{{ progressPercent }}%</span>
        </div>
        <div class="w-full bg-primary rounded-full h-2 overflow-hidden">
          <div
            class="h-full bg-accent-gradient rounded-full transition-all duration-500"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
      </div>

      <!-- Trend Indicator -->
      <div v-if="trend !== 0" class="mt-4 flex items-center justify-center space-x-2">
        <svg
          v-if="trend > 0"
          class="w-5 h-5 text-success"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
        <svg
          v-else
          class="w-5 h-5 text-error"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
          />
        </svg>
        <span :class="trend > 0 ? 'text-success' : 'text-error'" class="text-sm font-medium">
          {{ Math.abs(trend) }}% {{ trend > 0 ? 'increase' : 'decrease' }}
        </span>
      </div>
    </div>

    <!-- Sub Statistics Grid -->
    <div class="grid grid-cols-3 gap-px bg-divider">
      <div
        v-for="(stat, index) in subStats"
        :key="index"
        class="bg-secondary p-4 text-center hover:bg-hover transition-colors duration-200"
      >
        <div class="text-2xl font-bold text-primary font-mono">{{ stat.value }}</div>
        <div class="text-xs text-secondary mt-1 uppercase tracking-wide">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-6 py-4 bg-primary border-t border-divider">
      <div class="flex justify-between items-center text-xs text-tertiary">
        <span>Last updated: {{ lastUpdated }}</span>
        <span class="font-mono">#{{ id }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SubStat {
  label: string
  value: string | number
}

interface Props {
  title?: string
  subtitle?: string
  mainValue?: string | number
  mainLabel?: string
  subStats?: SubStat[]
  trend?: number
  showProgress?: boolean
  progressPercent?: number
  lastUpdated?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Command Statistics',
  subtitle: 'Real-time analytics',
  mainValue: '12,847',
  mainLabel: 'Total Commands',
  subStats: () => [
    { label: 'Today', value: '127' },
    { label: 'This Week', value: '834' },
    { label: 'This Month', value: '3,241' }
  ],
  trend: 0,
  showProgress: false,
  progressPercent: 75,
  lastUpdated: new Date().toLocaleDateString(),
  id: 'STAT-001'
})
</script>

<style scoped>
.bg-accent-gradient {
  background: linear-gradient(135deg, var(--accentPrimary) 0%, var(--accentSecondary) 100%);
}
</style>
