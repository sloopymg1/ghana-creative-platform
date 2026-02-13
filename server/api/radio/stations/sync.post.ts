export default defineEventHandler(async (event) => {
  // Check authentication
  const session = await requireUserSession(event)

  // Check permission (admin only)
  await requirePermission(event, 'radio.manage')

  const body = await readBody(event)
  const stationIds = body.stationIds as number[] // AzuraCast station IDs

  if (!stationIds || !Array.isArray(stationIds) || stationIds.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'stationIds array is required',
    })
  }

  const results = []

  for (const stationId of stationIds) {
    try {
      const station = await syncStationFromAzuraCast(stationId)
      results.push({
        stationId,
        success: true,
        data: station,
      })
    } catch (error: any) {
      results.push({
        stationId,
        success: false,
        error: error.message,
      })
    }
  }

  return {
    success: true,
    synced: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  }
})
