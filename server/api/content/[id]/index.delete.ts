import { prisma } from '../../../plugins/prisma'

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
      message: 'Only the content owner can delete this content',
    })
  }

  // Soft delete
  await prisma.content.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  })

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: 'CONTENT_DELETED',
      resource: 'Content',
      resourceId: id,
      details: { title: content.title },
      ipAddress: getRequestIP(event),
      userAgent: getHeader(event, 'user-agent'),
    },
  })

  return {
    success: true,
    message: 'Content deleted successfully',
  }
})
