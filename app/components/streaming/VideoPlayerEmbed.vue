<template>
  <div class="bg-black rounded-lg overflow-hidden">
    <!-- YouTube Embed -->
    <div v-if="embedType === 'youtube'" :class="aspectRatio">
      <iframe
        :src="`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`"
        class="w-full h-full"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>

    <!-- Vimeo Embed -->
    <div v-else-if="embedType === 'vimeo'" :class="aspectRatio">
      <iframe
        :src="`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`"
        class="w-full h-full"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>

    <!-- Facebook Embed -->
    <div v-else-if="embedType === 'facebook'" :class="aspectRatio">
      <iframe
        :src="`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=false`"
        class="w-full h-full"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>

    <!-- Fallback: Direct Video URL -->
    <div v-else>
      <VideoPlayer
        :video-url="videoUrl"
        :title="title"
        :artist-name="artistName"
        :thumbnail-url="thumbnailUrl"
        :aspect-ratio="aspectRatio"
      />
    </div>

    <!-- Video Info -->
    <div class="bg-gray-900 p-4 text-white">
      <h3 class="font-semibold text-lg">{{ title }}</h3>
      <p class="text-sm text-gray-400">{{ artistName }}</p>
      <p v-if="embedType" class="text-xs text-gray-500 mt-2">
        Source: {{ embedType.charAt(0).toUpperCase() + embedType.slice(1) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

// Detect video platform
const embedType = computed(() => {
  if (props.videoUrl.includes('youtube.com') || props.videoUrl.includes('youtu.be')) {
    return 'youtube'
  } else if (props.videoUrl.includes('vimeo.com')) {
    return 'vimeo'
  } else if (props.videoUrl.includes('facebook.com')) {
    return 'facebook'
  }
  return null
})

// Extract video ID
const videoId = computed(() => {
  if (embedType.value === 'youtube') {
    const match = props.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    return match ? match[1] : ''
  } else if (embedType.value === 'vimeo') {
    const match = props.videoUrl.match(/vimeo\.com\/(\d+)/)
    return match ? match[1] : ''
  }
  return ''
})
</script>
