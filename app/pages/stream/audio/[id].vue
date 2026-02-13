<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading audio...</p>
      </div>

      <!-- Error State -->
      <Alert v-else-if="error" type="error" class="mb-6">{{ error }}</Alert>

      <!-- Audio Player -->
      <div v-else-if="content">
        <AudioPlayer
          :audio-url="content.fileUrl || content.externalUrl || ''"
          :title="content.title"
          :artist-name="getArtistName(content.user)"
          :thumbnail-url="content.thumbnailUrl || undefined"
        />

        <!-- Content Details -->
        <Card class="mt-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ content.title }}</h1>
              <NuxtLink
                v-if="content.user.artistProfile?.slug"
                :to="`/artists/${content.user.artistProfile.slug}`"
                class="text-primary-600 hover:text-primary-700 font-medium"
              >
                {{ getArtistName(content.user) }}
              </NuxtLink>
              <p v-else class="text-gray-600">{{ getArtistName(content.user) }}</p>
            </div>
            <div class="text-right">
              <div class="flex items-center text-gray-500 text-sm">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {{ formatNumber(content.viewCount) }} views
              </div>
              <p v-if="content.duration" class="text-gray-500 text-sm mt-1">
                {{ formatDuration(content.duration) }}
              </p>
            </div>
          </div>

          <!-- Description -->
          <div v-if="content.description" class="mb-4">
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p class="text-gray-700 whitespace-pre-line">{{ content.description }}</p>
          </div>

          <!-- Tags and Categories -->
          <div class="flex flex-wrap gap-2 mb-4">
            <Badge v-for="category in content.categories" :key="category" variant="primary">
              {{ category }}
            </Badge>
            <Badge v-for="tag in content.tags" :key="tag" variant="secondary">
              #{{ tag }}
            </Badge>
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

const route = useRoute()
const id = route.params.id as string

const loading = ref(true)
const error = ref('')
const content = ref<any>(null)

async function fetchContent() {
  try {
    loading.value = true
    error.value = ''

    const response = await $fetch(`/api/content/stream/${id}`)
    content.value = response.data
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load audio content'
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

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  fetchContent()
})
</script>
