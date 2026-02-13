import { prisma } from '../../plugins/prisma'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Slug is required',
    })
  }

  try {
    // Find artist by slug in artistProfile
    const artist = await prisma.user.findFirst({
      where: {
        userType: 'ARTIST',
        status: 'ACTIVE',
        deletedAt: null,
        artistProfile: {
          slug,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        createdAt: true,
        artistProfile: {
          select: {
            slug: true,
            stageName: true,
            categories: true,
            isVerified: true,
            instagramUrl: true,
            twitterUrl: true,
            facebookUrl: true,
            youtubeUrl: true,
            websiteUrl: true,
          },
        },
      },
    })

    if (!artist) {
      throw createError({
        statusCode: 404,
        message: 'Artist not found',
      })
    }

    return {
      success: true,
      data: artist,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch artist',
    })
  }
})
