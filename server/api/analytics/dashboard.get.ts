import { prisma } from '../../plugins/prisma'
import { requirePermission } from '../../utils/rbac'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'analytics.view')

  try {
    // Get date ranges
    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Total users by type
    const usersByType = await prisma.user.groupBy({
      by: ['userType'],
      where: { deletedAt: null },
      _count: true,
    })

    // Total users by status
    const usersByStatus = await prisma.user.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: true,
    })

    // New users (last 7 and 30 days)
    const newUsers7Days = await prisma.user.count({
      where: {
        createdAt: { gte: last7Days },
        deletedAt: null,
      },
    })

    const newUsers30Days = await prisma.user.count({
      where: {
        createdAt: { gte: last30Days },
        deletedAt: null,
      },
    })

    // Active users (logged in within last 30 days)
    const activeUsers = await prisma.user.count({
      where: {
        lastLoginAt: { gte: last30Days },
        deletedAt: null,
      },
    })

    // Total content by type
    const contentByType = await prisma.content.groupBy({
      by: ['type'],
      where: { deletedAt: null },
      _count: true,
    })

    // Total content by status
    const contentByStatus = await prisma.content.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: true,
    })

    // Content statistics
    const totalContent = await prisma.content.count({
      where: { deletedAt: null },
    })

    const publishedContent = await prisma.content.count({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
    })

    const pendingContent = await prisma.content.count({
      where: {
        status: 'PENDING_REVIEW',
        deletedAt: null,
      },
    })

    // Total views
    const totalViews = await prisma.content.aggregate({
      where: { deletedAt: null },
      _sum: {
        viewCount: true,
      },
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
        slug: true,
        type: true,
        viewCount: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            artistProfile: {
              select: {
                stageName: true,
              },
            },
          },
        },
      },
      orderBy: {
        viewCount: 'desc',
      },
      take: 10,
    })

    // Recent activity
    const recentContent = await prisma.content.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        type: true,
        publishedAt: true,
        viewCount: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 10,
    })

    // Categories distribution
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

    // User growth (last 30 days, daily)
    const userGrowth = await prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM "User"
      WHERE created_at >= ${last30Days}
        AND deleted_at IS NULL
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Content uploads (last 30 days, daily)
    const contentGrowth = await prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM "Content"
      WHERE created_at >= ${last30Days}
        AND deleted_at IS NULL
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    return {
      success: true,
      data: {
        users: {
          total: usersByStatus.reduce((sum, item) => sum + item._count, 0),
          byType: usersByType,
          byStatus: usersByStatus,
          new7Days: newUsers7Days,
          new30Days: newUsers30Days,
          active30Days: activeUsers,
          growth: userGrowth,
        },
        content: {
          total: totalContent,
          published: publishedContent,
          pending: pendingContent,
          byType: contentByType,
          byStatus: contentByStatus,
          byCategory: categoryCount,
          growth: contentGrowth,
        },
        engagement: {
          totalViews: totalViews._sum.viewCount || 0,
          topContent,
          recentContent,
        },
      },
    }
  } catch (error: any) {
    console.error('Analytics error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch analytics data',
    })
  }
})
