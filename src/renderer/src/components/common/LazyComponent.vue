<template>
  <div class="lazy-component">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center h-full">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"
      ></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center h-full error-text">
      <div class="text-center">
        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
        <div class="text-xs">{{ error }}</div>
      </div>
    </div>

    <!-- Actual component -->
    <component v-else :is="componentToRender" v-bind="$attrs" v-on="$listeners" />
  </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'

const props = defineProps({
  component: {
    type: [String, Object, Function],
    required: true
  },
  delay: {
    type: Number,
    default: 0 // Lazy load delay (ms)
  }
})

const loading = ref(true)
const error = ref(null)
const componentToRender = ref(null)

onMounted(async () => {
  try {
    // Wait if delay is set
    if (props.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, props.delay))
    }

    // If async component
    if (typeof props.component === 'function') {
      componentToRender.value = defineAsyncComponent(props.component)
    } else {
      componentToRender.value = props.component
    }

    loading.value = false
  } catch (err) {
    console.error('Failed to load component:', err)
    error.value = err.message || 'Failed to load component'
    loading.value = false
  }
})
</script>

<style scoped>
.lazy-component {
  width: 100%;
  height: 100%;
}
</style>
