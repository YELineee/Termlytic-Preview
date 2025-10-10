import { ref, watch, computed } from 'vue'

// Theme state (dark, light, or colorful)
const currentThemeMode = ref('dark') // Default to dark theme

// Apply theme by setting data-theme attribute on document root
const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
}

// Toggle theme (only between dark and light)
const toggleTheme = () => {
  if (currentThemeMode.value === 'dark') {
    currentThemeMode.value = 'light'
  } else if (currentThemeMode.value === 'light') {
    currentThemeMode.value = 'dark'
  } else {
    // If in colorful mode, toggle to dark
    currentThemeMode.value = 'dark'
  }
  localStorage.setItem('termlytic-theme', currentThemeMode.value)
}

// Set specific theme
const setTheme = (theme) => {
  const validThemes = ['dark', 'light', 'colorful']
  if (validThemes.includes(theme)) {
    currentThemeMode.value = theme
    localStorage.setItem('termlytic-theme', theme)
  }
}

// Initialize theme
const initTheme = () => {
  const savedTheme = localStorage.getItem('termlytic-theme')
  const validThemes = ['dark', 'light', 'colorful']
  if (savedTheme && validThemes.includes(savedTheme)) {
    currentThemeMode.value = savedTheme
  }
  applyTheme(currentThemeMode.value)
}

// Watch theme changes
watch(currentThemeMode, (newValue) => {
  applyTheme(newValue)
})

export function useTheme() {
  return {
    isDark: computed(() => currentThemeMode.value === 'dark'),
    isLight: computed(() => currentThemeMode.value === 'light'),
    isColorful: computed(() => currentThemeMode.value === 'colorful'),
    currentThemeMode,
    toggleTheme,
    setTheme,
    initTheme
  }
}
