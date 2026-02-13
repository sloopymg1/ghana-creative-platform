import { prisma } from '../../plugins/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }

  try {
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const perPage = parseInt(query.perPage as string) || 12
    const type = query.type as string
    const status = query.status as string
    const search = query.search as string

    const where: any = {
      userId: session.user.id,
      deletedAt: null,
    }

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      }
    }

    const [content, total] = await Promise.all([
      prisma.content.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          type: true,
          status: true,
          thumbnailUrl: true,
          viewCount: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.content.count({ where }),
    ])

    return {
      success: true,
      data: content,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    }
  } catch (error) {
    console.error('Fetch user content error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch content',
    })
  }
})
