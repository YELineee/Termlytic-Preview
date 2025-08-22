<template>
  <!-- Global loading overlay -->
  <div v-if="isAppLoading" class="fixed inset-0 z-50 bg-gray-900 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
      <div class="text-white text-lg font-medium">Initializing Termlytic...</div>
      <div class="text-gray-400 text-sm mt-2">Loading core data...</div>
    </div>
  </div>

  <div class="flex h-screen bg-gray-900">
    <!-- Left navigation -->
    <navigation
      ref="navigationRef"
      @page-change="handlePageChange"
      @refresh-data="handleRefreshData"
    />

    <!-- Main content area -->
    <div class="flex-1 overflow-hidden relative">

      <!-- Drag region for window movement -->
      <div class="absolute w-full h-6 z-10 drag-region"/> 
      
      <!-- Page loading indicator -->
      <div v-if="isAnyLoading && !isAppLoading" class="absolute top-0 left-0 right-0 z-10">
        <div class="bg-blue-600 h-1 transition-all duration-300" :style="{ width: `${loadingProgress}%` }"></div>
      </div>

      <!-- Dashboard page -->
      <PageDashboard v-if="currentPage === 'dashboard'" />

      <!-- Analysis page -->
      <PageAnalysis v-else-if="currentPage === 'analysis'" />

      <!-- Ticket page -->
      <PageTicketBoard v-else-if="currentPage === 'ticket'" />

      <!-- Settings page -->
      <PageSettings v-else-if="currentPage === 'settings'" />

      <!-- Default or error page -->
      <div v-else class="flex items-center justify-center h-full">
        <div class="text-center">
          <div class="text-gray-400 text-xl mb-4">Page not found</div>
          <button
            @click="goToDashboard"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navigation from '@renderer/components/Navigation.vue'
import PageDashboard from '@renderer/components/PageDashboard.vue'
import PageAnalysis from '@renderer/components/PageHeatmap.vue'
import PageTicketBoard from '@renderer/components/PageTicketBoard.vue'
import PageSettings from '@renderer/components/PageSettings.vue'
import { useShellData } from '@renderer/composables/useShellData.js'
import { useLoadingState } from '@renderer/composables/useLoadingState.js'

// Use global data store and loading state
const { refreshData } = useShellData()
const { isAppLoading, isAnyLoading, loadingProgress, setGlobalLoading } = useLoadingState()

// Reactive data
const currentPage = ref('dashboard')
const navigationRef = ref(null)

// Page switching with loading state management
const handlePageChange = async (pageName) => {
  console.log(`Switching to page: ${pageName}`)
  
  try {
    // Set page switching loading state
    setGlobalLoading(pageName, true)
    
    currentPage.value = pageName

    switch (pageName) {
      case 'dashboard':
        console.log('Loading dashboard...')
        break
      case 'analysis':
        console.log('Loading analysis page...')
        break
      case 'ticket':
        console.log('Loading ticket board...')
        break
      case 'settings':
        console.log('Loading settings...')
        break
    }
  } catch (error) {
    console.error(`Failed to load page ${pageName}:`, error)
  } finally {
    setTimeout(() => {
      setGlobalLoading(pageName, false)
    }, 300)
  }
}

// Data refresh handler
const handleRefreshData = async () => {
  try {
    const { refreshData } = useShellData()
    const result = await refreshData()

    if (result.success) {
      console.log('Data refreshed successfully')
    } else {
      console.error('Refresh failed:', result.error || 'Unknown error')
    }
  } catch (error) {
    console.error('Failed to refresh data:', error)
  }
}

// Return to dashboard
const goToDashboard = () => {
  currentPage.value = 'dashboard'
  navigationRef.value?.setPage('dashboard')
}

// Keyboard shortcut support
const handleKeydown = (event) => {
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
    switch (event.key) {
      case '1':
        event.preventDefault()
        handlePageChange('dashboard')
        navigationRef.value?.setPage('dashboard')
        break
      case '2':
        event.preventDefault()
        handlePageChange('analysis')
        navigationRef.value?.setPage('analysis')
        break
      case '3':
        event.preventDefault()
        handlePageChange('ticket')
        navigationRef.value?.setPage('ticket')
        break
      case '4':
        event.preventDefault()
        handlePageChange('settings')
        navigationRef.value?.setPage('settings')
        break
      case 'r':
        event.preventDefault()
        handleRefreshData()
        break
    }
  }
}

// Add keyboard event listeners
window.addEventListener('keydown', handleKeydown)
</script>

<style scoped>
.drag-region {
  -webkit-app-region: drag;
}
/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
