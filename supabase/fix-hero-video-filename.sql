-- Fix hero video filename from hero-video.mp4 to herovideo.mp4
UPDATE hero_video_settings 
SET video_url = '/herovideo.mp4'
WHERE video_url = '/hero-video.mp4';

-- Verify the update
SELECT * FROM hero_video_settings;