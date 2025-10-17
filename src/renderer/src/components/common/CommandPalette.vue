<template>
  <transition name="palette-fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[10000] flex items-start justify-center pt-[20vh]"
      @click.self="close"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close"></div>

      <!-- Palette Container -->
      <div
        class="relative w-full max-w-2xl mx-4 rounded-xl shadow-2xl glass-card overflow-hidden"
        :style="{
          backgroundColor: 'var(--bgSecondary)',
          border: '1px solid var(--borderPrimary)'
        }"
      >
        <!-- Search Input -->
        <div class="flex items-center gap-3 p-4 border-b" :style="{ borderColor: 'var(--borderPrimary)' }">
          <i class="fas fa-search text-lg" :style="{ color: 'var(--textSecondary)' }"></i>
          <input
            ref="searchInput"
            v-model="query"
            type="text"
            placeholder="Search commands, pages, actions..."
            class="flex-1 bg-transparent outline-none text-base"
            :style="{ color: 'var(--textPrimary)' }"
            @keydown.down.prevent="selectNext"
            @keydown.up.prevent="selectPrevious"
            @keydown.enter="executeSelected"
            @keydown.esc="close"
          />
          <kbd class="px-2 py-1 rounded text-xs" :style="{
            backgroundColor: 'var(--bgTertiary)',
            color: 'var(--textMuted)'
          }">ESC</kbd>
        </div>

        <!-- Results -->
        <div class="max-h-[400px] overflow-y-auto">
          <div
            v-if="filteredResults.length === 0"
            class="p-8 text-center"
            :style="{ color: 'var(--textMuted)' }"
          >
            <i class="fas fa-search text-3xl mb-2"></i>
            <div>No results found for "{{ query }}"</div>
          </div>

          <div v-else class="py-2">
            <div
              v-for="(result, index) in filteredResults"
              :key="result.id"
              @click="execute(result)"
              @mouseenter="selectedIndex = index"
              class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
              :class="{ 'selected': selectedIndex === index }"
              :style="{
                backgroundColor: selectedIndex === index ? 'var(--bgHover)' : 'transparent'
              }"
            >
              <!-- Icon -->
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center"
                :style="{
                  backgroundColor: result.iconBg || 'var(--bgTertiary)',
                  color: result.iconColor || 'var(--textPrimary)'
                }"
              >
                <i :class="result.icon"></i>
              </div>

              <!-- Content -->
              <div class="flex-1">
                <div class="font-medium" :style="{ color: 'var(--textPrimary)' }">
                  {{ result.name }}
                </div>
                <div v-if="result.description" class="text-xs" :style="{ color: 'var(--textSecondary)' }">
                  {{ result.description }}
                </div>
              </div>

              <!-- Shortcut -->
              <div v-if="result.shortcut" class="flex gap-1">
                <kbd
                  v-for="key in result.shortcut.split('+')"
                  :key="key"
                  class="px-2 py-1 rounded text-xs"
                  :style="{
                    backgroundColor: 'var(--bgTertiary)',
                    color: 'var(--textMuted)'
                  }"
                >
                  {{ key }}
                </kbd>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between px-4 py-3 border-t text-xs"
          :style="{
            borderColor: 'var(--borderPrimary)',
            color: 'var(--textMuted)'
          }"
        >
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-1">
              <kbd class="px-1.5 py-0.5 rounded" :style="{ backgroundColor: 'var(--bgTertiary)' }">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div class="flex items-center gap-1">
              <kbd class="px-1.5 py-0.5 rounded" :style="{ backgroundColor: 'var(--bgTertiary)' }">↵</kbd>
              <span>Select</span>
            </div>
            <div class="flex items-center gap-1">
              <kbd class="px-1.5 py-0.5 rounded" :style="{ backgroundColor: 'var(--bgTertiary)' }">ESC</kbd>
              <span>Close</span>
            </div>
          </div>
          <div>{{ filteredResults.length }} results</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'execute'])

const query = ref('')
const selectedIndex = ref(0)
const searchInput = ref(null)

// Command database
const commands = ref([
  // Pages
  { id: 'page-dashboard', name: 'Dashboard', description: 'View overall statistics', icon: 'fas fa-tachometer-alt', type: 'page', action: () => emit('execute', { type: 'page', value: 'dashboard' }), shortcut: 'Cmd+1' },
  { id: 'page-analysis', name: 'Heatmap', description: 'Analyze command patterns', icon: 'fas fa-chart-line', type: 'page', action: () => emit('execute', { type: 'page', value: 'analysis' }), shortcut: 'Cmd+2' },
  { id: 'page-ticket', name: 'Tickets', description: 'View command tickets', icon: 'fas fa-ticket-alt', type: 'page', action: () => emit('execute', { type: 'page', value: 'ticket' }), shortcut: 'Cmd+3' },
  { id: 'page-settings', name: 'Settings', description: 'Configure preferences', icon: 'fas fa-cog', type: 'page', action: () => emit('execute', { type: 'page', value: 'settings' }), shortcut: 'Cmd+4' },

  // Actions
  { id: 'action-refresh', name: 'Refresh Data', description: 'Reload all shell data', icon: 'fas fa-sync-alt', type: 'action', action: () => emit('execute', { type: 'refresh' }), shortcut: 'Cmd+R', iconBg: 'rgba(59, 130, 246, 0.2)', iconColor: '#3B82F6' },
  { id: 'action-clear-cache', name: 'Clear Cache', description: 'Remove cached data', icon: 'fas fa-trash', type: 'action', action: () => emit('execute', { type: 'clear-cache' }), iconBg: 'rgba(239, 68, 68, 0.2)', iconColor: '#EF4444' },
  { id: 'action-export', name: 'Export Data', description: 'Export to CSV/JSON', icon: 'fas fa-download', type: 'action', action: () => emit('execute', { type: 'export' }), iconBg: 'rgba(16, 185, 129, 0.2)', iconColor: '#10B981' },
  { id: 'action-theme', name: 'Toggle Theme', description: 'Switch color theme', icon: 'fas fa-palette', type: 'action', action: () => emit('execute', { type: 'theme' }), iconBg: 'rgba(245, 158, 11, 0.2)', iconColor: '#F59E0B' },
])

// Filter results based on query
const filteredResults = computed(() => {
  if (!query.value) {
    return commands.value
  }

  const q = query.value.toLowerCase()
  return commands.value.filter(cmd => {
    return cmd.name.toLowerCase().includes(q) ||
           (cmd.description && cmd.description.toLowerCase().includes(q)) ||
           (cmd.type && cmd.type.toLowerCase().includes(q))
  })
})

// Navigation
const selectNext = () => {
  if (selectedIndex.value < filteredResults.value.length - 1) {
    selectedIndex.value++
  }
}

const selectPrevious = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  }
}

const executeSelected = () => {
  if (filteredResults.value[selectedIndex.value]) {
    execute(filteredResults.value[selectedIndex.value])
  }
}

const execute = (command) => {
  command.action()
  close()
}

const close = () => {
  emit('close')
  query.value = ''
  selectedIndex.value = 0
}

// Auto-focus input when opened
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    searchInput.value?.focus()
  }
})
</script>

<style scoped>
/* Palette animations */
.palette-fade-enter-active {
  animation: palette-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.palette-fade-leave-active {
  animation: palette-out 0.15s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes palette-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes palette-out {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bgSecondary);
}

::-webkit-scrollbar-thumb {
  background: var(--bgHover);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--borderSecondary);
}
</style>
