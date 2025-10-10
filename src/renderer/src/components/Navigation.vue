<template>
  <div
    class="w-18 h-full navibar flex flex-col items-center py-4"
    :style="{
      backgroundColor: 'var(--bgSecondary)',
      borderRight: '1px solid var(--borderPrimary)'
    }"
  >
    <!-- Top: App icon -->
    <div class="font-bold text-xl select-none mb-6 mt-12" :style="{ color: 'var(--textPrimary)' }">
      T
    </div>

    <!-- Middle: Navigation menu -->
    <div class="flex flex-col items-center space-y-2 flex-1">
      <button
        v-for="item in navigationItems"
        :key="item.name"
        @click="switchPage(item.name)"
        :class="[
          'w-10 h-10 text-lg transition-all duration-200 rounded-md flex items-center justify-center',
          'no-drag'
        ]"
        :style="getButtonStyle(item.name)"
        :title="item.label"
      >
        <i :class="item.icon"></i>
      </button>
    </div>

    <!-- Bottom: Theme toggle and Refresh button -->
    <div class="flex flex-col items-center space-y-2">
      <!-- Theme Toggle Button -->
      <div class="relative theme-selector-container" ref="themeSelectorContainer">
        <button
          ref="themeButton"
          @click="handleThemeButtonClick"
          class="no-drag w-10 h-10 rounded-md transition-all duration-200 flex items-center justify-center hover-button"
          :style="getHoverButtonStyle()"
          :title="getThemeTitle()"
        >
          <i :class="getThemeIcon()"></i>
        </button>

        <!-- Theme Selector Bubbles -->
        <div v-if="showThemeSelector" class="theme-bubbles-wrapper">
          <!-- Dark Theme -->
          <button
            @click.stop="handleBubbleClick('dark')"
            class="theme-bubble"
            :class="{ active: currentThemeMode === 'dark' }"
            :style="{
              backgroundColor:
                currentThemeMode === 'dark' ? 'var(--textPrimary)' : 'var(--bgTertiary)',
              color: currentThemeMode === 'dark' ? 'var(--bgPrimary)' : 'var(--textPrimary)',
              border: '2px solid var(--borderPrimary)'
            }"
            title="Dark Theme"
          >
            <i class="fas fa-moon"></i>
          </button>

          <!-- Light Theme -->
          <button
            @click.stop="handleBubbleClick('light')"
            class="theme-bubble"
            :class="{ active: currentThemeMode === 'light' }"
            :style="{
              backgroundColor:
                currentThemeMode === 'light' ? 'var(--textPrimary)' : 'var(--bgTertiary)',
              color: currentThemeMode === 'light' ? 'var(--bgPrimary)' : 'var(--textPrimary)',
              border: '2px solid var(--borderPrimary)'
            }"
            title="Light Theme"
          >
            <i class="fas fa-sun"></i>
          </button>

          <!-- Colorful Theme -->
          <button
            @click.stop="handleBubbleClick('colorful')"
            class="theme-bubble"
            :class="{ active: currentThemeMode === 'colorful' }"
            :style="{
              backgroundColor: currentThemeMode === 'colorful' ? '#00D9FF' : 'var(--bgTertiary)',
              color: currentThemeMode === 'colorful' ? '#1A1A2E' : 'var(--textPrimary)',
              border: '2px solid var(--borderPrimary)'
            }"
            title="Colorful Theme"
          >
            <i class="fas fa-palette"></i>
          </button>
        </div>
      </div>

      <!-- Refresh Button -->
      <button
        @click="refreshData"
        class="no-drag w-10 h-10 rounded-md transition-all duration-200 flex items-center justify-center hover-button"
        :style="getHoverButtonStyle()"
        title="Refresh Data"
      >
        <i class="fas fa-sync-alt"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useTheme } from '@renderer/composables/useTheme.js'

// Define emits
const emit = defineEmits(['page-change', 'refresh-data'])

// Use theme composable
const { isDark, currentThemeMode, toggleTheme, setTheme } = useTheme()

// Theme selector state
const showThemeSelector = ref(false)
const themeButton = ref(null)
const themeSelectorContainer = ref(null)
const clickTimer = ref(null)
const clickCount = ref(0)

// Handle theme button click with double-click detection
const handleThemeButtonClick = (e) => {
  e.stopPropagation()
  clickCount.value++

  if (clickTimer.value) {
    clearTimeout(clickTimer.value)
  }

  clickTimer.value = setTimeout(() => {
    if (clickCount.value === 1) {
      // Single click - toggle theme
      toggleTheme()
    } else if (clickCount.value >= 2) {
      // Double click - show theme selector
      showThemeSelector.value = !showThemeSelector.value
    }
    clickCount.value = 0
  }, 250) // 250ms window for double click
}

// Handle bubble click to switch theme
const handleBubbleClick = (theme) => {
  setTheme(theme)
  showThemeSelector.value = false
}

const getThemeIcon = () => {
  switch (currentThemeMode.value) {
    case 'dark':
      return 'fas fa-moon'
    case 'light':
      return 'fas fa-sun'
    case 'colorful':
      return 'fas fa-palette'
    default:
      return 'fas fa-moon'
  }
}

const getThemeTitle = () => {
  const currentName =
    currentThemeMode.value === 'dark'
      ? 'Dark'
      : currentThemeMode.value === 'light'
      ? 'Light'
      : 'Colorful'
  return `${currentName} Theme (Click: toggle, Double-click: all options)`
}

// Close theme selector when clicking outside
const handleClickOutside = (e) => {
  if (showThemeSelector.value) {
    const container = themeSelectorContainer.value
    if (container && !container.contains(e.target)) {
      showThemeSelector.value = false
    }
  }
}

// Rest of the original code
const currentPage = ref('dashboard')

// Navigation item configuration
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

// Get button style based on active state
const getButtonStyle = (pageName) => {
  if (currentPage.value === pageName) {
    return {
      backgroundColor: 'var(--textPrimary)',
      color: 'var(--bgPrimary)'
    }
  }
  return {
    color: 'var(--textSecondary)'
  }
}

// Get hover button style
const getHoverButtonStyle = () => {
  return {
    color: 'var(--textSecondary)'
  }
}

// Methods
const switchPage = (pageName) => {
  if (pageName !== currentPage.value) {
    currentPage.value = pageName
    // Send page change event
    emit('page-change', pageName)
  }
}

const refreshData = () => {
  // Send refresh data event directly, without showing loading state
  emit('refresh-data')
}

// Expose current page to parent component
defineExpose({
  currentPage,
  setPage: (pageName) => {
    currentPage.value = pageName
  }
})

onMounted(() => {
  // Send default page on initialization
  emit('page-change', currentPage.value)
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (clickTimer.value) {
    clearTimeout(clickTimer.value)
  }
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

/* Hover effects */
.hover-button:hover {
  background-color: var(--bgHover);
  color: var(--textPrimary);
}

button:not(.hover-button):hover {
  background-color: var(--bgHover);
}

/* Theme Selector Container */
.theme-selector-container {
  position: relative;
  z-index: 100;
  -webkit-app-region: no-drag;
}

/* Theme Bubbles Wrapper */
.theme-bubbles-wrapper {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  z-index: 1000;
  -webkit-app-region: no-drag;
}

/* Theme Bubbles */
.theme-bubble {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 16px;
  z-index: 1001;
  position: relative;
  background: none;
  border: none;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  -webkit-app-region: no-drag;
}

.theme-bubble i {
  pointer-events: none;
}

.theme-bubble:hover {
  transform: scale(1.15);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.4),
    0 4px 6px -2px rgba(0, 0, 0, 0.3);
}

.theme-bubble:active {
  transform: scale(1.05);
}

.theme-bubble.active {
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.3),
    0 10px 15px -3px rgba(0, 0, 0, 0.4);
}

/* Bubble appear animation */
.theme-bubbles-wrapper .theme-bubble:nth-child(1) {
  animation: bubbleAppear 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) 0s backwards;
}

.theme-bubbles-wrapper .theme-bubble:nth-child(2) {
  animation: bubbleAppear 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s backwards;
}

.theme-bubbles-wrapper .theme-bubble:nth-child(3) {
  animation: bubbleAppear 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s backwards;
}

@keyframes bubbleAppear {
  from {
    opacity: 0;
    transform: scale(0.3) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
