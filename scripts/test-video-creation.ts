/**
 * Test script to create sample video content using Prisma
 * This bypasses authentication for testing purposes
 *
 * Usage: npx tsx scripts/test-video-creation.ts
 */

import { PrismaClient } from '@prisma/client'
import slugify from 'slugify'

const prisma = new PrismaClient()

async function createTestVideos() {
  try {
    console.log('🎬 Testing Video Content Creation...\n')

    // First, get or create a test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })

    if (!testUser) {
      console.log('Creating test user...')
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: '$2a$10$test.hash.placeholder', // Placeholder bcrypt hash
          firstName: 'Test',
          lastName: 'Creator',
          userType: 'ARTIST',
          status: 'ACTIVE',
          emailVerified: new Date(),
        }
      })
      console.log('✅ Test user created:', testUser.email)
    } else {
      console.log('✅ Using existing test user:', testUser.email)
    }

    // Test 1: Create YouTube video
    console.log('\n--- Test 1: Creating YouTube Video ---')
    const youtubeVideo = await prisma.content.create({
      data: {
        userId: testUser.id,
        title: 'Amazing Ghanaian Music Video - Sarkodie',
        description: 'Official music video by Sarkodie, one of Ghana\'s most popular hip-hop artists. Experience the vibrant culture and creativity of Ghanaian music.',
        slug: slugify('Amazing Ghanaian Music Video - Sarkodie', { lower: true, strict: true }) + '-' + Date.now(),
        type: 'VIDEO',
        externalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        categories: ['MUSIC'],
        tags: ['hip-hop', 'ghana-music', 'sarkodie', 'afrobeats'],
        duration: 245,
        status: 'PUBLISHED',
      }
    })
    console.log('✅ YouTube video created:')
    console.log('   ID:', youtubeVideo.id)
    console.log('   Title:', youtubeVideo.title)
    console.log('   URL:', youtubeVideo.externalUrl)
    console.log('   View at: http://localhost:3000/stream/video/' + youtubeVideo.id)

    // Test 2: Create Facebook video
    console.log('\n--- Test 2: Creating Facebook Video ---')
    const facebookVideo = await prisma.content.create({
      data: {
        userId: testUser.id,
        title: 'Ghana Dance Festival 2024 Highlights',
        description: 'Watch the best moments from the Ghana Dance Festival 2024. Traditional and contemporary dance performances showcasing Ghanaian culture.',
        slug: slugify('Ghana Dance Festival 2024 Highlights', { lower: true, strict: true }) + '-' + Date.now(),
        type: 'VIDEO',
        externalUrl: 'https://www.facebook.com/watch/?v=1234567890',
        categories: ['DANCE'],
        tags: ['dance-festival', 'traditional-dance', 'ghana-culture'],
        duration: 420,
        status: 'PUBLISHED',
      }
    })
    console.log('✅ Facebook video created:')
    console.log('   ID:', facebookVideo.id)
    console.log('   Title:', facebookVideo.title)
    console.log('   URL:', facebookVideo.externalUrl)
    console.log('   View at: http://localhost:3000/stream/video/' + facebookVideo.id)

    // Test 3: Create Vimeo video
    console.log('\n--- Test 3: Creating Vimeo Video ---')
    const vimeoVideo = await prisma.content.create({
      data: {
        userId: testUser.id,
        title: 'Ghanaian Contemporary Art Documentary',
        description: 'A documentary exploring the vibrant contemporary art scene in Ghana, featuring interviews with leading artists and gallery tours.',
        slug: slugify('Ghanaian Contemporary Art Documentary', { lower: true, strict: true }) + '-' + Date.now(),
        type: 'VIDEO',
        externalUrl: 'https://vimeo.com/123456789',
        categories: ['VISUAL_ARTS', 'FILM'],
        tags: ['documentary', 'contemporary-art', 'visual-arts'],
        duration: 1800,
        status: 'PUBLISHED',
      }
    })
    console.log('✅ Vimeo video created:')
    console.log('   ID:', vimeoVideo.id)
    console.log('   Title:', vimeoVideo.title)
    console.log('   URL:', vimeoVideo.externalUrl)
    console.log('   View at: http://localhost:3000/stream/video/' + vimeoVideo.id)

    // Test 4: Create short film
    console.log('\n--- Test 4: Creating YouTube Short Film ---')
    const shortFilm = await prisma.content.create({
      data: {
        userId: testUser.id,
        title: 'The Return - Ghanaian Short Film',
        description: 'An award-winning short film about a young Ghanaian artist returning home after years abroad. Directed by emerging filmmaker Kwame Asante.',
        slug: slugify('The Return - Ghanaian Short Film', { lower: true, strict: true }) + '-' + Date.now(),
        type: 'VIDEO',
        externalUrl: 'https://youtu.be/abcd1234567',
        categories: ['FILM'],
        tags: ['short-film', 'drama', 'ghanaian-cinema'],
        duration: 900,
        status: 'PUBLISHED',
      }
    })
    console.log('✅ Short film created:')
    console.log('   ID:', shortFilm.id)
    console.log('   Title:', shortFilm.title)
    console.log('   URL:', shortFilm.externalUrl)
    console.log('   View at: http://localhost:3000/stream/video/' + shortFilm.id)

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('🎉 SUCCESS! All test videos created!')
    console.log('='.repeat(60))
    console.log('\n📺 View the video gallery at:')
    console.log('   http://localhost:3000/videos')
    console.log('\n📋 Videos created:')
    console.log('   1. YouTube Music Video')
    console.log('   2. Facebook Dance Performance')
    console.log('   3. Vimeo Documentary')
    console.log('   4. YouTube Short Film')
    console.log('\n✅ All videos have externalUrl and duration fields set')
    console.log('✅ All videos are PUBLISHED and visible in the gallery')
    console.log('✅ Platform badges will be displayed on each video')
    console.log('\n')

  } catch (error) {
    console.error('❌ Error creating test videos:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
createTestVideos()
  .then(() => {
    console.log('✅ Test completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
