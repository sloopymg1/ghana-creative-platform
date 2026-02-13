<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">📻 Radio Stations</h1>
        <p class="text-lg text-gray-600">
          Listen to live radio from Ghana's creative community
        </p>
      </div>

      <!-- Featured Stations -->
      <div v-if="featuredStations.length > 0" class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">⭐ Featured Stations</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RadioStationCard
            v-for="station in featuredStations"
            :key="station.id"
            :station="station"
          />
        </div>
      </div>

      <!-- All Stations -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">All Stations</h2>

        <!-- Loading -->
        <div v-if="pending" class="text-center py-12">
          <p class="text-gray-600">Loading stations...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center py-12">
          <p class="text-red-600">Failed to load stations</p>
        </div>

        <!-- Stations Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RadioStationCard
            v-for="station in stations"
            :key="station.id"
            :station="station"
          />
        </div>

        <!-- Empty State -->
        <div v-if="!pending && stations.length === 0" class="text-center py-12">
          <span class="text-6xl mb-4 block">📻</span>
          <p class="text-xl text-gray-600">No radio stations available yet</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, pending, error } = await useFetch('/api/radio/stations', {
  query: { limit: 50 },
})

const stations = computed(() => data.value?.data?.filter((s: any) => !s.isFeatured) || [])
const featuredStations = computed(() => data.value?.data?.filter((s: any) => s.isFeatured) || [])
</script>
