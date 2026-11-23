// Week 12: the two core functions of ShortsPilot.
// In Week 13 they become LLM-callable tools; for now they are normal functions.
import fs from 'node:fs';

export const DEFAULT_VIDEOS_FILE = new URL('../data/videos.json', import.meta.url);
export const SORT_FIELDS = ['views', 'likes', 'date'];
export const MAX_LIMIT = 10;
export const MAX_TITLE_LENGTH = 100;
export const MAX_HASHTAGS = 3;
export const BANNED_PHRASES = ['free robux', 'giveaway', '100% real', 'not clickbait'];

// Read the video list and check that every entry has the right fields.
export function loadVideos(file = DEFAULT_VIDEOS_FILE) {
  let videos;
  try {
    videos = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    throw new Error('Cannot read video data: ' + err.message);
  }
  if (!Array.isArray(videos)) throw new Error('Video data must be a JSON array');

  videos.forEach((v, i) => {
    const ok = typeof v?.title === 'string' && v.title.trim() !== ''
      && /^\d{4}-\d{2}-\d{2}$/.test(v.date ?? '')
      && Number.isInteger(v.views) && v.views >= 0
      && Number.isInteger(v.likes) && v.likes >= 0;
    if (!ok) throw new Error(`Invalid video at position ${i}: needs title, date (YYYY-MM-DD), views and likes`);
  });
  return videos;
}

// Return the top `limit` videos sorted by `sort_by` (biggest / newest first).
export function getVideoStats({sort_by = 'views', limit = 3} = {}, videos = loadVideos()) {
  if (!SORT_FIELDS.includes(sort_by)) {
    throw new Error(`sort_by must be one of: ${SORT_FIELDS.join(', ')}`);
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new Error(`limit must be a whole number from 1 to ${MAX_LIMIT}`);
  }
  if (videos.length === 0) return {videos: [], note: 'No videos in the data file'};

  const sorted = [...videos].sort((a, b) =>
    sort_by === 'date' ? b.date.localeCompare(a.date) : b[sort_by] - a[sort_by]);
  return {sort_by, videos: sorted.slice(0, limit)};
}

// Check a title with 4 simple rules. Returns {ok, problems}.
export function checkTitle({title} = {}) {
  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error('title must be a non-empty string');
  }
  const problems = [];

  if (title.length > MAX_TITLE_LENGTH) {
    problems.push(`Too long: ${title.length} characters (max ${MAX_TITLE_LENGTH})`);
  }

  const lower = title.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) problems.push(`Spam / clickbait phrase: "${phrase}"`);
  }

  const hashtags = title.match(/#\w+/g) ?? [];
  if (hashtags.length > MAX_HASHTAGS) {
    problems.push(`Too many hashtags: ${hashtags.length} (max ${MAX_HASHTAGS})`);
  }

  // All caps = has letters and none of them are lowercase (hashtags ignored).
  const words = title.replace(/#\w+/g, '');
  if (/[a-z]/i.test(words) && words === words.toUpperCase()) {
    problems.push('Title is written in ALL CAPS');
  }

  return {ok: problems.length === 0, problems};
}
