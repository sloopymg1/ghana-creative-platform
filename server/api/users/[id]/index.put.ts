import { prisma } from '../../../plugins/prisma'
import { requirePermission } from '../../../utils/rbac'
import { z } from 'zod'

const updateUserSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().max(500).optional(),
  status: z.enum(['PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'BANNED', 'INACTIVE']).optional(),
})

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'users.update')

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required',
    })
  }

  const body = await readBody(event)
  const session = await getUserSession(event)

  try {
    const validatedData = updateUserSchema.parse(body)

    const user = await prisma.user.update({
      where: { id },
      data: validatedData,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session?.user?.id,
        action: 'USER_UPDATED',
        resource: 'User',
        resourceId: id,
        details: validatedData,
        ipAddress: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent'),
      },
    })

    return {
      success: true,
      message: 'User updated successfully',
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
