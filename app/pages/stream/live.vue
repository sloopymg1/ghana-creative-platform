<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Live Streams</h1>
        <p class="mt-2 text-gray-600">Watch live performances and events</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading live streams...</p>
      </div>

      <!-- Error State -->
      <Alert v-else-if="error" type="error" class="mb-6">{{ error }}</Alert>

      <!-- No Streams -->
      <Card v-else-if="streams.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No Live Streams</h3>
        <p class="text-gray-600">There are no live streams at the moment. Check back later!</p>
      </Card>

      <!-- Streams Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          v-for="stream in streams"
          :key="stream.id"
          class="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          @click="navigateTo(`/stream/live/${stream.id}`)"
        >
          <!-- Thumbnail -->
          <div class="relative aspect-video bg-gray-900">
            <img
              v-if="stream.thumbnailUrl"
              :src="stream.thumbnailUrl"
              :alt="stream.title"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700"
            >
              <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>

            <!-- Live Badge -->
            <div class="absolute top-2 left-2">
              <Badge variant="danger" class="animate-pulse">
                <span class="flex items-center">
                  <span class="w-2 h-2 bg-white rounded-full mr-1"></span>
                  LIVE
                </span>
              </Badge>
            </div>

            <!-- View Count -->
            <div class="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
              {{ formatNumber(stream.viewCount) }} watching
            </div>
          </div>

          <!-- Stream Info -->
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 mb-1 line-clamp-2">{{ stream.title }}</h3>
            <p class="text-sm text-gray-600 mb-2">{{ getArtistName(stream.user) }}</p>

            <!-- Categories -->
            <div class="flex flex-wrap gap-1">
              <Badge
                v-for="category in stream.categories.slice(0, 2)"
                :key="category"
                size="sm"
                variant="secondary"
              >
                {{ category }}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const loading = ref(true)
const error = ref('')
const streams = ref<any[]>([])

async function fetchLiveStreams() {
  try {
    loading.value = true
    error.value = ''

    const response = await $fetch('/api/content/live')
    streams.value = response.data
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load live streams'
  } finally {
    loading.value = false
  }
}

function getArtistName(user: any): string {
  return user.artistProfile?.stageName || `${user.firstName} ${user.lastName}`.trim()
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

onMounted(() => {
  fetchLiveStreams()

  // Auto-refresh every 30 seconds to get new live streams
  const interval = setInterval(fetchLiveStreams, 30000)

  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>
