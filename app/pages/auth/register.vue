<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

const { register } = useAuth()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  userType: 'PUBLIC' as 'ARTIST' | 'STAKEHOLDER' | 'GOVERNMENT' | 'PUBLIC',
  phoneNumber: '',
})

const loading = ref(false)
const error = ref('')
const success = ref('')

const passwordsMatch = computed(() => {
  return form.password === form.confirmPassword
})

const userTypes = [
  { value: 'ARTIST', label: 'Artist / Creative', description: 'Musicians, visual artists, performers' },
  { value: 'STAKEHOLDER', label: 'Industry Stakeholder', description: 'Record labels, galleries, businesses' },
  { value: 'GOVERNMENT', label: 'Government Official', description: 'Policy makers, board members' },
  { value: 'PUBLIC', label: 'Public / Fan', description: 'General public, art enthusiasts' },
]

async function handleRegister() {
  error.value = ''
  success.value = ''

  // Validate passwords match
  if (!passwordsMatch.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true

  try {
    const response = await register({
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      userType: form.userType,
      phoneNumber: form.phoneNumber || undefined,
    })

    success.value = response.message

    // Redirect to verify email page after 2 seconds
    setTimeout(() => {
      router.push('/auth/verify-email')
    }, 2000)
  } catch (err: any) {
    error.value = err.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <UiCard>
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Create Your Account</h2>

      <UiAlert v-if="error" type="error" class="mb-4" dismissible @dismiss="error = ''">
        {{ error }}
      </UiAlert>

      <UiAlert v-if="success" type="success" class="mb-4">
        {{ success }}
      </UiAlert>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <!-- User Type Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            I am a <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-1 gap-3">
            <label
              v-for="type in userTypes"
              :key="type.value"
              class="relative flex cursor-pointer rounded-lg border p-4 focus:outline-none"
              :class="form.userType === type.value ? 'border-primary-600 bg-primary-50' : 'border-gray-300'"
            >
              <input
                v-model="form.userType"
                type="radio"
                :value="type.value"
                class="sr-only"
              />
              <div class="flex flex-1">
                <div class="flex flex-col">
                  <span class="block text-sm font-medium text-gray-900">{{ type.label }}</span>
                  <span class="mt-1 flex items-center text-sm text-gray-500">{{ type.description }}</span>
                </div>
              </div>
              <svg
                v-if="form.userType === type.value"
                class="h-5 w-5 text-primary-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </label>
          </div>
        </div>

        <!-- Name Fields -->
        <div class="grid grid-cols-2 gap-4">
          <UiInput
            v-model="form.firstName"
            label="First Name"
            placeholder="John"
            required
          />
          <UiInput
            v-model="form.lastName"
            label="Last Name"
            placeholder="Doe"
            required
          />
        </div>

        <!-- Email -->
        <UiInput
          v-model="form.email"
          type="email"
          label="Email Address"
          placeholder="your@email.com"
          required
        />

        <!-- Phone (Optional) -->
        <UiInput
          v-model="form.phoneNumber"
          type="tel"
          label="Phone Number (Optional)"
          placeholder="+233 XX XXX XXXX"
        />

        <!-- Password -->
        <UiInput
          v-model="form.password"
          type="password"
          label="Password"
          placeholder="Create a strong password"
          required
        />

        <!-- Confirm Password -->
        <UiInput
          v-model="form.confirmPassword"
          type="password"
          label="Confirm Password"
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
          :disabled="!form.email || !form.password || !passwordsMatch"
          full-width
        >
          Create Account
        </UiButton>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Already have an account?
          <NuxtLink to="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </NuxtLink>
        </p>
      </div>
    </UiCard>
  </div>
</template>
