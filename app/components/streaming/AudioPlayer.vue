<template>
  <div class="bg-white rounded-lg shadow-md p-4">
    <!-- Track Info -->
    <div class="flex items-center mb-4">
      <img
        v-if="thumbnailUrl"
        :src="thumbnailUrl"
        :alt="title"
        class="w-16 h-16 rounded-md object-cover"
      />
      <div
        v-else
        class="w-16 h-16 rounded-md bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center"
      >
        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
        </svg>
      </div>
      <div class="ml-4 flex-1">
        <h3 class="font-semibold text-gray-900">{{ title }}</h3>
        <p class="text-sm text-gray-600">{{ artistName }}</p>
      </div>
    </div>

    <!-- Audio Element -->
    <audio
      ref="audioElement"
      :src="audioUrl"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      class="hidden"
    ></audio>

    <!-- Progress Bar -->
    <div class="mb-4">
      <div
        class="h-2 bg-gray-200 rounded-full cursor-pointer"
        @click="seek"
      >
        <div
          class="h-full bg-primary-600 rounded-full transition-all"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <div class="flex justify-between text-xs text-gray-500 mt-1">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex items-center justify-center space-x-4">
      <!-- Previous Button -->
      <button
        v-if="showPrevNext"
        @click="$emit('previous')"
        class="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <svg class="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
        </svg>
      </button>

      <!-- Play/Pause Button -->
      <button
        @click="togglePlay"
        class="p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors"
      >
        <svg v-if="!isPlaying" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
        <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
        </svg>
      </button>

      <!-- Next Button -->
      <button
        v-if="showPrevNext"
        @click="$emit('next')"
        class="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <svg class="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
        </svg>
      </button>

      <!-- Volume Control -->
      <div class="flex items-center space-x-2">
        <button @click="toggleMute" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg v-if="volume > 0" class="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z" />
            <path d="M13.829 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z" />
          </svg>
          <svg v-else class="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.28 6.22a.75.75 0 10-1.06 1.06L15.44 8.5l-1.22 1.22a.75.75 0 001.06 1.06l1.22-1.22 1.22 1.22a.75.75 0 001.06-1.06L17.56 8.5l1.22-1.22a.75.75 0 00-1.06-1.06l-1.22 1.22-1.22-1.22z" />
          </svg>
        </button>
        <input
          v-model.number="volume"
          type="range"
          min="0"
          max="100"
          class="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          @input="updateVolume"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  audioUrl: string
  title: string
  artistName: string
  thumbnailUrl?: string
  showPrevNext?: boolean
}>()

defineEmits<{
  previous: []
  next: []
}>()

const audioElement = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(70)

const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

function togglePlay() {
  if (!audioElement.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    audioElement.value.play()
  }
}

function seek(event: MouseEvent) {
  if (!audioElement.value) return

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  audioElement.value.currentTime = percent * duration.value
}

function onTimeUpdate() {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime
  }
}

function onLoadedMetadata() {
  if (audioElement.value) {
    duration.value = audioElement.value.duration
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
  if (audioElement.value) {
    audioElement.value.volume = volume.value / 100
  }
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  if (audioElement.value) {
    audioElement.value.volume = volume.value / 100
  }
})
</script>
