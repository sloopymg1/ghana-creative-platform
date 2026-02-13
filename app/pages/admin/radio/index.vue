<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Radio Station Management</h1>
        <button
          @click="showSyncModal = true"
          class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Sync from AzuraCast
        </button>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="text-center py-12">
        <p class="text-gray-600">Loading stations...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">Failed to load stations</p>
      </div>

      <!-- Stations Table -->
      <div v-else class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listeners</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Sync</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="station in stations" :key="station.id">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div>
                    <div class="font-medium text-gray-900">{{ station.name }}</div>
                    <div class="text-sm text-gray-500">{{ station.genre || 'Various' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="[
                  'px-2 py-1 text-xs font-semibold rounded-full',
                  station.isLive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                ]">
                  {{ station.isLive ? 'Live' : 'Offline' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ station.listenerCount }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(station.lastSyncAt) }}
              </td>
              <td class="px-6 py-4">
                <button
                  @click="syncStation(station.azuracastStationId)"
                  :disabled="syncing"
                  class="px-3 py-1 text-sm bg-secondary-600 text-white rounded hover:bg-secondary-700 disabled:opacity-50"
                >
                  {{ syncing ? 'Syncing...' : 'Sync' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="stations.length === 0" class="text-center py-12">
          <span class="text-6xl mb-4 block">📻</span>
          <p class="text-xl text-gray-600 mb-4">No radio stations configured yet</p>
          <button
            @click="showSyncModal = true"
            class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Sync from AzuraCast
          </button>
        </div>
      </div>

      <!-- Sync Modal -->
      <div v-if="showSyncModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Sync Stations from AzuraCast</h3>
          <p class="text-gray-600 mb-4">
            Enter the AzuraCast station IDs to sync (comma-separated):
          </p>
          <input
            v-model="stationIdsInput"
            type="text"
            placeholder="e.g., 1, 2, 3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
          />
          <div class="flex justify-end space-x-3">
            <button
              @click="showSyncModal = false"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              @click="syncStations"
              :disabled="syncing || !stationIdsInput"
              class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {{ syncing ? 'Syncing...' : 'Sync Stations' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  // Note: In production, add admin middleware
})

const showSyncModal = ref(false)
const stationIdsInput = ref('')
const syncing = ref(false)

const { data, pending, error, refresh } = await useFetch('/api/radio/stations', {
  query: { limit: 100 },
})

const stations = computed(() => data.value?.data || [])

function formatDate(date: string | null) {
  if (!date) return 'Never'
  return new Date(date).toLocaleString()
}

async function syncStation(azuracastStationId: number) {
  syncing.value = true
  try {
    await $fetch('/api/radio/stations/sync', {
      method: 'POST',
      body: { stationIds: [azuracastStationId] },
    })
    await refresh()
  } catch (error: any) {
    console.error('Sync failed:', error)
    alert('Failed to sync station: ' + (error.message || 'Unknown error'))
  } finally {
    syncing.value = false
  }
}

async function syncStations() {
  const ids = stationIdsInput.value
    .split(',')
    .map(id => parseInt(id.trim()))
    .filter(id => !isNaN(id))

  if (ids.length === 0) {
    alert('Please enter valid station IDs')
    return
  }

  syncing.value = true
  try {
    await $fetch('/api/radio/stations/sync', {
      method: 'POST',
      body: { stationIds: ids },
    })
    showSyncModal.value = false
    stationIdsInput.value = ''
    await refresh()
  } catch (error: any) {
    console.error('Sync failed:', error)
    alert('Failed to sync stations: ' + (error.message || 'Unknown error'))
  } finally {
    syncing.value = false
  }
}
</script>
