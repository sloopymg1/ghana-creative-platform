<template>
  <div class="py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading content...</p>
      </div>

      <!-- Content Not Found -->
      <div v-else-if="!content" class="text-center py-12">
        <h2 class="text-2xl font-bold text-gray-900">Content Not Found</h2>
        <p class="mt-2 text-gray-600">The content you're looking for doesn't exist.</p>
        <Button class="mt-6" @click="navigateTo('/dashboard/content')">
          Back to My Content
        </Button>
      </div>

      <!-- Content Detail -->
      <div v-else>
        <!-- Header -->
        <div class="mb-6 flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <Button
                variant="secondary"
                size="sm"
                @click="navigateTo('/dashboard/content')"
              >
                ← Back
              </Button>
              <Badge :variant="statusVariant(content.status)">
                {{ statusLabel(content.status) }}
              </Badge>
            </div>
            <h1 class="text-3xl font-bold text-gray-900">{{ content.title }}</h1>
          </div>

          <div class="flex items-center space-x-2">
            <Button
              v-if="!editMode"
              variant="secondary"
              @click="editMode = true"
            >
              Edit
            </Button>
            <Button
              v-if="content.status === 'DRAFT'"
              @click="publishContent"
              :disabled="publishing"
            >
              {{ publishing ? 'Publishing...' : 'Publish' }}
            </Button>
            <Button
              variant="danger"
              @click="deleteContent"
              :disabled="deleting"
            >
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </Button>
          </div>
        </div>

        <Alert v-if="error" type="error" class="mb-6">{{ error }}</Alert>
        <Alert v-if="success" type="success" class="mb-6">{{ success }}</Alert>

        <!-- Edit Form -->
        <Card v-if="editMode" class="mb-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Edit Content</h2>

          <form @submit.prevent="saveContent" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Title <span class="text-red-500">*</span>
              </label>
              <Input v-model="editForm.title" type="text" required />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                v-model="editForm.description"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Categories <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label
                  v-for="category in categories"
                  :key="category.value"
                  class="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    v-model="editForm.categories"
                    type="checkbox"
                    :value="category.value"
                    class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span class="text-sm text-gray-700">{{ category.label }}</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <Input
                v-model="tagsInput"
                type="text"
                placeholder="e.g., highlife, traditional, modern"
              />
              <p class="mt-1 text-sm text-gray-500">Maximum 10 tags</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                License Type
              </label>
              <select
                v-model="editForm.licenseType"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select license</option>
                <option value="ALL_RIGHTS_RESERVED">All Rights Reserved</option>
                <option value="CC_BY">Creative Commons Attribution</option>
                <option value="CC_BY_SA">Creative Commons Attribution-ShareAlike</option>
                <option value="CC_BY_NC">Creative Commons Attribution-NonCommercial</option>
              </select>
            </div>

            <div class="flex justify-end space-x-3">
              <Button type="button" variant="secondary" @click="cancelEdit">
                Cancel
              </Button>
              <Button type="submit" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </Button>
            </div>
          </form>
        </Card>

        <!-- Content Preview -->
        <div v-else class="space-y-6">
          <!-- Media Preview -->
          <Card>
            <div class="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <img
                v-if="content.type === 'IMAGE' && content.fileUrl"
                :src="content.fileUrl"
                :alt="content.title"
                class="w-full h-full object-contain"
              />
              <video
                v-else-if="content.type === 'VIDEO' && content.fileUrl"
                :src="content.fileUrl"
                controls
                class="w-full h-full"
              />
              <audio
                v-else-if="content.type === 'AUDIO' && content.fileUrl"
                :src="content.fileUrl"
                controls
                class="w-full"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <div class="text-center">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p class="mt-2 text-sm text-gray-500">{{ content.type }} File</p>
                  <a
                    v-if="content.fileUrl"
                    :href="content.fileUrl"
                    target="_blank"
                    class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Download File
                  </a>
                </div>
              </div>
            </div>
          </Card>

          <!-- Content Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card class="md:col-span-2">
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Details</h2>

              <div class="space-y-4">
                <div v-if="content.description">
                  <p class="text-sm font-medium text-gray-500">Description</p>
                  <p class="mt-1 text-gray-900">{{ content.description }}</p>
                </div>

                <div>
                  <p class="text-sm font-medium text-gray-500">Type</p>
                  <Badge class="mt-1">{{ content.type }}</Badge>
                </div>

                <div>
                  <p class="text-sm font-medium text-gray-500">Categories</p>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <Badge v-for="cat in content.categories" :key="cat">
                      {{ categories.find(c => c.value === cat)?.label }}
                    </Badge>
                  </div>
                </div>

                <div v-if="content.tags && content.tags.length">
                  <p class="text-sm font-medium text-gray-500">Tags</p>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <Badge v-for="tag in content.tags" :key="tag" variant="secondary">
                      {{ tag }}
                    </Badge>
                  </div>
                </div>

                <div v-if="content.licenseType">
                  <p class="text-sm font-medium text-gray-500">License</p>
                  <p class="mt-1 text-gray-900">{{ content.licenseType.replace(/_/g, ' ') }}</p>
                </div>

                <div v-if="content.moderationNotes">
                  <p class="text-sm font-medium text-gray-500">Moderation Notes</p>
                  <Alert type="warning" class="mt-1">
                    {{ content.moderationNotes }}
                  </Alert>
                </div>
              </div>
            </Card>

            <!-- Stats & Info -->
            <Card>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Statistics</h2>

              <div class="space-y-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Views</p>
                  <p class="text-2xl font-bold text-gray-900">{{ content.viewCount }}</p>
                </div>

                <div v-if="content.fileSize">
                  <p class="text-sm font-medium text-gray-500">File Size</p>
                  <p class="text-gray-900">{{ formatFileSize(content.fileSize) }}</p>
                </div>

                <div v-if="content.duration">
                  <p class="text-sm font-medium text-gray-500">Duration</p>
                  <p class="text-gray-900">{{ formatDuration(content.duration) }}</p>
                </div>

                <div>
                  <p class="text-sm font-medium text-gray-500">Created</p>
                  <p class="text-gray-900">{{ formatDate(content.createdAt) }}</p>
                </div>

                <div v-if="content.publishedAt">
                  <p class="text-sm font-medium text-gray-500">Published</p>
                  <p class="text-gray-900">{{ formatDate(content.publishedAt) }}</p>
                </div>

                <div>
                  <p class="text-sm font-medium text-gray-500">Last Updated</p>
                  <p class="text-gray-900">{{ formatDate(content.updatedAt) }}</p>
                </div>

                <div v-if="content.status === 'PUBLISHED'">
                  <p class="text-sm font-medium text-gray-500">Public URL</p>
                  <a
                    :href="`/content/${content.slug}`"
                    target="_blank"
                    class="text-primary-600 hover:text-primary-700 text-sm font-medium break-all"
                  >
                    /content/{{ content.slug }}
                  </a>
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
definePageMeta({
  middleware: ['auth', 'verified'],
  layout: 'dashboard'
})

const route = useRoute()
const contentId = route.params.id as string

const loading = ref(true)
const editMode = ref(false)
const saving = ref(false)
const publishing = ref(false)
const deleting = ref(false)
const error = ref('')
const success = ref('')

const content = ref<any>(null)
const editForm = ref({
  title: '',
  description: '',
  categories: [] as string[],
  tags: [] as string[],
  licenseType: ''
})
const tagsInput = ref('')

const categories = [
  { value: 'MUSIC', label: 'Music' },
  { value: 'VISUAL_ARTS', label: 'Visual Arts' },
  { value: 'DANCE', label: 'Dance' },
  { value: 'THEATER', label: 'Theater' },
  { value: 'FILM', label: 'Film' },
  { value: 'LITERATURE', label: 'Literature' },
  { value: 'CRAFTS', label: 'Crafts' },
  { value: 'DIGITAL_ARTS', label: 'Digital Arts' },
  { value: 'FASHION', label: 'Fashion' },
  { value: 'CULINARY_ARTS', label: 'Culinary Arts' },
  { value: 'OTHER', label: 'Other' }
]

async function fetchContent() {
  try {
    loading.value = true
    const response = await $fetch(`/api/content/${contentId}`)
    content.value = response.data

    // Initialize edit form
    editForm.value = {
      title: content.value.title,
      description: content.value.description || '',
      categories: [...content.value.categories],
      tags: [...(content.value.tags || [])],
      licenseType: content.value.licenseType || ''
    }
    tagsInput.value = content.value.tags?.join(', ') || ''
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load content'
  } finally {
    loading.value = false
  }
}

function cancelEdit() {
  editMode.value = false
  // Reset form
  editForm.value = {
    title: content.value.title,
    description: content.value.description || '',
    categories: [...content.value.categories],
    tags: [...(content.value.tags || [])],
    licenseType: content.value.licenseType || ''
  }
  tagsInput.value = content.value.tags?.join(', ') || ''
  error.value = ''
  success.value = ''
}

async function saveContent() {
  try {
    saving.value = true
    error.value = ''
    success.value = ''

    // Process tags
    editForm.value.tags = tagsInput.value
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .slice(0, 10)

    const response = await $fetch(`/api/content/${contentId}`, {
      method: 'PUT',
      body: editForm.value
    })

    content.value = response.data
    editMode.value = false
    success.value = 'Content updated successfully'

    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to update content'
  } finally {
    saving.value = false
  }
}

async function publishContent() {
  if (!confirm('Are you sure you want to publish this content?')) return

  try {
    publishing.value = true
    error.value = ''
    success.value = ''

    const response = await $fetch(`/api/content/${contentId}/publish`, {
      method: 'POST'
    })

    content.value.status = response.data.status
    content.value.publishedAt = response.data.publishedAt
    success.value = response.message
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to publish content'
  } finally {
    publishing.value = false
  }
}

async function deleteContent() {
  if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) return

  try {
    deleting.value = true
    error.value = ''

    await $fetch(`/api/content/${contentId}`, {
      method: 'DELETE'
    })

    success.value = 'Content deleted successfully'

    setTimeout(() => {
      navigateTo('/dashboard/content')
    }, 1500)
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to delete content'
  } finally {
    deleting.value = false
  }
}

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
    PENDING_REVIEW: 'Pending Review',
    PUBLISHED: 'Published',
    REJECTED: 'Rejected'
  }
  return labels[status] || status
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchContent()
})
</script>
