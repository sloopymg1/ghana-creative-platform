import { prisma } from '../../../plugins/prisma'
import { requirePermission } from '../../../utils/rbac'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'users.read')

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required',
    })
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
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
      artistProfile: true,
      stakeholderProfile: true,
      governmentProfile: true,
      _count: {
        select: {
          content: true,
        },
      },
    },
  })

  if (!user || user.deletedAt) {
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
