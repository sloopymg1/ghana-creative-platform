import { prisma } from '../../plugins/prisma'

export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event)

    if (session?.user) {
      // Log audit
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'USER_LOGOUT',
          resource: 'User',
          resourceId: session.user.id,
          ipAddress: getRequestIP(event),
          userAgent: getHeader(event, 'user-agent'),
        },
      })
    }

    // Clear session
    await clearUserSession(event)

    return {
      success: true,
      message: 'Logout successful',
    }
  } catch (error) {
    console.error('Logout error:', error)
    throw createError({
      statusCode: 500,
      message: 'An error occurred during logout',
    })
  }
})
