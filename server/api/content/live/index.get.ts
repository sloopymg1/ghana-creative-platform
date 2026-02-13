import { prisma } from '../../../plugins/prisma'

export default defineEventHandler(async (event) => {
  try {
    const liveStreams = await prisma.content.findMany({
      where: {
        deletedAt: null,
        status: 'PUBLISHED',
        type: 'LIVE_STREAM',
      },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        externalUrl: true,
        viewCount: true,
        categories: true,
        createdAt: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      data: liveStreams,
    }
  } catch (error) {
    console.error('Live streams fetch error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch live streams',
    })
  }
})
