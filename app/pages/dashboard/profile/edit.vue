<template>
  <div class="py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <Button variant="secondary" size="sm" @click="navigateTo('/dashboard/profile')" class="mb-4">
          ← Back to Profile
        </Button>
        <h1 class="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p class="mt-2 text-gray-600">Update your personal information and preferences</p>
      </div>

      <Alert v-if="error" type="error" class="mb-6">{{ error }}</Alert>
      <Alert v-if="success" type="success" class="mb-6">{{ success }}</Alert>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading...</p>
      </div>

      <!-- Edit Form -->
      <form v-else @submit.prevent="saveProfile" class="space-y-6">
        <!-- Avatar Upload -->
        <Card>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Profile Photo</h2>

          <div class="flex items-center space-x-6">
            <div class="relative">
              <div
                v-if="form.avatar"
                class="w-24 h-24 rounded-full overflow-hidden bg-gray-200"
              >
                <img
                  :src="form.avatar"
                  alt="Avatar"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center"
              >
                <span class="text-3xl font-bold text-white">
                  {{ getInitials() }}
                </span>
              </div>
            </div>

            <div class="flex-1">
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleAvatarChange"
              />
              <Button
                type="button"
                variant="secondary"
                @click="$refs.avatarInput.click()"
                :disabled="uploadingAvatar"
              >
                {{ uploadingAvatar ? 'Uploading...' : 'Change Photo' }}
              </Button>
              <p class="mt-2 text-sm text-gray-500">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </Card>

        <!-- Basic Information -->
        <Card>
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                First Name <span class="text-red-500">*</span>
              </label>
              <Input v-model="form.firstName" type="text" required />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span class="text-red-500">*</span>
              </label>
              <Input v-model="form.lastName" type="text" required />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input v-model="form.email" type="email" disabled />
              <p class="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input v-model="form.phoneNumber" type="tel" />
            </div>
          </div>

          <div class="mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              v-model="form.bio"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Tell us about yourself..."
              maxlength="500"
            />
            <p class="mt-1 text-xs text-gray-500 text-right">
              {{ form.bio?.length || 0 }}/500 characters
            </p>
          </div>
        </Card>

        <!-- Artist Profile Fields -->
        <Card v-if="userType === 'ARTIST'">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Artist Information</h2>

          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Stage Name
              </label>
              <Input v-model="form.artistProfile.stageName" type="text" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label
                  v-for="category in categories"
                  :key="category.value"
                  class="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    v-model="form.artistProfile.categories"
                    type="checkbox"
                    :value="category.value"
                    class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span class="text-sm text-gray-700">{{ category.label }}</span>
                </label>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Instagram URL
                </label>
                <Input v-model="form.artistProfile.instagramUrl" type="url" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Twitter URL
                </label>
                <Input v-model="form.artistProfile.twitterUrl" type="url" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Facebook URL
                </label>
                <Input v-model="form.artistProfile.facebookUrl" type="url" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL
                </label>
                <Input v-model="form.artistProfile.youtubeUrl" type="url" />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <Input v-model="form.artistProfile.websiteUrl" type="url" />
              </div>
            </div>
          </div>
        </Card>

        <!-- Stakeholder Profile Fields -->
        <Card v-if="userType === 'STAKEHOLDER'">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Organization Information</h2>

          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <Input v-model="form.stakeholderProfile.organizationName" type="text" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Position/Title
                </label>
                <Input v-model="form.stakeholderProfile.position" type="text" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <Input v-model="form.stakeholderProfile.industry" type="text" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Company Website
              </label>
              <Input v-model="form.stakeholderProfile.companyWebsite" type="url" />
            </div>
          </div>
        </Card>

        <!-- Government Profile Fields -->
        <Card v-if="userType === 'GOVERNMENT'">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Government Information</h2>

          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Department/Ministry
              </label>
              <Input v-model="form.governmentProfile.department" type="text" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Position/Title
                </label>
                <Input v-model="form.governmentProfile.position" type="text" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Office Location
                </label>
                <Input v-model="form.governmentProfile.officeLocation" type="text" />
              </div>
            </div>
          </div>
        </Card>

        <!-- Submit Buttons -->
        <div class="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            @click="navigateTo('/dashboard/profile')"
          >
            Cancel
          </Button>
          <Button type="submit" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'verified'],
  layout: 'dashboard'
})

const loading = ref(true)
const saving = ref(false)
const uploadingAvatar = ref(false)
const error = ref('')
const success = ref('')
const userType = ref('')
const avatarInput = ref<HTMLInputElement>()

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

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  bio: '',
  avatar: '',
  artistProfile: {
    stageName: '',
    categories: [] as string[],
    instagramUrl: '',
    twitterUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    websiteUrl: ''
  },
  stakeholderProfile: {
    organizationName: '',
    position: '',
    industry: '',
    companyWebsite: ''
  },
  governmentProfile: {
    department: '',
    position: '',
    officeLocation: ''
  }
})

async function fetchProfile() {
  try {
    loading.value = true
    const response = await $fetch('/api/user/me')
    const user = response.data

    userType.value = user.userType

    // Populate form
    form.value.firstName = user.firstName || ''
    form.value.lastName = user.lastName || ''
    form.value.email = user.email || ''
    form.value.phoneNumber = user.phoneNumber || ''
    form.value.bio = user.bio || ''
    form.value.avatar = user.avatar || ''

    if (user.artistProfile) {
      form.value.artistProfile = {
        stageName: user.artistProfile.stageName || '',
        categories: user.artistProfile.categories || [],
        instagramUrl: user.artistProfile.instagramUrl || '',
        twitterUrl: user.artistProfile.twitterUrl || '',
        facebookUrl: user.artistProfile.facebookUrl || '',
        youtubeUrl: user.artistProfile.youtubeUrl || '',
        websiteUrl: user.artistProfile.websiteUrl || ''
      }
    }

    if (user.stakeholderProfile) {
      form.value.stakeholderProfile = {
        organizationName: user.stakeholderProfile.organizationName || '',
        position: user.stakeholderProfile.position || '',
        industry: user.stakeholderProfile.industry || '',
        companyWebsite: user.stakeholderProfile.companyWebsite || ''
      }
    }

    if (user.governmentProfile) {
      form.value.governmentProfile = {
        department: user.governmentProfile.department || '',
        position: user.governmentProfile.position || '',
        officeLocation: user.governmentProfile.officeLocation || ''
      }
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

async function handleAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files || !target.files[0]) return

  const file = target.files[0]

  try {
    uploadingAvatar.value = true
    error.value = ''

    const formData = new FormData()
    formData.append('avatar', file)

    const response = await $fetch('/api/user/avatar', {
      method: 'POST',
      body: formData
    })

    form.value.avatar = response.data.avatar
    success.value = 'Avatar uploaded successfully'

    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to upload avatar'
  } finally {
    uploadingAvatar.value = false
  }
}

async function saveProfile() {
  try {
    saving.value = true
    error.value = ''
    success.value = ''

    const payload: any = {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      phoneNumber: form.value.phoneNumber || undefined,
      bio: form.value.bio || undefined
    }

    if (userType.value === 'ARTIST') {
      payload.artistProfile = form.value.artistProfile
    } else if (userType.value === 'STAKEHOLDER') {
      payload.stakeholderProfile = form.value.stakeholderProfile
    } else if (userType.value === 'GOVERNMENT') {
      payload.governmentProfile = form.value.governmentProfile
    }

    await $fetch('/api/user/profile', {
      method: 'PUT',
      body: payload
    })

    success.value = 'Profile updated successfully'

    setTimeout(() => {
      navigateTo('/dashboard/profile')
    }, 1500)
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to update profile'
  } finally {
    saving.value = false
  }
}

function getInitials(): string {
  const first = form.value.firstName?.[0] || ''
  const last = form.value.lastName?.[0] || ''
  return (first + last).toUpperCase() || 'U'
}

onMounted(() => {
  fetchProfile()
})
</script>
