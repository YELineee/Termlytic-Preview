<template>
  <div
    class="w-18 h-full navibar bg-gray-900 border-r border-gray-700 flex flex-col items-center py-4"
  >
    <!-- Top: App icon -->
    <div class="text-white font-bold text-xl select-none mb-6 mt-12">T</div>

    <!-- Middle: Navigation menu -->
    <div class="flex flex-col items-center space-y-2 flex-1">
      <button
        v-for="item in navigationItems"
        :key="item.name"
        @click="switchPage(item.name)"
        :class="[
          'w-10 h-10 text-lg transition-all duration-200 rounded-md flex items-center justify-center',
          'no-drag', // Prevent dragging
          currentPage === item.name
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-gray-300 hover:text-white hover:bg-gray-700'
        ]"
        :title="item.label"
      >
        <i :class="item.icon"></i>
      </button>
    </div>

    <!-- Bottom: Refresh button -->
    <div class="flex flex-col items-center">
      <button
        @click="refreshData"
        class="no-drag w-10 h-10 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors flex items-center justify-center"
        title="RefreshData"
      >
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Define emits
const emit = defineEmits(['page-change', 'refresh-data'])

// Reactive data
const currentPage = ref('dashboard')

// 导航项配置
const navigationItems = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    icon: 'fas fa-tachometer-alt'
  },
  {
    name: 'analysis',
    label: 'Heatmap',
    icon: 'fas fa-chart-line'
  },
  {
    name: 'ticket',
    label: 'Tickets',
    icon: 'fas fa-ticket-alt'
  },
  {
    name: 'settings',
    label: 'Settings',
    icon: 'fas fa-cog'
  }
]

// Methods
const switchPage = (pageName) => {
  if (pageName !== currentPage.value) {
    currentPage.value = pageName
    // 发送页面切换事件
    emit('page-change', pageName)
  }
}

const refreshData = () => {
  // 直接发送RefreshData事件，不显示Load状态
  emit('refresh-data')
}

// 暴露当前页面给父组件
defineExpose({
  currentPage,
  setPage: (pageName) => {
    currentPage.value = pageName
  }
})

onMounted(() => {
  // 初始化时发送默认页面
  emit('page-change', currentPage.value)
})
</script>

<style scoped>
.navibar {
  -webkit-app-region: drag;
}

.no-drag {
  -webkit-app-region: no-drag;
}

/* Prevent button from being selected */
button {
  -webkit-user-select: none;
  user-select: none;
}

/* 添加一些动画效果 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
