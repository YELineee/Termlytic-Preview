<template>
  <div class="p-8 max-w-4xl mx-auto h-full overflow-y-scroll">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2" :style="{ color: 'var(--textPrimary)' }">Settings</h1>
      <p :style="{ color: 'var(--textSecondary)' }">Manage your Termlytic application configuration</p>
    </div>

    <!-- Application Info Card -->
    <div class="rounded-xl p-6 mb-6"
         :style="{ 
           backgroundColor: 'var(--bgSecondary)',
           border: '1px solid var(--borderPrimary)'
         }">
      <h2 class="text-xl font-semibold mb-4 flex items-center"
          :style="{ color: 'var(--textPrimary)' }">
        <div class="w-2 h-2 rounded-full mr-3" :style="{ backgroundColor: 'var(--textSecondary)' }"></div>
        Application Info
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div class="text-sm mb-1" :style="{ color: 'var(--textTertiary)' }">Application Name</div>
          <div class="font-medium" :style="{ color: 'var(--textPrimary)' }">Termlytic</div>
        </div>
        <div>
          <div class="text-sm mb-1" :style="{ color: 'var(--textTertiary)' }">Version</div>
          <div class="font-medium" :style="{ color: 'var(--textPrimary)' }">1.0.0</div>
        </div>
        <div>
          <div class="text-sm mb-1" :style="{ color: 'var(--textTertiary)' }">Data Storage Location</div>
          <div class="font-medium font-mono text-sm" :style="{ color: 'var(--textPrimary)' }">~/.termlytic</div>
        </div>
        <div>
          <div class="text-sm mb-1" :style="{ color: 'var(--textTertiary)' }">Cache Status</div>
          <div class="font-medium" :style="{ color: 'var(--textPrimary)' }">{{ cacheInfo.status }}</div>
        </div>
      </div>
    </div>

    <!-- Cache Management Card -->
    <div class="rounded-xl p-6 mb-6"
         :style="{ 
           backgroundColor: 'var(--bgSecondary)',
           border: '1px solid var(--borderPrimary)'
         }">
      <h2 class="text-xl font-semibold mb-4 flex items-center"
          :style="{ color: 'var(--textPrimary)' }">
        <div class="w-2 h-2 rounded-full mr-3" :style="{ backgroundColor: 'var(--textSecondary)' }"></div>
        Cache Management
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="rounded-lg p-4 text-center"
             :style="{ 
               backgroundColor: 'var(--bgTertiary)',
               border: '1px solid var(--borderSecondary)'
             }">
          <div class="text-2xl font-bold mb-1" :style="{ color: 'var(--textPrimary)' }">{{ cacheInfo.entries }}</div>
          <div class="text-sm" :style="{ color: 'var(--textTertiary)' }">Cache Entries</div>
        </div>
        <div class="rounded-lg p-4 text-center"
             :style="{ 
               backgroundColor: 'var(--bgTertiary)',
               border: '1px solid var(--borderSecondary)'
             }">
          <div class="text-2xl font-bold mb-1" :style="{ color: 'var(--textPrimary)' }">{{ cacheInfo.size }}</div>
          <div class="text-sm" :style="{ color: 'var(--textTertiary)' }">Cache Size</div>
        </div>
        <div class="rounded-lg p-4 text-center"
             :style="{ 
               backgroundColor: 'var(--bgTertiary)',
               border: '1px solid var(--borderSecondary)'
             }">
          <div class="text-2xl font-bold mb-1" :style="{ color: 'var(--textPrimary)' }">{{ cacheInfo.lastUpdate }}</div>
          <div class="text-sm" :style="{ color: 'var(--textTertiary)' }">Last Updated</div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <button
          @click="clearCache"
          :disabled="isClearing"
          class="flex items-center justify-center px-4 py-2 rounded-lg transition-colors border"
          :style="{ 
            backgroundColor: isClearing ? 'var(--bgTertiary)' : 'var(--bgSecondary)',
            color: 'var(--textPrimary)',
            borderColor: 'var(--borderPrimary)',
            opacity: isClearing ? '0.5' : '1'
          }"
        >
          <i class="fas fa-trash mr-2" :class="{ 'fa-spin fa-spinner': isClearing }"></i>
          {{ isClearing ? 'Clearing...' : 'Clear all cache' }}
        </button>
        
        <button
          @click="refreshCacheInfo"
          :disabled="isRefreshing"
          class="flex items-center justify-center px-4 py-2 rounded-lg transition-colors border"
          :style="{ 
            backgroundColor: isRefreshing ? 'var(--bgTertiary)' : 'var(--bgSecondary)',
            color: 'var(--textPrimary)',
            borderColor: 'var(--borderPrimary)',
            opacity: isRefreshing ? '0.5' : '1'
          }"
        >
          <i class="fas fa-sync-alt mr-2" :class="{ 'fa-spin': isRefreshing }"></i>
          {{ isRefreshing ? 'Refreshing...' : 'Refresh cache info' }}
        </button>
      </div>

      <div class="mt-4 p-4 rounded-lg"
           :style="{ 
             backgroundColor: 'var(--bgTertiary)', 
             border: '1px solid var(--borderPrimary)' 
           }">
        <div class="flex items-start">
          <i class="fas fa-exclamation-triangle mr-3 mt-1" :style="{ color: 'var(--textSecondary)' }"></i>
          <div>
            <div class="font-medium mb-1" :style="{ color: 'var(--textSecondary)' }">Warning</div>
            <div class="text-sm" :style="{ color: 'var(--textSecondary)' }">
              Clearing cache will delete all analyzed command history data. The next startup will require re-analysis, which may take some time.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" class="mb-6">
      <div 
        class="p-4 rounded-lg flex items-center"
        :style="{
          backgroundColor: 'var(--bgTertiary)',
          border: '1px solid var(--borderPrimary)',
          color: 'var(--textSecondary)'
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

    <!-- Shell History Diagnosis Card -->
    <div class="rounded-xl p-6 mb-6"
         :style="{ 
           backgroundColor: 'var(--bgSecondary)',
           border: '1px solid var(--borderPrimary)'
         }">
      <h2 class="text-xl font-semibold mb-4 flex items-center"
          :style="{ color: 'var(--textPrimary)' }">
        <div class="w-2 h-2 rounded-full mr-3" :style="{ backgroundColor: 'var(--textSecondary)' }"></div>
        Shell History Diagnosis
      </h2>
      
      <div class="mb-4">
        <p class="text-sm mb-4" :style="{ color: 'var(--textSecondary)' }">
          If the application shows "No Data", click the button below to run diagnosis and check the status and configuration of shell history files.
        </p>
        
        <button
          @click="runDiagnosis"
          :disabled="isDiagnosing"
          class="flex items-center justify-center px-4 py-2 rounded-lg transition-colors border"
          :style="{ 
            backgroundColor: isDiagnosing ? 'var(--bgTertiary)' : 'var(--bgSecondary)',
            color: 'var(--textPrimary)',
            borderColor: 'var(--borderPrimary)',
            opacity: isDiagnosing ? '0.5' : '1'
          }"
        >
          <i class="fas fa-search mr-2" :class="{ 'fa-spin fa-spinner': isDiagnosing }"></i>
          {{ isDiagnosing ? 'Diagnosing...' : 'Run diagnosis' }}
        </button>
      </div>

      <!-- Diagnosis Results -->
      <div v-if="diagnosisResult" class="mt-4">
        <div class="rounded-lg p-4"
             :style="{ 
               backgroundColor: 'var(--bgTertiary)',
               border: '1px solid var(--borderSecondary)'
             }">
          <h3 class="text-lg font-medium mb-3 flex items-center"
              :style="{ color: 'var(--textPrimary)' }">
            <div class="w-2 h-2 rounded-full mr-2" :style="{ backgroundColor: 'var(--textSecondary)' }"></div>
            Diagnosis Results
          </h3>
          
          <!-- Environment Information -->
          <div class="mb-4">
            <h4 class="text-md font-medium mb-2" :style="{ color: 'var(--textPrimary)' }">Environment Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><span :style="{ color: 'var(--textTertiary)' }">Current Shell:</span> <span class="font-mono" :style="{ color: 'var(--textPrimary)' }">{{ diagnosisResult.environment.detectedShell }}</span></div>
              <div><span :style="{ color: 'var(--textTertiary)' }">SHELL Environment Variable:</span> <span class="font-mono" :style="{ color: 'var(--textPrimary)' }">{{ diagnosisResult.environment.shell || 'Not set' }}</span></div>
              <div><span :style="{ color: 'var(--textTertiary)' }">HISTFILE:</span> <span class="font-mono" :style="{ color: 'var(--textPrimary)' }">{{ diagnosisResult.environment.histfile || 'Not set' }}</span></div>
              <div><span :style="{ color: 'var(--textTertiary)' }">User:</span> <span class="font-mono" :style="{ color: 'var(--textPrimary)' }">{{ diagnosisResult.environment.user }}</span></div>
            </div>
          </div>

          <!-- File Status -->
          <div class="mb-4">
            <h4 class="text-md font-medium mb-2" :style="{ color: 'var(--textPrimary)' }">History File Status</h4>
            <div class="space-y-2">
              <div v-for="(fileInfo, filePath) in diagnosisResult.files" :key="filePath">
                <div class="flex items-center justify-between rounded p-2"
                     :style="{ backgroundColor: 'var(--bgSecondary)' }">
                  <div class="flex-1">
                    <div class="text-sm font-mono" :style="{ color: 'var(--textPrimary)' }">{{ filePath }}</div>
                    <div class="text-xs" :style="{ color: 'var(--textTertiary)' }">{{ fileInfo.source }}</div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span v-if="fileInfo.exists" class="text-xs" :style="{ color: 'var(--textSecondary)' }">
                      <i class="fas fa-check-circle mr-1"></i>
                      Exists ({{ fileInfo.lineCount }} lines)
                    </span>
                    <span v-else class="text-xs" :style="{ color: 'var(--textSecondary)' }">
                      <i class="fas fa-times-circle mr-1"></i>
                      Not Found
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div v-if="diagnosisResult.recommendations?.length">
            <h4 class="text-md font-medium mb-2" :style="{ color: 'var(--textPrimary)' }">Recommendations</h4>
            <ul class="space-y-1 text-sm">
              <li v-for="(recommendation, index) in diagnosisResult.recommendations" :key="index" class="flex items-start">
                <i class="fas fa-lightbulb mr-2 mt-1" :style="{ color: 'var(--textSecondary)' }"></i>
                <span :style="{ color: 'var(--textSecondary)' }">{{ recommendation }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Other Settings Card -->
    <div class="rounded-xl p-6"
         :style="{ 
           backgroundColor: 'var(--bgSecondary)',
           border: '1px solid var(--borderPrimary)'
         }">
      <h2 class="text-xl font-semibold mb-4 flex items-center"
          :style="{ color: 'var(--textPrimary)' }">
        <div class="w-2 h-2 rounded-full mr-3" :style="{ backgroundColor: 'var(--textSecondary)' }"></div>
        Other Settings
      </h2>
      <div class="text-center py-8" :style="{ color: 'var(--textTertiary)' }">
        <i class="fas fa-tools text-3xl mb-3"></i>
        <p>More settings options coming soon...</p>
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
  lastUpdate: 'Unknown'
})

// Get cache information
const getCacheInfo = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('get-cache-info')
    if (result.success) {
      cacheInfo.value = {
        status: result.entries > 0 ? 'Has Data' : 'No Data',
        entries: result.entries.toLocaleString(),
        size: formatFileSize(result.size || 0),
        lastUpdate: result.lastUpdate ? 
          new Date(result.lastUpdate).toLocaleDateString('en-US') : 
          'Unknown'
      }
    }
  } catch (err) {
    console.error('Failed to get cache info:', err)
    cacheInfo.value.status = 'Get Failed'
  }
}

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Clear cache
const clearCache = async () => {
  if (!confirm('Are you sure you want to clear all cache data? This operation cannot be undone.')) {
    return
  }

  isClearing.value = true
  message.value = null

  try {
    const result = await window.electron.ipcRenderer.invoke('clear-cache')
    if (result.success) {
      message.value = {
        type: 'success',
        text: 'Cache successfully cleared! Data will be re-analyzed on next startup.'
      }
      await getCacheInfo() // Refresh cache info
    } else {
      throw new Error(result.error || 'Failed to clear cache')
    }
  } catch (err) {
    console.error('Failed to clear cache:', err)
    message.value = {
      type: 'error',
      text: `Failed to clear cache: ${err.message}`
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

// Clear message
const clearMessage = () => {
  message.value = null
}

// Run shell history diagnosis
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
        text: `Diagnosis completed! Processing time: ${result.processingTimeMs}ms`
      }
    } else {
      throw new Error(result.error || 'Diagnosis failed')
    }
  } catch (err) {
    console.error('Failed to run diagnosis:', err)
    message.value = {
      type: 'error',
      text: `Diagnosis failed: ${err.message}`
    }
  } finally {
    isDiagnosing.value = false
  }
}

// Get cache information when page loads
onMounted(() => {
  getCacheInfo()
})

// Automatically clear message after timeout
const showMessage = (type, text) => {
  message.value = { type, text }
  setTimeout(() => {
    message.value = null
  }, 5000)
}
</script>

<style scoped>
/* Settings page styles */
.transition-colors {
  transition: background-color 0.2s ease-in-out;
}
</style>
