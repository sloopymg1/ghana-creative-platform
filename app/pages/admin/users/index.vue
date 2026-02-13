<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'verified', 'admin'],
})

const { fullName } = useUser()
const { logout } = useAuth()

// Fetch users
const { data: usersData, refresh, pending } = await useFetch('/api/users', {
  query: {
    page: 1,
    perPage: 20,
  },
})

const users = computed(() => usersData.value?.data || [])
const meta = computed(() => usersData.value?.meta)

// User type badge colors
const userTypeBadges: Record<string, string> = {
  ARTIST: 'bg-purple-100 text-purple-800',
  STAKEHOLDER: 'bg-blue-100 text-blue-800',
  GOVERNMENT: 'bg-green-100 text-green-800',
  PUBLIC: 'bg-gray-100 text-gray-800',
  ADMIN: 'bg-red-100 text-red-800',
}

// Status badge colors
const statusBadges: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
  BANNED: 'bg-red-100 text-red-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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
            <h1 class="text-2xl font-bold text-gray-900">User Management</h1>
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
      <Card>
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">All Users</h2>
            <p class="text-sm text-gray-600">Manage user accounts and permissions</p>
          </div>
          <Button variant="primary" @click="refresh">
            <svg class="h-4 w-4 mr-2" :class="{ 'animate-spin': pending }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
        </div>

        <!-- Loading State -->
        <div v-if="pending" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading users...</p>
        </div>

        <!-- Users Table -->
        <div v-else-if="users.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span class="text-primary-600 font-medium">
                          {{ user.firstName[0] }}{{ user.lastName[0] }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.firstName }} {{ user.lastName }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ user.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="userTypeBadges[user.userType]"
                  >
                    {{ user.userType }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="statusBadges[user.status]"
                  >
                    {{ user.status.replace('_', ' ') }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div v-if="user.roles.length > 0" class="flex flex-wrap gap-1">
                    <span
                      v-for="ur in user.roles"
                      :key="ur.role.id"
                      class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {{ ur.role.displayName }}
                    </span>
                  </div>
                  <span v-else class="text-gray-400">No roles</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <NuxtLink
                    :to="`/admin/users/${user.id}`"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    View
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <p class="text-gray-500">No users found</p>
        </div>

        <!-- Pagination -->
        <div v-if="meta" class="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
          <div class="text-sm text-gray-700">
            Showing page <span class="font-medium">{{ meta.page }}</span> of
            <span class="font-medium">{{ meta.totalPages }}</span>
            ({{ meta.total }} total users)
          </div>
        </div>
      </Card>
    </main>
  </div>
</template>
