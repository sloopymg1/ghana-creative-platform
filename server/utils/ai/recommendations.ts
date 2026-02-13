import { prisma } from '../../plugins/prisma'

/**
 * Content Recommendation Engine
 * Uses collaborative filtering and content-based filtering
 */

export interface RecommendationOptions {
  userId?: string
  contentId?: string
  limit?: number
  excludeContentIds?: string[]
}

/**
 * Get personalized content recommendations for a user
 */
export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 10
): Promise<any[]> {
  // Get user's interaction history
  const userInteractions = await prisma.content.findMany({
    where: {
      OR: [
        { userId }, // User's own content
        // In production, add: views, likes, shares from separate tables
      ],
      status: 'PUBLISHED',
      deletedAt: null,
    },
    select: {
      categories: true,
      tags: true,
      type: true,
    },
  })

  // Extract user preferences
  const preferredCategories = extractPreferences(userInteractions, 'categories')
  const preferredTags = extractPreferences(userInteractions, 'tags')
  const preferredTypes = extractPreferences(userInteractions, 'type')

  // Get recommended content based on preferences
  const recommendations = await prisma.content.findMany({
    where: {
      userId: { not: userId }, // Don't recommend user's own content
      status: 'PUBLISHED',
      deletedAt: null,
      OR: [
        { categories: { hasSome: preferredCategories } },
        { tags: { hasSome: preferredTags } },
        { type: { in: preferredTypes } },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      type: true,
      thumbnailUrl: true,
      viewCount: true,
      categories: true,
      tags: true,
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
    orderBy: [
      { viewCount: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  })

  return recommendations
}

/**
 * Get similar content based on a specific content item
 */
export async function getSimilarContent(
  contentId: string,
  limit: number = 10
): Promise<any[]> {
  // Get the source content
  const sourceContent = await prisma.content.findUnique({
    where: { id: contentId },
    select: {
      categories: true,
      tags: true,
      type: true,
      userId: true,
    },
  })

  if (!sourceContent) {
    return []
  }

  // Find similar content
  const similarContent = await prisma.content.findMany({
    where: {
      id: { not: contentId }, // Exclude the source content
      status: 'PUBLISHED',
      deletedAt: null,
      OR: [
        { categories: { hasSome: sourceContent.categories } },
        { tags: { hasSome: sourceContent.tags } },
        { type: sourceContent.type },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      type: true,
      thumbnailUrl: true,
      viewCount: true,
      categories: true,
      tags: true,
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
    orderBy: [
      { viewCount: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  })

  // Calculate similarity scores and sort
  const scoredContent = similarContent.map((content) => {
    let score = 0

    // Category match
    const categoryMatches = content.categories.filter((cat) =>
      sourceContent.categories.includes(cat)
    ).length
    score += categoryMatches * 3

    // Tag match
    const tagMatches = content.tags.filter((tag) =>
      sourceContent.tags.includes(tag)
    ).length
    score += tagMatches * 2

    // Type match
    if (content.type === sourceContent.type) {
      score += 5
    }

    // Same artist bonus
    if (content.user.id === sourceContent.userId) {
      score += 4
    }

    return { ...content, similarityScore: score }
  })

  // Sort by similarity score
  return scoredContent
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit)
}

/**
 * Get trending content based on recent activity
 */
export async function getTrendingContent(
  timeframe: 'day' | 'week' | 'month' = 'week',
  limit: number = 10
): Promise<any[]> {
  const now = new Date()
  const timeframeMap = {
    day: 1,
    week: 7,
    month: 30,
  }
  const daysAgo = new Date(now.getTime() - timeframeMap[timeframe] * 24 * 60 * 60 * 1000)

  const trendingContent = await prisma.content.findMany({
    where: {
      status: 'PUBLISHED',
      deletedAt: null,
      createdAt: { gte: daysAgo },
    },
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      type: true,
      thumbnailUrl: true,
      viewCount: true,
      categories: true,
      tags: true,
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
    orderBy: [
      { viewCount: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  })

  // Calculate trending score
  return trendingContent.map((content) => {
    const ageInDays = (now.getTime() - content.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    const trendingScore = content.viewCount / (ageInDays + 1) // Avoid division by zero

    return {
      ...content,
      trendingScore: Math.round(trendingScore * 100) / 100,
    }
  })
}

/**
 * Get content recommendations for unauthenticated users
 */
export async function getPopularContent(limit: number = 10): Promise<any[]> {
  return await prisma.content.findMany({
    where: {
      status: 'PUBLISHED',
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      description: true,
      slug: true,
      type: true,
      thumbnailUrl: true,
      viewCount: true,
      categories: true,
      tags: true,
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
    orderBy: [
      { viewCount: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
  })
}

/**
 * Helper function to extract preferences from user interactions
 */
function extractPreferences(interactions: any[], field: string): any[] {
  const preferences = new Map<any, number>()

  interactions.forEach((item) => {
    const values = Array.isArray(item[field]) ? item[field] : [item[field]]
    values.forEach((value) => {
      preferences.set(value, (preferences.get(value) || 0) + 1)
    })
  })

  // Return top preferences sorted by frequency
  return Array.from(preferences.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([value]) => value)
}
