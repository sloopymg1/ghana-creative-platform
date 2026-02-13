# 🎥 Video Streaming API Documentation

Complete guide to using the YouTube, Facebook, and Vimeo video streaming integration.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Creating Video Content](#creating-video-content)
- [Updating Video Content](#updating-video-content)
- [Viewing Videos](#viewing-videos)
- [Platform Support](#platform-support)
- [Validation Rules](#validation-rules)
- [Examples](#examples)

---

## Overview

The Ghana Creative Arts Platform supports embedding videos from:
- ✅ **YouTube** - Full support for HD quality and autoplay
- ✅ **Facebook** - Native Facebook video embeds
- ✅ **Vimeo** - Professional video hosting platform

All videos are validated on creation to ensure valid URLs and optimal embedding.

---

## Authentication

All content creation requires authentication. You need to:

1. **Register/Login** at `http://localhost:3000/auth/login`
2. **Get Session Cookie** from browser DevTools
3. **Include Cookie** in API requests

### Getting Your Session Cookie

```bash
# After logging in:
# 1. Open DevTools (F12)
# 2. Go to Application > Cookies > http://localhost:3000
# 3. Copy the session cookie value
# 4. Use in requests: -H "Cookie: session=YOUR_COOKIE_VALUE"
```

---

## Creating Video Content

### Endpoint

```
POST /api/content
```

### Headers

```
Content-Type: application/json
Cookie: session=YOUR_SESSION_COOKIE
```

### Request Body

```json
{
  "title": "Video Title",
  "description": "Video description (optional)",
  "type": "VIDEO",
  "externalUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "categories": ["MUSIC"],
  "tags": ["tag1", "tag2"],
  "duration": 245
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Video title (3-200 characters) |
| `type` | string | Must be "VIDEO" |
| `externalUrl` | string | Valid YouTube/Facebook/Vimeo URL |
| `categories` | array | At least one category |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Video description (max 5000 chars) |
| `tags` | array | Search tags (max 10) |
| `duration` | number | Duration in seconds |
| `licenseType` | string | License type (default: ALL_RIGHTS_RESERVED) |

### Response

```json
{
  "success": true,
  "message": "Content created successfully",
  "data": {
    "id": "cm5hn0abc...",
    "title": "Video Title",
    "slug": "video-title-123456",
    "type": "VIDEO",
    "externalUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
    "status": "DRAFT",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "user": { ... }
  }
}
```

---

## Updating Video Content

### Endpoint

```
PUT /api/content/:id
```

### Request Body

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "externalUrl": "https://www.youtube.com/watch?v=NEW_VIDEO_ID",
  "categories": ["MUSIC", "VISUAL_ARTS"],
  "tags": ["updated-tag"],
  "duration": 300
}
```

All fields are optional. Only include fields you want to update.

---

## Viewing Videos

### Video Stream Page

```
GET /stream/video/:id
```

Features:
- ✅ Embedded video player with optimized settings
- ✅ Platform badge (YouTube/Facebook/Vimeo)
- ✅ View count and duration display
- ✅ Artist/creator information
- ✅ SEO meta tags for social sharing

### Video Gallery

```
GET /videos
```

Features:
- ✅ Responsive grid layout
- ✅ Video thumbnails with play overlays
- ✅ Platform badges
- ✅ Duration badges
- ✅ View counts

### API Endpoints

```bash
# List all published videos
GET /api/content?type=VIDEO&status=PUBLISHED&limit=50

# Get single video
GET /api/content/stream/:id
```

---

## Platform Support

### YouTube

**Supported URL Formats:**
```
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://www.youtube.com/embed/VIDEO_ID
```

**Features:**
- ✅ HD quality (1080p preferred)
- ✅ No related videos
- ✅ Minimal branding
- ✅ Mobile-friendly playback
- ✅ 16:9 responsive aspect ratio

### Facebook

**Supported URL Formats:**
```
https://www.facebook.com/*/videos/VIDEO_ID
https://www.facebook.com/watch/?v=VIDEO_ID
```

**Features:**
- ✅ Native Facebook embed
- ✅ Flexible height
- ✅ Auto-sized player
- ✅ No post text

### Vimeo

**Supported URL Formats:**
```
https://vimeo.com/VIDEO_ID
```

**Features:**
- ✅ Clean embed (no title/author)
- ✅ Professional player
- ✅ 16:9 responsive aspect ratio

---

## Validation Rules

### URL Validation

The API validates all video URLs:

✅ **Valid Examples:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://www.facebook.com/watch/?v=1234567890
https://vimeo.com/123456789
```

❌ **Invalid Examples:**
```
https://example.com/video.mp4  (not a supported platform)
http://youtube.com/invalid     (invalid format)
(empty string)                  (VIDEO type requires URL)
```

### Error Responses

**Missing External URL:**
```json
{
  "statusCode": 400,
  "message": "VIDEO content requires an externalUrl (YouTube, Facebook, or Vimeo link)"
}
```

**Invalid URL Format:**
```json
{
  "statusCode": 400,
  "message": "Invalid video URL. Please provide a valid YouTube, Facebook, or Vimeo URL"
}
```

---

## Examples

### Example 1: Create YouTube Music Video

```bash
curl -X POST http://localhost:3000/api/content \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{
    "title": "Sarkodie - Amazing Grace (Official Video)",
    "description": "Official music video by Sarkodie featuring amazing visuals and storytelling",
    "type": "VIDEO",
    "externalUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "categories": ["MUSIC"],
    "tags": ["hip-hop", "ghana-music", "sarkodie"],
    "duration": 245
  }'
```

### Example 2: Create Facebook Dance Performance

```bash
curl -X POST http://localhost:3000/api/content \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{
    "title": "Traditional Adowa Dance Performance",
    "description": "Beautiful traditional Adowa dance performed at the National Theatre",
    "type": "VIDEO",
    "externalUrl": "https://www.facebook.com/watch/?v=1234567890",
    "categories": ["DANCE"],
    "tags": ["traditional-dance", "adowa", "ghana-culture"],
    "duration": 420
  }'
```

### Example 3: Create Vimeo Documentary

```bash
curl -X POST http://localhost:3000/api/content \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{
    "title": "Ghana Contemporary Art Scene",
    "description": "A documentary exploring the vibrant contemporary art scene in Ghana",
    "type": "VIDEO",
    "externalUrl": "https://vimeo.com/123456789",
    "categories": ["VISUAL_ARTS", "FILM"],
    "tags": ["documentary", "contemporary-art"],
    "duration": 1800
  }'
```

### Example 4: Update Video URL

```bash
curl -X PUT http://localhost:3000/api/content/CONTENT_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{
    "externalUrl": "https://www.youtube.com/watch?v=NEW_VIDEO_ID",
    "duration": 300
  }'
```

### Example 5: List All Videos

```bash
curl http://localhost:3000/api/content?type=VIDEO&status=PUBLISHED&limit=20
```

---

## Frontend Integration

### Using the VideoPlayerEmbed Component

```vue
<template>
  <VideoPlayerEmbed
    :video-url="content.externalUrl"
    :title="content.title"
    :artist-name="artistName"
    :autoplay="false"
  />
</template>

<script setup>
const content = {
  externalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  title: 'Amazing Video',
}
const artistName = 'Artist Name'
</script>
```

### Component Features

- ✅ Automatic platform detection
- ✅ Optimized embed parameters
- ✅ Responsive 16:9 aspect ratio
- ✅ HD quality preference
- ✅ Mobile-friendly
- ✅ Autoplay control

---

## SEO & Social Sharing

All video pages include:

### Open Graph Tags
```html
<meta property="og:type" content="video.other">
<meta property="og:title" content="Video Title">
<meta property="og:description" content="Description">
<meta property="og:video" content="VIDEO_URL">
<meta property="og:image" content="THUMBNAIL_URL">
```

### Twitter Cards
```html
<meta name="twitter:card" content="player">
<meta name="twitter:title" content="Video Title">
<meta name="twitter:player" content="VIDEO_URL">
<meta name="twitter:image" content="THUMBNAIL_URL">
```

---

## Testing

### Test Script

Run the example script to see all API formats:

```bash
node scripts/create-video-content.js
```

### Manual Testing Checklist

1. ✅ Create video with YouTube URL
2. ✅ Create video with Facebook URL
3. ✅ Create video with Vimeo URL
4. ✅ Try creating VIDEO without externalUrl (should fail)
5. ✅ Try creating VIDEO with invalid URL (should fail)
6. ✅ Visit `/videos` gallery page
7. ✅ Click video to watch
8. ✅ Verify platform badge shows correctly
9. ✅ Test responsive design on mobile
10. ✅ Share URL on social media to test OG tags

---

## Troubleshooting

### "Authentication required"
- Make sure you're logged in
- Include session cookie in requests
- Check cookie hasn't expired

### "VIDEO content requires an externalUrl"
- Add `externalUrl` field to request body
- Make sure it's a valid URL string

### "Invalid video URL"
- Check URL format matches supported platforms
- Verify URL is accessible
- Try copying URL directly from platform

### Video not embedding
- Verify video is public (not private)
- Check video hasn't been removed
- Test URL in browser first

---

## Support

For issues or questions:
- GitHub: https://github.com/sloopymg1/ghana-creative-platform/issues
- Run test script: `node scripts/create-video-content.js`

---

**Last Updated:** 2024-01-15
**Integration Version:** 1.0.0
**Supported Platforms:** YouTube, Facebook, Vimeo
