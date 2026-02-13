import { prisma } from '../../../plugins/prisma'
import { z } from 'zod'

const updateContentSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(5000).optional(),
  categories: z.array(z.enum([
    'MUSIC', 'VISUAL_ARTS', 'DANCE', 'THEATER', 'FILM',
    'LITERATURE', 'CRAFTS', 'DIGITAL_ARTS', 'FASHION',
    'CULINARY_ARTS', 'OTHER'
  ])).optional(),
  tags: z.array(z.string()).max(10).optional(),
  licenseType: z.string().optional(),
  externalUrl: z.string().url().optional().or(z.literal('')),
  duration: z.number().optional(),
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const id = getRouterParam(event, 'id')

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Content ID is required',
    })
  }

  // Check ownership
  const existingContent = await prisma.content.findUnique({
    where: { id },
  })

  if (!existingContent || existingContent.deletedAt) {
    throw createError({
      statusCode: 404,
      message: 'Content not found',
    })
  }

  const isOwner = existingContent.userId === session.user.id
  const isModerator = session.user.permissions?.includes('content.moderate')

  if (!isOwner && !isModerator) {
    throw createError({
      statusCode: 403,
      message: 'You do not have permission to update this content',
    })
  }

  const body = await readBody(event)

  try {
    const validatedData = updateContentSchema.parse(body)

    const content = await prisma.content.update({
      where: { id },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CONTENT_UPDATED',
        resource: 'Content',
        resourceId: id,
        details: validatedData,
        ipAddress: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent'),
      },
    })

    return {
      success: true,
      message: 'Content updated successfully',
      data: content,
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
