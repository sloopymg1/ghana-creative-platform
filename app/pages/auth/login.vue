<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { login } = useAuth()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')
const success = ref('')

async function handleLogin() {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const response = await login(form.email, form.password)
    success.value = response.message

    // Redirect to appropriate page
    setTimeout(() => {
      router.push(response.data?.redirectUrl || '/dashboard')
    }, 1000)
  } catch (err: any) {
    error.value = err.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <UiCard>
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>

      <UiAlert v-if="error" type="error" class="mb-4" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <UiAlert v-if="success" type="success" class="mb-4">
        {{ success }}
      </UiAlert>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <UiInput
          v-model="form.email"
          type="email"
          label="Email Address"
          placeholder="your@email.com"
          required
        />

        <UiInput
          v-model="form.password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          required
        />

        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input type="checkbox" class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
            <span class="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <NuxtLink to="/auth/forgot-password" class="text-sm text-primary-600 hover:text-primary-700">
            Forgot password?
          </NuxtLink>
        </div>

        <UiButton
          type="submit"
          :loading="loading"
          :disabled="!form.email || !form.password"
          full-width
        >
          Sign In
        </UiButton>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <NuxtLink to="/auth/register" class="text-primary-600 hover:text-primary-700 font-medium">
            Sign up
          </NuxtLink>
        </p>
      </div>
    </UiCard>
  </div>
</template>
