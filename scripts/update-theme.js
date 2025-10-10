#!/usr/bin/env node

/**
 * Batch update component colors script
 * Convert Tailwind color classes to CSS variables
 */

const fs = require('fs');
const path = require('path');

// Color mapping table
const colorMappings = {
  // Background colors
  'bg-gray-950': 'backgroundColor: \'var(--bgPrimary)\'',
  'bg-gray-900': 'backgroundColor: \'var(--bgSecondary)\'',
  'bg-gray-800': 'backgroundColor: \'var(--bgTertiary)\'',
  'bg-gray-700': 'backgroundColor: \'var(--bgHover)\'',
  
  // Text colors
  'text-white': 'color: \'var(--textPrimary)\'',
  'text-gray-300': 'color: \'var(--textSecondary)\'',
  'text-gray-400': 'color: \'var(--textTertiary)\'',
  'text-gray-500': 'color: \'var(--textMuted)\'',
  'text-gray-600': 'color: \'var(--textMuted)\'',
  
  // Borders
  'border-gray-800': 'border: \'1px solid var(--borderPrimary)\'',
  'border-gray-700': 'border: \'1px solid var(--borderSecondary)\'',
  
  // Special colors
  'text-blue-400': 'color: \'var(--textPrimary)\'',
  'text-blue-500': 'color: \'var(--textPrimary)\'',
  'text-blue-600': 'color: \'var(--textPrimary)\'',
  'text-green-400': 'color: \'var(--success)\'',
  'text-red-400': 'color: \'var(--error)\'',
  'text-yellow-400': 'color: \'var(--warning)\'',
  'text-purple-400': 'color: \'var(--textSecondary)\'',
  
  'bg-blue-500': 'backgroundColor: \'var(--textPrimary)\'',
  'bg-blue-600': 'backgroundColor: \'var(--textPrimary)\'',
  'bg-green-400': 'backgroundColor: \'var(--success)\'',
  'bg-red-600': 'backgroundColor: \'var(--error)\'',
};

// List of components to update
const componentsToUpdate = [
  'src/renderer/src/components/dashboard/DashboardExtremeStats.vue',
  'src/renderer/src/components/dashboard/DashboardRecently.vue',
  'src/renderer/src/components/dashboard/DashboardRepor.vue',
  'src/renderer/src/components/dashboard/DashboardHourlyActivity.vue',
  'src/renderer/src/components/dashboard/DashboardShellDistribution.vue',
  'src/renderer/src/components/dashboard/DashboardWeeklyActivity.vue',
  'src/renderer/src/components/dashboard/DashboardHeatmap.vue',
  'src/renderer/src/components/PageHeatmap.vue',
  'src/renderer/src/components/PageTicketBoard.vue',
  'src/renderer/src/components/heatmap/HeatmapCommandList.vue',
  'src/renderer/src/components/heatmap/HeatmapCustomStats.vue',
  'src/renderer/src/components/ticket-style/HeatmapCard.vue',
  'src/renderer/src/components/ticket-style/TerminalCard.vue',
];

function updateComponent(filePath) {
  console.log(`\nUpdating component: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  File does not exist, skipping`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Example replacement logic - this is just a starting point
  // Actual use requires manual checking and adjustment
  
  Object.entries(colorMappings).forEach(([tailwindClass, cssVar]) => {
    const regex = new RegExp(`class="([^"]*?)${tailwindClass}([^"]*?)"`, 'g');
    if (regex.test(content)) {
      console.log(`  ✓ Found ${tailwindClass}`);
      modified = true;
    }
  });
  
  if (modified) {
    console.log(`  ⚠️  This component needs manual update`);
  } else {
    console.log(`  ✓ No updates needed or already updated`);
  }
}

// Main function
function main() {
  console.log('='.repeat(60));
  console.log('Termlytic Component Color Update Script');
  console.log('='.repeat(60));
  
  console.log('\n📋 List of components to update:\n');
  componentsToUpdate.forEach((comp, index) => {
    console.log(`${index + 1}. ${comp}`);
  });
  
  console.log('\n\n🔍 Checking components...\n');
  
  componentsToUpdate.forEach(updateComponent);
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ Check complete!');
  console.log('='.repeat(60));
  console.log('\n💡 Tips:');
  console.log('1. Please refer to THEME_GUIDE.md to manually update each component');
  console.log('2. Use already updated components as examples:');
  console.log('   - Navigation.vue');
  console.log('   - DashboardTotalStats.vue');
  console.log('   - DashboardTopCommands.vue');
  console.log('   - PageSettings.vue');
  console.log('3. Main replacement patterns:');
  console.log('   class="bg-gray-900" → :style="{ backgroundColor: \'var(--bgSecondary)\' }"');
  console.log('   class="text-white" → :style="{ color: \'var(--textPrimary)\' }"');
  console.log('   class="border border-gray-800" → :style="{ border: \'1px solid var(--borderPrimary)\' }"');
  console.log('\n');
}

main();
