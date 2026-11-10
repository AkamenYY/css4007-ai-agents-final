// Week 11: first working request — ShortsPilot answers a creator question with the LLM.
// Tools (analytics, policy check) are added in weeks 12–14.
import {complete} from './model-client.mjs';

export const MAX_QUESTION_LENGTH = 2000;

export const SYSTEM_PROMPT = `You are ShortsPilot, an assistant for YouTube Shorts creators (gaming / Roblox niche).
Help with video ideas, titles, descriptions, hashtags and general channel growth questions.
Rules:
- Keep answers short and practical.
- Never invent channel statistics. If the user asks about their own numbers, say that analytics data is not connected yet.
- Avoid spammy or misleading suggestions (fake giveaways, "free Robux", keyword stuffing, excessive hashtags).
- Answer in the same language as the user.`;

export function validateQuestion(question) {
  if (typeof question !== 'string' || question.trim() === '') {
    throw new Error('Please enter a question, for example: npm start -- "Give me 3 title ideas for a Roblox Short"');
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    throw new Error(`Question is too long (${question.length} characters, max ${MAX_QUESTION_LENGTH}).`);
  }
  return question.trim();
}

// `model` is injectable so tests can use a fake model instead of the real API.
export async function ask(question, model = complete) {
  const text = validateQuestion(question);
  const reply = await model([
    {role: 'system', content: SYSTEM_PROMPT},
    {role: 'user', content: text},
  ]);
  if (!reply?.text?.trim()) throw new Error('The model returned an empty answer. Please try again.');
  return reply.text.trim();
}
