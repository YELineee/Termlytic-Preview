<template>
  <div
    class="w-full max-w-2xl bg-secondary border border-divider rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:-translate-y-1"
  >
    <!-- Header -->
    <div class="px-8 py-6 border-b border-divider bg-primary">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-primary">{{ title }}</h3>
            <p class="text-sm text-secondary mt-1">{{ subtitle }}</p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold text-accent font-mono">{{ items.length }}</div>
          <div class="text-xs text-secondary uppercase">Activities</div>
        </div>
      </div>
    </div>

    <!-- Timeline Content -->
    <div class="p-8 bg-tertiary max-h-[600px] overflow-y-auto custom-scrollbar">
      <div class="relative">
        <!-- Vertical Line -->
        <div
          class="absolute left-6 top-0 bottom-0 w-0.5 bg-divider"
          style="background: linear-gradient(180deg, var(--accentPrimary) 0%, var(--borderPrimary) 100%)"
        ></div>

        <!-- Timeline Items -->
        <div class="space-y-6">
          <div
            v-for="(item, index) in items"
            :key="index"
            class="relative pl-16 group"
          >
            <!-- Timeline Dot -->
            <div
              class="absolute left-0 w-12 h-12 rounded-xl bg-primary border-2 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-accent"
              :class="getTimelineDotClass(item.type)"
            >
              <component :is="getIcon(item.type)" class="w-5 h-5" :class="getIconColor(item.type)" />
            </div>

            <!-- Content Card -->
            <div
              class="bg-secondary border border-divider rounded-xl p-5 transition-all duration-300 group-hover:border-accent group-hover:shadow-lg"
            >
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1">
                  <h4 class="text-base font-semibold text-primary mb-1">{{ item.title }}</h4>
                  <p class="text-sm text-secondary">{{ item.description }}</p>
                </div>
                <span
                  class="ml-4 px-3 py-1 rounded-lg text-xs font-medium"
                  :class="getTypeBadgeClass(item.type)"
                >
                  {{ item.type }}
                </span>
              </div>

              <!-- Command or Details -->
              <div
                v-if="item.command"
                class="mt-3 p-3 bg-tertiary rounded-lg border border-divider"
              >
                <code class="text-xs font-mono text-accent">{{ item.command }}</code>
              </div>

              <!-- Meta Info -->
              <div class="mt-3 flex items-center justify-between text-xs text-tertiary">
                <div class="flex items-center space-x-4">
                  <span class="flex items-center space-x-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{{ item.time }}</span>
                  </span>
                  <span v-if="item.user" class="flex items-center space-x-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>{{ item.user }}</span>
                  </span>
                </div>
                <span v-if="item.duration" class="font-mono">{{ item.duration }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-8 py-4 bg-primary border-t border-divider">
      <div class="flex justify-between items-center text-xs text-tertiary">
        <span>Activity Timeline - {{ currentDate }}</span>
        <span class="font-mono">#{{ id }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, defineComponent } from 'vue'

type TimelineType = 'success' | 'warning' | 'error' | 'info' | 'command'

interface TimelineItem {
  type: TimelineType
  title: string
  description: string
  command?: string
  time: string
  user?: string
  duration?: string
}

interface Props {
  title?: string
  subtitle?: string
  items?: TimelineItem[]
  currentDate?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Activity Timeline',
  subtitle: 'Recent command history',
  items: () => [
    {
      type: 'command',
      title: 'Git Push Successful',
      description: 'Pushed changes to remote repository',
      command: 'git push origin main',
      time: '2 minutes ago',
      user: 'developer',
      duration: '1.2s'
    },
    {
      type: 'success',
      title: 'Build Completed',
      description: 'Production build finished successfully',
      command: 'npm run build',
      time: '15 minutes ago',
      user: 'developer',
      duration: '43.8s'
    },
    {
      type: 'warning',
      title: 'Linter Warning',
      description: 'Found 3 warnings in code style',
      command: 'npm run lint',
      time: '1 hour ago',
      user: 'developer',
      duration: '2.1s'
    },
    {
      type: 'info',
      title: 'Dependencies Updated',
      description: 'Installed new package dependencies',
      command: 'npm install',
      time: '3 hours ago',
      user: 'developer',
      duration: '12.5s'
    },
    {
      type: 'error',
      title: 'Test Failed',
      description: 'Unit tests encountered 2 failures',
      command: 'npm test',
      time: '5 hours ago',
      user: 'developer',
      duration: '8.3s'
    }
  ],
  currentDate: new Date().toLocaleDateString(),
  id: 'TL-001'
})

const getTimelineDotClass = (type: TimelineType) => {
  const classes = {
    success: 'border-success',
    warning: 'border-warning',
    error: 'border-error',
    info: 'border-info',
    command: 'border-accent'
  }
  return classes[type] || 'border-divider'
}

const getTypeBadgeClass = (type: TimelineType) => {
  const classes = {
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    error: 'bg-error/10 text-error border border-error/20',
    info: 'bg-info/10 text-info border border-info/20',
    command: 'bg-accent/10 text-accent border border-accent/20'
  }
  return classes[type] || 'bg-tertiary text-secondary'
}

const getIconColor = (type: TimelineType) => {
  const colors = {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info',
    command: 'text-accent'
  }
  return colors[type] || 'text-secondary'
}

const getIcon = (type: TimelineType) => {
  const icons = {
    success: defineComponent({
      render: () =>
        h(
          'svg',
          { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-5 h-5' },
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M5 13l4 4L19 7'
          })
        )
    }),
    warning: defineComponent({
      render: () =>
        h(
          'svg',
          { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-5 h-5' },
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
          })
        )
    }),
    error: defineComponent({
      render: () =>
        h(
          'svg',
          { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-5 h-5' },
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M6 18L18 6M6 6l12 12'
          })
        )
    }),
    info: defineComponent({
      render: () =>
        h(
          'svg',
          { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-5 h-5' },
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          })
        )
    }),
    command: defineComponent({
      render: () =>
        h(
          'svg',
          { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-5 h-5' },
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'stroke-width': '2',
            d: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
          })
        )
    })
  }
  return icons[type] || icons.info
}
</script>

<style scoped>
.bg-accent-gradient {
  background: linear-gradient(135deg, var(--accentPrimary) 0%, var(--accentSecondary) 100%);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--bgPrimary);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--borderSecondary);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--accentSecondary);
}
</style>
