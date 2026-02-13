<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Back Button -->
      <NuxtLink to="/stream/radio" class="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
        ← Back to Stations
      </NuxtLink>

      <!-- Error -->
      <div v-if="error" class="text-center py-12">
        <p class="text-red-600">Station not found</p>
      </div>

      <!-- Player -->
      <div v-else-if="station">
        <RadioPlayer :station="station" />

        <!-- Station Info -->
        <div class="mt-8 bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">About This Station</h2>
          <p v-if="station.description" class="text-gray-700 mb-4">
            {{ station.description }}
          </p>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Genre:</span>
              <span class="ml-2 font-medium">{{ station.genre || 'Various' }}</span>
            </div>
            <div>
              <span class="text-gray-600">Status:</span>
              <span class="ml-2 font-medium" :class="station.isLive ? 'text-green-600' : 'text-gray-600'">
                {{ station.isLive ? 'Live' : 'Offline' }}
              </span>
            </div>
          </div>
          <a v-if="station.websiteUrl" :href="station.websiteUrl" target="_blank" class="mt-4 inline-block text-primary-600 hover:text-primary-700">
            Visit Website →
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()
const id = route.params.id as string

interface Station {
  data: any
}

const { data, error } = await useFetch<Station>(`/api/radio/stations/${id}`)
const station = computed(() => data.value?.data)
</script>
