<template>
  <div class="p-8 max-w-4xl mx-auto h-full overflow-y-scroll">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">Settings</h1>
      <p class="text-gray-400">管理你的 Termlytic 应用程序配置</p>
    </div>

    <!-- 应用信息卡片 -->
    <div class="bg-gray-800 rounded-xl p-6 mb-6">
      <h2 class="text-xl font-semibold text-white mb-4 flex items-center">
        <i class="fas fa-info-circle mr-3 text-blue-400"></i>
        应用信息
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div class="text-sm text-gray-400 mb-1">应用名称</div>
          <div class="text-white font-medium">Termlytic</div>
        </div>
        <div>
          <div class="text-sm text-gray-400 mb-1">版本</div>
          <div class="text-white font-medium">1.0.0</div>
        </div>
        <div>
          <div class="text-sm text-gray-400 mb-1">Data存储位置</div>
          <div class="text-white font-medium font-mono text-sm">~/.termlytic</div>
        </div>
        <div>
          <div class="text-sm text-gray-400 mb-1">缓存状态</div>
          <div class="text-white font-medium">{{ cacheInfo.status }}</div>
        </div>
      </div>
    </div>

    <!-- 缓存管理卡片 -->
    <div class="bg-gray-800 rounded-xl p-6 mb-6">
      <h2 class="text-xl font-semibold text-white mb-4 flex items-center">
        <i class="fas fa-database mr-3 text-green-400"></i>
        缓存管理
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-gray-700 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-blue-400 mb-1">{{ cacheInfo.entries }}</div>
          <div class="text-sm text-gray-400">缓存条目</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-yellow-400 mb-1">{{ cacheInfo.size }}</div>
          <div class="text-sm text-gray-400">缓存大小</div>
        </div>
        <div class="bg-gray-700 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-purple-400 mb-1">{{ cacheInfo.lastUpdate }}</div>
          <div class="text-sm text-gray-400">最后更新</div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <button
          @click="clearCache"
          :disabled="isClearing"
          class="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          <i class="fas fa-trash mr-2" :class="{ 'fa-spin fa-spinner': isClearing }"></i>
          {{ isClearing ? 'Clearing...' : 'Clear all cache' }}
        </button>
        
        <button
          @click="refreshCacheInfo"
          :disabled="isRefreshing"
          class="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': isRefreshing }"></i>
          {{ isRefreshing ? 'Refreshing...' : 'Refresh cache info' }}
        </button>
      </div>

      <div class="mt-4 p-4 bg-amber-900/20 border border-amber-600/30 rounded-lg">
        <div class="flex items-start">
          <i class="fas fa-exclamation-triangle text-amber-400 mr-3 mt-1"></i>
          <div>
            <div class="text-amber-400 font-medium mb-1">注意</div>
            <div class="text-sm text-amber-200">
              清除缓存将删除所有已Analysis的CommandHistoryData，下次启动时需要重新Analysis，这可能需要一些时间。
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error消息 -->
    <div v-if="message" class="mb-6">
      <div 
        class="p-4 rounded-lg flex items-center"
        :class="{
          'bg-green-900/20 border border-green-600/30 text-green-400': message.type === 'success',
          'bg-red-900/20 border border-red-600/30 text-red-400': message.type === 'error'
        }"
      >
        <i 
          class="mr-3"
          :class="{
            'fas fa-check-circle': message.type === 'success',
            'fas fa-exclamation-circle': message.type === 'error'
          }"
        ></i>
        {{ message.text }}
      </div>
    </div>

    <!-- Shell History诊断卡片 -->
    <div class="bg-gray-800 rounded-xl p-6 mb-6">
      <h2 class="text-xl font-semibold text-white mb-4 flex items-center">
        <i class="fas fa-stethoscope mr-3 text-cyan-400"></i>
        Shell History诊断
      </h2>
      
      <div class="mb-4">
        <p class="text-gray-400 text-sm mb-4">
          如果应用显示"无Data"，点击下方按钮进行诊断，查看 shell History文件的状态和配置。
        </p>
        
        <button
          @click="runDiagnosis"
          :disabled="isDiagnosing"
          class="flex items-center justify-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          <i class="fas fa-search mr-2" :class="{ 'fa-spin fa-spinner': isDiagnosing }"></i>
          {{ isDiagnosing ? 'Diagnosing...' : 'Run diagnosis' }}
        </button>
      </div>

      <!-- 诊断结果 -->
      <div v-if="diagnosisResult" class="mt-4">
        <div class="bg-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-medium text-white mb-3 flex items-center">
            <i class="fas fa-clipboard-list mr-2 text-cyan-400"></i>
            诊断结果
          </h3>
          
          <!-- 环境信息 -->
          <div class="mb-4">
            <h4 class="text-md font-medium text-white mb-2">环境信息</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><span class="text-gray-400">当前 Shell:</span> <span class="text-white font-mono">{{ diagnosisResult.environment.detectedShell }}</span></div>
              <div><span class="text-gray-400">SHELL 环境变量:</span> <span class="text-white font-mono">{{ diagnosisResult.environment.shell || 'Not set' }}</span></div>
              <div><span class="text-gray-400">HISTFILE:</span> <span class="text-white font-mono">{{ diagnosisResult.environment.histfile || 'Not set' }}</span></div>
              <div><span class="text-gray-400">用户:</span> <span class="text-white font-mono">{{ diagnosisResult.environment.user }}</span></div>
            </div>
          </div>

          <!-- 文件状态 -->
          <div class="mb-4">
            <h4 class="text-md font-medium text-white mb-2">History文件状态</h4>
            <div class="space-y-2">
              <div v-for="(fileInfo, filePath) in diagnosisResult.files" :key="filePath">
                <div class="flex items-center justify-between bg-gray-800 rounded p-2">
                  <div class="flex-1">
                    <div class="text-sm font-mono text-white">{{ filePath }}</div>
                    <div class="text-xs text-gray-400">{{ fileInfo.source }}</div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span v-if="fileInfo.exists" class="text-green-400 text-xs">
                      <i class="fas fa-check-circle mr-1"></i>
                      存在 ({{ fileInfo.lineCount }} 行)
                    </span>
                    <span v-else class="text-red-400 text-xs">
                      <i class="fas fa-times-circle mr-1"></i>
                      不存在
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 建议 -->
          <div v-if="diagnosisResult.recommendations?.length">
            <h4 class="text-md font-medium text-white mb-2">建议</h4>
            <ul class="space-y-1 text-sm">
              <li v-for="(recommendation, index) in diagnosisResult.recommendations" :key="index" class="flex items-start">
                <i class="fas fa-lightbulb text-yellow-400 mr-2 mt-1"></i>
                <span class="text-gray-300">{{ recommendation }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Other Settings卡片 -->
    <div class="bg-gray-800 rounded-xl p-6">
      <h2 class="text-xl font-semibold text-white mb-4 flex items-center">
        <i class="fas fa-cog mr-3 text-gray-400"></i>
        Other Settings
      </h2>
      <div class="text-gray-400 text-center py-8">
        <i class="fas fa-tools text-3xl mb-3"></i>
        <p>更多Settings选项即将推出...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Reactive data
const isClearing = ref(false)
const isRefreshing = ref(false)
const isDiagnosing = ref(false)
const message = ref(null)
const diagnosisResult = ref(null)
const cacheInfo = ref({
  status: 'Loading...',
  entries: 0,
  size: '0 KB',
  lastUpdate: '未知'
})

// Get缓存信息
const getCacheInfo = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('get-cache-info')
    if (result.success) {
      cacheInfo.value = {
        status: result.entries > 0 ? '有Data' : '无Data',
        entries: result.entries.toLocaleString(),
        size: formatFileSize(result.size || 0),
        lastUpdate: result.lastUpdate ? 
          new Date(result.lastUpdate).toLocaleDateString('zh-CN') : 
          '未知'
      }
    }
  } catch (err) {
    console.error('Failed to get cache info:', err)
    cacheInfo.value.status = 'GetFailed'
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 清除缓存
const clearCache = async () => {
  if (!confirm('确定要Clear all cacheData吗？这个操作不能撤销。')) {
    return
  }

  isClearing.value = true
  message.value = null

  try {
    const result = await window.electron.ipcRenderer.invoke('clear-cache')
    if (result.success) {
      message.value = {
        type: 'success',
        text: '缓存已Success清除！下次启动时将重新AnalysisData。'
      }
      await getCacheInfo() // Refresh cache info
    } else {
      throw new Error(result.error || '清除缓存Failed')
    }
  } catch (err) {
    console.error('Failed to clear cache:', err)
    message.value = {
      type: 'error',
      text: `清除缓存Failed: ${err.message}`
    }
  } finally {
    isClearing.value = false
  }
}

// Refresh cache info
const refreshCacheInfo = async () => {
  isRefreshing.value = true
  await getCacheInfo()
  isRefreshing.value = false
}

// 清除消息
const clearMessage = () => {
  message.value = null
}

// 运行 Shell History诊断
const runDiagnosis = async () => {
  isDiagnosing.value = true
  diagnosisResult.value = null
  message.value = null

  try {
    const result = await window.electron.ipcRenderer.invoke('diagnose-shell-history')
    if (result.success) {
      diagnosisResult.value = result.data
      message.value = {
        type: 'success',
        text: `诊断完成！耗时 ${result.processingTimeMs}ms`
      }
    } else {
      throw new Error(result.error || '诊断Failed')
    }
  } catch (err) {
    console.error('Failed to run diagnosis:', err)
    message.value = {
      type: 'error',
      text: `诊断Failed: ${err.message}`
    }
  } finally {
    isDiagnosing.value = false
  }
}

// 页面Load时Get缓存信息
onMounted(() => {
  getCacheInfo()
})

// 定时清除消息
const showMessage = (type, text) => {
  message.value = { type, text }
  setTimeout(() => {
    message.value = null
  }, 5000)
}
</script>

<style scoped>
/* Settings页面样式 */
.transition-colors {
  transition: background-color 0.2s ease-in-out;
}
</style>
