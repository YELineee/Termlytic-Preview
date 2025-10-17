<template>
  <div class="w-full h-full rounded-lg p-4 skeleton-card" :style="{
    backgroundColor: 'var(--bgSecondary)',
    border: '1px solid var(--borderPrimary)'
  }">
    <!-- Title skeleton -->
    <div class="skeleton-line w-1/3 h-4 mb-4"></div>

    <!-- Main content skeleton -->
    <div class="skeleton-line w-full h-8 mb-3"></div>
    <div class="skeleton-line w-2/3 h-4 mb-4"></div>

    <!-- Secondary metrics skeleton -->
    <div class="space-y-2 mt-auto">
      <div class="skeleton-line w-full h-3"></div>
      <div class="skeleton-line w-5/6 h-3"></div>
    </div>
  </div>
</template>

<script setup>
// Skeleton loader for card-style components
</script>

<style scoped>
.skeleton-card {
  display: flex;
  flex-direction: column;
}
</style>
