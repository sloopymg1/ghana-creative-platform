import { prisma } from '../../../plugins/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Content ID is required',
    })
  }

  try {
    const content = await prisma.content.findFirst({
      where: {
        id,
        deletedAt: null,
        status: 'PUBLISHED',
        type: {
          in: ['AUDIO', 'VIDEO', 'LIVE_STREAM'],
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        fileUrl: true,
        externalUrl: true,
        thumbnailUrl: true,
        duration: true,
        viewCount: true,
        categories: true,
        tags: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            artistProfile: {
              select: {
                stageName: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    if (!content) {
      throw createError({
        statusCode: 404,
        message: 'Content not found',
      })
    }

    // Increment view count
    await prisma.content.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    return {
      success: true,
      data: content,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Stream fetch error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch stream',
    })
  }
})
