<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-display font-bold text-primary-600 mb-2">
          Ghana Creative Arts
        </h1>
        <p class="text-gray-600">
          Empowering Creativity & Innovation
        </p>
      </div>

      <!-- Main Content -->
      <slot />

      <!-- Footer -->
      <div class="text-center mt-8 text-sm text-gray-600">
        <p>&copy; {{ new Date().getFullYear() }} Ghana Creative Arts Board. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>
