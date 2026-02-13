<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { verifyEmail } = useAuth()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const success = ref('')
const verified = ref(false)

// Check if token is in URL
const token = computed(() => route.query.token as string)

// Auto-verify if token is present
onMounted(async () => {
  if (token.value) {
    await handleVerification()
  }
})

async function handleVerification() {
  if (!token.value) {
    error.value = 'No verification token provided'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await verifyEmail(token.value)
    success.value = response.message
    verified.value = true

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Verification failed. The link may be expired or invalid.'
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push('/auth/login')
}

function goToRegister() {
  router.push('/auth/register')
}
</script>

<template>
  <div>
    <Card>
      <div class="text-center">
        <!-- Loading State -->
        <div v-if="loading" class="py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 class="text-xl font-semibold text-gray-900">Verifying your email...</h2>
        </div>

        <!-- Success State -->
        <div v-else-if="verified" class="py-8">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
          <p class="text-gray-600 mb-4">{{ success }}</p>
          <p class="text-sm text-gray-500">Redirecting you to your dashboard...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="py-8">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <Alert type="error" class="text-left">
            {{ error }}
          </Alert>
          <div class="mt-6 space-y-3">
            <NuxtLink
              to="/auth/login"
              class="block w-full px-4 py-2 text-center bg-primary-500 text-white hover:bg-primary-600 rounded-lg font-medium transition-colors"
            >
              Go to Login
            </NuxtLink>
            <NuxtLink
              to="/auth/register"
              class="block w-full px-4 py-2 text-center bg-secondary-400 text-gray-900 hover:bg-secondary-500 rounded-lg font-medium transition-colors"
            >
              Create New Account
            </NuxtLink>
          </div>
        </div>

        <!-- Waiting for Email State -->
        <div v-else class="py-8">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p class="text-gray-600 mb-6">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </p>
          <div class="text-sm text-gray-500 space-y-2">
            <p>Didn't receive the email?</p>
            <ul class="list-disc list-inside text-left">
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes and check again</li>
            </ul>
          </div>
          <div class="mt-6">
            <NuxtLink
              to="/auth/login"
              class="block w-full px-4 py-2 text-center bg-secondary-400 text-gray-900 hover:bg-secondary-500 rounded-lg font-medium transition-colors"
            >
              Back to Login
            </NuxtLink>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>
