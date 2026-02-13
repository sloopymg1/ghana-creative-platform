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
          <Button variant="ghost" size="sm" @click="logout">
            Logout
          </Button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {{ user?.firstName }}! 👋
        </h2>
        <p class="text-gray-600">
          Here's what's happening on the platform today
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content Area -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Personalized Recommendations -->
          <AiRecommendationsWidget :limit="6" :auto-refresh="true" />

          <!-- Trending Content -->
          <AiTrendingWidget />
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- User Info Card -->
          <Card>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Your Account</h3>
            <div class="space-y-3">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <span class="text-xl font-bold text-primary-600">
                    {{ user?.firstName?.charAt(0) }}{{ user?.lastName?.charAt(0) }}
                  </span>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">{{ fullName }}</p>
                  <p class="text-xs text-gray-500">{{ user?.userType }}</p>
                </div>
              </div>
              <div class="border-t border-gray-200 pt-3">
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Status</span>
                    <span class="text-green-600 font-medium">{{ user?.status }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Email</span>
                    <span class="text-green-600">✓ Verified</span>
                  </div>
                </div>
              </div>
              <div class="pt-3">
                <NuxtLink to="/dashboard/profile">
                  <Button variant="secondary" size="sm" class="w-full">
                    View Profile
                  </Button>
                </NuxtLink>
              </div>
            </div>
          </Card>

          <!-- Quick Actions -->
          <Card>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="space-y-2">
              <NuxtLink to="/dashboard/content/upload" class="block">
                <Button variant="primary" size="sm" class="w-full">
                  Upload Content
                </Button>
              </NuxtLink>
              <NuxtLink to="/content" class="block">
                <Button variant="secondary" size="sm" class="w-full">
                  Browse Content
                </Button>
              </NuxtLink>
              <NuxtLink to="/ai-features" class="block">
                <Button variant="secondary" size="sm" class="w-full">
                  AI Features
                </Button>
              </NuxtLink>
            </div>
          </Card>

          <!-- Platform Stats -->
          <Card>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Platform Activity</h3>
            <div class="space-y-3 text-sm">
              <div class="flex items-start">
                <span class="text-2xl mr-3">🎵</span>
                <div>
                  <p class="font-medium text-gray-900">New Music</p>
                  <p class="text-xs text-gray-600">Discover fresh tracks daily</p>
                </div>
              </div>
              <div class="flex items-start">
                <span class="text-2xl mr-3">📈</span>
                <div>
                  <p class="font-medium text-gray-900">Trending Now</p>
                  <p class="text-xs text-gray-600">See what's popular today</p>
                </div>
              </div>
              <div class="flex items-start">
                <span class="text-2xl mr-3">🤖</span>
                <div>
                  <p class="font-medium text-gray-900">AI-Powered</p>
                  <p class="text-xs text-gray-600">Smart recommendations for you</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  </div>
</template>
