<script setup lang="ts">
interface Props {
  padding?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: true,
})
</script>

<template>
  <div class="bg-white rounded-lg shadow-md" :class="{ 'p-6': padding }">
    <slot />
  </div>
</template>
