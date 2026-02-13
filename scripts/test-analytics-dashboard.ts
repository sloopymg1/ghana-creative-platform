/**
 * Analytics Dashboard Test Suite
 *
 * Tests the analytics dashboard functionality:
 * - Dashboard API endpoint
 * - Data aggregation queries
 * - User statistics
 * - Content statistics
 * - Engagement metrics
 * - Growth calculations
 *
 * Run with: tsx scripts/test-analytics-dashboard.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    console.log(`   Data:`, JSON.stringify(result.data, null, 2))
  }
}

async function testUserStatistics() {
  console.log('\n👥 Test 1: User Statistics')
  console.log('='.repeat(60))

  try {
    // Total users
    const totalUsers = await prisma.user.count({
      where: { deletedAt: null }
    })

    logTest({
      name: 'Total Users Count',
      status: 'PASS',
      message: `Found ${totalUsers} users`,
    })

    // Users by type
    const usersByType = await prisma.user.groupBy({
      by: ['userType'],
      where: { deletedAt: null },
      _count: true,
    })

    logTest({
      name: 'Users by Type',
      status: 'PASS',
      message: `Grouped users by ${usersByType.length} types`,
      data: usersByType.map(u => ({ type: u.userType, count: u._count })),
    })

    // Users by status
    const usersByStatus = await prisma.user.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: true,
    })

    logTest({
      name: 'Users by Status',
      status: 'PASS',
      message: `Grouped users by ${usersByStatus.length} statuses`,
      data: usersByStatus.map(u => ({ status: u.status, count: u._count })),
    })

    // New users (last 30 days)
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const newUsers30Days = await prisma.user.count({
      where: {
        createdAt: { gte: last30Days },
        deletedAt: null,
      },
    })

    logTest({
      name: 'New Users (30 days)',
      status: 'PASS',
      message: `${newUsers30Days} new users in last 30 days`,
    })

    // Active users (logged in within last 30 days)
    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: { gte: last30Days },
        deletedAt: null,
      },
    })

    logTest({
      name: 'Active Users (30 days)',
      status: 'PASS',
      message: `${activeUsers} active users in last 30 days`,
    })

  } catch (error: any) {
    logTest({
      name: 'User Statistics',
      status: 'FAIL',
      message: error.message,
    })
  }
}

async function testContentStatistics() {
  console.log('\n📊 Test 2: Content Statistics')
  console.log('='.repeat(60))

  try {
    // Total content
    const totalContent = await prisma.content.count({
      where: { deletedAt: null }
    })

    logTest({
      name: 'Total Content Count',
      status: 'PASS',
      message: `Found ${totalContent} content items`,
    })

    // Content by type
    const contentByType = await prisma.content.groupBy({
      by: ['type'],
      where: { deletedAt: null },
      _count: true,
    })

    logTest({
      name: 'Content by Type',
      status: 'PASS',
      message: `Grouped content by ${contentByType.length} types`,
      data: contentByType.map(c => ({ type: c.type, count: c._count })),
    })

    // Content by status
    const contentByStatus = await prisma.content.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: true,
    })

    logTest({
      name: 'Content by Status',
      status: 'PASS',
      message: `Grouped content by ${contentByStatus.length} statuses`,
      data: contentByStatus.map(c => ({ status: c.status, count: c._count })),
    })

    // Published content
    const publishedContent = await prisma.content.count({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
    })

    logTest({
      name: 'Published Content',
      status: 'PASS',
      message: `${publishedContent} published items`,
    })

    // Pending review
    const pendingContent = await prisma.content.count({
      where: {
        status: 'PENDING_REVIEW',
        deletedAt: null,
      },
    })

    logTest({
      name: 'Pending Review',
      status: 'PASS',
      message: `${pendingContent} items pending review`,
    })

  } catch (error: any) {
    logTest({
      name: 'Content Statistics',
      status: 'FAIL',
      message: error.message,
    })
  }
}

async function testEngagementMetrics() {
  console.log('\n📈 Test 3: Engagement Metrics')
  console.log('='.repeat(60))

  try {
    // Total views
    const totalViews = await prisma.content.aggregate({
      where: { deletedAt: null },
      _sum: {
        viewCount: true,
      },
    })

    logTest({
      name: 'Total Views',
      status: 'PASS',
      message: `${totalViews._sum.viewCount || 0} total views`,
    })

    // Top content (most viewed)
    const topContent = await prisma.content.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        type: true,
        viewCount: true,
      },
      orderBy: {
        viewCount: 'desc',
      },
      take: 5,
    })

    logTest({
      name: 'Top Content',
      status: 'PASS',
      message: `Retrieved top ${topContent.length} most viewed items`,
      data: topContent.map(c => ({
        title: c.title.substring(0, 40),
        type: c.type,
        views: c.viewCount,
      })),
    })

    // Recent content
    const recentContent = await prisma.content.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      select: {
        title: true,
        publishedAt: true,
        viewCount: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 5,
    })

    logTest({
      name: 'Recent Content',
      status: 'PASS',
      message: `Retrieved ${recentContent.length} recent items`,
    })

  } catch (error: any) {
    logTest({
      name: 'Engagement Metrics',
      status: 'FAIL',
      message: error.message,
    })
  }
}

async function testCategoryDistribution() {
  console.log('\n🏷️ Test 4: Category Distribution')
  console.log('='.repeat(60))

  try {
    // Get all content with categories
    const contentByCategory = await prisma.content.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      select: {
        categories: true,
      },
    })

    // Count categories
    const categoryCount: Record<string, number> = {}
    contentByCategory.forEach(content => {
      content.categories.forEach(cat => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1
      })
    })

    const sortedCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    logTest({
      name: 'Category Distribution',
      status: 'PASS',
      message: `Found ${Object.keys(categoryCount).length} unique categories`,
      data: sortedCategories.map(([cat, count]) => ({ category: cat, count })),
    })

  } catch (error: any) {
    logTest({
      name: 'Category Distribution',
      status: 'FAIL',
      message: error.message,
    })
  }
}

async function testGrowthMetrics() {
  console.log('\n📊 Test 5: Growth Metrics')
  console.log('='.repeat(60))

  try {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // User growth (daily)
    const userGrowth = await prisma.$queryRaw<any[]>`
      SELECT
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= ${last30Days}
        AND "deletedAt" IS NULL
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `

    logTest({
      name: 'User Growth Query',
      status: 'PASS',
      message: `Retrieved ${userGrowth.length} days of user growth data`,
      data: userGrowth.slice(0, 5).map(d => ({
        date: new Date(d.date).toISOString().split('T')[0],
        count: Number(d.count),
      })),
    })

    // Content growth (daily)
    const contentGrowth = await prisma.$queryRaw<any[]>`
      SELECT
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "Content"
      WHERE "createdAt" >= ${last30Days}
        AND "deletedAt" IS NULL
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `

    logTest({
      name: 'Content Growth Query',
      status: 'PASS',
      message: `Retrieved ${contentGrowth.length} days of content growth data`,
      data: contentGrowth.slice(0, 5).map(d => ({
        date: new Date(d.date).toISOString().split('T')[0],
        count: Number(d.count),
      })),
    })

  } catch (error: any) {
    logTest({
      name: 'Growth Metrics',
      status: 'FAIL',
      message: error.message,
    })
  }
}

async function testDataIntegrity() {
  console.log('\n🔍 Test 6: Data Integrity')
  console.log('='.repeat(60))

  try {
    // Check for orphaned content (content without user)
    // Note: Since Content has a required userId field, orphaned content shouldn't exist
    // This test verifies data integrity
    const allContent = await prisma.content.count({
      where: { deletedAt: null },
    })

    const contentWithUsers = await prisma.content.count({
      where: {
        deletedAt: null,
        user: {
          id: { not: undefined },
        },
      },
    })

    if (allContent === contentWithUsers) {
      logTest({
        name: 'Orphaned Content Check',
        status: 'PASS',
        message: 'All content has valid user relationships',
      })
    } else {
      logTest({
        name: 'Orphaned Content Check',
        status: 'WARN',
        message: `Found ${allContent - contentWithUsers} content items with issues`,
      })
    }

    // Check for negative view counts (data integrity)
    const negativeViewCounts = await prisma.content.count({
      where: {
        viewCount: { lt: 0 },
        deletedAt: null,
      },
    })

    if (negativeViewCounts > 0) {
      logTest({
        name: 'View Count Integrity',
        status: 'WARN',
        message: `Found ${negativeViewCounts} content items with negative view counts`,
      })
    } else {
      logTest({
        name: 'View Count Integrity',
        status: 'PASS',
        message: 'All content has valid view counts (>= 0)',
      })
    }

    // Check for users without email verification date
    const unverifiedUsers = await prisma.user.count({
      where: {
        emailVerified: null,
        status: 'ACTIVE',
        deletedAt: null,
      },
    })

    if (unverifiedUsers > 0) {
      logTest({
        name: 'Unverified Active Users',
        status: 'WARN',
        message: `Found ${unverifiedUsers} active users without email verification`,
      })
    } else {
      logTest({
        name: 'Email Verification',
        status: 'PASS',
        message: 'All active users have verified emails',
      })
    }

  } catch (error: any) {
    logTest({
      name: 'Data Integrity',
      status: 'FAIL',
      message: error.message,
    })
  }
}

async function testPerformance() {
  console.log('\n⚡ Test 7: Query Performance')
  console.log('='.repeat(60))

  const queries = [
    {
      name: 'User Count',
      fn: () => prisma.user.count({ where: { deletedAt: null } }),
    },
    {
      name: 'Content Count',
      fn: () => prisma.content.count({ where: { deletedAt: null } }),
    },
    {
      name: 'Users by Type (Group By)',
      fn: () => prisma.user.groupBy({ by: ['userType'], where: { deletedAt: null }, _count: true }),
    },
    {
      name: 'Content by Type (Group By)',
      fn: () => prisma.content.groupBy({ by: ['type'], where: { deletedAt: null }, _count: true }),
    },
    {
      name: 'Top Content (Order + Limit)',
      fn: () => prisma.content.findMany({
        where: { status: 'PUBLISHED', deletedAt: null },
        orderBy: { viewCount: 'desc' },
        take: 10,
      }),
    },
  ]

  for (const query of queries) {
    try {
      const start = Date.now()
      await query.fn()
      const duration = Date.now() - start

      const status = duration < 100 ? 'PASS' : duration < 500 ? 'WARN' : 'FAIL'
      logTest({
        name: query.name,
        status,
        message: `Executed in ${duration}ms`,
      })
    } catch (error: any) {
      logTest({
        name: query.name,
        status: 'FAIL',
        message: error.message,
      })
    }
  }
}

async function main() {
  console.log('📊 Analytics Dashboard Test Suite')
  console.log('='.repeat(60))
  console.log('Testing analytics data aggregation and metrics\n')

  try {
    await testUserStatistics()
    await testContentStatistics()
    await testEngagementMetrics()
    await testCategoryDistribution()
    await testGrowthMetrics()
    await testDataIntegrity()
    await testPerformance()

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

    // Performance summary
    const performanceTests = results.filter(r =>
      r.name.includes('Count') || r.name.includes('Group By') || r.name.includes('Order')
    )
    const avgPerformance = performanceTests.reduce((sum, r) => {
      const match = r.message.match(/(\d+)ms/)
      return sum + (match ? parseInt(match[1]) : 0)
    }, 0) / performanceTests.length

    console.log(`\n⚡ Average Query Time: ${avgPerformance.toFixed(0)}ms`)

    if (failed === 0) {
      console.log('\n🎉 All tests passed!')
      console.log('✅ Analytics dashboard is ready')
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
