import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { useShellData } from './composables/useShellData.js'
import { useLoadingState } from './composables/useLoadingState.js'

// 应用启动时初始化
async function initializeApp() {
  const { setGlobalLoading } = useLoadingState()
  const { preloadCoreData } = useShellData()

  try {
    // 设置应用加载状态
    setGlobalLoading('app', true)
    
    console.log('🚀 Initializing Termlytic application...')
    
    // 预加载核心数据
    await preloadCoreData()
    
    console.log('✅ Application initialization completed')
  } catch (error) {
    console.error('❌ Application initialization failed:', error)
    // 即使预加载失败，也继续启动应用
  } finally {
    setGlobalLoading('app', false)
  }
}

// 创建应用实例
const app = createApp(App)

// 启动应用
app.mount('#app')

// 应用挂载后启动预加载
initializeApp()
