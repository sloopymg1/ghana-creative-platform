import { getPersonalizedRecommendations, getPopularContent } from '../../utils/ai/recommendations'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 10

  try {
    let recommendations

    if (session?.user) {
      // Get personalized recommendations for logged-in users
      recommendations = await getPersonalizedRecommendations(session.user.id, limit)
    } else {
      // Get popular content for anonymous users
      recommendations = await getPopularContent(limit)
    }

    return {
      success: true,
      data: recommendations,
      personalized: !!session?.user,
    }
  } catch (error) {
    console.error('Recommendations error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to generate recommendations',
    })
  }
})
