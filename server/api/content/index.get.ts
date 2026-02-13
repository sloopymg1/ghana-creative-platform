import { prisma } from '../../plugins/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const session = await getUserSession(event)

  const page = Number(query.page) || 1
  const perPage = Number(query.perPage) || 20
  const search = query.search as string
  const type = query.type as string
  const status = query.status as string
  const category = query.category as string
  const userId = query.userId as string
  const sortBy = (query.sortBy as string) || 'createdAt'
  const sortOrder = (query.sortOrder as string) || 'desc'

  // Build where clause
  const where: any = {}

  // Only show published content to non-authenticated users
  if (!session?.user) {
    where.status = 'PUBLISHED'
  } else if (userId) {
    // User viewing their own content
    where.userId = userId
  } else if (!query.showAll) {
    // Default: show published content
    where.status = 'PUBLISHED'
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ]
  }

  if (type) {
    where.type = type
  }

  if (status) {
    where.status = status
  }

  if (category) {
    where.categories = { has: category }
  }

  // Don't show soft-deleted content
  where.deletedAt = null

  // Get total count
  const total = await prisma.content.count({ where })

  // Get content
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
      [sortBy]: sortOrder,
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
