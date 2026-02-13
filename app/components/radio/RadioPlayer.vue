<template>
  <div class="bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- Album Art / Station Logo -->
    <div class="relative h-64 bg-gradient-to-br from-primary-500 to-secondary-500">
      <img
        v-if="currentArt"
        :src="currentArt"
        :alt="station.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="flex items-center justify-center h-full">
        <span class="text-6xl">📻</span>
      </div>

      <!-- Live Indicator -->
      <div v-if="isLive" class="absolute top-4 right-4">
        <span class="flex items-center px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
          <span class="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
          LIVE
        </span>
      </div>

      <!-- Listener Count -->
      <div class="absolute bottom-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full">
        <span class="text-white text-sm">
          👥 {{ listenerCount }} listening
        </span>
      </div>
    </div>

    <!-- Now Playing Info -->
    <div class="p-6">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-1">
          {{ currentTrack?.song?.title || 'Loading...' }}
        </h2>
        <p class="text-lg text-gray-600">
          {{ currentTrack?.song?.artist || station.name }}
        </p>
        <p v-if="currentTrack?.song?.album" class="text-sm text-gray-500">
          {{ currentTrack.song.album }}
        </p>
      </div>

      <!-- Audio Player -->
      <audio
        ref="audioElement"
        :src="station.streamUrl"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @error="handleError"
      ></audio>

      <!-- Controls -->
      <div class="flex items-center justify-center space-x-4">
        <button
          @click="togglePlay"
          class="w-16 h-16 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-full transition"
        >
          <svg v-if="!isPlaying" class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        </button>

        <!-- Volume Control -->
        <div class="flex items-center space-x-2">
          <button @click="toggleMute" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
          </button>
          <input
            v-model="volume"
            type="range"
            min="0"
            max="100"
            class="w-24"
            @input="updateVolume"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  station: any
}>()

const audioElement = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const volume = ref(70)
const isMuted = ref(false)
const currentTrack = ref<any>(null)
const listenerCount = ref(0)
const isLive = ref(false)

const currentArt = computed(() => {
  return currentTrack.value?.song?.art || props.station.coverUrl
})

let nowPlayingInterval: NodeJS.Timeout

onMounted(() => {
  if (audioElement.value) {
    audioElement.value.volume = volume.value / 100
  }

  // Fetch now-playing data
  fetchNowPlaying()

  // Auto-refresh every 30 seconds
  nowPlayingInterval = setInterval(fetchNowPlaying, 30000)
})

onUnmounted(() => {
  if (nowPlayingInterval) {
    clearInterval(nowPlayingInterval)
  }
})

async function fetchNowPlaying() {
  try {
    const response = await $fetch(`/api/radio/nowplaying/${props.station.id}`)
    if (response.success) {
      currentTrack.value = response.data.currentTrack
      listenerCount.value = response.data.listenerCount
      isLive.value = response.data.isLive
    }
  } catch (error) {
    console.error('Failed to fetch now-playing:', error)
  }
}

function togglePlay() {
  if (!audioElement.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    audioElement.value.play()
  }
}

function updateVolume() {
  if (audioElement.value) {
    audioElement.value.volume = volume.value / 100
    isMuted.value = volume.value === 0
  }
}

function toggleMute() {
  if (!audioElement.value) return

  if (isMuted.value) {
    audioElement.value.volume = volume.value / 100
    isMuted.value = false
  } else {
    audioElement.value.volume = 0
    isMuted.value = true
  }
}

function handleError(e: Event) {
  console.error('Audio error:', e)
  isPlaying.value = false
}
</script>
