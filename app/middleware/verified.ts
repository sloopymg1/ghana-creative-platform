/**
 * Middleware to ensure user has verified their email
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user } = useUser()

  if (!user.value?.emailVerified) {
    return navigateTo('/auth/verify-email')
  }
})
