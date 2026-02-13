<template>
  <NuxtLink :to="`/stream/radio/${station.id}`">
    <div class="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      <!-- Station Logo -->
      <div class="relative h-48 bg-gradient-to-br from-primary-400 to-secondary-400">
        <img
          v-if="station.logoUrl"
          :src="station.logoUrl"
          :alt="station.name"
          class="w-full h-full object-cover"
        />
        <div v-else class="flex items-center justify-center h-full">
          <span class="text-6xl">📻</span>
        </div>

        <!-- Live Badge -->
        <div v-if="station.isLive" class="absolute top-2 right-2">
          <span class="flex items-center px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
            <span class="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></span>
            LIVE
          </span>
        </div>

        <!-- Featured Badge -->
        <div v-if="station.isFeatured" class="absolute top-2 left-2">
          <span class="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
            ⭐ Featured
          </span>
        </div>
      </div>

      <!-- Station Info -->
      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">
          {{ station.name }}
        </h3>
        <p v-if="station.genre" class="text-sm text-gray-600 mb-2">
          {{ station.genre }}
        </p>
        <p v-if="station.description" class="text-sm text-gray-500 line-clamp-2 mb-3">
          {{ station.description }}
        </p>

        <!-- Now Playing -->
        <div v-if="station.currentTrack" class="bg-gray-50 rounded p-2 mb-3">
          <p class="text-xs text-gray-500 mb-1">Now Playing:</p>
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ station.currentTrack.song?.title }}
          </p>
          <p class="text-xs text-gray-600 truncate">
            {{ station.currentTrack.song?.artist }}
          </p>
        </div>

        <!-- Listener Count -->
        <div class="flex items-center justify-between text-sm text-gray-600">
          <span class="flex items-center">
            👥 {{ station.listenerCount }} listening
          </span>
          <span class="text-primary-600 font-medium">
            Listen →
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  station: any
}>()
</script>
