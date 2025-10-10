import './assets/main.css'
import './assets/themes.css'

import { createApp } from 'vue'
import App from './App.vue'
import { useShellData } from './composables/useShellData.js'
import { useLoadingState } from './composables/useLoadingState.js'
import { useTheme } from './composables/useTheme.js'

// Initialize theme first
const { initTheme } = useTheme()
initTheme()

// Initialize when application starts
async function initializeApp() {
  const { setGlobalLoading } = useLoadingState()
  const { preloadCoreData } = useShellData()

  try {
    // Set application loading state
    setGlobalLoading('app', true)
    
    console.log('🚀 Initializing Termlytic application...')
    
    // Preload core data
    await preloadCoreData()
    
    console.log('✅ Application initialization completed')
  } catch (error) {
    console.error('❌ Application initialization failed:', error)
    // Continue starting the app even if preloading fails
  } finally {
    setGlobalLoading('app', false)
  }
}

// Create application instance
const app = createApp(App)

// Start application
app.mount('#app')

// Start preloading after application mounts
initializeApp()
