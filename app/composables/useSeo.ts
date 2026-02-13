/**
 * SEO and Open Graph meta tags composable
 */
export function useSeo() {
  function setVideoMeta(video: {
    title: string
    description?: string
    thumbnailUrl?: string
    externalUrl?: string
    duration?: number
  }) {
    const siteName = 'Ghana Creative Arts Platform'
    const siteUrl = 'https://ghana-creative-arts.com' // Update with actual domain

    useHead({
      title: video.title,
      meta: [
        // Open Graph - Basic
        { property: 'og:type', content: 'video.other' },
        { property: 'og:site_name', content: siteName },
        { property: 'og:title', content: video.title },
        { property: 'og:description', content: video.description || '' },
        { property: 'og:image', content: video.thumbnailUrl || '' },

        // Open Graph - Video
        { property: 'og:video', content: video.externalUrl || '' },
        { property: 'og:video:url', content: video.externalUrl || '' },
        { property: 'og:video:secure_url', content: video.externalUrl || '' },
        { property: 'og:video:type', content: 'text/html' },
        { property: 'og:video:width', content: '1280' },
        { property: 'og:video:height', content: '720' },

        // Twitter Card
        { name: 'twitter:card', content: 'player' },
        { name: 'twitter:site', content: '@GhanaCreativeArts' }, // Update with actual handle
        { name: 'twitter:title', content: video.title },
        { name: 'twitter:description', content: video.description || '' },
        { name: 'twitter:image', content: video.thumbnailUrl || '' },
        { name: 'twitter:player', content: video.externalUrl || '' },
        { name: 'twitter:player:width', content: '1280' },
        { name: 'twitter:player:height', content: '720' },
      ],
    })
  }

  function setAudioMeta(audio: {
    title: string
    description?: string
    thumbnailUrl?: string
    audioUrl?: string
    artistName?: string
    duration?: number
  }) {
    const siteName = 'Ghana Creative Arts Platform'

    useHead({
      title: audio.title,
      meta: [
        // Open Graph - Basic
        { property: 'og:type', content: 'music.song' },
        { property: 'og:site_name', content: siteName },
        { property: 'og:title', content: audio.title },
        { property: 'og:description', content: audio.description || '' },
        { property: 'og:image', content: audio.thumbnailUrl || '' },

        // Open Graph - Music
        { property: 'og:audio', content: audio.audioUrl || '' },
        { property: 'og:audio:type', content: 'audio/mpeg' },
        { property: 'music:duration', content: audio.duration?.toString() || '' },
        { property: 'music:musician', content: audio.artistName || '' },

        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: audio.title },
        { name: 'twitter:description', content: audio.description || '' },
        { name: 'twitter:image', content: audio.thumbnailUrl || '' },
      ],
    })
  }

  function setDefaultMeta(page: {
    title: string
    description?: string
    image?: string
  }) {
    const siteName = 'Ghana Creative Arts Platform'

    useHead({
      title: page.title,
      meta: [
        { name: 'description', content: page.description || '' },

        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: siteName },
        { property: 'og:title', content: page.title },
        { property: 'og:description', content: page.description || '' },
        { property: 'og:image', content: page.image || '' },

        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: page.title },
        { name: 'twitter:description', content: page.description || '' },
        { name: 'twitter:image', content: page.image || '' },
      ],
    })
  }

  return {
    setVideoMeta,
    setAudioMeta,
    setDefaultMeta,
  }
}
