<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'verified', 'admin'],
})

const { fullName } = useUser()
const { logout } = useAuth()

// Fetch roles
const { data: rolesData, pending: loadingRoles } = await useFetch('/api/roles')
const roles = computed(() => rolesData.value?.data || [])

// Fetch permissions
const { data: permissionsData } = await useFetch('/api/permissions')
const permissionsGrouped = computed(() => permissionsData.value?.data?.grouped || {})

// Selected role for viewing permissions
const selectedRole = ref<any>(null)

function selectRole(role: any) {
  selectedRole.value = role
}

function getRolePermissions(role: any) {
  return role.permissions.map((rp: any) => rp.permission.name)
}

function hasPermission(role: any, permissionName: string) {
  const rolePermissions = getRolePermissions(role)
  return rolePermissions.includes(permissionName) || rolePermissions.includes('*')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Admin Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Role Management</h1>
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
            class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Users
          </NuxtLink>
          <NuxtLink
            to="/admin/roles"
            class="border-b-2 border-primary-500 py-4 px-1 text-sm font-medium text-primary-600"
          >
            Roles
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loadingRoles" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading roles...</p>
      </div>

      <!-- Content -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left - Roles List -->
        <div class="lg:col-span-1">
          <Card>
            <h2 class="text-lg font-semibold text-gray-900 mb-4">System Roles</h2>
            <div class="space-y-2">
              <button
                v-for="role in roles"
                :key="role.id"
                @click="selectRole(role)"
                class="w-full text-left p-4 rounded-lg border transition-colors"
                :class="selectedRole?.id === role.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900">{{ role.displayName }}</h3>
                    <p class="text-sm text-gray-600 mt-1">{{ role.description }}</p>
                  </div>
                  <span v-if="role.isSystem" class="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                    System
                  </span>
                </div>
                <div class="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span>{{ role.permissions.length }} permissions</span>
                  <span>•</span>
                  <span>{{ role._count.users }} users</span>
                </div>
              </button>
            </div>
          </Card>
        </div>

        <!-- Right - Role Details -->
        <div class="lg:col-span-2">
          <!-- Selected Role -->
          <Card v-if="selectedRole">
            <div class="mb-6">
              <div class="flex items-start justify-between">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900">{{ selectedRole.displayName }}</h2>
                  <p class="text-gray-600 mt-1">{{ selectedRole.description }}</p>
                </div>
                <span v-if="selectedRole.isSystem" class="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full">
                  System Role
                </span>
              </div>
              <div class="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                <div>
                  <span class="font-medium">{{ selectedRole.permissions.length }}</span> permissions
                </div>
                <div>
                  <span class="font-medium">{{ selectedRole._count.users }}</span> users assigned
                </div>
              </div>
            </div>

            <!-- Permissions -->
            <div class="border-t border-gray-200 pt-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>

              <!-- Wildcard Permission (Super Admin) -->
              <div v-if="hasPermission(selectedRole, '*')" class="mb-6">
                <div class="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <div class="flex items-center">
                    <svg class="h-5 w-5 text-red-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <p class="font-semibold text-red-900">Super Administrator Access</p>
                      <p class="text-sm text-red-700">This role has full access to all system features and permissions.</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Grouped Permissions -->
              <div v-else class="space-y-6">
                <div v-for="(permissions, resource) in permissionsGrouped" :key="resource">
                  <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    {{ resource }}
                  </h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div
                      v-for="permission in permissions"
                      :key="permission.id"
                      class="flex items-center p-3 rounded-lg border"
                      :class="hasPermission(selectedRole, permission.name) ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'"
                    >
                      <div class="flex-shrink-0 mr-3">
                        <svg
                          v-if="hasPermission(selectedRole, permission.name)"
                          class="h-5 w-5 text-green-600"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                        <svg
                          v-else
                          class="h-5 w-5 text-gray-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p
                          class="text-sm font-medium truncate"
                          :class="hasPermission(selectedRole, permission.name) ? 'text-green-900' : 'text-gray-500'"
                        >
                          {{ permission.action }}
                        </p>
                        <p class="text-xs text-gray-500 truncate">{{ permission.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <!-- No Role Selected -->
          <Card v-else>
            <div class="text-center py-12">
              <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No role selected</h3>
              <p class="mt-1 text-sm text-gray-500">Select a role from the list to view its permissions</p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  </div>
</template>
