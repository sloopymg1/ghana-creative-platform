/**
 * AzuraCast API Client
 * Handles all communication with AzuraCast radio server
 */

interface AzuraCastStation {
  id: number
  name: string
  description: string
  genre: string
  url: string
  listen_url: string
  is_public: boolean
  mounts: Array<{
    name: string
    url: string
    format: string
  }>
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
  playing_next: {
    song: {
      title: string
      artist: string
    }
  }
}

export class AzuraCastClient {
  private baseUrl: string
  private apiKey: string
  private cacheTtl: number

  constructor() {
    const config = useRuntimeConfig()
    this.baseUrl = config.azuracast.apiUrl
    this.apiKey = config.azuracast.apiKey
    this.cacheTtl = config.azuracast.cacheTtl || 60
  }

  /**
   * Make authenticated request to AzuraCast API
   */
  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`

    try {
      const response = await $fetch<T>(url, {
        headers: {
          'X-API-Key': this.apiKey,
          'Accept': 'application/json',
        },
        timeout: 10000,
      })

      return response
    } catch (error) {
      console.error('AzuraCast API Error:', error)
      throw createError({
        statusCode: 500,
        message: 'Failed to communicate with radio server',
      })
    }
  }

  /**
   * Get all stations from AzuraCast
   */
  async getStations(): Promise<AzuraCastStation[]> {
    return await this.request<AzuraCastStation[]>('/stations')
  }

  /**
   * Get single station info
   */
  async getStation(stationId: number): Promise<AzuraCastStation> {
    return await this.request<AzuraCastStation>(`/station/${stationId}`)
  }

  /**
   * Get now-playing info for a station
   */
  async getNowPlaying(stationId: number): Promise<NowPlayingResponse> {
    return await this.request<NowPlayingResponse>(`/nowplaying/${stationId}`)
  }

  /**
   * Get station schedule/playlist
   */
  async getSchedule(stationId: number): Promise<any> {
    return await this.request<any>(`/station/${stationId}/schedule`)
  }

  /**
   * Get listener statistics
   */
  async getListeners(stationId: number): Promise<any> {
    return await this.request<any>(`/station/${stationId}/listeners`)
  }
}

/**
 * Create AzuraCast client instance
 */
export function useAzuraCast() {
  return new AzuraCastClient()
}
