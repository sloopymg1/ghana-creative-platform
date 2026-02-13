<template>
  <div class="py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900">Discover Creative Works</h1>
        <p class="mt-2 text-lg text-gray-600">Explore amazing content from Ghana's creative community</p>
      </div>

      <!-- Filters -->
      <Card class="mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <Input
              v-model="filters.search"
              type="text"
              placeholder="Search content..."
              @input="debouncedFetch"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              v-model="filters.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              @change="fetchContent"
            >
              <option value="">All Types</option>
              <option value="AUDIO">Audio</option>
              <option value="VIDEO">Video</option>
              <option value="IMAGE">Image</option>
              <option value="DOCUMENT">Document</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              v-model="filters.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              @change="fetchContent"
            >
              <option value="">All Categories</option>
              <option value="MUSIC">Music</option>
              <option value="VISUAL_ARTS">Visual Arts</option>
              <option value="DANCE">Dance</option>
              <option value="THEATER">Theater</option>
              <option value="FILM">Film</option>
              <option value="LITERATURE">Literature</option>
              <option value="CRAFTS">Crafts</option>
              <option value="DIGITAL_ARTS">Digital Arts</option>
              <option value="FASHION">Fashion</option>
              <option value="CULINARY_ARTS">Culinary Arts</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              v-model="filters.sortBy"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              @change="fetchContent"
            >
              <option value="publishedAt">Recently Published</option>
              <option value="viewCount">Most Viewed</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </Card>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading content...</p>
      </div>

      <!-- Empty State -->
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
        <h3 class="mt-4 text-lg font-medium text-gray-900">No content found</h3>
        <p class="mt-2 text-gray-600">Try adjusting your filters or search terms.</p>
      </div>

      <!-- Content Grid -->
      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
                <svg
                  class="h-16 w-16 text-white opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    v-if="item.type === 'AUDIO'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                  <path
                    v-else-if="item.type === 'VIDEO'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    v-else-if="item.type === 'IMAGE'"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                  <path
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <!-- Type Badge -->
              <div class="absolute top-2 right-2">
                <Badge size="sm">{{ item.type }}</Badge>
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

              <!-- Artist Info -->
              <div class="flex items-center space-x-2 mb-3">
                <div
                  v-if="item.user?.avatar"
                  class="w-6 h-6 rounded-full bg-gray-300 overflow-hidden"
                >
                  <img :src="item.user.avatar" :alt="getArtistName(item.user)" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                  <span class="text-white font-medium text-xs">
                    {{ getArtistInitials(item.user) }}
                  </span>
                </div>
                <span class="text-sm text-gray-700 font-medium">
                  {{ getArtistName(item.user) }}
                </span>
                <svg
                  v-if="item.user?.artistProfile?.isVerified"
                  class="h-4 w-4 text-blue-500"
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

              <!-- Categories -->
              <div class="flex flex-wrap gap-1 mb-3">
                <Badge
                  v-for="cat in item.categories.slice(0, 2)"
                  :key="cat"
                  variant="secondary"
                  size="sm"
                >
                  {{ cat.replace('_', ' ') }}
                </Badge>
              </div>

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

        <!-- Pagination -->
        <div v-if="meta.totalPages > 1" class="flex justify-center">
          <nav class="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              :disabled="meta.page === 1"
              @click="changePage(meta.page - 1)"
            >
              Previous
            </Button>

            <template v-for="page in paginationPages" :key="page">
              <Button
                v-if="page !== '...'"
                :variant="page === meta.page ? 'primary' : 'secondary'"
                size="sm"
                @click="changePage(page)"
              >
                {{ page }}
              </Button>
              <span v-else class="px-2 text-gray-500">...</span>
            </template>

            <Button
              variant="secondary"
              size="sm"
              :disabled="meta.page === meta.totalPages"
              @click="changePage(meta.page + 1)"
            >
              Next
            </Button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const loading = ref(true)
const content = ref<any[]>([])
const meta = ref({
  page: 1,
  perPage: 20,
  total: 0,
  totalPages: 0
})

const filters = ref({
  search: '',
  type: '',
  category: '',
  sortBy: 'publishedAt'
})

let debounceTimer: NodeJS.Timeout

const debouncedFetch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchContent()
  }, 500)
}

async function fetchContent() {
  try {
    loading.value = true

    const params: any = {
      page: meta.value.page,
      perPage: meta.value.perPage,
      status: 'PUBLISHED',
      sortBy: filters.value.sortBy
    }

    if (filters.value.search) params.search = filters.value.search
    if (filters.value.type) params.type = filters.value.type
    if (filters.value.category) params.category = filters.value.category

    const response = await $fetch('/api/content', { params })

    content.value = response.data
    meta.value = response.meta
  } catch (error) {
    console.error('Failed to fetch content:', error)
  } finally {
    loading.value = false
  }
}

function changePage(page: number) {
  meta.value.page = page
  fetchContent()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const paginationPages = computed(() => {
  const pages: (number | string)[] = []
  const total = meta.value.totalPages
  const current = meta.value.page

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    pages.push(1)

    if (current > 3) {
      pages.push('...')
    }

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (current < total - 2) {
      pages.push('...')
    }

    pages.push(total)
  }

  return pages
})

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

function formatDate(dateString: string) {
  const d = new Date(dateString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
  fetchContent()
})

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
})
</script>
