<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading content...</p>
      </div>
    </div>

    <!-- Content Not Found -->
    <div v-else-if="!content" class="flex items-center justify-center h-screen">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900">Content Not Found</h2>
        <p class="mt-2 text-gray-600">The content you're looking for doesn't exist or has been removed.</p>
        <Button class="mt-6" @click="navigateTo('/content')">
          Browse Content
        </Button>
      </div>
    </div>

    <!-- Content Detail -->
    <div v-else>
      <!-- Hero/Player Section -->
      <div class="bg-black">
        <div class="max-w-7xl mx-auto px-4 py-8">
          <div class="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <!-- Image -->
            <img
              v-if="content.type === 'IMAGE' && content.fileUrl"
              :src="content.fileUrl"
              :alt="content.title"
              class="w-full h-full object-contain"
            />

            <!-- Video Player -->
            <video
              v-else-if="content.type === 'VIDEO' && content.fileUrl"
              :src="content.fileUrl"
              controls
              class="w-full h-full"
              @play="incrementViewCount"
            />

            <!-- Audio Player with Visualizer -->
            <div
              v-else-if="content.type === 'AUDIO' && content.fileUrl"
              class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-700"
            >
              <div class="text-center">
                <svg
                  class="h-24 w-24 text-white opacity-50 mx-auto mb-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
                <audio
                  :src="content.fileUrl"
                  controls
                  class="w-full max-w-2xl"
                  @play="incrementViewCount"
                />
              </div>
            </div>

            <!-- Document -->
            <div
              v-else-if="content.type === 'DOCUMENT' && content.fileUrl"
              class="w-full h-full flex items-center justify-center bg-gray-800"
            >
              <div class="text-center text-white">
                <svg
                  class="h-24 w-24 mx-auto mb-6 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p class="text-lg mb-4">Document File</p>
                <a
                  :href="content.fileUrl"
                  target="_blank"
                  class="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium"
                >
                  Download File
                </a>
              </div>
            </div>

            <!-- Fallback -->
            <div v-else class="w-full h-full flex items-center justify-center bg-gray-800">
              <div class="text-center text-white">
                <p class="text-lg">No preview available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Info -->
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Title & Meta -->
            <div>
              <div class="flex items-start justify-between mb-4">
                <h1 class="text-3xl font-bold text-gray-900 flex-1">{{ content.title }}</h1>
                <Badge>{{ content.type }}</Badge>
              </div>

              <div class="flex items-center space-x-4 text-sm text-gray-600">
                <span class="flex items-center">
                  <svg class="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  {{ content.viewCount }} views
                </span>
                <span>•</span>
                <span>{{ formatDate(content.publishedAt) }}</span>
              </div>
            </div>

            <!-- Description -->
            <Card v-if="content.description">
              <h2 class="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p class="text-gray-700 whitespace-pre-wrap">{{ content.description }}</p>
            </Card>

            <!-- Categories & Tags -->
            <Card>
              <div class="space-y-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-500 mb-2">Categories</h3>
                  <div class="flex flex-wrap gap-2">
                    <Badge v-for="cat in content.categories" :key="cat">
                      {{ cat.replace('_', ' ') }}
                    </Badge>
                  </div>
                </div>

                <div v-if="content.tags && content.tags.length">
                  <h3 class="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                  <div class="flex flex-wrap gap-2">
                    <Badge v-for="tag in content.tags" :key="tag" variant="secondary">
                      #{{ tag }}
                    </Badge>
                  </div>
                </div>

                <div v-if="content.licenseType">
                  <h3 class="text-sm font-medium text-gray-500 mb-2">License</h3>
                  <p class="text-gray-900">{{ content.licenseType.replace(/_/g, ' ') }}</p>
                </div>
              </div>
            </Card>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Artist Card -->
            <Card>
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Creator</h2>

              <div class="flex items-start space-x-4">
                <div
                  v-if="content.user.avatar"
                  class="w-16 h-16 rounded-full bg-gray-300 overflow-hidden flex-shrink-0"
                >
                  <img
                    :src="content.user.avatar"
                    :alt="getArtistName(content.user)"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div v-else class="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                  <span class="text-white font-bold text-xl">
                    {{ getArtistInitials(content.user) }}
                  </span>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2 mb-1">
                    <h3 class="text-lg font-semibold text-gray-900 truncate">
                      {{ getArtistName(content.user) }}
                    </h3>
                    <svg
                      v-if="content.user.artistProfile?.isVerified"
                      class="h-5 w-5 text-blue-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>

                  <p v-if="content.user.bio" class="text-sm text-gray-600 line-clamp-3 mb-3">
                    {{ content.user.bio }}
                  </p>

                  <Button
                    v-if="artistSlug"
                    variant="secondary"
                    size="sm"
                    class="w-full"
                    @click="navigateTo(`/artists/${artistSlug}`)"
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </Card>

            <!-- Stats Card -->
            <Card>
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Details</h2>

              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Published</span>
                  <span class="text-sm font-medium text-gray-900">
                    {{ new Date(content.publishedAt).toLocaleDateString() }}
                  </span>
                </div>

                <div v-if="content.fileSize" class="flex justify-between">
                  <span class="text-sm text-gray-600">File Size</span>
                  <span class="text-sm font-medium text-gray-900">
                    {{ formatFileSize(content.fileSize) }}
                  </span>
                </div>

                <div v-if="content.duration" class="flex justify-between">
                  <span class="text-sm text-gray-600">Duration</span>
                  <span class="text-sm font-medium text-gray-900">
                    {{ formatDuration(content.duration) }}
                  </span>
                </div>

                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Views</span>
                  <span class="text-sm font-medium text-gray-900">
                    {{ content.viewCount }}
                  </span>
                </div>
              </div>
            </Card>

            <!-- Share Card -->
            <Card>
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Share</h2>

              <div class="space-y-2">
                <Button variant="secondary" size="sm" class="w-full" @click="copyLink">
                  {{ copied ? 'Link Copied!' : 'Copy Link' }}
                </Button>

                <div class="flex space-x-2">
                  <Button variant="secondary" size="sm" class="flex-1">
                    Facebook
                  </Button>
                  <Button variant="secondary" size="sm" class="flex-1">
                    Twitter
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const loading = ref(true)
const content = ref<any>(null)
const viewCounted = ref(false)
const copied = ref(false)

const artistSlug = computed(() => {
  return content.value?.user?.artistProfile?.slug
})

async function fetchContent() {
  try {
    loading.value = true
    const response = await $fetch(`/api/content/${slug}`)
    content.value = response.data

    // Set page title
    if (content.value) {
      useHead({
        title: `${content.value.title} - Ghana Creative Arts Platform`
      })
    }
  } catch (error) {
    console.error('Failed to fetch content:', error)
  } finally {
    loading.value = false
  }
}

async function incrementViewCount() {
  if (viewCounted.value || !content.value) return

  try {
    await $fetch(`/api/content/${content.value.id}/view`, {
      method: 'POST'
    })
    viewCounted.value = true
    content.value.viewCount++
  } catch (error) {
    console.error('Failed to increment view count:', error)
  }
}

function copyLink() {
  const url = window.location.href
  navigator.clipboard.writeText(url)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function getArtistName(user: any): string {
  if (user?.artistProfile?.stageName) {
    return user.artistProfile.stageName
  }
  return `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Anonymous'
}

function getArtistInitials(user: any): string {
  if (user?.artistProfile?.stageName) {
    return user.artistProfile.stageName.substring(0, 2).toUpperCase()
  }
  const first = user?.firstName?.[0] || ''
  const last = user?.lastName?.[0] || ''
  return (first + last).toUpperCase() || 'A'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchContent()
})
</script>
