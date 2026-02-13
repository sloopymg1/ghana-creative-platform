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

  // Check if cache is fresh (< 30 seconds old)
  const cacheAge = station.lastSyncAt
    ? Date.now() - station.lastSyncAt.getTime()
    : Infinity

  if (cacheAge < 30000 && station.currentTrack) {
    // Return cached data
    return {
      success: true,
      cached: true,
      data: {
        isLive: station.isLive,
        currentTrack: station.currentTrack,
        listenerCount: station.listenerCount,
      },
    }
  }

  // Fetch fresh data
  try {
    const nowPlaying = await updateStationNowPlaying(id)

    return {
      success: true,
      cached: false,
      data: {
        isLive: nowPlaying.live.is_live,
        currentTrack: nowPlaying.now_playing,
        listenerCount: nowPlaying.listeners.current,
      },
    }
  } catch (error) {
    // Fallback to cached data if available
    if (station.currentTrack) {
      return {
        success: true,
        cached: true,
        data: {
          isLive: station.isLive,
          currentTrack: station.currentTrack,
          listenerCount: station.listenerCount,
        },
      }
    }
    throw error
  }
})
