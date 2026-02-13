/**
 * Middleware to protect admin routes
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { hasAnyPermission } = usePermissions()

  // Check if user has any admin permissions
  const adminPermissions = [
    'users.read',
    'users.create',
    'users.update',
    'users.delete',
    'content.moderate',
    'roles.read',
    'roles.create',
    'analytics.view-all',
  ]

  if (!hasAnyPermission(adminPermissions)) {
    return navigateTo('/dashboard')
  }
})
