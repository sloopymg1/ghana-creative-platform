<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading artist profile...</p>
      </div>
    </div>

    <!-- Artist Not Found -->
    <div v-else-if="!artist" class="flex items-center justify-center h-screen">
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900">Artist Not Found</h2>
        <p class="mt-2 text-gray-600">The artist you're looking for doesn't exist.</p>
        <Button class="mt-6" @click="navigateTo('/content')">
          Browse Content
        </Button>
      </div>
    </div>

    <!-- Artist Profile -->
    <div v-else>
      <!-- Hero Section -->
      <div class="bg-gradient-to-br from-primary-900 to-primary-700 text-white">
        <div class="max-w-7xl mx-auto px-4 py-16">
          <div class="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <!-- Avatar -->
            <div class="relative">
              <div
                v-if="artist.avatar"
                class="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-white/20 ring-4 ring-white/50"
              >
                <img
                  :src="artist.avatar"
                  :alt="artistName"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white/50"
              >
                <span class="text-5xl md:text-6xl font-bold text-white">
                  {{ getInitials() }}
                </span>
              </div>

              <!-- Verified Badge -->
              <div
                v-if="artist.artistProfile?.isVerified"
                class="absolute bottom-2 right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center ring-4 ring-white"
              >
                <svg
                  class="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1">
              <h1 class="text-4xl md:text-5xl font-bold mb-2">
                {{ artistName }}
              </h1>
              <p v-if="artist.bio" class="text-lg text-white/90 mb-4">
                {{ artist.bio }}
              </p>

              <!-- Categories -->
              <div v-if="artist.artistProfile?.categories?.length" class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="cat in artist.artistProfile.categories"
                  :key="cat"
                  class="px-3 py-1 bg-white/20 rounded-full text-sm font-medium"
                >
                  {{ cat.replace('_', ' ') }}
                </span>
              </div>

              <!-- Social Links -->
              <div v-if="hasSocialLinks" class="flex flex-wrap gap-3">
                <a
                  v-if="artist.artistProfile.instagramUrl"
                  :href="artist.artistProfile.instagramUrl"
                  target="_blank"
                  class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Instagram
                </a>
                <a
                  v-if="artist.artistProfile.twitterUrl"
                  :href="artist.artistProfile.twitterUrl"
                  target="_blank"
                  class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Twitter
                </a>
                <a
                  v-if="artist.artistProfile.facebookUrl"
                  :href="artist.artistProfile.facebookUrl"
                  target="_blank"
                  class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Facebook
                </a>
                <a
                  v-if="artist.artistProfile.youtubeUrl"
                  :href="artist.artistProfile.youtubeUrl"
                  target="_blank"
                  class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  YouTube
                </a>
                <a
                  v-if="artist.artistProfile.websiteUrl"
                  :href="artist.artistProfile.websiteUrl"
                  target="_blank"
                  class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Website
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="max-w-7xl mx-auto px-4 py-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Content by {{ artistName }}</h2>

        <!-- Loading Content -->
        <div v-if="loadingContent" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading content...</p>
        </div>

        <!-- No Content -->
        <div v-else-if="!content.length" class="text-center py-12">
          <svg
            class="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 13h6m-3-3v6m-2 0h4a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">No content yet</h3>
          <p class="mt-2 text-gray-600">This artist hasn't published any content.</p>
        </div>

        <!-- Content Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Card
            v-for="item in content"
            :key="item.id"
            class="hover:shadow-xl transition-all cursor-pointer group"
            @click="navigateTo(`/content/${item.slug}`)"
          >
            <!-- Thumbnail -->
            <div class="aspect-video bg-gray-200 rounded-t-lg overflow-hidden relative">
              <img
                v-if="item.thumbnailUrl"
                :src="item.thumbnailUrl"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                <Badge>{{ item.type }}</Badge>
              </div>
            </div>

            <!-- Content Info -->
            <div class="p-4">
              <h3 class="text-lg font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
                {{ item.title }}
              </h3>

              <p v-if="item.description" class="text-sm text-gray-600 line-clamp-2 mb-3">
                {{ item.description }}
              </p>

              <!-- Stats -->
              <div class="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                <span class="flex items-center">
                  <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  {{ item.viewCount }}
                </span>
                <span>{{ formatDate(item.publishedAt) }}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

const loading = ref(true)
const loadingContent = ref(true)
const artist = ref<any>(null)
const content = ref<any[]>([])

const artistName = computed(() => {
  if (!artist.value) return ''
  return artist.value.artistProfile?.stageName || `${artist.value.firstName} ${artist.value.lastName}`.trim()
})

const hasSocialLinks = computed(() => {
  if (!artist.value?.artistProfile) return false
  const profile = artist.value.artistProfile
  return !!(
    profile.instagramUrl ||
    profile.twitterUrl ||
    profile.facebookUrl ||
    profile.youtubeUrl ||
    profile.websiteUrl
  )
})

async function fetchArtist() {
  try {
    loading.value = true
    const response = await $fetch(`/api/artists/${slug}`)
    artist.value = response.data

    // Set page title
    useHead({
      title: `${artistName.value} - Ghana Creative Arts Platform`
    })
  } catch (error) {
    console.error('Failed to fetch artist:', error)
  } finally {
    loading.value = false
  }
}

async function fetchContent() {
  if (!artist.value) return

  try {
    loadingContent.value = true
    const response = await $fetch('/api/content', {
      params: {
        userId: artist.value.id,
        status: 'PUBLISHED',
        perPage: 12
      }
    })
    content.value = response.data
  } catch (error) {
    console.error('Failed to fetch content:', error)
  } finally {
    loadingContent.value = false
  }
}

function getInitials(): string {
  if (!artist.value) return 'A'
  if (artist.value.artistProfile?.stageName) {
    return artist.value.artistProfile.stageName.substring(0, 2).toUpperCase()
  }
  const first = artist.value.firstName?.[0] || ''
  const last = artist.value.lastName?.[0] || ''
  return (first + last).toUpperCase() || 'A'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(async () => {
  await fetchArtist()
  if (artist.value) {
    fetchContent()
  }
})
</script>
