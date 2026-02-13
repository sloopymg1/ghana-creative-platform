import { prisma } from '../../../plugins/prisma'
import { requirePermission } from '../../../utils/rbac'
import { z } from 'zod'

const reviewSchema = z.object({
  contentId: z.string(),
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.moderate')

  const session = await getUserSession(event)
  const body = await readBody(event)

  try {
    const { contentId, action, notes } = reviewSchema.parse(body)

    // Get content
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    })

    if (!content) {
      throw createError({
        statusCode: 404,
        message: 'Content not found',
      })
    }

    // Update content status
    const newStatus = action === 'approve' ? 'PUBLISHED' : 'REJECTED'
    const publishedAt = action === 'approve' ? new Date() : null

    const updatedContent = await prisma.content.update({
      where: { id: contentId },
      data: {
        status: newStatus,
        publishedAt,
        moderatedAt: new Date(),
        moderatedBy: session?.user?.id,
        moderationNotes: notes,
      },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session?.user?.id,
        action: 'CONTENT_MODERATED',
        resource: 'Content',
        resourceId: contentId,
        details: { action, notes },
        ipAddress: getRequestIP(event),
        userAgent: getHeader(event, 'user-agent'),
      },
    })

    return {
      success: true,
      message: `Content ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: updatedContent,
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
