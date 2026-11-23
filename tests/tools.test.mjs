// Week 12 tests: video data, get_video_stats, check_title and JSON title output.
// No API key needed: the model is a fake function.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {loadVideos, getVideoStats, checkTitle} from '../src/tools.mjs';
import {parseTitles, suggestTitles} from '../src/titles.mjs';

const sample = [
  {title: 'A', date: '2026-10-01', views: 100, likes: 50},
  {title: 'B', date: '2026-10-03', views: 300, likes: 10},
  {title: 'C', date: '2026-10-02', views: 200, likes: 30},
];

test('loadVideos reads the real data file and rejects broken data', () => {
  const videos = loadVideos();
  assert.ok(videos.length >= 5);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'videos-'));
  const bad = path.join(dir, 'bad.json');
  fs.writeFileSync(bad, JSON.stringify([{title: 'No numbers', date: '2026-10-01'}]));
  assert.throws(() => loadVideos(bad), /Invalid video at position 0/);
  fs.writeFileSync(bad, '{not json');
  assert.throws(() => loadVideos(bad), /Cannot read video data/);
  assert.throws(() => loadVideos(path.join(dir, 'missing.json')), /Cannot read video data/);
});

test('getVideoStats sorts by views, likes and date and respects limit', () => {
  assert.deepEqual(getVideoStats({sort_by: 'views', limit: 2}, sample).videos.map(v => v.title), ['B', 'C']);
  assert.deepEqual(getVideoStats({sort_by: 'likes', limit: 3}, sample).videos.map(v => v.title), ['A', 'C', 'B']);
  assert.deepEqual(getVideoStats({sort_by: 'date', limit: 1}, sample).videos.map(v => v.title), ['B']);
  assert.equal(getVideoStats({sort_by: 'views', limit: 10}, sample).videos.length, 3);
  assert.deepEqual(getVideoStats({}, []).videos, []);
});

test('getVideoStats rejects bad arguments', () => {
  assert.throws(() => getVideoStats({sort_by: 'comments'}, sample), /sort_by must be one of/);
  assert.throws(() => getVideoStats({limit: 0}, sample), /limit must be/);
  assert.throws(() => getVideoStats({limit: 50}, sample), /limit must be/);
  assert.throws(() => getVideoStats({limit: '3'}, sample), /limit must be/);
});

test('checkTitle accepts a good title and finds each problem', () => {
  assert.deepEqual(checkTitle({title: 'Yeti can\'t find his egg #roblox'}), {ok: true, problems: []});

  const bad = checkTitle({title: 'FREE ROBUX GIVEAWAY #roblox #fyp #shorts #viral'});
  assert.equal(bad.ok, false);
  assert.equal(bad.problems.length, 4); // free robux, giveaway, hashtags, all caps

  assert.match(checkTitle({title: 'a'.repeat(101)}).problems[0], /Too long/);
  assert.throws(() => checkTitle({title: '  '}), /non-empty string/);
});

test('parseTitles accepts valid JSON (also inside ```json) and rejects bad output', () => {
  const good = '{"titles": ["One", "Two", "Three"]}';
  assert.deepEqual(parseTitles(good).titles, ['One', 'Two', 'Three']);
  assert.deepEqual(parseTitles('```json\n' + good + '\n```').titles, ['One', 'Two', 'Three']);

  assert.throws(() => parseTitles('Here are some titles: One, Two'), /valid JSON/);
  assert.throws(() => parseTitles('{"titles": ["Only one"]}'), /exactly 3/);
  assert.throws(() => parseTitles('{"titles": ["One", "", "Three"]}'), /non-empty/);
  assert.throws(() => parseTitles('{"names": []}'), /exactly 3/);
});

test('suggestTitles uses the model output and marks spammy titles', async () => {
  const fakeModel = async () => ({text: '{"titles": ["Penguin hides the egg", "FREE ROBUX egg", "Boss cries #roblox"]}', toolCalls: []});
  const result = await suggestTitles('boss cannot find his egg', fakeModel);
  assert.equal(result.length, 3);
  assert.equal(result[0].ok, true);
  assert.equal(result[1].ok, false);
  await assert.rejects(suggestTitles('', fakeModel), /describe the video idea/);
});
