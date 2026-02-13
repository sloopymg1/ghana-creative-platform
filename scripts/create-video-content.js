/**
 * Test script to create video content via API
 *
 * Usage: node scripts/create-video-content.js
 *
 * Note: You need to be authenticated to create content.
 * This script provides examples of the API payload structure.
 */

// Example 1: YouTube Video
const youtubeVideo = {
  title: "Amazing Ghanaian Music Video - Sarkodie",
  description: "Official music video by Sarkodie, one of Ghana's most popular hip-hop artists. Experience the vibrant culture and creativity of Ghanaian music.",
  type: "VIDEO",
  externalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  categories: ["MUSIC"],
  tags: ["hip-hop", "ghana-music", "sarkodie", "afrobeats"],
  duration: 245, // seconds
}

// Example 2: Facebook Video
const facebookVideo = {
  title: "Ghana Dance Festival 2024 Highlights",
  description: "Watch the best moments from the Ghana Dance Festival 2024. Traditional and contemporary dance performances showcasing Ghanaian culture.",
  type: "VIDEO",
  externalUrl: "https://www.facebook.com/watch/?v=1234567890",
  categories: ["DANCE"],
  tags: ["dance-festival", "traditional-dance", "ghana-culture"],
  duration: 420,
}

// Example 3: Vimeo Video
const vimeoVideo = {
  title: "Ghanaian Contemporary Art Documentary",
  description: "A documentary exploring the vibrant contemporary art scene in Ghana, featuring interviews with leading artists and gallery tours.",
  type: "VIDEO",
  externalUrl: "https://vimeo.com/123456789",
  categories: ["VISUAL_ARTS", "FILM"],
  tags: ["documentary", "contemporary-art", "visual-arts"],
  duration: 1800,
}

// Example 4: Short Film on YouTube
const shortFilm = {
  title: "The Return - Ghanaian Short Film",
  description: "An award-winning short film about a young Ghanaian artist returning home after years abroad. Directed by emerging filmmaker Kwame Asante.",
  type: "VIDEO",
  externalUrl: "https://youtu.be/abcd1234567",
  categories: ["FILM"],
  tags: ["short-film", "drama", "ghanaian-cinema"],
  duration: 900,
}

console.log("=== Video Content Creation Examples ===\n")
console.log("To create video content, make a POST request to /api/content with authentication:\n")

console.log("Example 1: YouTube Video")
console.log("curl -X POST http://localhost:3000/api/content \\")
console.log('  -H "Content-Type: application/json" \\')
console.log('  -H "Cookie: your-session-cookie" \\')
console.log(`  -d '${JSON.stringify(youtubeVideo)}'\n`)

console.log("Example 2: Facebook Video")
console.log("curl -X POST http://localhost:3000/api/content \\")
console.log('  -H "Content-Type: application/json" \\')
console.log('  -H "Cookie: your-session-cookie" \\')
console.log(`  -d '${JSON.stringify(facebookVideo)}'\n`)

console.log("Example 3: Vimeo Video")
console.log("curl -X POST http://localhost:3000/api/content \\")
console.log('  -H "Content-Type: application/json" \\')
console.log('  -H "Cookie: your-session-cookie" \\')
console.log(`  -d '${JSON.stringify(vimeoVideo)}'\n`)

console.log("\n=== Supported Video Platforms ===")
console.log("✓ YouTube - https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID")
console.log("✓ Facebook - https://www.facebook.com/*/videos/VIDEO_ID")
console.log("✓ Vimeo - https://vimeo.com/VIDEO_ID")

console.log("\n=== Validation Rules ===")
console.log("• VIDEO type MUST have an externalUrl")
console.log("• externalUrl must be a valid YouTube, Facebook, or Vimeo URL")
console.log("• Categories: MUSIC, VISUAL_ARTS, DANCE, THEATER, FILM, LITERATURE, etc.")
console.log("• Duration is in seconds (optional but recommended)")
console.log("• Tags are optional but improve discoverability")

console.log("\n=== How to Get Your Session Cookie ===")
console.log("1. Log in to the platform at http://localhost:3000")
console.log("2. Open browser DevTools (F12)")
console.log("3. Go to Application/Storage > Cookies")
console.log("4. Copy the session cookie value")
console.log("5. Use it in the Cookie header: -H \"Cookie: session=YOUR_COOKIE_VALUE\"")
