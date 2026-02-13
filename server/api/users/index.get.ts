import { prisma } from '../../plugins/prisma'
import { requirePermission } from '../../utils/rbac'

export default defineEventHandler(async (event) => {
  // Check permission
  await requirePermission(event, 'users.read')

  // Get query parameters
  const query = getQuery(event)
  const page = Number(query.page) || 1
  const perPage = Number(query.perPage) || 20
  const search = query.search as string
  const status = query.status as string
  const userType = query.userType as string
  const sortBy = (query.sortBy as string) || 'createdAt'
  const sortOrder = (query.sortOrder as string) || 'desc'

  // Build where clause
  const where: any = {}

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (status) {
    where.status = status
  }

  if (userType) {
    where.userType = userType
  }

  // Don't show deleted users
  where.deletedAt = null

  // Get total count
  const total = await prisma.user.count({ where })

  // Get users
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      userType: true,
      status: true,
      emailVerified: true,
      lastLoginAt: true,
      loginCount: true,
      createdAt: true,
      roles: {
        include: {
          role: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
      },
    },
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: {
      [sortBy]: sortOrder,
    },
  })

  return {
    success: true,
    data: users,
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  }
})
