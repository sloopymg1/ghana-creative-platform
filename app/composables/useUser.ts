export const useUser = () => {
  const { session } = useUserSession()

  const user = computed(() => session.value?.user || null)

  const isAdmin = computed(() => {
    return user.value?.userType === 'ADMIN'
  })

  const isArtist = computed(() => {
    return user.value?.userType === 'ARTIST'
  })

  const isStakeholder = computed(() => {
    return user.value?.userType === 'STAKEHOLDER'
  })

  const isGovernment = computed(() => {
    return user.value?.userType === 'GOVERNMENT'
  })

  const isPublic = computed(() => {
    return user.value?.userType === 'PUBLIC'
  })

  const isEmailVerified = computed(() => {
    return !!user.value?.emailVerified
  })

  const isActive = computed(() => {
    return user.value?.status === 'ACTIVE'
  })

  const fullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName} ${user.value.lastName}`
  })

  /**
   * Refresh user data from server
   */
  const refreshUser = async () => {
    // Re-fetch session to get latest user data
    const { fetch } = useUserSession()
    await fetch()
  }

  return {
    user,
    isAdmin,
    isArtist,
    isStakeholder,
    isGovernment,
    isPublic,
    isEmailVerified,
    isActive,
    fullName,
    refreshUser,
  }
}
