<template>
  <div class="toast-container fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item pointer-events-auto rounded-lg p-4 shadow-2xl backdrop-blur-md border flex items-center gap-3 min-w-[300px] max-w-[400px]"
        :class="[getToastClass(toast.type), 'glass-card']"
        :style="{
          backgroundColor: getToastBg(toast.type),
          borderColor: getToastBorder(toast.type)
        }"
      >
        <!-- Icon -->
        <div class="flex-shrink-0">
          <i :class="getIcon(toast.type)" class="text-lg" :style="{ color: getIconColor(toast.type) }"></i>
        </div>

        <!-- Message -->
        <div class="flex-1 text-sm font-medium" :style="{ color: 'var(--textPrimary)' }">
          {{ toast.message }}
        </div>

        <!-- Action Button (Optional) -->
        <button
          v-if="toast.action"
          @click="toast.action.onClick"
          class="flex-shrink-0 text-xs font-semibold px-2 py-1 rounded hover:opacity-80 transition-opacity"
          :style="{
            color: 'var(--accentPrimary)',
            backgroundColor: 'var(--bgTertiary)'
          }"
        >
          {{ toast.action.label }}
        </button>

        <!-- Dismiss Button -->
        <button
          v-if="toast.dismissible"
          @click="dismiss(toast.id)"
          class="flex-shrink-0 text-xs opacity-60 hover:opacity-100 transition-opacity"
          :style="{ color: 'var(--textSecondary)' }"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToast } from '@renderer/composables/useToast.js'

const { toasts, dismiss } = useToast()

const getIcon = (type) => {
  switch (type) {
    case 'success': return 'fas fa-check-circle'
    case 'error': return 'fas fa-exclamation-circle'
    case 'warning': return 'fas fa-exclamation-triangle'
    case 'info': return 'fas fa-info-circle'
    default: return 'fas fa-info-circle'
  }
}

const getToastClass = (type) => {
  return `toast-${type}`
}

const getToastBg = (type) => {
  switch (type) {
    case 'success': return 'rgba(16, 185, 129, 0.1)'
    case 'error': return 'rgba(239, 68, 68, 0.1)'
    case 'warning': return 'rgba(245, 158, 11, 0.1)'
    case 'info': return 'rgba(59, 130, 246, 0.1)'
    default: return 'var(--bgSecondary)'
  }
}

const getToastBorder = (type) => {
  switch (type) {
    case 'success': return 'var(--success)'
    case 'error': return 'var(--error)'
    case 'warning': return 'var(--warning)'
    case 'info': return 'var(--info)'
    default: return 'var(--borderPrimary)'
  }
}

const getIconColor = (type) => {
  switch (type) {
    case 'success': return 'var(--success)'
    case 'error': return 'var(--error)'
    case 'warning': return 'var(--warning)'
    case 'info': return 'var(--info)'
    default: return 'var(--textPrimary)'
  }
}
</script>

<style scoped>
.toast-container {
  -webkit-app-region: no-drag;
}

/* Toast animation */
.toast-enter-active {
  animation: toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  animation: toast-out 0.2s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
}

.toast-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-item:hover {
  transform: translateX(-4px);
}
</style>
