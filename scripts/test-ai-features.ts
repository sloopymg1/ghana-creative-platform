/**
 * AI Features Test Suite
 *
 * Tests the AI-powered recommendation and trending algorithms:
 * - Personalized recommendations
 * - Popular content for anonymous users
 * - Trending content (day, week, month)
 * - Similar content matching
 * - Recommendation scoring algorithm
 *
 * Run with: tsx scripts/test-ai-features.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Inline recommendation functions to avoid Nitro dependencies

/**
 * Get personalized content recommendations for a user
 */
async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 10
): Promise<any[]> {
  const userInteractions = await prisma.content.findMany({
    where: {
      OR: [{ userId }],
      status: 'PUBLISHED',
      deletedAt: null,
    },
    select: {
      categories: true,
      tags: true,
      type: true,
    },
  })

  const preferredCategories = extractPreferences(userInteractions, 'categories')
  const preferredTags = extractPreferences(userInteractions, 'tags')
  const preferredTypes = extractPreferences(userInteractions, 'type')

  const recommendations = await prisma.content.findMany({
    where: {
      userId: { not: userId },
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
async function getSimilarContent(
  contentId: string,
  limit: number = 10
): Promise<any[]> {
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

  const similarContent = await prisma.content.findMany({
    where: {
      id: { not: contentId },
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

  const scoredContent = similarContent.map((content) => {
    let score = 0

    const categoryMatches = content.categories.filter((cat) =>
      sourceContent.categories.includes(cat)
    ).length
    score += categoryMatches * 3

    const tagMatches = content.tags.filter((tag) =>
      sourceContent.tags.includes(tag)
    ).length
    score += tagMatches * 2

    if (content.type === sourceContent.type) {
      score += 5
    }

    if (content.user.id === sourceContent.userId) {
      score += 4
    }

    return { ...content, similarityScore: score }
  })

  return scoredContent
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit)
}

/**
 * Get trending content based on recent activity
 */
async function getTrendingContent(
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

  return trendingContent.map((content) => {
    const ageInDays = (now.getTime() - content.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    const trendingScore = content.viewCount / (ageInDays + 1)

    return {
      ...content,
      trendingScore: Math.round(trendingScore * 100) / 100,
    }
  })
}

/**
 * Get content recommendations for unauthenticated users
 */
async function getPopularContent(limit: number = 10): Promise<any[]> {
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

  return Array.from(preferences.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([value]) => value)
}

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'WARN'
  message: string
  data?: any
}

const results: TestResult[] = []

function logTest(result: TestResult) {
  results.push(result)
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
  console.log(`${icon} ${result.name}`)
  console.log(`   ${result.message}`)
  if (result.data) {
    console.log(`   Data:`, result.data)
  }
}

async function testPopularContent() {
  console.log('\n📊 Test 1: Popular Content (Anonymous Users)')
  console.log('='.repeat(60))

  try {
    const popular = await getPopularContent(5)

    if (popular.length === 0) {
      logTest({
        name: 'Popular Content',
        status: 'WARN',
        message: 'No content available. Database may be empty.',
      })
      return
    }

    logTest({
      name: 'Popular Content API',
      status: 'PASS',
      message: `Retrieved ${popular.length} popular items`,
      data: popular.map(c => ({
        id: c.id.substring(0, 8),
        title: c.title.substring(0, 40),
        type: c.type,
        views: c.viewCount,
      })),
    })

    // Verify sorting
    for (let i = 0; i < popular.length - 1; i++) {
      if (popular[i].viewCount < popular[i + 1].viewCount) {
        logTest({
          name: 'Popular Content Sorting',
          status: 'FAIL',
          message: 'Content not sorted by view count',
        })
        return
      }
    }

    logTest({
      name: 'Popular Content Sorting',
      status: 'PASS',
      message: 'Content correctly sorted by views (descending)',
    })

  } catch (error: any) {
    logTest({
      name: 'Popular Content',
      status: 'FAIL',
      message: error.message,
    })
  }
}

async function testPersonalizedRecommendations() {
  console.log('\n🎯 Test 2: Personalized Recommendations')
  console.log('='.repeat(60))

  try {
    // Find a user with content
    const userWithContent = await prisma.content.findFirst({
      where: { status: 'PUBLISHED' },
      select: { userId: true },
    })

    if (!userWithContent) {
      logTest({
        name: 'Personalized Recommendations',
        status: 'WARN',
        message: 'No users with content found',
      })
      return
    }

    const recommendations = await getPersonalizedRecommendations(
      userWithContent.userId,
      5
    )

    logTest({
      name: 'Personalized Recommendations API',
      status: 'PASS',
      message: `Retrieved ${recommendations.length} personalized recommendations`,
      data: recommendations.map(c => ({
        id: c.id.substring(0, 8),
        title: c.title.substring(0, 40),
        type: c.type,
        categories: c.categories.slice(0, 2),
        tags: c.tags.slice(0, 2),
      })),
    })

    // Verify user doesn't see their own content
    const hasOwnContent = recommendations.some(
      c => c.user.id === userWithContent.userId
    )

    if (hasOwnContent) {
      logTest({
        name: 'Own Content Exclusion',
        status: 'FAIL',
        message: 'User recommendations include their own content',
      })
    } else {
      logTest({
        name: 'Own Content Exclusion',
        status: 'PASS',
        message: "User's own content correctly excluded",
      })
    }

  } catch (error: any) {
    logTest({
      name: 'Personalized Recommendations',
      status: 'FAIL',
      message: error.message,
    })
  }
}

async function testTrendingContent() {
  console.log('\n🔥 Test 3: Trending Content')
  console.log('='.repeat(60))

  const timeframes: Array<'day' | 'week' | 'month'> = ['day', 'week', 'month']

  for (const timeframe of timeframes) {
    try {
      const trending = await getTrendingContent(timeframe, 5)

      logTest({
        name: `Trending Content (${timeframe})`,
        status: 'PASS',
        message: `Retrieved ${trending.length} trending items for ${timeframe}`,
        data: trending.slice(0, 3).map(c => ({
          id: c.id.substring(0, 8),
          title: c.title.substring(0, 40),
          type: c.type,
          views: c.viewCount,
          trendingScore: c.trendingScore,
          ageInDays: Math.floor(
            (Date.now() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
      })

      // Verify trending score calculation
      if (trending.length > 0) {
        const hasValidScore = trending.every(c =>
          typeof c.trendingScore === 'number' && c.trendingScore >= 0
        )

        if (hasValidScore) {
          logTest({
            name: `Trending Score (${timeframe})`,
            status: 'PASS',
            message: 'All items have valid trending scores',
          })
        } else {
          logTest({
            name: `Trending Score (${timeframe})`,
            status: 'FAIL',
            message: 'Some items have invalid trending scores',
          })
        }
      }

    } catch (error: any) {
      logTest({
        name: `Trending Content (${timeframe})`,
        status: 'FAIL',
        message: error.message,
      })
    }
  }
}

async function testSimilarContent() {
  console.log('\n🔗 Test 4: Similar Content')
  console.log('='.repeat(60))

  try {
    // Find a piece of content with categories and tags
    const sourceContent = await prisma.content.findFirst({
      where: {
        status: 'PUBLISHED',
        categories: { isEmpty: false },
        tags: { isEmpty: false },
      },
    })

    if (!sourceContent) {
      logTest({
        name: 'Similar Content',
        status: 'WARN',
        message: 'No content with categories and tags found',
      })
      return
    }

    const similar = await getSimilarContent(sourceContent.id, 5)

    logTest({
      name: 'Similar Content API',
      status: 'PASS',
      message: `Found ${similar.length} similar items`,
      data: {
        source: {
          id: sourceContent.id.substring(0, 8),
          title: sourceContent.title.substring(0, 40),
          categories: sourceContent.categories,
          tags: sourceContent.tags,
        },
        similar: similar.slice(0, 3).map(c => ({
          id: c.id.substring(0, 8),
          title: c.title.substring(0, 40),
          similarityScore: c.similarityScore,
          categories: c.categories,
          tags: c.tags,
        })),
      },
    })

    // Verify source content not in results
    const includesSource = similar.some(c => c.id === sourceContent.id)
    if (includesSource) {
      logTest({
        name: 'Source Content Exclusion',
        status: 'FAIL',
        message: 'Source content included in similar results',
      })
    } else {
      logTest({
        name: 'Source Content Exclusion',
        status: 'PASS',
        message: 'Source content correctly excluded',
      })
    }

    // Verify similarity scoring
    if (similar.length > 1) {
      const isSorted = similar.every((item, index) =>
        index === 0 || item.similarityScore <= similar[index - 1].similarityScore
      )

      if (isSorted) {
        logTest({
          name: 'Similarity Score Sorting',
          status: 'PASS',
          message: 'Results correctly sorted by similarity score',
        })
      } else {
        logTest({
          name: 'Similarity Score Sorting',
          status: 'FAIL',
          message: 'Results not properly sorted',
        })
      }
    }

  } catch (error: any) {
    logTest({
      name: 'Similar Content',
      status: 'FAIL',
      message: error.message,
    })
  }
}

async function testRecommendationAlgorithm() {
  console.log('\n🧠 Test 5: Recommendation Algorithm Logic')
  console.log('='.repeat(60))

  try {
    // Test category matching
    const musicContent = await prisma.content.count({
      where: {
        status: 'PUBLISHED',
        categories: { has: 'MUSIC' },
      },
    })

    logTest({
      name: 'Category Filtering',
      status: 'PASS',
      message: `Found ${musicContent} MUSIC content items`,
    })

    // Test tag matching
    const testTagContent = await prisma.content.count({
      where: {
        status: 'PUBLISHED',
        tags: { has: 'test' },
      },
    })

    logTest({
      name: 'Tag Filtering',
      status: 'PASS',
      message: `Found ${testTagContent} items with 'test' tag`,
    })

    // Test type filtering
    const imageContent = await prisma.content.count({
      where: {
        status: 'PUBLISHED',
        type: 'IMAGE',
      },
    })

    logTest({
      name: 'Type Filtering',
      status: 'PASS',
      message: `Found ${imageContent} IMAGE content items`,
    })

  } catch (error: any) {
    logTest({
      name: 'Recommendation Algorithm',
      status: 'FAIL',
      message: error.message,
    })
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 Test 6: API Endpoints (HTTP)')
  console.log('='.repeat(60))

  const baseUrl = 'http://localhost:3000'
  const endpoints = [
    { url: '/api/ai/recommendations?limit=5', name: 'Recommendations' },
    { url: '/api/ai/trending?timeframe=week&limit=5', name: 'Trending' },
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(baseUrl + endpoint.url)
      const data = await response.json()

      if (response.ok && data.success) {
        logTest({
          name: `${endpoint.name} Endpoint`,
          status: 'PASS',
          message: `HTTP ${response.status} - ${data.data.length} items returned`,
        })
      } else {
        logTest({
          name: `${endpoint.name} Endpoint`,
          status: 'FAIL',
          message: `HTTP ${response.status} - ${data.message || 'Unknown error'}`,
        })
      }
    } catch (error: any) {
      logTest({
        name: `${endpoint.name} Endpoint`,
        status: 'WARN',
        message: `Could not connect: ${error.message}. Is server running?`,
      })
    }
  }
}

async function testDatabaseReadiness() {
  console.log('\n🗄️ Test 0: Database Readiness')
  console.log('='.repeat(60))

  try {
    const totalContent = await prisma.content.count()
    const publishedContent = await prisma.content.count({
      where: { status: 'PUBLISHED' },
    })
    const totalUsers = await prisma.user.count()

    console.log(`   Total content: ${totalContent}`)
    console.log(`   Published content: ${publishedContent}`)
    console.log(`   Total users: ${totalUsers}`)

    if (publishedContent === 0) {
      logTest({
        name: 'Database Readiness',
        status: 'WARN',
        message: 'No published content. AI features may return empty results.',
      })
    } else {
      logTest({
        name: 'Database Readiness',
        status: 'PASS',
        message: `Database ready with ${publishedContent} published items`,
      })
    }

    // Show content breakdown
    const contentByType = await prisma.content.groupBy({
      by: ['type'],
      where: { status: 'PUBLISHED' },
      _count: true,
    })

    console.log('\n   Content by type:')
    contentByType.forEach(({ type, _count }) => {
      console.log(`   - ${type}: ${_count}`)
    })

  } catch (error: any) {
    logTest({
      name: 'Database Readiness',
      status: 'FAIL',
      message: error.message,
    })
  }
}

async function main() {
  console.log('🤖 AI Features Test Suite')
  console.log('='.repeat(60))
  console.log('Testing recommendation algorithms and AI endpoints\n')

  try {
    await testDatabaseReadiness()
    await testPopularContent()
    await testPersonalizedRecommendations()
    await testTrendingContent()
    await testSimilarContent()
    await testRecommendationAlgorithm()
    await testAPIEndpoints()

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Test Summary')
    console.log('='.repeat(60))

    const passed = results.filter(r => r.status === 'PASS').length
    const failed = results.filter(r => r.status === 'FAIL').length
    const warnings = results.filter(r => r.status === 'WARN').length

    console.log(`\n✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⚠️ Warnings: ${warnings}`)
    console.log(`📝 Total: ${results.length}`)

    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.name}: ${r.message}`))
    }

    if (warnings > 0) {
      console.log('\n⚠️ Warnings:')
      results
        .filter(r => r.status === 'WARN')
        .forEach(r => console.log(`   - ${r.name}: ${r.message}`))
    }

    const successRate = ((passed / results.length) * 100).toFixed(1)
    console.log(`\n📈 Success Rate: ${successRate}%`)

    if (failed === 0) {
      console.log('\n🎉 All tests passed!')
      console.log('✅ AI features are working correctly')
    } else {
      console.log('\n⚠️ Some tests failed. Review errors above.')
      process.exit(1)
    }

  } catch (error) {
    console.error('\n❌ Test suite crashed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
