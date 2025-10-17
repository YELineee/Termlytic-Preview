<template>
  <transition name="shortcuts-fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      @click.self="close"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-md" @click="close"></div>

      <!-- Shortcuts Panel -->
      <div
        class="relative w-full max-w-3xl rounded-2xl shadow-2xl glass-card overflow-hidden"
        :style="{
          backgroundColor: 'var(--bgSecondary)',
          border: '1px solid var(--borderPrimary)'
        }"
      >
        <!-- Header -->
        <div class="px-6 py-5 border-b flex items-center justify-between" :style="{ borderColor: 'var(--borderPrimary)' }">
          <div>
            <h2 class="text-xl font-bold" :style="{ color: 'var(--textPrimary)' }">
              Keyboard Shortcuts
            </h2>
            <p class="text-sm mt-1" :style="{ color: 'var(--textSecondary)' }">
              Boost your productivity with these shortcuts
            </p>
          </div>
          <button
            @click="close"
            class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-opacity-80 transition-colors"
            :style="{ backgroundColor: 'var(--bgHover)', color: 'var(--textSecondary)' }"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <div class="space-y-6">
            <!-- Navigation -->
            <div>
              <h3 class="text-sm font-semibold uppercase tracking-wider mb-3" :style="{ color: 'var(--textTertiary)' }">
                Navigation
              </h3>
              <div class="space-y-2">
                <div v-for="shortcut in navigationShortcuts" :key="shortcut.key" class="flex items-center justify-between p-3 rounded-lg" :style="{ backgroundColor: 'var(--bgTertiary)' }">
                  <span :style="{ color: 'var(--textPrimary)' }">{{ shortcut.description }}</span>
                  <div class="flex gap-1">
                    <kbd v-for="key in shortcut.keys" :key="key" class="px-2 py-1 rounded text-sm font-mono" :style="{ backgroundColor: 'var(--bgHover)', color: 'var(--textSecondary)' }">
                      {{ key }}
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div>
              <h3 class="text-sm font-semibold uppercase tracking-wider mb-3" :style="{ color: 'var(--textTertiary)' }">
                Actions
              </h3>
              <div class="space-y-2">
                <div v-for="shortcut in actionShortcuts" :key="shortcut.key" class="flex items-center justify-between p-3 rounded-lg" :style="{ backgroundColor: 'var(--bgTertiary)' }">
                  <span :style="{ color: 'var(--textPrimary)' }">{{ shortcut.description }}</span>
                  <div class="flex gap-1">
                    <kbd v-for="key in shortcut.keys" :key="key" class="px-2 py-1 rounded text-sm font-mono" :style="{ backgroundColor: 'var(--bgHover)', color: 'var(--textSecondary)' }">
                      {{ key }}
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            <!-- General -->
            <div>
              <h3 class="text-sm font-semibold uppercase tracking-wider mb-3" :style="{ color: 'var(--textTertiary)' }">
                General
              </h3>
              <div class="space-y-2">
                <div v-for="shortcut in generalShortcuts" :key="shortcut.key" class="flex items-center justify-between p-3 rounded-lg" :style="{ backgroundColor: 'var(--bgTertiary)' }">
                  <span :style="{ color: 'var(--textPrimary)' }">{{ shortcut.description }}</span>
                  <div class="flex gap-1">
                    <kbd v-for="key in shortcut.keys" :key="key" class="px-2 py-1 rounded text-sm font-mono" :style="{ backgroundColor: 'var(--bgHover)', color: 'var(--textSecondary)' }">
                      {{ key }}
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t flex items-center justify-between" :style="{ borderColor: 'var(--borderPrimary)' }">
          <div class="text-xs" :style="{ color: 'var(--textMuted)' }">
            <i class="fas fa-lightbulb mr-1"></i>
            Press <kbd class="px-1.5 py-0.5 rounded mx-1" :style="{ backgroundColor: 'var(--bgTertiary)' }">?</kbd> anytime to view shortcuts
          </div>
          <button
            @click="close"
            class="px-4 py-2 rounded-lg font-medium transition-colors"
            :style="{
              backgroundColor: 'var(--accentPrimary)',
              color: 'var(--bgPrimary)'
            }"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const isMac = computed(() => {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0
})

const modKey = computed(() => isMac.value ? '⌘' : 'Ctrl')

const navigationShortcuts = computed(() => [
  { key: 'nav-dashboard', description: 'Go to Dashboard', keys: [modKey.value, '1'] },
  { key: 'nav-heatmap', description: 'Go to Heatmap', keys: [modKey.value, '2'] },
  { key: 'nav-tickets', description: 'Go to Tickets', keys: [modKey.value, '3'] },
  { key: 'nav-settings', description: 'Go to Settings', keys: [modKey.value, '4'] }
])

const actionShortcuts = computed(() => [
  { key: 'action-refresh', description: 'Refresh Data', keys: [modKey.value, 'R'] },
  { key: 'action-search', description: 'Open Command Palette', keys: [modKey.value, 'K'] },
  { key: 'action-theme', description: 'Toggle Theme', keys: ['Click Theme Button'] },
  { key: 'action-copy', description: 'Copy Command', keys: ['Click Command'] }
])

const generalShortcuts = computed(() => [
  { key: 'general-help', description: 'Show Keyboard Shortcuts', keys: ['?'] },
  { key: 'general-close', description: 'Close Dialogs', keys: ['Esc'] },
  { key: 'general-navigate', description: 'Navigate in Lists', keys: ['↑', '↓'] }
])

const close = () => {
  emit('close')
}
</script>

<style scoped>
/* Shortcuts overlay animations */
.shortcuts-fade-enter-active {
  animation: shortcuts-in 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.shortcuts-fade-leave-active {
  animation: shortcuts-out 0.2s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes shortcuts-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shortcuts-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
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
