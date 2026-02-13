import { prisma } from '../../../plugins/prisma'
import { checkUserPermission } from '../../../utils/rbac'

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

  // Get content
  const content = await prisma.content.findUnique({
    where: { id },
  })

  if (!content || content.deletedAt) {
    throw createError({
      statusCode: 404,
      message: 'Content not found',
    })
  }

  // Check if user is owner
  const isOwner = content.userId === session.user.id

  if (!isOwner) {
    throw createError({
      statusCode: 403,
      message: 'Only the content owner can publish',
    })
  }

  // Check if user can publish directly or needs moderation
  const canPublishDirectly = await checkUserPermission(session.user.id, 'content.publish')

  const newStatus = canPublishDirectly ? 'PUBLISHED' : 'PENDING_REVIEW'
  const publishedAt = canPublishDirectly ? new Date() : null

  // Update content
  const updatedContent = await prisma.content.update({
    where: { id },
    data: {
      status: newStatus,
      publishedAt,
    },
  })

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'CONTENT_PUBLISHED',
      resource: 'Content',
      resourceId: id,
      details: { status: newStatus },
      ipAddress: getRequestIP(event),
      userAgent: getHeader(event, 'user-agent'),
    },
  })

  return {
    success: true,
    message: canPublishDirectly
      ? 'Content published successfully'
      : 'Content submitted for review',
    data: updatedContent,
  }
})
