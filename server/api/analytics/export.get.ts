import { prisma } from '../../plugins/prisma'
import { requirePermission } from '../../utils/rbac'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'analytics.export')

  const query = getQuery(event)
  const type = query.type as string

  try {
    let csvData = ''
    let filename = 'export.csv'

    switch (type) {
      case 'users':
        const users = await prisma.user.findMany({
          where: { deletedAt: null },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userType: true,
            status: true,
            emailVerified: true,
            createdAt: true,
            lastLoginAt: true,
            loginCount: true,
          },
          orderBy: { createdAt: 'desc' },
        })

        csvData = 'ID,Email,First Name,Last Name,User Type,Status,Email Verified,Created At,Last Login,Login Count\n'
        csvData += users
          .map(u =>
            [
              u.id,
              u.email,
              u.firstName,
              u.lastName,
              u.userType,
              u.status,
              u.emailVerified ? 'Yes' : 'No',
              u.createdAt.toISOString(),
              u.lastLoginAt?.toISOString() || 'Never',
              u.loginCount,
            ].join(',')
          )
          .join('\n')

        filename = 'users-export.csv'
        break

      case 'content':
        const content = await prisma.content.findMany({
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            viewCount: true,
            categories: true,
            createdAt: true,
            publishedAt: true,
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        csvData = 'ID,Title,Type,Status,Views,Categories,Created At,Published At,Creator Email,Creator Name\n'
        csvData += content
          .map(c =>
            [
              c.id,
              `"${c.title.replace(/"/g, '""')}"`,
              c.type,
              c.status,
              c.viewCount,
              `"${c.categories.join(', ')}"`,
              c.createdAt.toISOString(),
              c.publishedAt?.toISOString() || 'Not published',
              c.user.email,
              `"${c.user.firstName} ${c.user.lastName}"`,
            ].join(',')
          )
          .join('\n')

        filename = 'content-export.csv'
        break

      case 'audit':
        const logs = await prisma.auditLog.findMany({
          select: {
            id: true,
            action: true,
            resource: true,
            resourceId: true,
            createdAt: true,
            ipAddress: true,
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10000, // Limit to last 10k logs
        })

        csvData = 'ID,Action,Resource,Resource ID,Created At,IP Address,User Email,User Name\n'
        csvData += logs
          .map(l =>
            [
              l.id,
              l.action,
              l.resource,
              l.resourceId || 'N/A',
              l.createdAt.toISOString(),
              l.ipAddress || 'N/A',
              l.user?.email || 'System',
              l.user ? `"${l.user.firstName} ${l.user.lastName}"` : 'System',
            ].join(',')
          )
          .join('\n')

        filename = 'audit-logs-export.csv'
        break

      default:
        throw createError({
          statusCode: 400,
          message: 'Invalid export type. Use: users, content, or audit',
        })
    }

    // Set headers for CSV download
    setHeader(event, 'Content-Type', 'text/csv')
    setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)

    return csvData
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Export error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to export data',
    })
  }
})
