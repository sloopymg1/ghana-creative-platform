import { prisma } from '../../../plugins/prisma'
import { requirePermission } from '../../../utils/rbac'
import { z } from 'zod'

const assignRolesSchema = z.object({
  roleIds: z.array(z.string()),
})

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'users.assign-roles')

  const userId = getRouterParam(event, 'id')
  const session = await getUserSession(event)

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required',
    })
  }

  const body = await readBody(event)

  try {
    const { roleIds } = assignRolesSchema.parse(body)

    // Remove all existing roles
    await prisma.userRole.deleteMany({
      where: { userId },
    })

    // Assign new roles
    await prisma.userRole.createMany({
      data: roleIds.map(roleId => ({
        userId,
        roleId,
        assignedBy: session?.user?.id,
      })),
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session?.user?.id,
        action: 'ROLE_ASSIGNED',
        resource: 'User',
        resourceId: userId,
        details: { roleIds },
        ipAddress: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent'),
      },
    })

    // Fetch updated user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    })

    return {
      success: true,
      message: 'Roles assigned successfully',
      data: user,
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Validation failed',
        data: error.errors,
      })
    }
    throw error
  }
})
