// Week 12: structured output — the model returns 3 titles as JSON, my code validates them.
import {complete} from './model-client.mjs';
import {checkTitle, MAX_TITLE_LENGTH} from './tools.mjs';

export const TITLE_PROMPT = `You write titles for Roblox YouTube Shorts.
Return ONLY JSON in exactly this format, with no other text:
{"titles": ["title 1", "title 2", "title 3"]}
Rules: exactly 3 titles, each at most ${MAX_TITLE_LENGTH} characters, at most 3 hashtags,
no "free robux", no giveaways, no fake claims, not all caps.`;

// Parse the model's text and check the structure. Throws a clear error if it is wrong.
export function parseTitles(text) {
  // Models sometimes wrap JSON in ```json ... ``` — remove that.
  const cleaned = String(text ?? '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

  let data;
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new Error('Model did not return valid JSON');
  }

  const titles = data?.titles;
  if (!Array.isArray(titles) || titles.length !== 3) {
    throw new Error('JSON must contain "titles" with exactly 3 items');
  }
  for (const t of titles) {
    if (typeof t !== 'string' || t.trim() === '') throw new Error('Every title must be a non-empty string');
    if (t.length > MAX_TITLE_LENGTH) throw new Error(`A title is longer than ${MAX_TITLE_LENGTH} characters`);
  }
  return {titles: titles.map(t => t.trim())};
}

// Ask the model for titles, validate them, and attach the rule check for each title.
export async function suggestTitles(idea, model = complete) {
  if (typeof idea !== 'string' || idea.trim() === '') throw new Error('Please describe the video idea');

  const reply = await model([
    {role: 'system', content: TITLE_PROMPT},
    {role: 'user', content: 'Video idea: ' + idea.trim()},
  ]);
  const {titles} = parseTitles(reply.text);
  return titles.map(title => ({title, ...checkTitle({title})}));
}
