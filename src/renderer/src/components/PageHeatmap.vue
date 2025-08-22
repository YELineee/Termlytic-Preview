<template>
  <div class="w-full h-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
    <div class="col-span-2 row-span-2">
      <DashboardHeatmap />
    </div>
    <!-- Additional grid items -->
  </div>
</template>

<script setup>
import DashboardHeatmap from './dashboard/DashboardHeatmap.vue'
</script>
