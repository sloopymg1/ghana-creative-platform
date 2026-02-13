import { prisma } from '../plugins/prisma'
import slugify from 'slugify'

/**
 * Sync radio station from AzuraCast
 */
export async function syncStationFromAzuraCast(azuracastStationId: number) {
  const client = useAzuraCast()

  try {
    const [stationInfo, nowPlaying] = await Promise.all([
      client.getStation(azuracastStationId),
      client.getNowPlaying(azuracastStationId),
    ])

    const config = useRuntimeConfig()

    const data = {
      azuracastStationId: stationInfo.id,
      azuracastUrl: config.azuracast.apiUrl,
      name: stationInfo.name,
      description: stationInfo.description || null,
      slug: slugify(stationInfo.name, { lower: true, strict: true }),
      genre: stationInfo.genre || null,
      streamUrl: stationInfo.listen_url,
      isLive: nowPlaying.live.is_live,
      currentTrack: nowPlaying.now_playing as any,
      listenerCount: nowPlaying.listeners.current,
      listenerPeak: Math.max(nowPlaying.listeners.current, 0),
      lastSyncAt: new Date(),
    }

    // Upsert station
    const station = await prisma.radioStation.upsert({
      where: { azuracastStationId },
      create: data,
      update: data,
    })

    return station
  } catch (error) {
    console.error(`Failed to sync station ${azuracastStationId}:`, error)
    throw error
  }
}

/**
 * Update now-playing info for all active stations
 */
export async function updateAllStationsNowPlaying() {
  const stations = await prisma.radioStation.findMany({
    where: {
      status: 'ACTIVE',
      syncEnabled: true,
    },
  })

  const results = await Promise.allSettled(
    stations.map(station => updateStationNowPlaying(station.id))
  )

  return {
    total: stations.length,
    success: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length,
  }
}

/**
 * Update single station's now-playing data
 */
export async function updateStationNowPlaying(stationId: string) {
  const station = await prisma.radioStation.findUnique({
    where: { id: stationId },
  })

  if (!station) {
    throw new Error('Station not found')
  }

  const client = useAzuraCast()
  const nowPlaying = await client.getNowPlaying(station.azuracastStationId)

  await prisma.radioStation.update({
    where: { id: stationId },
    data: {
      isLive: nowPlaying.live.is_live,
      currentTrack: nowPlaying.now_playing as any,
      listenerCount: nowPlaying.listeners.current,
      listenerPeak: Math.max(
        station.listenerPeak,
        nowPlaying.listeners.current
      ),
      lastSyncAt: new Date(),
    },
  })

  return nowPlaying
}
