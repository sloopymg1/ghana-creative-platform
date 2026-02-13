/**
 * Script to sync radio stations from AzuraCast
 * Usage: tsx scripts/sync-stations.ts
 */

import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'

const prisma = new PrismaClient()

// AzuraCast configuration
const AZURACAST_API_URL = process.env.AZURACAST_API_URL || 'https://a9.asurahosting.com'
const AZURACAST_API_KEY = process.env.AZURACAST_API_KEY || '0174d31ec9f75ba9:7c89a6055fa33edad0afe683b52b13af'

// Station IDs to sync (add more as needed)
const STATION_IDS_TO_SYNC = [1, 3, 503]

// Featured station IDs
const FEATURED_STATION_IDS = [1, 503]

interface AzuraCastStation {
  id: number
  name: string
  description: string
  genre: string
  url: string
  listen_url: string
  is_public: boolean
}

interface NowPlayingResponse {
  station: {
    id: number
    name: string
    listen_url: string
  }
  listeners: {
    total: number
    unique: number
    current: number
  }
  live: {
    is_live: boolean
    streamer_name: string
  }
  now_playing: {
    song: {
      title: string
      artist: string
      album: string
      art: string
    }
    duration: number
    elapsed: number
  }
}

async function fetchFromAzuraCast<T>(endpoint: string): Promise<T> {
  const url = `${AZURACAST_API_URL}/api${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        'X-API-Key': AZURACAST_API_KEY,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`AzuraCast API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error)
    throw error
  }
}

async function syncStation(stationId: number) {
  console.log(`\n📻 Syncing station ${stationId}...`)

  try {
    // Fetch station info and now-playing data
    const [stationInfo, nowPlaying] = await Promise.all([
      fetchFromAzuraCast<AzuraCastStation>(`/station/${stationId}`),
      fetchFromAzuraCast<NowPlayingResponse>(`/nowplaying/${stationId}`),
    ])

    const isFeatured = FEATURED_STATION_IDS.includes(stationId)

    const data = {
      azuracastStationId: stationInfo.id,
      azuracastUrl: AZURACAST_API_URL,
      name: stationInfo.name,
      description: stationInfo.description || null,
      slug: slugify(stationInfo.name, { lower: true, strict: true }),
      genre: stationInfo.genre || null,
      streamUrl: stationInfo.listen_url,
      isLive: nowPlaying.live.is_live,
      currentTrack: nowPlaying.now_playing as any,
      listenerCount: nowPlaying.listeners.current,
      listenerPeak: Math.max(nowPlaying.listeners.current, 0),
      isFeatured,
      lastSyncAt: new Date(),
    }

    // Upsert station
    const station = await prisma.radioStation.upsert({
      where: { azuracastStationId: stationId },
      create: data,
      update: data,
    })

    console.log(`✅ Synced: ${station.name}`)
    console.log(`   - Slug: ${station.slug}`)
    console.log(`   - Live: ${station.isLive ? 'Yes' : 'No'}`)
    console.log(`   - Listeners: ${station.listenerCount}`)
    console.log(`   - Featured: ${station.isFeatured ? 'Yes ⭐' : 'No'}`)

    if (station.currentTrack) {
      const track = station.currentTrack as any
      console.log(`   - Now Playing: ${track.song?.title || 'Unknown'} - ${track.song?.artist || 'Unknown'}`)
    }

    return station
  } catch (error) {
    console.error(`❌ Failed to sync station ${stationId}:`, error)
    throw error
  }
}

async function main() {
  console.log('🎵 Ghana Creative Platform - AzuraCast Station Sync')
  console.log('================================================\n')
  console.log(`AzuraCast URL: ${AZURACAST_API_URL}`)
  console.log(`Syncing ${STATION_IDS_TO_SYNC.length} stations...`)
  console.log(`Featured stations: ${FEATURED_STATION_IDS.join(', ')}`)

  const results = {
    success: 0,
    failed: 0,
    stations: [] as any[],
  }

  // Sync each station
  for (const stationId of STATION_IDS_TO_SYNC) {
    try {
      const station = await syncStation(stationId)
      results.success++
      results.stations.push(station)
    } catch (error) {
      results.failed++
    }
  }

  console.log('\n================================================')
  console.log('✨ Sync Complete!')
  console.log(`✅ Success: ${results.success}`)
  console.log(`❌ Failed: ${results.failed}`)

  if (results.stations.length > 0) {
    console.log('\n📻 Synced Stations:')
    results.stations.forEach(station => {
      console.log(`   - ${station.name} (ID: ${station.id})`)
      console.log(`     URL: http://localhost:3000/stream/radio/${station.id}`)
    })
  }

  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
