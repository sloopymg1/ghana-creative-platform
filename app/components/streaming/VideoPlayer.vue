<template>
  <div class="bg-black rounded-lg overflow-hidden">
    <!-- Video Element -->
    <div class="relative" :class="aspectRatio">
      <video
        ref="videoElement"
        :src="videoUrl"
        :poster="thumbnailUrl"
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        class="w-full h-full"
        @click="togglePlay"
      ></video>

      <!-- Play Overlay -->
      <div
        v-if="!isPlaying && !isControlsVisible"
        class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
        @click="togglePlay"
      >
        <div class="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
          <svg class="w-10 h-10 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        </div>
      </div>

      <!-- Controls Overlay -->
      <div
        v-show="isControlsVisible"
        class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4"
        @mousemove="showControls"
        @mouseleave="hideControls"
      >
        <!-- Progress Bar -->
        <div class="mb-3">
          <div
            class="h-1 bg-white bg-opacity-30 rounded-full cursor-pointer hover:h-2 transition-all"
            @click="seek"
          >
            <div
              class="h-full bg-primary-500 rounded-full"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center justify-between text-white">
          <div class="flex items-center space-x-3">
            <!-- Play/Pause -->
            <button
              @click="togglePlay"
              class="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <svg v-if="!isPlaying" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
              </svg>
            </button>

            <!-- Volume -->
            <div class="flex items-center space-x-2">
              <button @click="toggleMute" class="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors">
                <svg v-if="volume > 0" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z" />
                  <path d="M13.829 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.28 6.22a.75.75 0 10-1.06 1.06L15.44 8.5l-1.22 1.22a.75.75 0 001.06 1.06l1.22-1.22 1.22 1.22a.75.75 0 001.06-1.06L17.56 8.5l1.22-1.22a.75.75 0 00-1.06-1.06l-1.22 1.22-1.22-1.22z" />
                </svg>
              </button>
              <input
                v-model.number="volume"
                type="range"
                min="0"
                max="100"
                class="w-16 h-1 bg-white bg-opacity-30 rounded-lg appearance-none cursor-pointer"
                @input="updateVolume"
              />
            </div>

            <!-- Time -->
            <span class="text-sm">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
          </div>

          <div class="flex items-center space-x-3">
            <!-- Fullscreen -->
            <button
              @click="toggleFullscreen"
              class="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <svg v-if="!isFullscreen" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.707 6.293a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L8 4.586V8a1 1 0 01-2 0V4.586L4.293 6.293a1 1 0 01-1.414 0zM14.293 6.293a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L18 4.586V8a1 1 0 01-2 0V4.586l-1.707 1.707a1 1 0 01-1.414 0zM3.707 13.707a1 1 0 010 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L8 15.414V12a1 1 0 00-2 0v3.414l-1.707-1.707a1 1 0 00-1.414 0zM14.293 13.707a1 1 0 010 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L18 15.414V12a1 1 0 00-2 0v3.414l-1.707-1.707a1 1 0 00-1.414 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Info -->
    <div class="bg-gray-900 p-4 text-white">
      <h3 class="font-semibold text-lg">{{ title }}</h3>
      <p class="text-sm text-gray-400">{{ artistName }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{
    videoUrl: string
    title: string
    artistName: string
    thumbnailUrl?: string
    aspectRatio?: string
  }>(),
  {
    aspectRatio: 'aspect-video',
  }
)

const videoElement = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(70)
const isControlsVisible = ref(false)
const isFullscreen = ref(false)
let controlsTimeout: NodeJS.Timeout | null = null

const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

function togglePlay() {
  if (!videoElement.value) return

  if (isPlaying.value) {
    videoElement.value.pause()
  } else {
    videoElement.value.play()
  }
}

function seek(event: MouseEvent) {
  if (!videoElement.value) return

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  videoElement.value.currentTime = percent * duration.value
}

function onTimeUpdate() {
  if (videoElement.value) {
    currentTime.value = videoElement.value.currentTime
  }
}

function onLoadedMetadata() {
  if (videoElement.value) {
    duration.value = videoElement.value.duration
  }
}

function onEnded() {
  isPlaying.value = false
  currentTime.value = 0
}

function toggleMute() {
  if (volume.value > 0) {
    volume.value = 0
  } else {
    volume.value = 70
  }
  updateVolume()
}

function updateVolume() {
  if (videoElement.value) {
    videoElement.value.volume = volume.value / 100
  }
}

function toggleFullscreen() {
  if (!videoElement.value) return

  if (!document.fullscreenElement) {
    videoElement.value.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

function showControls() {
  isControlsVisible.value = true
  if (controlsTimeout) {
    clearTimeout(controlsTimeout)
  }
  controlsTimeout = setTimeout(() => {
    if (isPlaying.value) {
      isControlsVisible.value = false
    }
  }, 3000)
}

function hideControls() {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout)
  }
  if (isPlaying.value) {
    isControlsVisible.value = false
  }
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  if (videoElement.value) {
    videoElement.value.volume = volume.value / 100
  }

  // Show controls initially
  showControls()
})

onUnmounted(() => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout)
  }
})
</script>
