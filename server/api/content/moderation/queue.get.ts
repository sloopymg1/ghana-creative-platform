import { prisma } from '../../../plugins/prisma'
import { requirePermission } from '../../../utils/rbac'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'content.moderate')

  const query = getQuery(event)
  const page = Number(query.page) || 1
  const perPage = Number(query.perPage) || 20

  // Get content pending review
  const where = {
    status: 'PENDING_REVIEW',
    deletedAt: null,
  }

  const total = await prisma.content.count({ where })

  const content = await prisma.content.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          artistProfile: {
            select: {
              stageName: true,
              isVerified: true,
            },
          },
        },
      },
    },
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: {
      createdAt: 'asc', // Oldest first
    },
  })

  return {
    success: true,
    data: content,
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  }
})
