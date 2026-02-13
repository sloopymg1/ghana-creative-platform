import { prisma } from '../../../plugins/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Station ID is required',
    })
  }

  const station = await prisma.radioStation.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  if (!station) {
    throw createError({
      statusCode: 404,
      message: 'Radio station not found',
    })
  }

  return {
    success: true,
    data: station,
  }
})
