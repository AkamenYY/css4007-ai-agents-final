# Project Proposal — Semester Week 10

## Project Title

**ShortsPilot** — a simple tool-using AI agent for YouTube Shorts creators.

## Problem Description

I make Roblox YouTube Shorts. Before each upload I repeat the same small tasks:

1. I check which of my videos did best, to decide what to make next.
2. I write a title and check that it is not "spammy". YouTube can strike a channel for misleading titles, scam phrases like "free Robux", or too many hashtags.

A normal chatbot cannot see my video numbers, so it invents them. It also cannot reliably check its own titles against rules.

ShortsPilot solves this with two small tools. One reads my real video data from a file. The other checks a title with fixed rules written in code. The LLM decides when a tool is needed, and its answer is based on the tool result instead of guesses.

## Target Users

- Small YouTube Shorts creators, especially in the gaming and Roblox niche.
- Editors who prepare titles for a creator.
- Me: I will use it for my own channel.

## Selected Difficulty

C — Intermediate: a tool-using agent.

## Expected Functionality

1. The user asks a question in the command line, in plain language.
2. The LLM decides:
   - question about my videos → calls `get_video_stats`;
   - "is this title OK?" → calls `check_title`;
   - general question (for example "what is CTR?") → answers without a tool.
3. My code validates the tool arguments, runs the tool, and sends the result back to the LLM.
4. The LLM writes the final answer using only the tool result.
5. **Title suggestions** with structured output: for a video idea the model returns JSON `{"titles": [...]}`, which my code validates.
6. **Errors** are handled: invalid arguments, unknown tool, empty data, API failures or timeouts, and a limit on tool rounds.
7. Every tool call is written to a log file `logs/tool-calls.jsonl`, without API keys.

## Proposed Functions

| Function | Purpose | Input | Output | Dependencies |
|---|---|---|---|---|
| `complete(messages, tools)` | Send a request to the OpenAI API | chat messages, tool definitions | `{text, toolCalls}` | OpenAI API, `fetch`, `.env` |
| `loadVideos()` | Read my video data | — | array of `{title, date, views, likes}` | `data/videos.json` |
| `get_video_stats(sort_by, limit)` | **Tool.** Return my top videos | `sort_by` ∈ views / likes / date; `limit` 1–10 | list of videos | `loadVideos` |
| `check_title(title)` | **Tool.** Check a title with simple rules | title string | `{ok, problems: [...]}` | none |
| `validateArgs(toolName, args)` | Reject bad tool arguments before running a tool | tool name, arguments | list of errors | none |
| `suggestTitles(idea)` | Ask the model for 3 titles as JSON and validate them | video idea | `{titles: [3 strings]}` | `complete` |
| `runAgent(question)` | Agent loop: LLM → tool → LLM → answer (max 3 tool rounds) | user question | final answer | `complete`, tools |
| `logToolCall(entry)` | Save one tool call to the log | `{time, tool, args, ok}` | line in log file | `node:fs` |

Rules inside `check_title`:
- title is not empty and has at most 100 characters;
- no scam or clickbait phrases ("free robux", "giveaway", "100% real");
- at most 3 hashtags;
- not written entirely in CAPITAL LETTERS.

Example:

```js
/** Returns my top videos sorted by a metric. */
export function getVideoStats({sort_by, limit = 3}) { /* ... */ }
```

## Proposed Agent Tools

The LLM can call two tools. The model chooses them itself; there is no `if (question.includes(...))` routing in my code.

1. **`get_video_stats`**: the model does not know my real views and likes. Without this tool it would invent numbers.
2. **`check_title`**: the rules must be checked exactly. Code is reliable; the model's own judgement is not.

## Model Selection

- **OpenAI API**, Chat Completions with function calling.
- Model: a cheap model with tool support, for example `gpt-5-mini`. It is set in `.env` (`LLM_MODEL`), so it can be changed without code changes.
- **Node.js 22** with no extra npm packages.
- The API key is kept in `.env`, which is not committed to git.
- Tests use a fake model, so they need no key and cost nothing.

## Architecture

```text
User question (CLI)
      │
      ▼
  runAgent ──── messages + tool list ────▶ OpenAI model
      ▲                                        │
      │                       text answer  or  tool call
      │                                        ▼
      │                            validateArgs (reject bad input)
      │                                        │
      │                       get_video_stats  │  check_title
      │                     (data/videos.json) │  (rules in code)
      │                                        ▼
      └──────── tool result ◀──────── logToolCall → logs/
      │
      ▼
Final answer (max 3 tool rounds)
```

Flow: **User Request → LLM → Tool Selection → Tool Execution → LLM → Answer**

## Example Requests

1. "Which 3 of my videos have the most views?" → `get_video_stats(sort_by="views", limit=3)`
2. "Is this title OK: 'FREE ROBUX GIVEAWAY #roblox #fyp #shorts #viral'?" → `check_title(...)` → explains the problems
3. "What is CTR on YouTube?" → no tool, direct answer
4. "Give me 3 titles for a video where a boss can't find his hidden egg" → structured JSON titles
5. "Show my top 50 videos" → limit is too big → the agent explains or uses the maximum of 10

## Evaluation Plan

At least **8 automated tests** with `node --test` and a fake model:

1. The adapter parses text and tool calls from an API response.
2. The adapter retries on rate limit or timeout and does not leak the API key.
3. `get_video_stats` sorts correctly and respects `limit`.
4. `check_title` finds each problem and accepts a good title.
5. `validateArgs` rejects bad arguments (wrong `sort_by`, `limit` = 0 or 50, empty title).
6. The agent calls the tool the model chose and passes the result back.
7. The agent answers without tools when the model gives no tool call.
8. Unknown tool, failing tool and too many tool rounds are handled without a crash.
9. `suggestTitles` accepts valid JSON and rejects broken JSON.

**Manual check with the real model:** 10 questions, recording which tool was chosen and whether the answer matches the data. Results go in the Week 16 report.

## Weekly Milestones

| Week | Dates | Plan |
|---|---|---|
| 10 | 02–08 Nov | Topic, level and proposal. |
| 11 | 09–15 Nov | OpenAI connection, first working answer in the CLI, first tests. |
| 12 | 16–22 Nov | `data/videos.json`, `get_video_stats` and `check_title` as normal functions, `suggestTitles` with JSON validation, tests. |
| 13 | 23–29 Nov | Register both tools with the LLM; the model chooses the tool; argument validation. |
| 14 | 30 Nov–06 Dec | Full agent loop (result back to the LLM), tool error handling, tool log file. |
| 15 | 07–13 Dec | Edge cases (empty data, bad input, API down, round limit); at least 8 tests. |
| 16 | 14–20 Dec | Run all tests and the 10 manual questions; fix problems; update the README. |
| 17 | 21–22 Dec | Final report, commit hash, demonstration and defense. |
