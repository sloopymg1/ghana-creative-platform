<script setup lang="ts">
const { loggedIn } = useUserSession()
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6">
            Ghana <span class="text-primary-600">Creative Arts</span> Board
          </h1>
          <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Empowering Creativity & Innovation in Ghana
          </p>
          <p class="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Join Ghana's premier platform for artists, stakeholders, and creative professionals.
            Connect, collaborate, and showcase your talent to the world.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink v-if="!loggedIn" to="/auth/register">
              <UiButton size="lg" variant="primary">
                Get Started
              </UiButton>
            </NuxtLink>
            <NuxtLink v-if="!loggedIn" to="/auth/login">
              <UiButton size="lg" variant="secondary">
                Sign In
              </UiButton>
            </NuxtLink>
            <NuxtLink v-if="loggedIn" to="/dashboard">
              <UiButton size="lg" variant="primary">
                Go to Dashboard
              </UiButton>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <UiCard>
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
              <svg class="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Connect with Creatives</h3>
            <p class="text-gray-600">Network with artists, musicians, and creative professionals across Ghana.</p>
          </div>
        </UiCard>

        <!-- Feature 2 -->
        <UiCard>
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-secondary-100 mb-4">
              <svg class="h-6 w-6 text-secondary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Showcase Your Work</h3>
            <p class="text-gray-600">Share your creative content, music, art, and performances with a wider audience.</p>
          </div>
        </UiCard>

        <!-- Feature 3 -->
        <UiCard>
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent-100 mb-4">
              <svg class="h-6 w-6 text-accent-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Industry Insights</h3>
            <p class="text-gray-600">Access analytics, trends, and data about Ghana's creative arts industry.</p>
          </div>
        </UiCard>
      </div>
    </div>

    <!-- Trending Content Section -->
    <div class="bg-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            🔥 Trending Now
          </h2>
          <p class="text-lg text-gray-600">
            Discover what's hot on the platform right now
          </p>
        </div>
        <AiTrendingWidget />
      </div>
    </div>

    <!-- Discover Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          ✨ Discover Amazing Content
        </h2>
        <p class="text-lg text-gray-600 mb-8">
          Popular content from talented creators across Ghana
        </p>
      </div>
      <AiRecommendationsWidget :limit="8" />

      <div class="text-center mt-8">
        <NuxtLink to="/content">
          <UiButton size="lg" variant="primary">
            Explore All Content
          </UiButton>
        </NuxtLink>
      </div>
    </div>

    <!-- AI Features Highlight -->
    <div class="bg-gradient-to-r from-primary-50 to-secondary-50 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            🤖 Powered by AI
          </h2>
          <p class="text-lg text-gray-600 mb-8">
            Our intelligent platform helps you discover the best content
          </p>
        </div>

        <div class="grid md:grid-cols-4 gap-6">
          <div class="bg-white rounded-lg p-6 text-center shadow-sm">
            <div class="text-3xl mb-3">🎯</div>
            <h3 class="font-semibold text-gray-900 mb-2">Smart Recommendations</h3>
            <p class="text-sm text-gray-600">Personalized content just for you</p>
          </div>

          <div class="bg-white rounded-lg p-6 text-center shadow-sm">
            <div class="text-3xl mb-3">📈</div>
            <h3 class="font-semibold text-gray-900 mb-2">Trend Detection</h3>
            <p class="text-sm text-gray-600">Stay on top of what's popular</p>
          </div>

          <div class="bg-white rounded-lg p-6 text-center shadow-sm">
            <div class="text-3xl mb-3">🔗</div>
            <h3 class="font-semibold text-gray-900 mb-2">Similar Content</h3>
            <p class="text-sm text-gray-600">Find related works easily</p>
          </div>

          <div class="bg-white rounded-lg p-6 text-center shadow-sm">
            <div class="text-3xl mb-3">🏷️</div>
            <h3 class="font-semibold text-gray-900 mb-2">Smart Tagging</h3>
            <p class="text-sm text-gray-600">Automatic content categorization</p>
          </div>
        </div>

        <div class="text-center mt-8">
          <NuxtLink to="/ai-features">
            <UiButton size="lg" variant="secondary">
              Learn More About AI Features
            </UiButton>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
        <p>&copy; {{ new Date().getFullYear() }} Ghana Creative Arts Board. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>
