<template>
  <Card>
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900">
        {{ personalized ? '✨ Recommended For You' : '🔥 Popular Content' }}
      </h3>
      <button
        @click="refreshRecommendations"
        class="text-sm text-primary-600 hover:text-primary-700"
        :disabled="loading"
      >
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && recommendations.length === 0" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
    </div>

    <!-- Recommendations Grid -->
    <div v-else-if="recommendations.length > 0" class="space-y-3">
      <div
        v-for="item in recommendations"
        :key="item.id"
        class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        @click="navigateTo(getContentUrl(item))"
      >
        <!-- Thumbnail -->
        <div class="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-200">
          <img
            v-if="item.thumbnailUrl"
            :src="item.thumbnailUrl"
            :alt="item.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path v-if="item.type === 'AUDIO'" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              <path v-else-if="item.type === 'VIDEO'" d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              <path v-else d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
          </div>
        </div>

        <!-- Content Info -->
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-medium text-gray-900 line-clamp-2">{{ item.title }}</h4>
          <p class="text-xs text-gray-600 mt-1">
            {{ getArtistName(item.user) }}
          </p>
          <div class="flex items-center space-x-2 mt-1">
            <Badge size="sm" variant="secondary">{{ item.type }}</Badge>
            <span class="text-xs text-gray-500">{{ formatViews(item.viewCount) }} views</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 text-gray-500">
      <p>No recommendations available</p>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = withDefaults(
  defineProps<{
    limit?: number
    autoRefresh?: boolean
  }>(),
  {
    limit: 5,
    autoRefresh: false,
  }
)

const loading = ref(false)
const recommendations = ref<any[]>([])
const personalized = ref(false)

async function fetchRecommendations() {
  try {
    loading.value = true
    const response = await $fetch(`/api/ai/recommendations?limit=${props.limit}`)
    recommendations.value = response.data
    personalized.value = response.personalized
  } catch (error) {
    console.error('Failed to fetch recommendations:', error)
  } finally {
    loading.value = false
  }
}

function refreshRecommendations() {
  fetchRecommendations()
}

function getContentUrl(item: any): string {
  const routes: Record<string, string> = {
    AUDIO: `/stream/audio/${item.id}`,
    VIDEO: `/stream/video/${item.id}`,
    LIVE_STREAM: `/stream/video/${item.id}`,
    IMAGE: `/content/${item.slug}`,
    DOCUMENT: `/content/${item.slug}`,
  }
  return routes[item.type] || `/content/${item.slug}`
}

function getArtistName(user: any): string {
  return user.artistProfile?.stageName || `${user.firstName} ${user.lastName}`.trim()
}

function formatViews(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}

onMounted(() => {
  fetchRecommendations()

  if (props.autoRefresh) {
    const interval = setInterval(fetchRecommendations, 5 * 60 * 1000) // Refresh every 5 minutes

    onUnmounted(() => {
      clearInterval(interval)
    })
  }
})
</script>
