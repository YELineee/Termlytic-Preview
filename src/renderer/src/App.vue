<template>
  <!-- Global loading overlay -->
  <div
    v-if="isAppLoading"
    class="fixed inset-0 z-50 flex items-center justify-center"
    :style="{ backgroundColor: 'var(--bgPrimary)' }"
  >
    <div class="text-center">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4"
        :style="{ borderColor: 'var(--textPrimary)' }"
      ></div>
      <div class="text-lg font-medium" :style="{ color: 'var(--textPrimary)' }">
        Initializing Termlytic...
      </div>
      <div class="text-sm mt-2" :style="{ color: 'var(--textSecondary)' }">
        Loading core data...
      </div>
    </div>
  </div>

  <!-- Particle Background -->
  <div class="particles-container">
    <div v-for="i in 20" :key="i" class="particle"></div>
  </div>

  <!-- Toast Notifications -->
  <ToastContainer />

  <!-- Command Palette -->
  <CommandPalette
    :isOpen="showCommandPalette"
    @close="showCommandPalette = false"
    @execute="handlePaletteAction"
  />

  <!-- Keyboard Shortcuts -->
  <KeyboardShortcuts
    :isOpen="showShortcuts"
    @close="showShortcuts = false"
  />

  <div class="flex h-screen relative z-10" :style="{ backgroundColor: 'var(--bgPrimary)' }">
    <!-- Left navigation -->
    <navigation
      ref="navigationRef"
      @page-change="handlePageChange"
      @refresh-data="handleRefreshData"
    />

    <!-- Main content area -->
    <div class="flex-1 overflow-hidden relative">
      <!-- Drag region for window movement -->
      <div class="absolute w-full h-6 z-10 drag-region" />

      <!-- Page loading indicator -->
      <div v-if="isAnyLoading && !isAppLoading" class="absolute top-0 left-0 right-0 z-10">
        <div
          class="h-1 transition-all duration-300"
          :style="{ width: `${loadingProgress}%`, backgroundColor: 'var(--textPrimary)' }"
        ></div>
      </div>

      <!-- Pages with transitions -->
      <transition name="page-transition" mode="out-in">
        <!-- Dashboard page -->
        <PageDashboard v-if="currentPage === 'dashboard'" key="dashboard" />

        <!-- Analysis page -->
        <PageAnalysis v-else-if="currentPage === 'analysis'" key="analysis" />

        <!-- Ticket page -->
        <PageTicketBoard v-else-if="currentPage === 'ticket'" key="ticket" />

        <!-- Settings page -->
        <PageSettings v-else-if="currentPage === 'settings'" key="settings" />

        <!-- Default or error page -->
        <div v-else class="flex items-center justify-center h-full" key="error">
          <div class="text-center">
            <div class="text-xl mb-4" :style="{ color: 'var(--textSecondary)' }">Page not found</div>
            <button
              @click="goToDashboard"
              class="px-4 py-2 rounded transition-colors"
              :style="{
                backgroundColor: 'var(--bgTertiary)',
                color: 'var(--textPrimary)',
                border: '1px solid var(--borderPrimary)'
              }"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </transition>
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
import ToastContainer from '@renderer/components/common/ToastContainer.vue'
import CommandPalette from '@renderer/components/common/CommandPalette.vue'
import KeyboardShortcuts from '@renderer/components/common/KeyboardShortcuts.vue'
import { useShellData } from '@renderer/composables/useShellData.js'
import { useLoadingState } from '@renderer/composables/useLoadingState.js'
import { useToast } from '@renderer/composables/useToast.js'
import { useTheme } from '@renderer/composables/useTheme.js'

// Use global data store and loading state
const { refreshData } = useShellData()
const { isAppLoading, isAnyLoading, loadingProgress, setGlobalLoading } = useLoadingState()
const { success } = useToast()
const { toggleTheme } = useTheme()

// Reactive data
const currentPage = ref('dashboard')
const navigationRef = ref(null)
const showCommandPalette = ref(false)
const showShortcuts = ref(false)

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
      success('Data refreshed successfully!')
    } else {
      console.error('Refresh failed:', result.error || 'Unknown error')
    }
  } catch (error) {
    console.error('Failed to refresh data:', error)
  }
}

// Handle command palette actions
const handlePaletteAction = (action) => {
  switch (action.type) {
    case 'page':
      handlePageChange(action.value)
      navigationRef.value?.setPage(action.value)
      break
    case 'refresh':
      handleRefreshData()
      break
    case 'clear-cache':
      success('Navigate to Settings to clear cache')
      handlePageChange('settings')
      navigationRef.value?.setPage('settings')
      break
    case 'export':
      success('Export feature coming soon!')
      break
    case 'theme':
      toggleTheme()
      success('Theme toggled!')
      break
  }
}

// Return to dashboard
const goToDashboard = () => {
  currentPage.value = 'dashboard'
  navigationRef.value?.setPage('dashboard')
}

// Keyboard shortcut support
const handleKeydown = (event) => {
  // Command Palette (Cmd/Ctrl + K)
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    showCommandPalette.value = !showCommandPalette.value
    return
  }

  // Help (?)
  if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
    event.preventDefault()
    showShortcuts.value = !showShortcuts.value
    return
  }

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
