import { prisma } from '../../../plugins/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20
  const status = query.status as string
  const featured = query.featured === 'true'

  const where: any = {
    isPublic: true,
  }

  if (status) {
    where.status = status
  }

  if (featured) {
    where.isFeatured = true
  }

  const [stations, total] = await Promise.all([
    prisma.radioStation.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { isFeatured: 'desc' },
        { listenerCount: 'desc' },
        { name: 'asc' },
      ],
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.radioStation.count({ where }),
  ])

  return {
    success: true,
    data: stations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
})
