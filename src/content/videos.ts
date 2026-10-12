import type { PrayerId } from './prayers';

// One YouTube playlist holds every guide video. Each prayer plays its own
// position in that playlist (0 = first video). Set an index to null to show
// the "coming soon" card instead. Only embed videos you have permission to show.
export const PLAYLIST_ID = 'PLOlaiHoIQfAiRZBwwcnJPIazqZRxd6UHW';

export const PRAYER_VIDEO_INDEX: Record<PrayerId, number | null> = {
  fajr: 0,
  dhuhr: 1,
  asr: 2,
  maghrib: 3,
  isha: 4,
};

export const WUDU_VIDEO_INDEX: number | null = 5;
