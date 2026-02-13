<template>
  <div class="py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading profile...</p>
      </div>

      <!-- Profile Content -->
      <div v-else-if="profile">
        <!-- Header -->
        <div class="mb-8 flex items-center justify-between">
          <h1 class="text-3xl font-bold text-gray-900">My Profile</h1>
          <Button @click="navigateTo('/dashboard/profile/edit')">
            Edit Profile
          </Button>
        </div>

        <!-- Profile Header Card -->
        <Card class="mb-6">
          <div class="flex items-start space-x-6">
            <!-- Avatar -->
            <div class="relative flex-shrink-0">
              <div
                v-if="profile.avatar"
                class="w-32 h-32 rounded-full overflow-hidden bg-gray-200"
              >
                <img
                  :src="profile.avatar"
                  :alt="`${profile.firstName} ${profile.lastName}`"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="w-32 h-32 rounded-full bg-primary-600 flex items-center justify-center"
              >
                <span class="text-4xl font-bold text-white">
                  {{ getInitials(profile) }}
                </span>
              </div>
            </div>

            <!-- User Info -->
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h2 class="text-2xl font-bold text-gray-900">
                  {{ getDisplayName(profile) }}
                </h2>
                <Badge>{{ profile.userType }}</Badge>
                <Badge
                  v-if="profile.artistProfile?.isVerified"
                  variant="success"
                >
                  Verified
                </Badge>
              </div>

              <p class="text-gray-600 mb-2">{{ profile.email }}</p>

              <p v-if="profile.phoneNumber" class="text-gray-600 mb-4">
                📞 {{ profile.phoneNumber }}
              </p>

              <p v-if="profile.bio" class="text-gray-700">
                {{ profile.bio }}
              </p>
            </div>
          </div>
        </Card>

        <!-- Artist Profile -->
        <Card v-if="profile.userType === 'ARTIST' && profile.artistProfile" class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Artist Information</h3>

          <div class="space-y-4">
            <div v-if="profile.artistProfile.stageName">
              <p class="text-sm font-medium text-gray-500">Stage Name</p>
              <p class="text-gray-900">{{ profile.artistProfile.stageName }}</p>
            </div>

            <div v-if="profile.artistProfile.categories?.length">
              <p class="text-sm font-medium text-gray-500 mb-2">Categories</p>
              <div class="flex flex-wrap gap-2">
                <Badge
                  v-for="cat in profile.artistProfile.categories"
                  :key="cat"
                >
                  {{ cat.replace('_', ' ') }}
                </Badge>
              </div>
            </div>

            <div v-if="hasSocialLinks(profile.artistProfile)">
              <p class="text-sm font-medium text-gray-500 mb-2">Social Media</p>
              <div class="flex flex-wrap gap-3">
                <a
                  v-if="profile.artistProfile.instagramUrl"
                  :href="profile.artistProfile.instagramUrl"
                  target="_blank"
                  class="text-pink-600 hover:text-pink-700"
                >
                  Instagram
                </a>
                <a
                  v-if="profile.artistProfile.twitterUrl"
                  :href="profile.artistProfile.twitterUrl"
                  target="_blank"
                  class="text-blue-500 hover:text-blue-600"
                >
                  Twitter
                </a>
                <a
                  v-if="profile.artistProfile.facebookUrl"
                  :href="profile.artistProfile.facebookUrl"
                  target="_blank"
                  class="text-blue-600 hover:text-blue-700"
                >
                  Facebook
                </a>
                <a
                  v-if="profile.artistProfile.youtubeUrl"
                  :href="profile.artistProfile.youtubeUrl"
                  target="_blank"
                  class="text-red-600 hover:text-red-700"
                >
                  YouTube
                </a>
                <a
                  v-if="profile.artistProfile.websiteUrl"
                  :href="profile.artistProfile.websiteUrl"
                  target="_blank"
                  class="text-gray-600 hover:text-gray-700"
                >
                  Website
                </a>
              </div>
            </div>
          </div>
        </Card>

        <!-- Stakeholder Profile -->
        <Card v-if="profile.userType === 'STAKEHOLDER' && profile.stakeholderProfile" class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Organization Information</h3>

          <div class="space-y-4">
            <div v-if="profile.stakeholderProfile.organizationName">
              <p class="text-sm font-medium text-gray-500">Organization</p>
              <p class="text-gray-900">{{ profile.stakeholderProfile.organizationName }}</p>
            </div>

            <div v-if="profile.stakeholderProfile.position">
              <p class="text-sm font-medium text-gray-500">Position</p>
              <p class="text-gray-900">{{ profile.stakeholderProfile.position }}</p>
            </div>

            <div v-if="profile.stakeholderProfile.industry">
              <p class="text-sm font-medium text-gray-500">Industry</p>
              <p class="text-gray-900">{{ profile.stakeholderProfile.industry }}</p>
            </div>

            <div v-if="profile.stakeholderProfile.companyWebsite">
              <p class="text-sm font-medium text-gray-500">Website</p>
              <a
                :href="profile.stakeholderProfile.companyWebsite"
                target="_blank"
                class="text-primary-600 hover:text-primary-700"
              >
                {{ profile.stakeholderProfile.companyWebsite }}
              </a>
            </div>
          </div>
        </Card>

        <!-- Government Profile -->
        <Card v-if="profile.userType === 'GOVERNMENT' && profile.governmentProfile" class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Government Information</h3>

          <div class="space-y-4">
            <div v-if="profile.governmentProfile.department">
              <p class="text-sm font-medium text-gray-500">Department</p>
              <p class="text-gray-900">{{ profile.governmentProfile.department }}</p>
            </div>

            <div v-if="profile.governmentProfile.position">
              <p class="text-sm font-medium text-gray-500">Position</p>
              <p class="text-gray-900">{{ profile.governmentProfile.position }}</p>
            </div>

            <div v-if="profile.governmentProfile.officeLocation">
              <p class="text-sm font-medium text-gray-500">Office Location</p>
              <p class="text-gray-900">{{ profile.governmentProfile.officeLocation }}</p>
            </div>
          </div>
        </Card>

        <!-- Account Details -->
        <Card>
          <h3 class="text-xl font-semibold text-gray-900 mb-4">Account Details</h3>

          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium text-gray-500">Account Status</p>
              <Badge :variant="statusVariant(profile.status)">
                {{ profile.status }}
              </Badge>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-500">Email Verified</p>
              <p class="text-gray-900">
                {{ profile.emailVerified ? 'Yes ✓' : 'No' }}
              </p>
            </div>

            <div v-if="profile.lastLoginAt">
              <p class="text-sm font-medium text-gray-500">Last Login</p>
              <p class="text-gray-900">{{ formatDate(profile.lastLoginAt) }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-gray-500">Member Since</p>
              <p class="text-gray-900">{{ formatDate(profile.createdAt) }}</p>
            </div>
          </div>
        </Card>
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
const profile = ref<any>(null)

async function fetchProfile() {
  try {
    loading.value = true
    const response = await $fetch('/api/user/me')
    profile.value = response.data
  } catch (error) {
    console.error('Failed to fetch profile:', error)
  } finally {
    loading.value = false
  }
}

function getInitials(user: any): string {
  if (user.artistProfile?.stageName) {
    return user.artistProfile.stageName.substring(0, 2).toUpperCase()
  }
  const first = user.firstName?.[0] || ''
  const last = user.lastName?.[0] || ''
  return (first + last).toUpperCase() || 'U'
}

function getDisplayName(user: any): string {
  if (user.artistProfile?.stageName) {
    return user.artistProfile.stageName
  }
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

function hasSocialLinks(profile: any): boolean {
  return !!(
    profile.instagramUrl ||
    profile.twitterUrl ||
    profile.facebookUrl ||
    profile.youtubeUrl ||
    profile.websiteUrl
  )
}

function statusVariant(status: string): string {
  const variants: Record<string, string> = {
    ACTIVE: 'success',
    PENDING_VERIFICATION: 'warning',
    SUSPENDED: 'danger',
    BANNED: 'danger'
  }
  return variants[status] || 'secondary'
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
  fetchProfile()
})
</script>
