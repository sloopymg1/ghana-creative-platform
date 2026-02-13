-- Insert test audio content
-- First, get the artist user ID
DO $$
DECLARE
    artist_id TEXT;
BEGIN
    -- Get the artist user ID
    SELECT id INTO artist_id FROM "User" WHERE email = 'artist@test.com' LIMIT 1;

    -- If no artist found, use admin
    IF artist_id IS NULL THEN
        SELECT id INTO artist_id FROM "User" WHERE email = 'admin@ghanaarts.gov.gh' LIMIT 1;
    END IF;

    -- Insert audio content
    INSERT INTO "Content" (
        id,
        "userId",
        title,
        description,
        slug,
        type,
        status,
        "externalUrl",
        categories,
        tags,
        duration,
        "createdAt",
        "updatedAt"
    ) VALUES (
        gen_random_uuid(),
        artist_id,
        'Beautiful Piano Music',
        'Relaxing piano music for studying and working. Free Music Archive.',
        'beautiful-piano-music-' || extract(epoch from now())::text,
        'AUDIO',
        'PUBLISHED',
        'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Kevin_MacLeod/Impact/Kevin_MacLeod_-_Apoxode_-_02_Past_the_Edge.mp3',
        ARRAY['MUSIC']::"ArtCategory"[],
        ARRAY['piano', 'relaxing', 'instrumental']::TEXT[],
        180,
        now(),
        now()
    ),
    (
        gen_random_uuid(),
        artist_id,
        'Ambient Electronic Track',
        'Chill electronic music from SoundHelix.',
        'ambient-electronic-' || extract(epoch from now())::text,
        'AUDIO',
        'PUBLISHED',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        ARRAY['MUSIC', 'DIGITAL_ARTS']::"ArtCategory"[],
        ARRAY['electronic', 'ambient', 'chill']::TEXT[],
        210,
        now(),
        now()
    );

    -- Insert video content with working URLs
    INSERT INTO "Content" (
        id,
        "userId",
        title,
        description,
        slug,
        type,
        status,
        "externalUrl",
        categories,
        tags,
        duration,
        "createdAt",
        "updatedAt"
    ) VALUES (
        gen_random_uuid(),
        artist_id,
        'Big Buck Bunny - Short Film',
        'A fun and quirky short film featuring Big Buck Bunny. Great for testing video playback.',
        'big-buck-bunny-' || extract(epoch from now())::text,
        'VIDEO',
        'PUBLISHED',
        'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
        ARRAY['FILM']::"ArtCategory"[],
        ARRAY['animation', 'short-film', 'test']::TEXT[],
        10,
        now(),
        now()
    ),
    (
        gen_random_uuid(),
        artist_id,
        'Sample Video - Nature',
        'Beautiful nature video for testing purposes.',
        'sample-nature-video-' || extract(epoch from now())::text,
        'VIDEO',
        'PUBLISHED',
        'https://file-examples.com/storage/fe7f11e98a66cc8c0c71a8c/2017/04/file_example_MP4_480_1_5MG.mp4',
        ARRAY['FILM', 'VISUAL_ARTS']::"ArtCategory"[],
        ARRAY['nature', 'wildlife', 'documentary']::TEXT[],
        30,
        now(),
        now()
    );

    -- Insert YouTube video (embedded)
    INSERT INTO "Content" (
        id,
        "userId",
        title,
        description,
        slug,
        type,
        status,
        "externalUrl",
        categories,
        tags,
        "createdAt",
        "updatedAt"
    ) VALUES (
        gen_random_uuid(),
        artist_id,
        'Me at the Zoo - First YouTube Video',
        'The very first video uploaded to YouTube. Historical content.',
        'first-youtube-video-' || extract(epoch from now())::text,
        'VIDEO',
        'PUBLISHED',
        'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        ARRAY['FILM']::"ArtCategory"[],
        ARRAY['youtube', 'historical', 'documentary']::TEXT[],
        now(),
        now()
    );

    RAISE NOTICE 'Test content inserted successfully!';
END $$;
