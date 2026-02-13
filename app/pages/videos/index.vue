<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Video Gallery</h1>
        <p class="text-lg text-gray-600">
          Watch creative content from Ghana's talented artists
        </p>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="text-gray-600 mt-4">Loading videos...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">Failed to load videos</p>
      </div>

      <!-- Videos Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="video in videos"
          :key="video.id"
          :to="`/stream/video/${video.id}`"
          class="group"
        >
          <div class="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
            <!-- Thumbnail -->
            <div class="relative aspect-video bg-gray-200">
              <img
                v-if="video.thumbnailUrl"
                :src="video.thumbnailUrl"
                :alt="video.title"
                class="w-full h-full object-cover"
              />
              <div v-else class="flex items-center justify-center h-full bg-gradient-to-br from-primary-500 to-primary-700">
                <svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                </svg>
              </div>

              <!-- Duration Badge -->
              <div v-if="video.duration"
                   class="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {{ formatDuration(video.duration) }}
              </div>

              <!-- Platform Badge -->
              <div v-if="getPlatform(video.externalUrl)"
                   class="absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded"
                   :class="getPlatformBadgeClass(getPlatform(video.externalUrl))">
                {{ getPlatformName(getPlatform(video.externalUrl)) }}
              </div>

              <!-- Play Icon Overlay -->
              <div class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition">
                <div class="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition transform group-hover:scale-110">
                  <svg class="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Video Info -->
            <div class="p-4">
              <h3 class="font-semibold text-gray-900 mb-1 line-clamp-2">
                {{ video.title }}
              </h3>
              <p v-if="video.description" class="text-sm text-gray-600 line-clamp-2 mb-2">
                {{ video.description }}
              </p>
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  {{ formatNumber(video.viewCount) }}
                </span>
                <span v-if="video.user" class="text-gray-600">
                  {{ getArtistName(video.user) }}
                </span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div v-if="!pending && videos.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">🎥</div>
        <p class="text-xl text-gray-600 mb-2">No videos available yet</p>
        <p class="text-gray-500">Check back soon for exciting content from Ghanaian artists</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

// Set SEO meta tags
const { setDefaultMeta } = useSeo()
setDefaultMeta({
  title: 'Video Gallery - Ghana Creative Arts Platform',
  description: 'Explore creative video content from Ghana\'s talented artists. Watch music videos, films, documentaries, and more.',
})

const { data, pending, error } = await useFetch('/api/content', {
  query: {
    type: 'VIDEO',
    status: 'PUBLISHED',
    limit: 50,
  },
})

const videos = computed(() => data.value?.data || [])

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
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

function getArtistName(user: any): string {
  return user?.artistProfile?.stageName || `${user?.firstName} ${user?.lastName}`.trim() || 'Unknown Artist'
}

function getPlatform(url: string | null): string | null {
  if (!url) return null
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('facebook.com')) return 'facebook'
  if (url.includes('vimeo.com')) return 'vimeo'
  return null
}

function getPlatformName(platform: string | null): string {
  const names: Record<string, string> = {
    youtube: 'YouTube',
    facebook: 'Facebook',
    vimeo: 'Vimeo'
  }
  return platform ? names[platform] : ''
}

function getPlatformBadgeClass(platform: string | null): string {
  const classes: Record<string, string> = {
    youtube: 'bg-red-500 text-white',
    facebook: 'bg-blue-500 text-white',
    vimeo: 'bg-cyan-500 text-white'
  }
  return platform ? classes[platform] : 'bg-gray-500 text-white'
}
</script>
