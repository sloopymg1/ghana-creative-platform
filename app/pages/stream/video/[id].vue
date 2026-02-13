<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p class="mt-4 text-white">Loading video...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-4xl mx-auto px-4 py-8">
      <Alert type="error">{{ error }}</Alert>
    </div>

    <!-- Video Player -->
    <div v-else-if="content">
      <div class="max-w-6xl mx-auto">
        <VideoPlayerEmbed
          :video-url="content.fileUrl || content.externalUrl || ''"
          :title="content.title"
          :artist-name="getArtistName(content.user)"
          :thumbnail-url="content.thumbnailUrl || undefined"
        />

        <!-- Content Details -->
        <div class="bg-gray-800 text-white p-6">
          <!-- Platform Badge and Stats -->
          <div class="flex items-center space-x-3 mb-4">
            <!-- Platform Badge -->
            <span v-if="videoPlatform"
                  class="px-3 py-1 text-sm font-semibold rounded-full"
                  :class="platformBadgeClass">
              {{ platformName }}
            </span>

            <!-- View Count -->
            <span class="flex items-center text-gray-400 text-sm">
              <svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              {{ formatNumber(content.viewCount) }} views
            </span>

            <!-- Duration -->
            <span v-if="content.duration" class="text-gray-400 text-sm">
              {{ formatDuration(content.duration) }}
            </span>
          </div>

          <!-- Title and Artist -->
          <div class="mb-4">
            <h1 class="text-2xl font-bold mb-2">{{ content.title }}</h1>
            <NuxtLink
              v-if="content.user.artistProfile?.slug"
              :to="`/artists/${content.user.artistProfile.slug}`"
              class="text-primary-400 hover:text-primary-300 font-medium"
            >
              {{ getArtistName(content.user) }}
            </NuxtLink>
            <p v-else class="text-gray-400">{{ getArtistName(content.user) }}</p>
          </div>

          <!-- Description -->
          <div v-if="content.description" class="mb-4">
            <h2 class="text-lg font-semibold mb-2">Description</h2>
            <p class="text-gray-300 whitespace-pre-line">{{ content.description }}</p>
          </div>

          <!-- Tags and Categories -->
          <div class="flex flex-wrap gap-2">
            <Badge v-for="category in content.categories" :key="category" variant="primary">
              {{ category }}
            </Badge>
            <Badge v-for="tag in content.tags" :key="tag" variant="secondary">
              #{{ tag }}
            </Badge>
          </div>
        </div>
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

// SEO composable
const { setVideoMeta } = useSeo()

async function fetchContent() {
  try {
    loading.value = true
    error.value = ''

    const response = await $fetch(`/api/content/stream/${id}`)
    content.value = response.data

    // Set SEO meta tags for video
    if (content.value) {
      setVideoMeta({
        title: content.value.title,
        description: content.value.description,
        thumbnailUrl: content.value.thumbnailUrl,
        externalUrl: content.value.externalUrl || content.value.fileUrl,
        duration: content.value.duration,
      })
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load video content'
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

// Platform detection
const videoPlatform = computed(() => {
  if (!content.value?.externalUrl) return null
  const url = content.value.externalUrl
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('facebook.com')) return 'facebook'
  if (url.includes('vimeo.com')) return 'vimeo'
  return null
})

const platformName = computed(() => {
  const names: Record<string, string> = {
    youtube: 'YouTube',
    facebook: 'Facebook',
    vimeo: 'Vimeo'
  }
  return videoPlatform.value ? names[videoPlatform.value] : ''
})

const platformBadgeClass = computed(() => {
  const classes: Record<string, string> = {
    youtube: 'bg-red-100 text-red-800',
    facebook: 'bg-blue-100 text-blue-800',
    vimeo: 'bg-cyan-100 text-cyan-800'
  }
  return videoPlatform.value ? classes[videoPlatform.value] : 'bg-gray-100 text-gray-800'
})

onMounted(() => {
  fetchContent()
})
</script>
