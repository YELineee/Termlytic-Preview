import { computed } from 'vue'
import { useTheme } from './useTheme.js'

/**
 * Colorful theme chart color scheme
 * Returns colorful scheme in colorful mode, grayscale scheme in dark/light mode
 */
export function useChartColors() {
  const { currentThemeMode } = useTheme()

  // Colorful theme chart palette
  const colorfulPalette = [
    '#00D9FF',  // cyan
    '#7B68EE',  // purple
    '#FF6B9D',  // pink
    '#4ECDC4',  // turquoise
    '#FFD93D',  // golden
    '#6BCF7F',  // mint green
    '#FF8C42',  // orange
    '#A8E6CF',  // mint blue
    '#FFB6C1',  // light pink
    '#87CEEB',  // sky blue
  ]

  // Dark theme grayscale palette
  const darkPalette = [
    '#888888',
    '#666666',
    '#AAAAAA',
    '#999999',
    '#777777',
    '#555555',
    '#BBBBBB',
    '#444444',
  ]

  // Light theme grayscale palette
  const lightPalette = [
    '#666666',
    '#888888',
    '#555555',
    '#777777',
    '#999999',
    '#444444',
    '#AAAAAA',
    '#333333',
  ]

  // Return color scheme based on current theme
  const chartColors = computed(() => {
    if (currentThemeMode.value === 'colorful') {
      return colorfulPalette
    } else if (currentThemeMode.value === 'light') {
      return lightPalette
    } else {
      return darkPalette
    }
  })

  // Get single color (with cycling)
  const getColor = (index) => {
    const colors = chartColors.value
    return colors[index % colors.length]
  }

  // Get gradient colors (for special charts)
  const gradientColors = computed(() => {
    if (currentThemeMode.value === 'colorful') {
      return {
        start: '#00D9FF',
        middle: '#7B68EE',
        end: '#FF6B9D'
      }
    } else if (currentThemeMode.value === 'light') {
      return {
        start: '#666666',
        middle: '#888888',
        end: '#AAAAAA'
      }
    } else {
      return {
        start: '#888888',
        middle: '#666666',
        end: '#444444'
      }
    }
  })

  // Get heatmap colors
  const heatmapColors = computed(() => {
    if (currentThemeMode.value === 'colorful') {
      return ['#0F3460', '#1A4D6D', '#00A8CC', '#00D9FF', '#4DFFFF']
    } else if (currentThemeMode.value === 'light') {
      return ['#F0F0F0', '#D0D0D0', '#A0A0A0', '#707070', '#404040']
    } else {
      return ['#1A1A1A', '#2A2A2A', '#4A4A4A', '#6A6A6A', '#8A8A8A']
    }
  })

  return {
    chartColors,
    getColor,
    gradientColors,
    heatmapColors,
    isColorful: computed(() => currentThemeMode.value === 'colorful')
  }
}
