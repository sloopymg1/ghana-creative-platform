<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { resetPassword } = useAuth()
const route = useRoute()
const router = useRouter()

const form = reactive({
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const error = ref('')
const success = ref('')
const resetComplete = ref(false)

const token = computed(() => route.query.token as string)

const passwordsMatch = computed(() => {
  return form.password === form.confirmPassword
})

async function handleSubmit() {
  if (!token.value) {
    error.value = 'Invalid or missing reset token'
    return
  }

  if (!passwordsMatch.value) {
    error.value = 'Passwords do not match'
    return
  }

  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const response = await resetPassword(token.value, form.password)
    success.value = response.message
    resetComplete.value = true

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Failed to reset password. The link may be expired.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <UiCard>
      <div v-if="!resetComplete">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
        <p class="text-gray-600 mb-6">
          Enter your new password below.
        </p>

        <UiAlert v-if="error" type="error" class="mb-4" dismissible @dismiss="error = ''">
          {{ error }}
        </UiAlert>

        <UiAlert v-if="!token" type="warning" class="mb-4">
          Invalid or missing reset token. Please request a new password reset link.
        </UiAlert>

        <form v-if="token" @submit.prevent="handleSubmit" class="space-y-4">
          <UiInput
            v-model="form.password"
            type="password"
            label="New Password"
            placeholder="Create a strong password"
            required
          />

          <UiInput
            v-model="form.confirmPassword"
            type="password"
            label="Confirm New Password"
            placeholder="Re-enter your password"
            :error="form.confirmPassword && !passwordsMatch ? 'Passwords do not match' : ''"
            required
          />

          <!-- Password Requirements -->
          <div class="text-xs text-gray-600 space-y-1">
            <p class="font-medium">Password must contain:</p>
            <ul class="list-disc list-inside space-y-1">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
              <li>One special character</li>
            </ul>
          </div>

          <UiButton
            type="submit"
            :loading="loading"
            :disabled="!form.password || !passwordsMatch"
            full-width
          >
            Reset Password
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
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Password Reset Successful!</h3>
        <p class="text-gray-600 mb-4">
          {{ success }}
        </p>
        <p class="text-sm text-gray-500 mb-4">
          Redirecting you to login...
        </p>
        <UiButton variant="primary" full-width @click="router.push('/auth/login')">
          Go to Login
        </UiButton>
      </div>
    </UiCard>
  </div>
</template>
