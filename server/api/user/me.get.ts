import { prisma } from '../../plugins/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }

  // Fetch full user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      avatar: true,
      bio: true,
      userType: true,
      status: true,
      emailVerified: true,
      lastLoginAt: true,
      loginCount: true,
      createdAt: true,
      updatedAt: true,
      artistProfile: true,
      stakeholderProfile: true,
      governmentProfile: true,
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  // Extract permissions
  const permissions = user.roles.flatMap(ur =>
    ur.role.permissions.map(rp => rp.permission.name)
  )

  return {
    success: true,
    data: {
      ...user,
      permissions,
    },
  }
})
