<template>
  <div class="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
    <!-- Title - fixed, no scroll -->
    <h4 class="text-md font-medium text-gray-200 mb-3 flex items-center shrink-0">
      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Command Execution History
      <span v-if="selectedDate" class="ml-2 text-sm text-gray-400">
        ({{ selectedDate.formattedDate }})
      </span>
    </h4>

    <!-- No data state -->
    <div
      v-if="!selectedDate || !selectedDate.commands || selectedDate.commands.length === 0"
      class="flex-1 text-gray-400 flex flex-col items-center justify-center"
    >
      <svg class="w-12 h-12 mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
          clip-rule="evenodd"
        />
      </svg>
      <div>{{ !selectedDate ? 'Please click on the heat map to select the date' : 'No command records for this date' }}</div>
    </div>

    <!-- Command列表 - 可滚动内容 -->
    <div v-else class="flex-1 min-h-0 flex flex-col">
      <!-- Statistics信息 - 固定不滚动 -->
      <div class="bg-gray-700 rounded p-3 mb-3 shrink-0">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="text-center">
            <div class="text-2xl font-bold text-green-400">{{ selectedDate.totalCommands }}</div>
            <div class="text-gray-400">Total Commands</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-400">{{ uniqueCommands }}</div>
            <div class="text-gray-400">Unique Commands</div>
          </div>
        </div>
      </div>

      <!-- Command项列表 - 仅此部分滚动 -->
      <div class="flex-1 min-h-0 overflow-y-auto">
        <div class="space-y-1">
          <div
            v-for="(cmd, index) in displayCommands"
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
          >
            <div class="flex-1 min-w-0 mr-3">
              <div class="flex items-center mb-1">
                <code class="text-green-400 font-mono text-sm break-all mr-2">{{
                  cmd.command
                }}</code>
                <span
                  v-if="cmd.count > 1"
                  class="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full"
                >
                  {{ cmd.count }}x
                </span>
              </div>
              <div class="text-gray-400 text-xs flex items-center space-x-3">
                <span class="flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ cmd.time }}
                </span>
                <span class="flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ cmd.shell }}
                </span>
              </div>
            </div>

            <!-- Command类型标识 -->
            <div class="text-right">
              <span
                class="inline-block w-2 h-2 rounded-full"
                :class="getCommandTypeColor(cmd.command)"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  selectedDate: {
    type: Object,
    default: null
  }
})

// Computed properties
const uniqueCommands = computed(() => {
  if (!props.selectedDate?.commands) return 0
  const commands = new Set(props.selectedDate.commands.map((cmd) => cmd.command.split(' ')[0]))
  return commands.size
})

const displayCommands = computed(() => {
  if (!props.selectedDate?.commands) return []

  // 按Command分组并Statistics次数
  const commandMap = new Map()
  props.selectedDate.commands.forEach((cmd) => {
    const key = cmd.command
    if (commandMap.has(key)) {
      commandMap.get(key).count++
      commandMap.get(key).times.push(cmd.time)
    } else {
      commandMap.set(key, {
        command: cmd.command,
        shell: cmd.shell,
        count: 1,
        times: [cmd.time],
        time: cmd.time // 显示最新的时间
      })
    }
  })

  return Array.from(commandMap.values()).sort((a, b) => b.count - a.count) // 按使用频率排序
})

// Methods
const getCommandTypeColor = (command) => {
  const mainCommand = command.split(' ')[0].toLowerCase()

  // 根据Command类型返回不同颜色
  const commandTypes = {
    // 文件操作
    ls: 'bg-blue-500',
    cd: 'bg-blue-500',
    mkdir: 'bg-blue-500',
    rm: 'bg-red-500',
    cp: 'bg-blue-500',
    mv: 'bg-blue-500',

    // GitCommand
    git: 'bg-green-500',

    // 开发工具
    npm: 'bg-yellow-500',
    yarn: 'bg-yellow-500',
    node: 'bg-green-600',
    code: 'bg-purple-500',
    vim: 'bg-green-600',
    nano: 'bg-green-600',

    // 系统Command
    ps: 'bg-gray-500',
    top: 'bg-gray-500',
    kill: 'bg-red-500',
    sudo: 'bg-red-600',

    // 网络
    curl: 'bg-orange-500',
    wget: 'bg-orange-500',
    ping: 'bg-orange-500',

    // 默认
    default: 'bg-gray-400'
  }

  return commandTypes[mainCommand] || commandTypes.default
}
</script>

<style scoped>
/* 自定义滚动条 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
