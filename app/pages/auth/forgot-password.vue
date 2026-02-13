<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { forgotPassword } = useAuth()

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const submitted = ref(false)

async function handleSubmit() {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const response = await forgotPassword(email.value)
    success.value = response.message
    submitted.value = true
  } catch (err: any) {
    error.value = err.message || 'Failed to send reset email. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <UiCard>
      <div v-if="!submitted">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
        <p class="text-gray-600 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <UiAlert v-if="error" type="error" class="mb-4" dismissible @dismiss="error = ''">
          {{ error }}
        </UiAlert>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UiInput
            v-model="email"
            type="email"
            label="Email Address"
            placeholder="your@email.com"
            required
          />

          <UiButton
            type="submit"
            :loading="loading"
            :disabled="!email"
            full-width
          >
            Send Reset Link
          </UiButton>
        </form>

        <div class="mt-6 text-center">
          <NuxtLink to="/auth/login" class="text-sm text-primary-600 hover:text-primary-700">
            &larr; Back to login
          </NuxtLink>
        </div>
      </div>

      <!-- Success State -->
      <div v-else class="text-center py-4">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h3>
        <p class="text-gray-600 mb-6">
          {{ success }}
        </p>
        <p class="text-sm text-gray-500 mb-4">
          The link will expire in 1 hour for security reasons.
        </p>
        <UiButton variant="ghost" full-width @click="$router.push('/auth/login')">
          Return to Login
        </UiButton>
      </div>
    </UiCard>
  </div>
</template>
