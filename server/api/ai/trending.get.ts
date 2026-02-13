import { getTrendingContent } from '../../utils/ai/recommendations'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const timeframe = (query.timeframe as 'day' | 'week' | 'month') || 'week'
  const limit = parseInt(query.limit as string) || 10

  try {
    const trending = await getTrendingContent(timeframe, limit)

    return {
      success: true,
      data: trending,
      timeframe,
    }
  } catch (error) {
    console.error('Trending content error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch trending content',
    })
  }
})
