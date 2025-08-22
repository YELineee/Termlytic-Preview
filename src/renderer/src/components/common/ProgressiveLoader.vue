<!-- 渐进式组件Load包装器 -->
<template>
  <div class="relative w-full h-full">
    <!-- Load状态占位符 -->
    <div v-if="!isVisible" class="w-full h-full bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-center">
      <div class="text-center">
        <div class="inline-block animate-pulse rounded-full h-4 w-4 bg-gray-700 mb-2"></div>
        <div class="text-gray-500 text-xs">{{ loadingText || 'Loading...' }}</div>
      </div>
    </div>

    <!-- 实际组件 - 使用transition实现平滑过渡 -->
    <transition 
      name="fade-slide" 
      @enter="onEnter" 
      @leave="onLeave"
      :duration="300"
    >
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

// 状态
const isVisible = ref(false)

// 渐进式Load逻辑
onMounted(async () => {
  // 根据优先级计算实际延迟
  const priorityDelay = (props.priority - 1) * 100 // 高优先级组件更早Load
  const totalDelay = props.delay + priorityDelay
  
  // 等待指定延迟时间
  if (totalDelay > 0) {
    await new Promise(resolve => setTimeout(resolve, totalDelay))
  }
  
  // 等待DOM更新
  await nextTick()
  
  // 显示组件
  isVisible.value = true
})

// 动画事件处理
const onEnter = (el) => {
  console.log(`Component ${props.loadingText} rendered`)
}

const onLeave = (el) => {
  console.log(`Component ${props.loadingText} hidden`)
}
</script>

<style scoped>
/* 渐入动画 */
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

/* 脉冲动画优化 */
@keyframes subtle-pulse {
  0%, 100% {
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
