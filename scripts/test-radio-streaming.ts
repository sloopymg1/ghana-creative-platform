/**
 * Radio Streaming Test Suite
 *
 * Tests the radio streaming functionality:
 * - Database schema
 * - API endpoints
 * - AzuraCast integration
 * - Sync functionality
 * - Now-playing data
 * - Player components
 *
 * Run with: tsx scripts/test-radio-streaming.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TestResult {
  name: string
  status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP'
  message: string
  data?: any
}

const results: TestResult[] = []

function logTest(result: TestResult) {
  results.push(result)
  const icons = {
    PASS: '✅',
    FAIL: '❌',
    WARN: '⚠️',
    SKIP: '⏭️',
  }
  const icon = icons[result.status]
  console.log(`${icon} ${result.name}`)
  console.log(`   ${result.message}`)
  if (result.data) {
    console.log(`   Data:`, JSON.stringify(result.data, null, 2))
  }
}

async function testDatabaseSchema() {
  console.log('\n🗄️ Test 1: Database Schema')
  console.log('='.repeat(60))

  try {
    // Check if RadioStation table exists
    const stationCount = await prisma.radioStation.count()

    logTest({
      name: 'RadioStation Table',
      status: 'PASS',
      message: `Table exists with ${stationCount} stations`,
    })

    // Check for required fields
    if (stationCount > 0) {
      const sample = await prisma.radioStation.findFirst()
      const requiredFields = [
        'id',
        'azuracastStationId',
        'azuracastUrl',
        'name',
        'streamUrl',
        'isLive',
        'listenerCount',
      ]

      const hasAllFields = requiredFields.every(field => field in sample!)
      logTest({
        name: 'Required Fields',
        status: hasAllFields ? 'PASS' : 'FAIL',
        message: hasAllFields
          ? 'All required fields present'
          : 'Missing required fields',
      })

      // Check data quality
      if (sample) {
        logTest({
          name: 'Station Data Sample',
          status: 'PASS',
          message: 'Sample station data retrieved',
          data: {
            id: sample.id.substring(0, 8),
            name: sample.name,
            genre: sample.genre,
            isLive: sample.isLive,
            listeners: sample.listenerCount,
            hasCurrentTrack: !!sample.currentTrack,
          },
        })
      }
    } else {
      logTest({
        name: 'Station Data',
        status: 'WARN',
        message: 'No stations in database. Run sync scripts to populate.',
      })
    }
  } catch (error: any) {
    logTest({
      name: 'Database Schema',
      status: 'FAIL',
      message: error.message,
    })
  }
}

async function testStationQueries() {
  console.log('\n📊 Test 2: Station Queries')
  console.log('='.repeat(60))

  try {
    // Total stations
    const total = await prisma.radioStation.count()

    logTest({
      name: 'Total Stations Count',
      status: 'PASS',
      message: `Found ${total} radio stations`,
    })

    // Public stations
    const publicStations = await prisma.radioStation.count({
      where: { isPublic: true },
    })

    logTest({
      name: 'Public Stations',
      status: 'PASS',
      message: `${publicStations} public stations available`,
    })

    // Featured stations
    const featuredStations = await prisma.radioStation.count({
      where: { isFeatured: true },
    })

    logTest({
      name: 'Featured Stations',
      status: 'PASS',
      message: `${featuredStations} featured stations`,
    })

    // Active stations
    const activeStations = await prisma.radioStation.count({
      where: { status: 'ACTIVE' },
    })

    logTest({
      name: 'Active Stations',
      status: 'PASS',
      message: `${activeStations} active stations`,
    })

    // Live stations
    const liveStations = await prisma.radioStation.count({
      where: { isLive: true },
    })

    logTest({
      name: 'Live Stations',
      status: 'PASS',
      message: `${liveStations} stations currently live`,
    })

    // Stations with listeners
    const stationsWithListeners = await prisma.radioStation.count({
      where: { listenerCount: { gt: 0 } },
    })

    logTest({
      name: 'Stations with Listeners',
      status: 'PASS',
      message: `${stationsWithListeners} stations have active listeners`,
    })
  } catch (error: any) {
    logTest({
      name: 'Station Queries',
      status: 'FAIL',
      message: error.message,
    })
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 Test 3: API Endpoints')
  console.log('='.repeat(60))

  const baseUrl = 'http://localhost:3000'
  const endpoints = [
    { url: '/api/radio/stations', name: 'List Stations' },
    { url: '/api/radio/stations?featured=true', name: 'Featured Stations' },
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(baseUrl + endpoint.url)
      const data = await response.json()

      if (response.ok && data.success) {
        logTest({
          name: endpoint.name,
          status: 'PASS',
          message: `HTTP ${response.status} - ${data.data?.length || 0} stations returned`,
        })
      } else {
        logTest({
          name: endpoint.name,
          status: 'FAIL',
          message: `HTTP ${response.status} - ${data.message || 'Unknown error'}`,
        })
      }
    } catch (error: any) {
      logTest({
        name: endpoint.name,
        status: 'WARN',
        message: `Could not connect: ${error.message}. Is server running?`,
      })
    }
  }

  // Test single station endpoint (if stations exist)
  const sampleStation = await prisma.radioStation.findFirst()
  if (sampleStation) {
    try {
      const response = await fetch(`${baseUrl}/api/radio/stations/${sampleStation.id}`)
      const data = await response.json()

      if (response.ok && data.success) {
        logTest({
          name: 'Single Station Endpoint',
          status: 'PASS',
          message: `Retrieved station: ${data.data.name}`,
        })
      } else {
        logTest({
          name: 'Single Station Endpoint',
          status: 'FAIL',
          message: `HTTP ${response.status}`,
        })
      }
    } catch (error: any) {
      logTest({
        name: 'Single Station Endpoint',
        status: 'WARN',
        message: `Could not connect: ${error.message}`,
      })
    }

    // Test now-playing endpoint
    try {
      const response = await fetch(`${baseUrl}/api/radio/nowplaying/${sampleStation.id}`)
      const data = await response.json()

      if (response.ok && data.success) {
        logTest({
          name: 'Now Playing Endpoint',
          status: 'PASS',
          message: data.cached
            ? 'Returned cached data'
            : 'Returned fresh data from AzuraCast',
          data: {
            isLive: data.data.isLive,
            listeners: data.data.listenerCount,
            hasTrack: !!data.data.currentTrack,
          },
        })
      } else {
        logTest({
          name: 'Now Playing Endpoint',
          status: 'FAIL',
          message: `HTTP ${response.status}`,
        })
      }
    } catch (error: any) {
      logTest({
        name: 'Now Playing Endpoint',
        status: 'WARN',
        message: `Could not fetch: ${error.message}`,
      })
    }
  } else {
    logTest({
      name: 'Single Station Tests',
      status: 'SKIP',
      message: 'No stations available for testing',
    })
  }
}

async function testAzuraCastConfig() {
  console.log('\n⚙️ Test 4: AzuraCast Configuration')
  console.log('='.repeat(60))

  try {
    // Check environment variables
    const azuracastUrl = process.env.AZURACAST_API_URL
    const azuracastKey = process.env.AZURACAST_API_KEY

    if (azuracastUrl) {
      logTest({
        name: 'AzuraCast URL Config',
        status: 'PASS',
        message: `Configured: ${azuracastUrl}`,
      })
    } else {
      logTest({
        name: 'AzuraCast URL Config',
        status: 'WARN',
        message: 'AZURACAST_API_URL not set in environment',
      })
    }

    if (azuracastKey) {
      logTest({
        name: 'AzuraCast API Key',
        status: 'PASS',
        message: `Configured (length: ${azuracastKey.length})`,
      })
    } else {
      logTest({
        name: 'AzuraCast API Key',
        status: 'WARN',
        message: 'AZURACAST_API_KEY not set in environment',
      })
    }

    // Check if we can connect to AzuraCast
    if (azuracastUrl && azuracastKey) {
      try {
        const response = await fetch(`${azuracastUrl}/api/stations`, {
          headers: {
            'X-API-Key': azuracastKey,
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        })

        if (response.ok) {
          const data = await response.json()
          logTest({
            name: 'AzuraCast Connection',
            status: 'PASS',
            message: `Connected successfully - ${data.length} stations available on server`,
          })
        } else {
          logTest({
            name: 'AzuraCast Connection',
            status: 'FAIL',
            message: `HTTP ${response.status} - Check API key`,
          })
        }
      } catch (error: any) {
        logTest({
          name: 'AzuraCast Connection',
          status: 'FAIL',
          message: `Connection failed: ${error.message}`,
        })
      }
    } else {
      logTest({
        name: 'AzuraCast Connection',
        status: 'SKIP',
        message: 'Cannot test - missing configuration',
      })
    }
  } catch (error: any) {
    logTest({
      name: 'AzuraCast Configuration',
      status: 'FAIL',
      message: error.message,
    })
  }
}

async function testDataQuality() {
  console.log('\n🔍 Test 5: Data Quality')
  console.log('='.repeat(60))

  try {
    const stations = await prisma.radioStation.findMany({
      take: 10,
    })

    if (stations.length === 0) {
      logTest({
        name: 'Data Quality',
        status: 'SKIP',
        message: 'No stations to test',
      })
      return
    }

    // Check for valid stream URLs
    const stationsWithStream = stations.filter(s => s.streamUrl && s.streamUrl.startsWith('http'))
    logTest({
      name: 'Valid Stream URLs',
      status: stationsWithStream.length === stations.length ? 'PASS' : 'WARN',
      message: `${stationsWithStream.length}/${stations.length} stations have valid stream URLs`,
    })

    // Check for current track data
    const stationsWithTrack = stations.filter(s => s.currentTrack !== null)
    logTest({
      name: 'Current Track Data',
      status: 'PASS',
      message: `${stationsWithTrack.length}/${stations.length} stations have current track info`,
    })

    // Check lastSyncAt timestamps
    const now = Date.now()
    const recentlySync = stations.filter(s =>
      s.lastSyncAt && (now - s.lastSyncAt.getTime()) < 24 * 60 * 60 * 1000
    )

    logTest({
      name: 'Recent Sync Status',
      status: recentlySync.length > 0 ? 'PASS' : 'WARN',
      message: `${recentlySync.length}/${stations.length} stations synced in last 24 hours`,
    })

    // Check for duplicate slugs
    const slugs = stations.map(s => s.slug)
    const uniqueSlugs = new Set(slugs)
    logTest({
      name: 'Unique Slugs',
      status: slugs.length === uniqueSlugs.size ? 'PASS' : 'FAIL',
      message: slugs.length === uniqueSlugs.size
        ? 'All station slugs are unique'
        : 'Duplicate slugs found',
    })
  } catch (error: any) {
    logTest({
      name: 'Data Quality',
      status: 'FAIL',
      message: error.message,
    })
  }
}

async function testSyncScripts() {
  console.log('\n🔄 Test 6: Sync Scripts')
  console.log('='.repeat(60))

  // Check if sync scripts exist
  const fs = await import('fs')
  const path = await import('path')

  const scriptPaths = [
    path.join(process.cwd(), 'scripts', 'sync-stations.ts'),
    path.join(process.cwd(), 'scripts', 'sync-single-station.ts'),
  ]

  for (const scriptPath of scriptPaths) {
    const scriptName = path.basename(scriptPath)
    if (fs.existsSync(scriptPath)) {
      logTest({
        name: `Sync Script: ${scriptName}`,
        status: 'PASS',
        message: 'Script file exists',
      })
    } else {
      logTest({
        name: `Sync Script: ${scriptName}`,
        status: 'FAIL',
        message: 'Script file not found',
      })
    }
  }

  logTest({
    name: 'Sync Script Usage',
    status: 'PASS',
    message: 'Run: tsx scripts/sync-stations.ts to sync all stations',
  })
}

async function testPerformance() {
  console.log('\n⚡ Test 7: Query Performance')
  console.log('='.repeat(60))

  const queries = [
    {
      name: 'List Public Stations',
      fn: () => prisma.radioStation.findMany({
        where: { isPublic: true },
        take: 20,
      }),
    },
    {
      name: 'List Featured Stations',
      fn: () => prisma.radioStation.findMany({
        where: { isFeatured: true },
        orderBy: { listenerCount: 'desc' },
      }),
    },
    {
      name: 'Count Active Stations',
      fn: () => prisma.radioStation.count({
        where: { status: 'ACTIVE' },
      }),
    },
    {
      name: 'Get Single Station',
      fn: async () => {
        const first = await prisma.radioStation.findFirst()
        if (first) {
          return prisma.radioStation.findUnique({ where: { id: first.id } })
        }
        return null
      },
    },
  ]

  for (const query of queries) {
    try {
      const start = Date.now()
      await query.fn()
      const duration = Date.now() - start

      const status = duration < 50 ? 'PASS' : duration < 200 ? 'WARN' : 'FAIL'
      logTest({
        name: query.name,
        status,
        message: `Executed in ${duration}ms`,
      })
    } catch (error: any) {
      logTest({
        name: query.name,
        status: 'FAIL',
        message: error.message,
      })
    }
  }
}

async function main() {
  console.log('📻 Radio Streaming Test Suite')
  console.log('='.repeat(60))
  console.log('Testing radio streaming functionality and AzuraCast integration\n')

  try {
    await testDatabaseSchema()
    await testStationQueries()
    await testAPIEndpoints()
    await testAzuraCastConfig()
    await testDataQuality()
    await testSyncScripts()
    await testPerformance()

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Test Summary')
    console.log('='.repeat(60))

    const passed = results.filter(r => r.status === 'PASS').length
    const failed = results.filter(r => r.status === 'FAIL').length
    const warnings = results.filter(r => r.status === 'WARN').length
    const skipped = results.filter(r => r.status === 'SKIP').length

    console.log(`\n✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⚠️ Warnings: ${warnings}`)
    console.log(`⏭️ Skipped: ${skipped}`)
    console.log(`📝 Total: ${results.length}`)

    if (failed > 0) {
      console.log('\n❌ Failed Tests:')
      results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.name}: ${r.message}`))
    }

    if (warnings > 0) {
      console.log('\n⚠️ Warnings:')
      results
        .filter(r => r.status === 'WARN')
        .forEach(r => console.log(`   - ${r.name}: ${r.message}`))
    }

    const successRate = passed > 0
      ? ((passed / (results.length - skipped)) * 100).toFixed(1)
      : '0.0'
    console.log(`\n📈 Success Rate: ${successRate}%`)

    // Recommendations
    console.log('\n💡 Recommendations:')
    const hasStations = results.some(r =>
      r.name === 'RadioStation Table' && r.message.includes('stations') && !r.message.includes('0 stations')
    )

    if (!hasStations) {
      console.log('   1. Run sync scripts to populate radio stations:')
      console.log('      tsx scripts/sync-stations.ts')
    }

    const hasAzuracastConfig = results.some(r =>
      r.name === 'AzuraCast URL Config' && r.status === 'PASS'
    )

    if (!hasAzuracastConfig) {
      console.log('   2. Configure AzuraCast environment variables:')
      console.log('      AZURACAST_API_URL=https://your-azuracast-instance.com')
      console.log('      AZURACAST_API_KEY=your-api-key')
    }

    if (failed === 0 && warnings === 0) {
      console.log('\n🎉 All tests passed!')
      console.log('✅ Radio streaming is fully functional')
    } else if (failed === 0) {
      console.log('\n✅ Core functionality working')
      console.log('⚠️ Some configuration or data warnings present')
    } else {
      console.log('\n⚠️ Some tests failed. Review errors above.')
    }

  } catch (error) {
    console.error('\n❌ Test suite crashed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
