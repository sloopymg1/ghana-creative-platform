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
  })

  if (!station) {
    throw createError({
      statusCode: 404,
      message: 'Station not found',
    })
  }

  const client = useAzuraCast()
  const schedule = await client.getSchedule(station.azuracastStationId)

  return {
    success: true,
    data: schedule,
  }
})
