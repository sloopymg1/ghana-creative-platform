<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'verified', 'admin'],
})

const route = useRoute()
const router = useRouter()
const { fullName } = useUser()
const { logout } = useAuth()

const userId = route.params.id as string

// Fetch user data
const { data: userData, refresh: refreshUser, pending: loadingUser } = await useFetch(`/api/users/${userId}`)
const user = computed(() => userData.value?.data)

// Fetch all roles
const { data: rolesData } = await useFetch('/api/roles')
const allRoles = computed(() => rolesData.value?.data || [])

// State
const editMode = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const selectedRoleIds = ref<string[]>([])

// Form data
const form = reactive({
  firstName: '',
  lastName: '',
  phoneNumber: '',
  bio: '',
  status: '',
})

// Initialize form when user data loads
watch(user, (newUser) => {
  if (newUser) {
    form.firstName = newUser.firstName
    form.lastName = newUser.lastName
    form.phoneNumber = newUser.phoneNumber || ''
    form.bio = newUser.bio || ''
    form.status = newUser.status
    selectedRoleIds.value = newUser.roles.map((ur: any) => ur.role.id)
  }
}, { immediate: true })

// Status options
const statusOptions = [
  { value: 'ACTIVE', label: 'Active', color: 'text-green-600' },
  { value: 'PENDING_VERIFICATION', label: 'Pending Verification', color: 'text-yellow-600' },
  { value: 'SUSPENDED', label: 'Suspended', color: 'text-orange-600' },
  { value: 'BANNED', label: 'Banned', color: 'text-red-600' },
  { value: 'INACTIVE', label: 'Inactive', color: 'text-gray-600' },
]

// Save changes
async function saveChanges() {
  error.value = ''
  success.value = ''
  saving.value = true

  try {
    // Update user info
    await $fetch(`/api/users/${userId}`, {
      method: 'PUT',
      body: {
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        bio: form.bio,
        status: form.status,
      },
    })

    // Update roles
    await $fetch(`/api/users/${userId}/roles`, {
      method: 'PUT',
      body: {
        roleIds: selectedRoleIds.value,
      },
    })

    success.value = 'User updated successfully!'
    editMode.value = false
    await refreshUser()
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to update user'
  } finally {
    saving.value = false
  }
}

function cancelEdit() {
  if (user.value) {
    form.firstName = user.value.firstName
    form.lastName = user.value.lastName
    form.phoneNumber = user.value.phoneNumber || ''
    form.bio = user.value.bio || ''
    form.status = user.value.status
    selectedRoleIds.value = user.value.roles.map((ur: any) => ur.role.id)
  }
  editMode.value = false
  error.value = ''
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Admin Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">User Details</h1>
            <p class="text-sm text-gray-600">Ghana Creative Arts Board</p>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ fullName }}</span>
            <Button variant="ghost" size="sm" @click="logout">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>

    <!-- Admin Navigation -->
    <nav class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-8">
          <NuxtLink
            to="/admin"
            class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Dashboard
          </NuxtLink>
          <NuxtLink
            to="/admin/users"
            class="border-b-2 border-primary-500 py-4 px-1 text-sm font-medium text-primary-600"
          >
            Users
          </NuxtLink>
          <NuxtLink
            to="/admin/roles"
            class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Roles
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back Button -->
      <div class="mb-6">
        <Button variant="ghost" @click="router.push('/admin/users')">
          <svg class="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Users
        </Button>
      </div>

      <!-- Loading State -->
      <div v-if="loadingUser" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading user...</p>
      </div>

      <!-- User Details -->
      <div v-else-if="user" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column - User Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Alerts -->
          <Alert v-if="success" type="success" dismissible @dismiss="success = ''">
            {{ success }}
          </Alert>

          <Alert v-if="error" type="error" dismissible @dismiss="error = ''">
            {{ error }}
          </Alert>

          <!-- Basic Info Card -->
          <Card>
            <div class="flex justify-between items-start mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Basic Information</h3>
              <div class="flex space-x-2">
                <Button v-if="!editMode" variant="primary" size="sm" @click="editMode = true">
                  Edit
                </Button>
                <template v-else>
                  <Button variant="primary" size="sm" :loading="saving" @click="saveChanges">
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" @click="cancelEdit">
                    Cancel
                  </Button>
                </template>
              </div>
            </div>

            <div class="space-y-4">
              <!-- Profile Picture -->
              <div class="flex items-center space-x-4">
                <div class="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                  <span class="text-3xl font-semibold text-primary-600">
                    {{ user.firstName[0] }}{{ user.lastName[0] }}
                  </span>
                </div>
                <div v-if="!editMode">
                  <h4 class="text-xl font-semibold text-gray-900">
                    {{ user.firstName }} {{ user.lastName }}
                  </h4>
                  <p class="text-gray-600">{{ user.email }}</p>
                </div>
              </div>

              <!-- Edit Form -->
              <div v-if="editMode" class="grid grid-cols-2 gap-4">
                <Input v-model="form.firstName" label="First Name" required />
                <Input v-model="form.lastName" label="Last Name" required />
                <div class="col-span-2">
                  <Input v-model="form.phoneNumber" label="Phone Number" />
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    v-model="form.bio"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  ></textarea>
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    v-model="form.status"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option v-for="status in statusOptions" :key="status.value" :value="status.value">
                      {{ status.label }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- View Mode -->
              <div v-else class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Email</p>
                  <p class="font-medium">{{ user.email }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Phone</p>
                  <p class="font-medium">{{ user.phoneNumber || 'Not provided' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">User Type</p>
                  <p class="font-medium">{{ user.userType }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Status</p>
                  <p class="font-medium" :class="statusOptions.find(s => s.value === user.status)?.color">
                    {{ user.status.replace('_', ' ') }}
                  </p>
                </div>
                <div v-if="user.bio" class="col-span-2">
                  <p class="text-sm text-gray-600">Bio</p>
                  <p class="font-medium">{{ user.bio }}</p>
                </div>
              </div>
            </div>
          </Card>

          <!-- Roles Card -->
          <Card>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Roles & Permissions</h3>

            <!-- Edit Mode - Role Selection -->
            <div v-if="editMode" class="space-y-3">
              <p class="text-sm text-gray-600 mb-4">Select roles to assign to this user:</p>
              <label
                v-for="role in allRoles"
                :key="role.id"
                class="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                :class="selectedRoleIds.includes(role.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-200'"
              >
                <input
                  v-model="selectedRoleIds"
                  type="checkbox"
                  :value="role.id"
                  class="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div class="ml-3 flex-1">
                  <p class="font-medium text-gray-900">{{ role.displayName }}</p>
                  <p class="text-sm text-gray-600">{{ role.description }}</p>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ role.permissions.length }} permissions • {{ role._count.users }} users
                  </p>
                </div>
              </label>
            </div>

            <!-- View Mode - Assigned Roles -->
            <div v-else>
              <div v-if="user.roles.length > 0" class="space-y-3">
                <div
                  v-for="ur in user.roles"
                  :key="ur.role.id"
                  class="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-medium text-gray-900">{{ ur.role.displayName }}</h4>
                      <p class="text-sm text-gray-600">{{ ur.role.description }}</p>
                    </div>
                    <span v-if="ur.role.isSystem" class="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                      System
                    </span>
                  </div>
                  <div class="mt-2">
                    <p class="text-xs text-gray-500">
                      Assigned {{ new Date(ur.assignedAt).toLocaleDateString() }}
                    </p>
                  </div>
                </div>
              </div>
              <p v-else class="text-gray-500 text-center py-4">No roles assigned</p>
            </div>
          </Card>

          <!-- Profile Data Card (Type-specific) -->
          <Card v-if="user.artistProfile || user.stakeholderProfile || user.governmentProfile">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Profile Data</h3>

            <!-- Artist Profile -->
            <div v-if="user.artistProfile" class="space-y-3">
              <div v-if="user.artistProfile.stageName">
                <p class="text-sm text-gray-600">Stage Name</p>
                <p class="font-medium">{{ user.artistProfile.stageName }}</p>
              </div>
              <div v-if="user.artistProfile.categories.length > 0">
                <p class="text-sm text-gray-600">Categories</p>
                <div class="flex flex-wrap gap-2 mt-1">
                  <span
                    v-for="cat in user.artistProfile.categories"
                    :key="cat"
                    class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded"
                  >
                    {{ cat.replace('_', ' ') }}
                  </span>
                </div>
              </div>
              <div v-if="user.artistProfile.yearsActive">
                <p class="text-sm text-gray-600">Years Active</p>
                <p class="font-medium">{{ user.artistProfile.yearsActive }} years</p>
              </div>
            </div>

            <!-- Stakeholder Profile -->
            <div v-if="user.stakeholderProfile" class="space-y-3">
              <div v-if="user.stakeholderProfile.organizationName">
                <p class="text-sm text-gray-600">Organization</p>
                <p class="font-medium">{{ user.stakeholderProfile.organizationName }}</p>
              </div>
              <div v-if="user.stakeholderProfile.position">
                <p class="text-sm text-gray-600">Position</p>
                <p class="font-medium">{{ user.stakeholderProfile.position }}</p>
              </div>
            </div>

            <!-- Government Profile -->
            <div v-if="user.governmentProfile" class="space-y-3">
              <div v-if="user.governmentProfile.department">
                <p class="text-sm text-gray-600">Department</p>
                <p class="font-medium">{{ user.governmentProfile.department }}</p>
              </div>
              <div v-if="user.governmentProfile.ministry">
                <p class="text-sm text-gray-600">Ministry</p>
                <p class="font-medium">{{ user.governmentProfile.ministry }}</p>
              </div>
            </div>
          </Card>
        </div>

        <!-- Right Column - Stats & Activity -->
        <div class="space-y-6">
          <!-- Stats Card -->
          <Card>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            <div class="space-y-4">
              <div>
                <p class="text-sm text-gray-600">Login Count</p>
                <p class="text-2xl font-bold text-gray-900">{{ user.loginCount }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Content Count</p>
                <p class="text-2xl font-bold text-gray-900">{{ user._count.content }}</p>
              </div>
              <div v-if="user.lastLoginAt">
                <p class="text-sm text-gray-600">Last Login</p>
                <p class="font-medium text-gray-900">{{ formatDate(user.lastLoginAt) }}</p>
              </div>
            </div>
          </Card>

          <!-- Account Info Card -->
          <Card>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Account Info</h3>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-600">Created</p>
                <p class="font-medium">{{ formatDate(user.createdAt) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Last Updated</p>
                <p class="font-medium">{{ formatDate(user.updatedAt) }}</p>
              </div>
              <div v-if="user.emailVerified">
                <p class="text-sm text-gray-600">Email Verified</p>
                <p class="font-medium text-green-600">
                  ✓ {{ formatDate(user.emailVerified) }}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Error State -->
      <div v-else>
        <Card>
          <div class="text-center py-12">
            <p class="text-red-600">User not found or you don't have permission to view this user.</p>
            <Button variant="primary" class="mt-4" @click="router.push('/admin/users')">
              Back to Users
            </Button>
          </div>
        </Card>
      </div>
    </main>
  </div>
</template>
