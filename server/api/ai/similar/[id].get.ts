import { getSimilarContent } from '../../../utils/ai/recommendations'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 10

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Content ID is required',
    })
  }

  try {
    const similarContent = await getSimilarContent(id, limit)

    return {
      success: true,
      data: similarContent,
    }
  } catch (error) {
    console.error('Similar content error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to find similar content',
    })
  }
})
