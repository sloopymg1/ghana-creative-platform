<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'verified'],
})

const { user, fullName } = useUser()
const { logout } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Simple Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">
          Ghana Creative Arts Board
        </h1>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">{{ fullName }}</span>
          <UiButton variant="ghost" size="sm" @click="logout">
            Logout
          </UiButton>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <UiCard>
        <div class="text-center py-12">
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg class="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Welcome, {{ user?.firstName }}! 🎉
          </h2>
          <p class="text-lg text-gray-600 mb-2">
            You're now logged in to the Ghana Creative Arts Board platform.
          </p>
          <p class="text-gray-500 mb-8">
            User Type: <span class="font-semibold text-gray-700">{{ user?.userType }}</span>
          </p>

          <!-- User Info -->
          <div class="max-w-md mx-auto bg-gray-50 rounded-lg p-6 text-left">
            <h3 class="font-semibold text-gray-900 mb-3">Your Account Details:</h3>
            <ul class="space-y-2 text-sm text-gray-600">
              <li><strong>Email:</strong> {{ user?.email }}</li>
              <li><strong>Name:</strong> {{ fullName }}</li>
              <li><strong>Status:</strong> <span class="text-green-600 font-medium">{{ user?.status }}</span></li>
              <li><strong>Email Verified:</strong> <span class="text-green-600">✓ Yes</span></li>
            </ul>
          </div>

          <div class="mt-8">
            <p class="text-sm text-gray-500">
              This is a placeholder dashboard. More features coming soon!
            </p>
          </div>
        </div>
      </UiCard>
    </main>
  </div>
</template>
