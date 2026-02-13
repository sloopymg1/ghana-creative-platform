<template>
  <div class="py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">My Content</h1>
          <p class="mt-2 text-gray-600">Manage your creative works</p>
        </div>
        <Button @click="navigateTo('/dashboard/content/upload')">
          Upload Content
        </Button>
      </div>

      <!-- Filters -->
      <Card class="mb-6">
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
              Status
            </label>
            <select
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              @change="fetchContent"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="PUBLISHED">Published</option>
              <option value="REJECTED">Rejected</option>
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
              <option value="createdAt">Date Created</option>
              <option value="updatedAt">Last Updated</option>
              <option value="title">Title</option>
              <option value="viewCount">Views</option>
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
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No content yet</h3>
        <p class="mt-2 text-gray-600">Get started by uploading your first creative work.</p>
        <Button class="mt-6" @click="navigateTo('/dashboard/content/upload')">
          Upload Content
        </Button>
      </div>

      <!-- Content Grid -->
      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card
            v-for="item in content"
            :key="item.id"
            class="hover:shadow-lg transition-shadow cursor-pointer"
            @click="navigateTo(`/dashboard/content/${item.id}`)"
          >
            <!-- Thumbnail -->
            <div class="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
              <img
                v-if="item.thumbnailUrl"
                :src="item.thumbnailUrl"
                :alt="item.title"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg
                  class="h-16 w-16 text-gray-400"
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
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
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
            </div>

            <!-- Content Info -->
            <div class="p-4">
              <div class="flex items-start justify-between mb-2">
                <h3 class="text-lg font-semibold text-gray-900 line-clamp-2">
                  {{ item.title }}
                </h3>
                <Badge :variant="statusVariant(item.status)">
                  {{ statusLabel(item.status) }}
                </Badge>
              </div>

              <p v-if="item.description" class="text-sm text-gray-600 line-clamp-2 mb-3">
                {{ item.description }}
              </p>

              <!-- Categories -->
              <div class="flex flex-wrap gap-1 mb-3">
                <Badge
                  v-for="cat in item.categories.slice(0, 3)"
                  :key="cat"
                  variant="secondary"
                  size="sm"
                >
                  {{ cat.replace('_', ' ') }}
                </Badge>
                <Badge v-if="item.categories.length > 3" variant="secondary" size="sm">
                  +{{ item.categories.length - 3 }}
                </Badge>
              </div>

              <!-- Stats -->
              <div class="flex items-center justify-between text-sm text-gray-500">
                <div class="flex items-center space-x-4">
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
                  <span class="flex items-center">
                    <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {{ formatDate(item.createdAt) }}
                  </span>
                </div>
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
definePageMeta({
  middleware: ['auth', 'verified'],
  layout: 'dashboard'
})

const loading = ref(true)
const content = ref<any[]>([])
const meta = ref({
  page: 1,
  perPage: 12,
  total: 0,
  totalPages: 0
})

const filters = ref({
  search: '',
  type: '',
  status: '',
  sortBy: 'createdAt'
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
      sortBy: filters.value.sortBy
    }

    if (filters.value.search) params.search = filters.value.search
    if (filters.value.type) params.type = filters.value.type
    if (filters.value.status) params.status = filters.value.status

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

function statusVariant(status: string) {
  const variants: Record<string, string> = {
    DRAFT: 'secondary',
    PENDING_REVIEW: 'warning',
    PUBLISHED: 'success',
    REJECTED: 'danger'
  }
  return variants[status] || 'secondary'
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: 'Draft',
    PENDING_REVIEW: 'Pending',
    PUBLISHED: 'Published',
    REJECTED: 'Rejected'
  }
  return labels[status] || status
}

function formatDate(date: string) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

onMounted(() => {
  fetchContent()
})

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
})
</script>
