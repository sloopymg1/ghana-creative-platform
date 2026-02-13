<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Upload Content</h1>
      <p class="mt-2 text-gray-600">Share your creative work with the community</p>
    </div>

    <!-- Progress Steps -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div v-for="(stepItem, index) in steps" :key="index" class="flex items-center flex-1">
          <div class="flex flex-col items-center flex-1">
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center border-2',
                step > index
                  ? 'bg-green-600 border-green-600 text-white'
                  : step === index
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
              ]"
            >
              <span v-if="step > index">✓</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span class="mt-2 text-sm font-medium text-gray-900">{{ stepItem }}</span>
          </div>
          <div
            v-if="index < steps.length - 1"
            :class="[
              'flex-1 h-1 mx-4',
              step > index ? 'bg-green-600' : 'bg-gray-300'
            ]"
          />
        </div>
      </div>
    </div>

    <Alert v-if="error" type="error" class="mb-6">{{ error }}</Alert>
    <Alert v-if="success" type="success" class="mb-6">{{ success }}</Alert>

    <Card>
      <!-- Step 1: Content Details -->
      <form v-if="step === 0" @submit.prevent="nextStep">
        <div class="space-y-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
              Title <span class="text-red-500">*</span>
            </label>
            <Input
              id="title"
              v-model="form.title"
              type="text"
              placeholder="Enter content title"
              required
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe your content"
            />
          </div>

          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
              Content Type <span class="text-red-500">*</span>
            </label>
            <select
              id="type"
              v-model="form.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select type</option>
              <option value="AUDIO">Audio</option>
              <option value="VIDEO">Video</option>
              <option value="IMAGE">Image</option>
              <option value="DOCUMENT">Document</option>
            </select>
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
                  v-model="form.categories"
                  type="checkbox"
                  :value="category.value"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span class="text-sm text-gray-700">{{ category.label }}</span>
              </label>
            </div>
          </div>

          <div>
            <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <Input
              id="tags"
              v-model="tagsInput"
              type="text"
              placeholder="e.g., highlife, traditional, modern"
            />
            <p class="mt-1 text-sm text-gray-500">Maximum 10 tags</p>
          </div>

          <div>
            <label for="licenseType" class="block text-sm font-medium text-gray-700 mb-2">
              License Type
            </label>
            <select
              id="licenseType"
              v-model="form.licenseType"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select license</option>
              <option value="ALL_RIGHTS_RESERVED">All Rights Reserved</option>
              <option value="CC_BY">Creative Commons Attribution</option>
              <option value="CC_BY_SA">Creative Commons Attribution-ShareAlike</option>
              <option value="CC_BY_NC">Creative Commons Attribution-NonCommercial</option>
            </select>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <Button type="submit" :disabled="!canProceedToUpload">
            Next: Upload File
          </Button>
        </div>
      </form>

      <!-- Step 2: File Upload -->
      <div v-if="step === 1">
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Upload File <span class="text-red-500">*</span>
            </label>
            <div
              @drop.prevent="handleDrop"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              :class="[
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                isDragging
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              ]"
              @click="$refs.fileInput.click()"
            >
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                :accept="acceptedFileTypes"
                @change="handleFileSelect"
              />
              <div v-if="!file">
                <svg
                  class="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p class="mt-2 text-sm text-gray-600">
                  <span class="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p class="text-xs text-gray-500 mt-1">{{ fileTypesText }}</p>
              </div>
              <div v-else class="space-y-2">
                <svg
                  class="mx-auto h-12 w-12 text-green-500"
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
                <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
                <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                <Button type="button" variant="secondary" size="sm" @click.stop="removeFile">
                  Remove
                </Button>
              </div>
            </div>
          </div>

          <!-- Upload Progress -->
          <div v-if="uploadProgress > 0 && uploadProgress < 100">
            <div class="mb-2 flex justify-between text-sm">
              <span class="font-medium text-gray-700">Uploading...</span>
              <span class="text-gray-500">{{ uploadProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${uploadProgress}%` }"
              />
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-between">
          <Button type="button" variant="secondary" @click="prevStep">
            Back
          </Button>
          <Button type="button" @click="uploadFile" :disabled="!file || uploading">
            {{ uploading ? 'Uploading...' : 'Next: Review' }}
          </Button>
        </div>
      </div>

      <!-- Step 3: Review & Publish -->
      <div v-if="step === 2">
        <div class="space-y-6">
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Review Your Content</h3>

            <div class="space-y-4">
              <div>
                <p class="text-sm font-medium text-gray-500">Title</p>
                <p class="text-base text-gray-900">{{ form.title }}</p>
              </div>

              <div v-if="form.description">
                <p class="text-sm font-medium text-gray-500">Description</p>
                <p class="text-base text-gray-900">{{ form.description }}</p>
              </div>

              <div>
                <p class="text-sm font-medium text-gray-500">Type</p>
                <Badge>{{ form.type }}</Badge>
              </div>

              <div>
                <p class="text-sm font-medium text-gray-500">Categories</p>
                <div class="flex flex-wrap gap-2 mt-1">
                  <Badge v-for="cat in form.categories" :key="cat">
                    {{ categories.find(c => c.value === cat)?.label }}
                  </Badge>
                </div>
              </div>

              <div v-if="form.tags.length">
                <p class="text-sm font-medium text-gray-500">Tags</p>
                <div class="flex flex-wrap gap-2 mt-1">
                  <Badge v-for="tag in form.tags" :key="tag" variant="secondary">
                    {{ tag }}
                  </Badge>
                </div>
              </div>

              <div v-if="file">
                <p class="text-sm font-medium text-gray-500">File</p>
                <p class="text-base text-gray-900">{{ file.name }} ({{ formatFileSize(file.size) }})</p>
              </div>
            </div>
          </div>

          <Alert type="info">
            {{ canPublishDirectly
              ? 'Your content will be published immediately.'
              : 'Your content will be submitted for moderation before being published.'
            }}
          </Alert>
        </div>

        <div class="mt-6 flex justify-between">
          <Button type="button" variant="secondary" @click="prevStep">
            Back
          </Button>
          <Button type="button" @click="publish" :disabled="publishing">
            {{ publishing ? 'Publishing...' : 'Publish Content' }}
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'verified'],
  layout: 'dashboard'
})

const { user } = useUser()
const { hasPermission } = usePermissions()

const steps = ['Details', 'Upload', 'Review']
const step = ref(0)
const error = ref('')
const success = ref('')
const isDragging = ref(false)
const uploading = ref(false)
const publishing = ref(false)
const uploadProgress = ref(0)

const form = ref({
  title: '',
  description: '',
  type: '',
  categories: [] as string[],
  tags: [] as string[],
  licenseType: ''
})

const tagsInput = ref('')
const file = ref<File | null>(null)
const contentId = ref('')
const fileInput = ref<HTMLInputElement>()

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

const acceptedFileTypes = computed(() => {
  const typeMap: Record<string, string> = {
    AUDIO: 'audio/*',
    VIDEO: 'video/*',
    IMAGE: 'image/*',
    DOCUMENT: '.pdf,.doc,.docx'
  }
  return form.value.type ? typeMap[form.value.type] : '*'
})

const fileTypesText = computed(() => {
  const typeMap: Record<string, string> = {
    AUDIO: 'MP3, WAV, OGG (max 50MB)',
    VIDEO: 'MP4, AVI, MOV (max 500MB)',
    IMAGE: 'JPG, PNG, GIF (max 10MB)',
    DOCUMENT: 'PDF, DOC, DOCX (max 20MB)'
  }
  return form.value.type ? typeMap[form.value.type] : 'Select content type first'
})

const canProceedToUpload = computed(() => {
  return form.value.title && form.value.type && form.value.categories.length > 0
})

const canPublishDirectly = computed(() => {
  return hasPermission('content.publish')
})

function nextStep() {
  if (step.value === 0 && canProceedToUpload.value) {
    // Process tags
    if (tagsInput.value) {
      form.value.tags = tagsInput.value
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .slice(0, 10)
    }
    step.value++
  }
}

function prevStep() {
  if (step.value > 0) {
    step.value--
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    file.value = target.files[0]
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    file.value = event.dataTransfer.files[0]
  }
}

function removeFile() {
  file.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

async function uploadFile() {
  if (!file.value) return

  try {
    uploading.value = true
    uploadProgress.value = 0
    error.value = ''

    // Create content first
    const contentResponse = await $fetch('/api/content', {
      method: 'POST',
      body: {
        title: form.value.title,
        description: form.value.description,
        type: form.value.type,
        categories: form.value.categories,
        tags: form.value.tags,
        licenseType: form.value.licenseType || undefined
      }
    })

    contentId.value = contentResponse.data.id

    // Upload file
    const formData = new FormData()
    formData.append('file', file.value)
    formData.append('contentId', contentId.value)

    await $fetch('/api/content/upload', {
      method: 'POST',
      body: formData,
      onUploadProgress: (event) => {
        if (event.total) {
          uploadProgress.value = Math.round((event.loaded / event.total) * 100)
        }
      }
    })

    uploadProgress.value = 100
    step.value++
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to upload file'
  } finally {
    uploading.value = false
  }
}

async function publish() {
  if (!contentId.value) return

  try {
    publishing.value = true
    error.value = ''

    const response = await $fetch(`/api/content/${contentId.value}/publish`, {
      method: 'POST'
    })

    success.value = response.message

    // Redirect after 2 seconds
    setTimeout(() => {
      navigateTo('/dashboard/content')
    }, 2000)
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to publish content'
  } finally {
    publishing.value = false
  }
}
</script>
