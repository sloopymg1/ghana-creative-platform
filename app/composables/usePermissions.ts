export const usePermissions = () => {
  const { user } = useUser()

  const userPermissions = computed(() => {
    return user.value?.permissions || []
  })

  /**
   * Check if user has a specific permission or array of permissions (AND logic)
   */
  const hasPermission = (permission: string | string[]): boolean => {
    const permissions = Array.isArray(permission) ? permission : [permission]

    // Check for wildcard (super admin)
    if (userPermissions.value.includes('*')) {
      return true
    }

    // Check if user has all required permissions
    return permissions.every(p => userPermissions.value.includes(p))
  }

  /**
   * Check if user has any of the specified permissions (OR logic)
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    // Check for wildcard (super admin)
    if (userPermissions.value.includes('*')) {
      return true
    }

    return permissions.some(p => userPermissions.value.includes(p))
  }

  /**
   * Check if user can manage users
   */
  const canManageUsers = computed(() => {
    return hasAnyPermission(['users.create', 'users.update', 'users.delete'])
  })

  /**
   * Check if user can moderate content
   */
  const canModerateContent = computed(() => {
    return hasPermission('content.moderate')
  })

  /**
   * Check if user can manage roles
   */
  const canManageRoles = computed(() => {
    return hasAnyPermission(['roles.create', 'roles.update', 'roles.delete'])
  })

  /**
   * Check if user can view analytics
   */
  const canViewAnalytics = computed(() => {
    return hasAnyPermission(['analytics.view-own', 'analytics.view-all'])
  })

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    canManageUsers,
    canModerateContent,
    canManageRoles,
    canViewAnalytics,
  }
}
