import { computed } from 'vue'
import { useTheme } from './useTheme.js'

/**
 * 彩色主题图表配色方案
 * 在彩色模式下返回彩色配色，在黑白模式下返回灰度配色
 */
export function useChartColors() {
  const { currentThemeMode } = useTheme()

  // 彩色主题的图表配色
  const colorfulPalette = [
    '#00D9FF',  // 青色
    '#7B68EE',  // 紫色
    '#FF6B9D',  // 粉色
    '#4ECDC4',  // 绿松石色
    '#FFD93D',  // 金黄色
    '#6BCF7F',  // 薄荷绿
    '#FF8C42',  // 橙色
    '#A8E6CF',  // 薄荷蓝
    '#FFB6C1',  // 淡粉色
    '#87CEEB',  // 天蓝色
  ]

  // 暗色主题的灰度配色
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

  // 亮色主题的灰度配色
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

  // 根据当前主题返回对应的配色方案
  const chartColors = computed(() => {
    if (currentThemeMode.value === 'colorful') {
      return colorfulPalette
    } else if (currentThemeMode.value === 'light') {
      return lightPalette
    } else {
      return darkPalette
    }
  })

  // 获取单个颜色（循环使用）
  const getColor = (index) => {
    const colors = chartColors.value
    return colors[index % colors.length]
  }

  // 获取渐变色（用于特殊图表）
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

  // 获取热力图颜色
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
