# Working Test URLs for Streaming

## Audio URLs (Direct MP3 Links)

### Option 1: Free Music Archive
```
https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Impact/Kevin_MacLeod_-_Apoxode_-_02_Past_the_Edge.mp3
```

### Option 2: Internet Archive
```
https://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_04_henley_apc_128kb.mp3
```

### Option 3: SoundHelix (Still works)
```
https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3
```

## Video URLs (Direct MP4 Links)

### Option 1: Sample Videos from Sample-Videos.com
```
https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4
```

### Option 2: File Examples
```
https://file-examples.com/storage/fe7f11e98a66cc8c0c71a8c/2017/04/file_example_MP4_480_1_5MG.mp4
```

### Option 3: Test Videos (Small sizes)
```
https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4
```

### Option 4: Wikimedia Commons
```
https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.480p.vp9.webm
```

## YouTube/Vimeo URLs (For External Embed)

### YouTube
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://www.youtube.com/watch?v=jNQXAC9IVRw
```

### Vimeo
```
https://vimeo.com/148751763
```

## Live Stream URLs (For Testing)

### Option 1: NASA TV (Always live)
```
https://www.youtube.com/watch?v=21X5lGlDOfg
```

### Option 2: Lofi Hip Hop Radio
```
https://www.youtube.com/watch?v=jfKfPfyJRdk
```

## Testing Strategy

1. **Start with Audio**: Use SoundHelix URLs (most reliable)
2. **Test Video**: Try sample-videos.com URLs first
3. **External URLs**: Test with YouTube/Vimeo links
4. **Upload Local Files**: If you have small test files (< 5MB)

## Notes

- Some URLs may require CORS headers to work properly
- For production, you'll want to:
  - Upload files to your own server
  - Use a CDN (Cloudflare, AWS CloudFront)
  - Integrate with proper video hosting (Vimeo, Wistia, etc.)
