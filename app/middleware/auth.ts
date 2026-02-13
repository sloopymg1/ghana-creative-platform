/**
 * Middleware to protect routes that require authentication
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/auth/login')
  }
})
