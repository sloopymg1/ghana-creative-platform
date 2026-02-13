<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  }>(),
  {
    variant: 'primary',
  }
)

const badgeClasses = computed(() => {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium'

  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  return `${baseClasses} ${variantClasses[props.variant]}`
})
</script>
