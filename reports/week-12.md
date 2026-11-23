# Semester Week 12 Progress Report

## Completed Work

Note: this work was committed on 23 November, one day after the Week 12 window ended (16–22 November), so it is late.

- Added `data/videos.json` with 10 sample videos (title, date, views, likes). The numbers are synthetic, so the project can be demonstrated without my real channel data.
- `src/tools.mjs`:
  - `loadVideos()` reads the file and checks that every video has a title, a `YYYY-MM-DD` date and non-negative whole numbers for views and likes.
  - `getVideoStats({sort_by, limit})` sorts by views, likes or date and returns the top `limit` videos. `sort_by` must be views / likes / date, and `limit` a whole number from 1 to 10.
  - `checkTitle({title})` checks 4 rules: at most 100 characters, no spam phrases ("free robux", "giveaway", "100% real", "not clickbait"), at most 3 hashtags, not all caps.
- `src/titles.mjs`: **structured output**. `suggestTitles(idea)` asks the model for exactly `{"titles": [3 strings]}`. `parseTitles` validates the JSON, and every title is then checked with `checkTitle`.
- New CLI commands: `titles`, `stats`, `check`.
- 6 new tests in `tests/tools.test.mjs`. The suite now has 23 tests, all passing.

## Important Commits

- Commit hash: `055894d`
- Description: Week 12: video data, get_video_stats, check_title, JSON titles
- Link: https://github.com/AkamenYY/css4007-ai-agents-final/commit/055894d

## Current Functionality

- `npm start -- "question"`: the assistant answers through OpenAI.
- `npm start -- titles "boss can't find his egg"`: 3 titles as validated JSON, each marked OK or with its problems.
- `npm start -- stats views 3`: the top 3 videos by views (no LLM).
- `npm start -- check "FREE ROBUX GIVEAWAY #roblox #fyp #shorts #viral"`: 4 problems found (no LLM).
- Wrong input gives a clear error, for example `stats comments` → "sort_by must be one of: views, likes, date".

## Problems Encountered

- Models sometimes add text around the JSON or wrap it in a ```` ```json ```` block, which breaks `JSON.parse`.
- The model can return the wrong number of titles, or empty or too-long titles, even when told the format.
- Hashtags such as `#fyp` made the all-caps check give wrong results.
- Tests must not depend on the real data file changing.

## Solutions

- `parseTitles` removes ```` ``` ```` fences, then parses and checks the structure. Wrong output gives a clear error instead of being shown to the user.
- The prompt asks for the model's titles, but my code still checks every title with `checkTitle`, because the prompt alone is not a guarantee.
- The all-caps rule ignores hashtags before comparing the text with its uppercase version.
- `getVideoStats` takes the video list as a parameter, so tests pass small fixed arrays. One test reads the real file only to check that it loads.

## What I Learned

- Structured output: ask for a fixed JSON shape, then **validate it in code**, because the model does not always follow instructions.
- Validating inputs early (`sort_by`, `limit`) and returning clear errors. In Week 13 this becomes tool argument validation.
- Copying an array before sorting (`[...videos].sort(...)`) so the original data is not changed.
- Writing functions that take their data as a parameter, which makes them easy to test.

## Next Week

Week 13: register `get_video_stats` and `check_title` as tools with the OpenAI API, let the model choose the tool itself, validate tool arguments before execution, and show real tool selection.
