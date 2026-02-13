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
      message: 'View count incremented',
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to increment view count',
    })
  }
})
