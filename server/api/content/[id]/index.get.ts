import { prisma } from '../../../plugins/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const session = await getUserSession(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Content ID is required',
    })
  }

  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          artistProfile: {
            select: {
              stageName: true,
              isVerified: true,
              categories: true,
            },
          },
        },
      },
    },
  })

  if (!content || content.deletedAt) {
    throw createError({
      statusCode: 404,
      message: 'Content not found',
    })
  }

  // Check if user can view this content
  if (content.status !== 'PUBLISHED') {
    // Only owner or moderators can view non-published content
    if (!session?.user) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to view this content',
      })
    }

    const isOwner = content.userId === session.user.id
    const isModerator = session.user.permissions?.includes('content.moderate')

    if (!isOwner && !isModerator) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to view this content',
      })
    }
  }

  // Increment view count
  await prisma.content.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  })

  return {
    success: true,
    data: content,
  }
})
