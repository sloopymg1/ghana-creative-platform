// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  // Enable app directory structure
  future: {
    compatibilityVersion: 4,
  },

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-auth-utils',
    '@pinia/nuxt',
    '@vee-validate/nuxt',
  ],

  // Runtime config
  runtimeConfig: {
    // Server-only (private)
    databaseUrl: process.env.DATABASE_URL,
    sessionSecret: process.env.SESSION_SECRET || 'replace-me-in-production-with-64-char-secret',

    // Email configuration
    emailHost: process.env.EMAIL_HOST,
    emailPort: process.env.EMAIL_PORT,
    emailUser: process.env.EMAIL_USER,
    emailPassword: process.env.EMAIL_PASSWORD,
    emailFrom: process.env.EMAIL_FROM || 'noreply@ghanaarts.gov.gh',

    // File upload
    uploadMaxSize: 52428800, // 50MB
    uploadAllowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'audio/mpeg'],

    // AzuraCast Radio Streaming
    azuracast: {
      apiUrl: process.env.AZURACAST_API_URL || '',
      apiKey: process.env.AZURACAST_API_KEY || '',
      adminKey: process.env.AZURACAST_ADMIN_KEY || '',
      cacheTtl: parseInt(process.env.AZURACAST_CACHE_TTL || '60'),
      syncInterval: parseInt(process.env.AZURACAST_SYNC_INTERVAL || '30'),
    },

    // Public (exposed to client)
    public: {
      appName: 'Ghana Creative Arts Board',
      appUrl: process.env.APP_URL || 'http://localhost:3000',
      apiBase: '/api',
    },
  },

  // Nitro server config
  nitro: {
    experimental: {
      openAPI: true, // Enable OpenAPI docs
    },
  },

  // App config
  app: {
    head: {
      title: 'Ghana Creative Arts Board',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Ghana Creative Arts Board Platform - Empowering creativity and innovation in Ghana' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: false, // Disabled for faster dev builds
  },
})
