export function useRadio() {
  const stations = useState<any[]>('radio-stations', () => [])
  const currentStation = useState<any>('current-station', () => null)

  async function fetchStations() {
    const { data } = await useFetch('/api/radio/stations')
    if (data.value?.success) {
      stations.value = data.value.data
    }
  }

  async function fetchStation(id: string) {
    const { data } = await useFetch(`/api/radio/stations/${id}`)
    if (data.value?.success) {
      currentStation.value = data.value.data
    }
    return data.value?.data
  }

  async function fetchNowPlaying(id: string) {
    const { data } = await useFetch(`/api/radio/nowplaying/${id}`)
    return data.value?.data
  }

  return {
    stations,
    currentStation,
    fetchStations,
    fetchStation,
    fetchNowPlaying,
  }
}
