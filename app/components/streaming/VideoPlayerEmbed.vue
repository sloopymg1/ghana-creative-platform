<template>
  <div class="bg-black rounded-lg overflow-hidden">
    <!-- YouTube Embed with 16:9 aspect ratio -->
    <div v-if="embedType === 'youtube'" class="relative w-full" style="padding-bottom: 56.25%">
      <iframe
        :src="embedUrl"
        class="absolute top-0 left-0 w-full h-full"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </div>

    <!-- Vimeo Embed with 16:9 aspect ratio -->
    <div v-else-if="embedType === 'vimeo'" class="relative w-full" style="padding-bottom: 56.25%">
      <iframe
        :src="embedUrl"
        class="absolute top-0 left-0 w-full h-full"
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>

    <!-- Facebook Embed with flexible height -->
    <div v-else-if="embedType === 'facebook'" class="relative w-full">
      <iframe
        :src="embedUrl"
        class="w-full"
        style="min-height: 500px; border: none;"
        scrolling="no"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>

    <!-- Fallback: Direct Video URL -->
    <div v-else>
      <video controls class="w-full rounded-lg">
        <source :src="videoUrl" />
        Your browser does not support the video tag.
      </video>
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
    autoplay?: boolean
  }>(),
  {
    autoplay: false,
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
    const match = props.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
    return match ? match[1] : ''
  } else if (embedType.value === 'vimeo') {
    const match = props.videoUrl.match(/vimeo\.com\/(\d+)/)
    return match ? match[1] : ''
  }
  return ''
})

// Generate enhanced embed URL with better parameters
const embedUrl = computed(() => {
  const autoplayParam = props.autoplay ? 1 : 0

  if (embedType.value === 'youtube' && videoId.value) {
    return `https://www.youtube.com/embed/${videoId.value}?` +
      `rel=0&` +                    // Don't show related videos
      `modestbranding=1&` +         // Minimal YouTube branding
      `vq=hd1080&` +                // Prefer HD quality
      `playsinline=1&` +            // Better mobile experience
      `autoplay=${autoplayParam}`
  }

  if (embedType.value === 'facebook') {
    return `https://www.facebook.com/plugins/video.php?` +
      `href=${encodeURIComponent(props.videoUrl)}&` +
      `width=730&` +                // Standard width
      `show_text=false&` +          // Hide post text
      `autoplay=${autoplayParam}&` +
      `mute=0`
  }

  if (embedType.value === 'vimeo' && videoId.value) {
    return `https://player.vimeo.com/video/${videoId.value}?` +
      `title=0&` +                  // Hide title
      `byline=0&` +                 // Hide author
      `portrait=0&` +               // Hide author image
      `autoplay=${autoplayParam}`
  }

  return ''
})
</script>
