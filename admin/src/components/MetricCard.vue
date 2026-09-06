<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  hint: string
  tone?: 'blue' | 'green' | 'orange' | 'purple'
}>()
</script>

<template>
  <div class="metric-card" :class="`metric-${tone || 'blue'}`">
    <div class="metric-label">{{ label }}</div>
    <div class="metric-value">{{ value }}</div>
    <div class="metric-hint">{{ hint }}</div>
  </div>
</template>
