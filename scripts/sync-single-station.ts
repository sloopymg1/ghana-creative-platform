/**
 * Sync a single station from AzuraCast
 * Usage: tsx scripts/sync-single-station.ts <station-id> [featured]
 */

import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'

const prisma = new PrismaClient()

const AZURACAST_API_URL = process.env.AZURACAST_API_URL || 'https://a9.asurahosting.com'
const AZURACAST_API_KEY = process.env.AZURACAST_API_KEY || '0174d31ec9f75ba9:7c89a6055fa33edad0afe683b52b13af'

const stationId = parseInt(process.argv[2])
const isFeatured = process.argv[3] === 'featured'

if (!stationId || isNaN(stationId)) {
  console.error('Usage: tsx scripts/sync-single-station.ts <station-id> [featured]')
  console.error('Example: tsx scripts/sync-single-station.ts 503 featured')
  process.exit(1)
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function syncStation() {
  console.log(`\n📻 Syncing station ${stationId}...`)
  console.log(`   Featured: ${isFeatured ? 'Yes ⭐' : 'No'}`)

  try {
    // Add delay to avoid rate limiting
    console.log('   Waiting to avoid rate limit...')
    await sleep(2000)

    const stationRes = await fetch(`${AZURACAST_API_URL}/api/station/${stationId}`, {
      headers: { 'X-API-Key': AZURACAST_API_KEY }
    })

    if (!stationRes.ok) {
      throw new Error(`Station API error: ${stationRes.status} ${stationRes.statusText}`)
    }

    const stationInfo = await stationRes.json()

    await sleep(2000)

    const nowPlayingRes = await fetch(`${AZURACAST_API_URL}/api/nowplaying/${stationId}`, {
      headers: { 'X-API-Key': AZURACAST_API_KEY }
    })

    if (!nowPlayingRes.ok) {
      throw new Error(`NowPlaying API error: ${nowPlayingRes.status} ${nowPlayingRes.statusText}`)
    }

    const nowPlaying = await nowPlayingRes.json()

    const data = {
      azuracastStationId: stationInfo.id,
      azuracastUrl: AZURACAST_API_URL,
      name: stationInfo.name,
      description: stationInfo.description || null,
      slug: slugify(stationInfo.name, { lower: true, strict: true }),
      genre: stationInfo.genre || null,
      streamUrl: stationInfo.listen_url,
      isLive: nowPlaying.live.is_live,
      currentTrack: nowPlaying.now_playing,
      listenerCount: nowPlaying.listeners.current,
      listenerPeak: Math.max(nowPlaying.listeners.current, 0),
      isFeatured,
      lastSyncAt: new Date(),
    }

    const station = await prisma.radioStation.upsert({
      where: { azuracastStationId: stationId },
      create: data,
      update: data,
    })

    console.log('\n✅ Successfully Synced!')
    console.log(`   Name: ${station.name}`)
    console.log(`   ID: ${station.id}`)
    console.log(`   Slug: ${station.slug}`)
    console.log(`   Genre: ${station.genre || 'N/A'}`)
    console.log(`   Live: ${station.isLive ? 'Yes 🔴' : 'No'}`)
    console.log(`   Listeners: ${station.listenerCount}`)
    console.log(`   Featured: ${station.isFeatured ? 'Yes ⭐' : 'No'}`)
    console.log(`   Stream: ${station.streamUrl}`)

    if (station.currentTrack) {
      const track = station.currentTrack as any
      console.log(`   Now Playing: ${track.song?.title || 'Unknown'} - ${track.song?.artist || 'Unknown'}`)
    }

    console.log(`\n🎵 Listen at: http://localhost:3000/stream/radio/${station.id}`)

    return station
  } catch (error: any) {
    console.error('\n❌ Failed to sync station:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

syncStation()
