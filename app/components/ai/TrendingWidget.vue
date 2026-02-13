<template>
  <Card>
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">📈 Trending Now</h3>

      <!-- Timeframe Selector -->
      <div class="flex space-x-2">
        <button
          v-for="option in timeframeOptions"
          :key="option.value"
          @click="changeTimeframe(option.value)"
          :class="[
            'px-3 py-1 text-sm rounded-md transition-colors',
            timeframe === option.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
    </div>

    <!-- Trending List -->
    <div v-else-if="trending.length > 0" class="space-y-3">
      <div
        v-for="(item, index) in trending"
        :key="item.id"
        class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        @click="navigateTo(getContentUrl(item))"
      >
        <!-- Rank Badge -->
        <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold text-lg"
             :class="getRankColor(index)">
          {{ index + 1 }}
        </div>

        <!-- Thumbnail -->
        <div class="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-200">
          <img
            v-if="item.thumbnailUrl"
            :src="item.thumbnailUrl"
            :alt="item.title"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-700">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
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
            <span class="text-xs text-gray-500">
              🔥 {{ item.trendingScore.toFixed(1) }} trending
            </span>
            <span class="text-xs text-gray-400">•</span>
            <span class="text-xs text-gray-500">
              {{ formatViews(item.viewCount) }} views
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8 text-gray-500">
      <p>No trending content</p>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const timeframeOptions = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

const timeframe = ref<'day' | 'week' | 'month'>('week')
const loading = ref(false)
const trending = ref<any[]>([])

async function fetchTrending() {
  try {
    loading.value = true
    const response = await $fetch(`/api/ai/trending?timeframe=${timeframe.value}&limit=10`)
    trending.value = response.data
  } catch (error) {
    console.error('Failed to fetch trending content:', error)
  } finally {
    loading.value = false
  }
}

function changeTimeframe(newTimeframe: 'day' | 'week' | 'month') {
  timeframe.value = newTimeframe
  fetchTrending()
}

function getRankColor(index: number): string {
  if (index === 0) return 'text-yellow-600'
  if (index === 1) return 'text-gray-500'
  if (index === 2) return 'text-orange-600'
  return 'text-gray-400'
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
  fetchTrending()
})
</script>
