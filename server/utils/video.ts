/**
 * Video streaming utilities for YouTube, Facebook, and Vimeo
 */

export interface VideoMetadata {
  platform: 'youtube' | 'facebook' | 'vimeo' | 'unknown'
  videoId: string | null
  isValid: boolean
}

/**
 * Validate and extract metadata from video URL
 */
export function parseVideoUrl(url: string): VideoMetadata {
  if (!url) {
    return { platform: 'unknown', videoId: null, isValid: false }
  }

  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern)
    if (match) {
      return { platform: 'youtube', videoId: match[1], isValid: true }
    }
  }

  // Facebook patterns
  const facebookPattern = /facebook\.com\/.*\/videos\/(\d+)/
  const fbMatch = url.match(facebookPattern)
  if (fbMatch || url.includes('facebook.com')) {
    return {
      platform: 'facebook',
      videoId: fbMatch ? fbMatch[1] : null,
      isValid: true
    }
  }

  // Vimeo pattern
  const vimeoPattern = /vimeo\.com\/(\d+)/
  const vimeoMatch = url.match(vimeoPattern)
  if (vimeoMatch) {
    return { platform: 'vimeo', videoId: vimeoMatch[1], isValid: true }
  }

  return { platform: 'unknown', videoId: null, isValid: false }
}

/**
 * Validate video URL for content type VIDEO
 */
export function validateVideoUrl(url: string, contentType: string): boolean {
  if (contentType !== 'VIDEO') {
    return true // Only validate for VIDEO type
  }

  if (!url) {
    return false // VIDEO type requires externalUrl
  }

  const metadata = parseVideoUrl(url)
  return metadata.isValid
}

/**
 * Extract video ID from URL based on platform
 */
export function extractVideoId(url: string): string | null {
  const metadata = parseVideoUrl(url)
  return metadata.videoId
}

/**
 * Get embed URL for a video based on platform
 */
export function getEmbedUrl(url: string, options: {
  autoplay?: boolean
  controls?: boolean
  modestBranding?: boolean
} = {}): string | null {
  const metadata = parseVideoUrl(url)

  if (!metadata.isValid || !metadata.videoId) {
    return null
  }

  const { autoplay = false, controls = true, modestBranding = true } = options

  switch (metadata.platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${metadata.videoId}?` +
        `rel=0&` +
        `modestbranding=${modestBranding ? 1 : 0}&` +
        `controls=${controls ? 1 : 0}&` +
        `vq=hd1080&` +
        `playsinline=1&` +
        `autoplay=${autoplay ? 1 : 0}`

    case 'facebook':
      return `https://www.facebook.com/plugins/video.php?` +
        `href=${encodeURIComponent(url)}&` +
        `width=730&` +
        `show_text=false&` +
        `autoplay=${autoplay ? 1 : 0}&` +
        `mute=0`

    case 'vimeo':
      return `https://player.vimeo.com/video/${metadata.videoId}?` +
        `title=0&` +
        `byline=0&` +
        `portrait=0&` +
        `autoplay=${autoplay ? 1 : 0}`

    default:
      return null
  }
}
