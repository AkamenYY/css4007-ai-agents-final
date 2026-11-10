# Project Proposal — Semester Week 10

## Project Title

**ShortsPilot** — a tool-using AI agent for YouTube Shorts creators.

## Problem Description

I run Roblox YouTube Shorts channels. Every upload repeats the same manual work:

1. Writing a title, description and hashtags for each video.
2. Checking which past videos actually performed well, by digging through YouTube Studio tables by hand.
3. Making sure the metadata does not look like spam. YouTube's *Spam & Deceptive Practices* policy can strike or terminate a channel for misleading titles, keyword stuffing, excessive tags or scam-like phrases such as "free Robux". Small creators rarely know the exact rules.

General chatbots can write titles, but they cannot see the creator's real numbers, and they invent statistics. They also do not check the result against the policy.

ShortsPilot answers questions about the creator's **real channel analytics**, using a CSV exported from YouTube Studio. It writes metadata for new videos and **checks that metadata with deterministic rules before suggesting it**. The LLM decides which tool a request needs. Answers about the channel are based only on tool results, never on invented numbers.

This matters because metadata quality affects both reach and channel safety, and a single policy strike can cost a creator their income.

## Target Users

- Solo YouTube Shorts creators and small channel networks, especially in gaming and Roblox niches.
- Video editors and assistants who prepare uploads for a creator.
- Me: I will use it for my own channels.

## Selected Difficulty

C — Intermediate: a tool-using agent.

## Expected Functionality

1. **Channel questions in natural language.** For example: "How did the channel do in October?" or "Which Shorts had the best retention?"
2. **Analytics tools.** These read a YouTube Studio CSV export: totals for a date range, and top or bottom videos by a chosen metric.
3. **Metadata generation.** Produces a title, description and hashtags for a new video idea as **validated JSON**.
4. **Policy check tool.** A rule-based check of a title, description and tags. It flags spam and deceptive patterns: excessive hashtags, repeated keywords, scam phrases, ALL-CAPS, external links and length limits. The agent revises the metadata if issues are found.
5. **No-tool answers.** General creator questions, such as "What is CTR?", are answered directly without calling a tool.
6. **Robustness.** Tool arguments are validated, and missing data is handled (for example a date range with no videos, or a missing CSV). The app also handles API errors, timeouts and rate limits with bounded retries.
7. **Tool execution log.** Every tool call is written to `logs/tool-calls.jsonl` with its time, tool name, validated arguments, result status and duration. API keys are never logged.

## Proposed Functions

| Function | Purpose | Input | Output | Dependencies |
|---|---|---|---|---|
| `complete(messages, tools)` | Provider adapter that sends a chat request to the OpenAI API | Chat messages; optional tool definitions | `{text, toolCalls: [{id, name, arguments}]}` | OpenAI Chat Completions API, `fetch`, `LLM_API_KEY`, `LLM_MODEL` |
| `loadAnalytics(csvPath)` | Parse a YouTube Studio "Table data" CSV export into typed rows | Path to CSV | `[{videoId, title, publishedAt, durationSec, views, watchHours, subscribers, impressions, ctr, avgViewPct}]` | `node:fs` |
| `get_channel_summary(start_date, end_date)` | Aggregate channel statistics for videos published in a period | ISO dates `YYYY-MM-DD` | `{videos, views, watchHours, subscribers, avgViewPct}` or `{error}` | `loadAnalytics` |
| `find_top_videos(metric, limit, order)` | Rank videos by a metric | `metric` ∈ views / avg_view_pct / ctr / subscribers; `limit` 1–20; `order` best / worst | `[{title, publishedAt, value}]` | `loadAnalytics` |
| `check_metadata_policy(title, description, tags)` | Deterministic spam and deceptive-metadata checker | Strings and an array of tags | `{ok, issues: [{rule, severity, message}]}` | none (pure function) |
| `validateToolArgs(name, args)` | Reject malformed tool arguments before execution | Tool name, parsed arguments | List of errors (empty = valid) | Tool JSON schemas |
| `validateMetadata(json)` | Validate the structured metadata output | Model output | Validated `{title, description, hashtags[]}` or an error | none |
| `runAgent(request)` | Agent loop: LLM → tool selection → execution → LLM → answer, with a maximum number of tool rounds | User request string | `{answer, toolLog}` | `complete`, tools, logger |
| `logToolCall(entry)` | Append one tool execution record | Entry object | Line in `logs/tool-calls.jsonl` | `node:fs` |

Example signature:

```js
/** Ranks videos from the analytics export by a metric. */
export function findTopVideos({metric, limit = 5, order = 'best'}) { /* ... */ }
```

## Proposed Agent Tools

These three functions are exposed to the LLM as callable tools. The model decides whether to call a tool, which one, and with which arguments; routing is not hard-coded.

1. **`get_channel_summary`**: the model cannot know the creator's real views, watch time or subscriber numbers. This tool gives it real totals for a period instead of hallucinated ones.
2. **`find_top_videos`**: questions like "what worked best?" need sorting and filtering over the real data. Code does this exactly; an LLM would be unreliable.
3. **`check_metadata_policy`**: an LLM alone cannot be trusted to verify its own output against policy rules. A deterministic checker gives verifiable feedback, and the agent uses it to revise titles and descriptions before presenting them.

Requests that do not need data, such as general advice or definitions, are answered without tools.

## Model Selection

- **Provider:** OpenAI API, Chat Completions endpoint with function calling (tools).
- **Model:** a small, inexpensive model that supports tool calling, configured via `LLM_MODEL` in `.env` (for example `gpt-5-mini`). Changing the model requires no code changes.
- **Runtime:** Node.js 22, with no external npm dependencies (built-in `fetch` and `node:test`).
- **Secrets:** `LLM_API_KEY` lives in a local `.env` file, which is git-ignored; only `.env.example` is committed.
- **Tests:** use a mocked model client, so they run without an API key and without cost.

## Architecture

```text
             ┌──────────────────────────────────────────────┐
User request │  CLI (src/cli.mjs)                           │
────────────▶│  input validation                            │
             └──────────────┬───────────────────────────────┘
                            ▼
             ┌──────────────────────────────┐   tool definitions
             │  Agent loop (runAgent)       │──────────────────┐
             │  max tool rounds, retries    │                  ▼
             └──────┬───────────────▲───────┘        ┌───────────────────┐
                    │ messages      │ text /         │ OpenAI API        │
                    ▼               │ tool calls     │ (model-client)    │
             ┌──────────────────────┴───────┐        └───────────────────┘
             │ Tool dispatcher              │
             │  1. validate arguments       │──▶ logs/tool-calls.jsonl
             │  2. execute tool             │
             │  3. return result to LLM     │
             └──┬───────────┬───────────┬───┘
                ▼           ▼           ▼
      get_channel_summary  find_top_videos  check_metadata_policy
                └─────┬─────┘                (pure rules)
                      ▼
          data/analytics.csv (YouTube Studio export)
```

Flow: **User Request → LLM → Tool Selection → Argument Validation → Tool Execution → LLM → Validated Answer**.

## Example Requests

1. "Which 5 of my Shorts have the best average percentage viewed?" → `find_top_videos(metric="avg_view_pct", limit=5)`
2. "How did the channel do from 1 to 31 October 2026?" → `get_channel_summary("2026-10-01", "2026-10-31")`
3. "Write a title, description and hashtags for a Roblox Short where a boss can't find his hidden egg, and make sure it isn't spammy." → model drafts metadata → `check_metadata_policy` → revises if issues are found → validated JSON
4. "What is a good length for a Short?" → no tool call; direct answer.
5. "Show my stats for 2030." → tool returns no videos for that period → the agent says the data is unavailable instead of inventing numbers.

## Evaluation Plan

**Automated tests** (`node --test`, at least 8 project tests, mocked LLM so they are reproducible):

1. Adapter: converts tool definitions and parses tool calls and text from an API response.
2. Adapter: retries on 429/5xx and timeouts, stops after the retry budget, and gives a clear error without leaking the key.
3. CSV parsing of a sample YouTube Studio export, including the totals row and malformed rows.
4. `get_channel_summary` arithmetic on known data, and an empty period.
5. `find_top_videos` sorting, limit bounds and invalid metric rejection.
6. `check_metadata_policy` flags each rule and passes clean metadata.
7. Agent loop: a scripted mock model selects a tool → the tool is executed → the result is passed back → final answer.
8. Agent loop: a request without tools gets a direct answer.
9. Agent loop: invalid or unknown tool arguments are rejected before execution, and the error is returned to the model.
10. Agent loop: a failing tool and the maximum-rounds limit are handled without crashing.
11. Structured metadata output validation (valid and malformed JSON).

**Manual evaluation with the real model:** a fixed set of about 12 requests (tool and no-tool, valid and invalid, missing data). For each I will record which tool was selected, whether the arguments were correct, whether the answer matches the tool result (no invented numbers), and whether errors were handled. Results go in the Week 16 report.

## Weekly Milestones

| Week | Dates | Plan |
|---|---|---|
| 10 | 02–08 Nov | Fork the repository, choose the topic and level, write this proposal. |
| 11 | 09–15 Nov | OpenAI adapter (`src/model-client.mjs`) with error handling and retries; CLI with a first working request; setup documentation; first adapter tests. |
| 12 | 16–22 Nov | CSV loader for YouTube Studio exports with a sample dataset; analytics functions; structured JSON metadata output with validation; core tests. |
| 13 | 23–29 Nov | Register the three tools with the LLM; tool argument validation; tool dispatcher; demonstrate real tool selection and execution. |
| 14 | 30 Nov–06 Dec | Complete the tool-calling loop (multiple tool rounds, results passed back to the model); tool error handling; tool execution logs. |
| 15 | 07–13 Dec | Reliability: missing data, invalid arguments, API failures, round limits; expand tests to 8 or more. |
| 16 | 14–20 Dec | Run the full test suite and the manual evaluation set; analyse failures; improve prompts and validation; update documentation. |
| 17 | 21–22 Dec | Final README, test results, final report, commit hash, demonstration and defense. |
