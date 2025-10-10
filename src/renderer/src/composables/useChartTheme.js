/**
 * Chart theme configuration
 * Provides unified theme styles for ECharts and custom chart components
 */

import { computed } from 'vue'
import { useTheme } from './useTheme'

/**
 * Get ECharts theme configuration
 */
export function useEChartsTheme() {
  const { currentThemeMode } = useTheme()

  const theme = computed(() => {
    const isDark = currentThemeMode.value === 'dark'

    return {
      // Background color
      backgroundColor: 'transparent',

      // Text styles
      textStyle: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: 12,
        color: isDark ? '#9CA3AF' : '#6B7280'
      },

      // Title style
      title: {
        textStyle: {
          color: isDark ? '#F3F4F6' : '#111827',
          fontSize: 16,
          fontWeight: 600
        },
        subtextStyle: {
          color: isDark ? '#9CA3AF' : '#6B7280',
          fontSize: 12
        }
      },

      // Legend style
      legend: {
        textStyle: {
          color: isDark ? '#D1D5DB' : '#4B5563',
          fontSize: 12
        },
        pageTextStyle: {
          color: isDark ? '#9CA3AF' : '#6B7280'
        }
      },

      // Axis styles
      axisLine: {
        lineStyle: {
          color: isDark ? '#374151' : '#E5E7EB'
        }
      },
      axisTick: {
        lineStyle: {
          color: isDark ? '#374151' : '#E5E7EB'
        }
      },
      axisLabel: {
        color: isDark ? '#9CA3AF' : '#6B7280',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: isDark ? '#374151' : '#E5E7EB',
          type: 'dashed'
        }
      },

      // Tooltip style
      tooltip: {
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        borderColor: isDark ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        textStyle: {
          color: isDark ? '#F9FAFB' : '#111827',
          fontSize: 12
        },
        extraCssText: `
          box-shadow: ${isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
          border-radius: 6px;
          padding: 8px 12px;
        `
      },

      // Grid style
      grid: {
        borderColor: isDark ? '#374151' : '#E5E7EB'
      },

      // Color palette - Black & White theme with subtle grays
      color: isDark
        ? [
            '#F3F4F6', // gray-100
            '#D1D5DB', // gray-300
            '#9CA3AF', // gray-400
            '#6B7280', // gray-500
            '#4B5563', // gray-600
            '#374151', // gray-700
            '#FFFFFF', // white
            '#E5E7EB'  // gray-200
          ]
        : [
            '#111827', // gray-900
            '#1F2937', // gray-800
            '#374151', // gray-700
            '#4B5563', // gray-600
            '#6B7280', // gray-500
            '#9CA3AF', // gray-400
            '#000000', // black
            '#4B5563'  // gray-600
          ]
    }
  })

  return { theme }
}

/**
 * Get heatmap theme configuration
 */
export function useHeatmapTheme() {
  const { currentThemeMode } = useTheme()

  const theme = computed(() => {
    const isDark = currentThemeMode.value === 'dark'

    return {
      // Cell colors - intensity levels (0-4)
      cellColors: isDark
        ? [
            '#1F2937', // gray-800 - level 0 (empty/lowest)
            '#4B5563', // gray-600 - level 1 (deeper than before)
            '#6B7280', // gray-500 - level 2
            '#9CA3AF', // gray-400 - level 3
            '#D1D5DB', // gray-300 - level 4 (highest, lighter for dark theme)
          ]
        : [
            '#F3F4F6', // gray-100 - level 0 (empty/lowest)
            '#9CA3AF', // gray-400 - level 1 (darker than before)
            '#6B7280', // gray-500 - level 2
            '#4B5563', // gray-600 - level 3
            '#1F2937', // gray-800 - level 4 (highest, much darker)
          ],

      // Border colors
      border: {
        default: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        hover: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)'
      },

      // Text colors
      text: {
        primary: isDark ? '#F3F4F6' : '#111827',
        secondary: isDark ? '#9CA3AF' : '#6B7280',
        tertiary: isDark ? '#6B7280' : '#9CA3AF'
      },

      // Tooltip
      tooltip: {
        background: isDark ? '#1F2937' : '#FFFFFF',
        border: isDark ? '#374151' : '#E5E7EB',
        text: isDark ? '#F9FAFB' : '#111827',
        shadow: isDark
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }
    }
  })

  return { theme }
}

/**
 * Get chart-specific color schemes
 */
export function useChartColors() {
  const { currentThemeMode } = useTheme()

  const colors = computed(() => {
    const isDark = currentThemeMode.value === 'dark'

    return {
      // Bar chart gradient (single color)
      barGradient: isDark
        ? {
            start: '#D1D5DB', // gray-300
            end: '#9CA3AF'    // gray-400
          }
        : {
            start: '#4B5563', // gray-600
            end: '#374151'    // gray-700
          },

      // Line chart
      line: {
        main: isDark ? '#F3F4F6' : '#111827',
        area: isDark ? 'rgba(243, 244, 246, 0.1)' : 'rgba(17, 24, 39, 0.1)'
      },

      // Pie/Donut chart - grayscale palette
      pie: isDark
        ? [
            '#F3F4F6', // gray-100
            '#D1D5DB', // gray-300
            '#9CA3AF', // gray-400
            '#6B7280', // gray-500
            '#4B5563', // gray-600
            '#374151'  // gray-700
          ]
        : [
            '#111827', // gray-900
            '#1F2937', // gray-800
            '#374151', // gray-700
            '#4B5563', // gray-600
            '#6B7280', // gray-500
            '#9CA3AF'  // gray-400
          ],

      // Emphasis/Highlight color
      emphasis: isDark ? '#FFFFFF' : '#000000',

      // Shadow color for emphasis
      emphasisShadow: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
    }
  })

  return { colors }
}

/**
 * Generate intensity-based color for value
 * @param {number} value - Current value
 * @param {number} max - Maximum value
 * @param {boolean} isDark - Dark theme flag
 * @returns {string} Color hex code
 */
export function getIntensityColor(value, max, isDark = true) {
  if (!value || value === 0) {
    return isDark ? '#1F2937' : '#F3F4F6' // Empty cell
  }

  const intensity = value / max
  
  if (isDark) {
    // Dark theme: lighter colors for higher values
    if (intensity < 0.2) return '#374151' // gray-700
    if (intensity < 0.4) return '#4B5563' // gray-600
    if (intensity < 0.6) return '#6B7280' // gray-500
    if (intensity < 0.8) return '#9CA3AF' // gray-400
    return '#D1D5DB' // gray-300
  } else {
    // Light theme: darker colors for higher values
    if (intensity < 0.2) return '#D1D5DB' // gray-300
    if (intensity < 0.4) return '#9CA3AF' // gray-400
    if (intensity < 0.6) return '#6B7280' // gray-500
    if (intensity < 0.8) return '#4B5563' // gray-600
    return '#374151' // gray-700
  }
}
