<template>
  <teleport to="body">
    <transition name="context-menu-fade">
      <div
        v-if="isVisible"
        ref="menuRef"
        class="fixed z-[9999] min-w-[200px] rounded-lg shadow-2xl glass-card overflow-hidden"
        :style="{
          top: `${position.y}px`,
          left: `${position.x}px`,
          backgroundColor: 'var(--bgSecondary)',
          border: '1px solid var(--borderPrimary)'
        }"
        @click.stop
      >
        <div class="py-1">
          <button
            v-for="item in items"
            :key="item.id"
            @click="handleItemClick(item)"
            class="w-full px-4 py-2 flex items-center gap-3 text-left transition-colors"
            :class="{ 'opacity-50 cursor-not-allowed': item.disabled }"
            :style="{
              color: item.danger ? 'var(--error)' : 'var(--textPrimary)',
              backgroundColor: 'transparent'
            }"
            :disabled="item.disabled"
            @mouseenter="(e) => e.target.style.backgroundColor = 'var(--bgHover)'"
            @mouseleave="(e) => e.target.style.backgroundColor = 'transparent'"
          >
            <i :class="item.icon" class="w-4 text-center"></i>
            <span class="flex-1">{{ item.label }}</span>
            <span v-if="item.shortcut" class="text-xs opacity-60">{{ item.shortcut }}</span>
          </button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'select'])

const menuRef = ref(null)

const handleItemClick = (item) => {
  if (item.disabled) return

  emit('select', item)
  emit('close')
}

const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    emit('close')
  }
}

watch(() => props.isVisible, (visible) => {
  if (visible) {
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('contextmenu', handleClickOutside)
    }, 0)
  } else {
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('contextmenu', handleClickOutside)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('contextmenu', handleClickOutside)
})
</script>

<style scoped>
.context-menu-fade-enter-active {
  animation: context-menu-in 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.context-menu-fade-leave-active {
  animation: context-menu-out 0.1s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes context-menu-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes context-menu-out {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
}
</style>
