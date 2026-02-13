import type { RegisterInput, LoginInput } from '~/utils/validators'

export const useAuth = () => {
  const { loggedIn, session, fetch: fetchSession, clear } = useUserSession()

  /**
   * Register a new user
   */
  const register = async (userData: RegisterInput) => {
    const { data, error } = await useFetch('/api/auth/register', {
      method: 'POST',
      body: userData,
    })

    if (error.value) {
      const err = error.value as any
      throw new Error(err.data?.message || 'Registration failed')
    }

    return data.value
  }

  /**
   * Login user
   */
  const login = async (email: string, password: string) => {
    const { data, error } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    if (error.value) {
      const err = error.value as any
      throw new Error(err.data?.message || 'Login failed')
    }

    await fetchSession() // Refresh session
    return data.value
  }

  /**
   * Logout user
   */
  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await clear()
    await navigateTo('/auth/login')
  }

  /**
   * Verify email with token
   */
  const verifyEmail = async (token: string) => {
    const { data, error } = await useFetch('/api/auth/verify-email', {
      method: 'POST',
      body: { token },
    })

    if (error.value) {
      const err = error.value as any
      throw new Error(err.data?.message || 'Email verification failed')
    }

    await fetchSession() // Refresh session after verification
    return data.value
  }

  /**
   * Request password reset
   */
  const forgotPassword = async (email: string) => {
    const { data, error } = await useFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email },
    })

    if (error.value) {
      const err = error.value as any
      throw new Error(err.data?.message || 'Password reset request failed')
    }

    return data.value
  }

  /**
   * Reset password with token
   */
  const resetPassword = async (token: string, password: string) => {
    const { data, error } = await useFetch('/api/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    })

    if (error.value) {
      const err = error.value as any
      throw new Error(err.data?.message || 'Password reset failed')
    }

    return data.value
  }

  return {
    loggedIn,
    session,
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
  }
}
