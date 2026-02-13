<template>
  <div class="py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Content Moderation</h1>
        <p class="mt-2 text-gray-600">Review and moderate user-submitted content</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Pending Review</p>
              <p class="text-2xl font-bold text-gray-900">{{ meta.total }}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Approved Today</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.approvedToday }}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-red-100 rounded-lg p-3">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Rejected Today</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.rejectedToday }}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Reviewed by You</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.reviewedByMe }}</p>
            </div>
          </div>
        </Card>
      </div>

      <Alert v-if="error" type="error" class="mb-6">{{ error }}</Alert>
      <Alert v-if="success" type="success" class="mb-6">{{ success }}</Alert>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading queue...</p>
      </div>

      <!-- Empty State -->
      <Card v-else-if="!queue.length">
        <div class="text-center py-12">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900">All caught up!</h3>
          <p class="mt-2 text-gray-600">There's no content waiting for review at the moment.</p>
        </div>
      </Card>

      <!-- Moderation Queue -->
      <div v-else class="space-y-6">
        <Card v-for="item in queue" :key="item.id">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Content Preview -->
            <div>
              <div class="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-3">
                <img
                  v-if="item.thumbnailUrl"
                  :src="item.thumbnailUrl"
                  :alt="item.title"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <Badge>{{ item.type }}</Badge>
                </div>
              </div>
              <div v-if="item.fileUrl" class="space-y-2">
                <audio v-if="item.type === 'AUDIO'" :src="item.fileUrl" controls class="w-full" />
                <video v-if="item.type === 'VIDEO'" :src="item.fileUrl" controls class="w-full max-h-40" />
                <a
                  v-if="item.type === 'DOCUMENT'"
                  :href="item.fileUrl"
                  target="_blank"
                  class="block text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Document
                </a>
              </div>
            </div>

            <!-- Content Details -->
            <div class="lg:col-span-2 space-y-4">
              <div>
                <div class="flex items-start justify-between mb-2">
                  <h3 class="text-xl font-semibold text-gray-900">{{ item.title }}</h3>
                  <Badge>{{ item.type }}</Badge>
                </div>
                <p v-if="item.description" class="text-gray-600">{{ item.description }}</p>
              </div>

              <!-- User Info -->
              <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div
                  v-if="item.user.avatar"
                  class="w-10 h-10 rounded-full bg-gray-300 overflow-hidden"
                >
                  <img :src="item.user.avatar" :alt="getUserName(item.user)" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                  <span class="text-white font-medium text-sm">
                    {{ getUserInitials(item.user) }}
                  </span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">
                    {{ getUserName(item.user) }}
                    <Badge
                      v-if="item.user.artistProfile?.isVerified"
                      variant="success"
                      size="sm"
                      class="ml-2"
                    >
                      Verified
                    </Badge>
                  </p>
                  <p class="text-xs text-gray-500">{{ item.user.email }}</p>
                </div>
              </div>

              <!-- Metadata -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Categories</p>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <Badge
                      v-for="cat in item.categories.slice(0, 3)"
                      :key="cat"
                      variant="secondary"
                      size="sm"
                    >
                      {{ cat.replace('_', ' ') }}
                    </Badge>
                  </div>
                </div>
                <div v-if="item.tags && item.tags.length">
                  <p class="text-sm font-medium text-gray-500">Tags</p>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <Badge
                      v-for="tag in item.tags.slice(0, 3)"
                      :key="tag"
                      variant="secondary"
                      size="sm"
                    >
                      {{ tag }}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Submitted</p>
                  <p class="text-sm text-gray-900">{{ formatDate(item.createdAt) }}</p>
                </div>
                <div v-if="item.fileSize">
                  <p class="text-sm font-medium text-gray-500">File Size</p>
                  <p class="text-sm text-gray-900">{{ formatFileSize(item.fileSize) }}</p>
                </div>
              </div>

              <!-- Review Form -->
              <div v-if="activeReview === item.id" class="border-t pt-4">
                <div class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      v-model="reviewForm.notes"
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Add notes about this decision..."
                    />
                  </div>

                  <div class="flex justify-end space-x-3">
                    <Button
                      variant="secondary"
                      @click="activeReview = null"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      @click="reviewContent(item.id, 'reject')"
                      :disabled="reviewing"
                    >
                      Reject
                    </Button>
                    <Button
                      @click="reviewContent(item.id, 'approve')"
                      :disabled="reviewing"
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </div>

              <!-- Review Actions -->
              <div v-else class="flex justify-end space-x-3 border-t pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  @click="navigateTo(`/content/${item.slug}`)"
                >
                  Preview
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  @click="startReview(item.id, 'reject')"
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  @click="startReview(item.id, 'approve')"
                >
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </Card>

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

            <span class="px-4 text-sm text-gray-700">
              Page {{ meta.page }} of {{ meta.totalPages }}
            </span>

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
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

const { user } = useUser()
const { hasPermission } = usePermissions()

// Check permission
if (!hasPermission('content.moderate')) {
  navigateTo('/dashboard')
}

const loading = ref(true)
const reviewing = ref(false)
const error = ref('')
const success = ref('')
const activeReview = ref<string | null>(null)

const queue = ref<any[]>([])
const meta = ref({
  page: 1,
  perPage: 10,
  total: 0,
  totalPages: 0
})

const stats = ref({
  approvedToday: 0,
  rejectedToday: 0,
  reviewedByMe: 0
})

const reviewForm = ref({
  notes: ''
})

async function fetchQueue() {
  try {
    loading.value = true
    error.value = ''

    const response = await $fetch('/api/content/moderation/queue', {
      params: {
        page: meta.value.page,
        perPage: meta.value.perPage
      }
    })

    queue.value = response.data
    meta.value = response.meta

    // TODO: Fetch stats from API
    // For now using placeholder values
    stats.value = {
      approvedToday: 0,
      rejectedToday: 0,
      reviewedByMe: 0
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load moderation queue'
  } finally {
    loading.value = false
  }
}

function startReview(contentId: string, action: string) {
  activeReview.value = contentId
  reviewForm.value.notes = ''
}

async function reviewContent(contentId: string, action: 'approve' | 'reject') {
  try {
    reviewing.value = true
    error.value = ''
    success.value = ''

    const response = await $fetch('/api/content/moderation/review', {
      method: 'POST',
      body: {
        contentId,
        action,
        notes: reviewForm.value.notes || undefined
      }
    })

    success.value = response.message

    // Update stats
    if (action === 'approve') {
      stats.value.approvedToday++
    } else {
      stats.value.rejectedToday++
    }
    stats.value.reviewedByMe++

    // Remove from queue
    queue.value = queue.value.filter(item => item.id !== contentId)
    meta.value.total--

    // Reset form
    activeReview.value = null
    reviewForm.value.notes = ''

    // Hide success message after 3 seconds
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (e: any) {
    error.value = e.data?.message || `Failed to ${action} content`
  } finally {
    reviewing.value = false
  }
}

function changePage(page: number) {
  meta.value.page = page
  fetchQueue()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function getUserName(user: any): string {
  if (user.artistProfile?.stageName) {
    return user.artistProfile.stageName
  }
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

function getUserInitials(user: any): string {
  if (user.artistProfile?.stageName) {
    return user.artistProfile.stageName.substring(0, 2).toUpperCase()
  }
  const first = user.firstName?.[0] || ''
  const last = user.lastName?.[0] || ''
  return (first + last).toUpperCase() || user.email.substring(0, 2).toUpperCase()
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (hours < 1) return 'Less than an hour ago'
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchQueue()
})
</script>
