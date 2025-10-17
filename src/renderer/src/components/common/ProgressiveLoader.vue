<!-- Progressive component loader wrapper -->
<template>
  <div class="relative w-full h-full">
    <!-- Loading state with skeleton -->
    <div
      v-if="!isVisible"
      class="w-full h-full rounded-lg p-4"
      :style="{
        backgroundColor: 'var(--bgSecondary)',
        border: '1px solid var(--borderPrimary)'
      }"
    >
      <div class="flex flex-col h-full">
        <!-- Title skeleton -->
        <div class="skeleton-line w-1/3 h-4 mb-4"></div>

        <!-- Main content skeleton -->
        <div class="skeleton-line w-full h-8 mb-3"></div>
        <div class="skeleton-line w-2/3 h-4 mb-4"></div>

        <!-- Secondary metrics skeleton -->
        <div class="space-y-2 mt-auto">
          <div class="skeleton-line w-full h-3"></div>
          <div class="skeleton-line w-5/6 h-3"></div>
        </div>
      </div>
    </div>

    <!-- Actual component - use transition for smooth animation -->
    <transition name="fade-slide" @enter="onEnter" @leave="onLeave" :duration="300">
      <div v-if="isVisible" class="w-full h-full">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

// Props
const props = defineProps({
  delay: {
    type: Number,
    default: 0
  },
  loadingText: {
    type: String,
    default: 'Loading...'
  },
  priority: {
    type: Number,
    default: 1 // 1 = high priority, 2 = medium priority, 3 = low priority
  }
})

// State
const isVisible = ref(false)

// Progressive loading logic
onMounted(async () => {
  // Calculate actual delay based on priority
  const priorityDelay = (props.priority - 1) * 100 // High priority components load earlier
  const totalDelay = props.delay + priorityDelay

  // Wait for specified delay time
  if (totalDelay > 0) {
    await new Promise((resolve) => setTimeout(resolve, totalDelay))
  }

  // Wait for DOM update
  await nextTick()

  // Show component
  isVisible.value = true
})

// Animation event handlers
const onEnter = (el) => {
  console.log(`Component ${props.loadingText} rendered`)
}

const onLeave = (el) => {
  console.log(`Component ${props.loadingText} hidden`)
}
</script>

<style scoped>
/* Fade-in animation */
.fade-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(1.02);
}

/* Pulse animation optimization */
@keyframes subtle-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.6;
  }
}

.animate-pulse {
  animation: subtle-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
