# Semester Week 11 Progress Report

## Completed Work

- Implemented the **OpenAI adapter** `src/model-client.mjs`. It calls the Chat Completions API with built-in `fetch` and returns `{text, toolCalls}`. It converts my tool definitions into OpenAI format and parses tool-call arguments, flagging invalid JSON.
- Added **error handling**: clear errors for a missing key or model, a 30-second timeout, retries with exponential backoff for 429/5xx/timeouts/network errors (maximum 2 retries), no retry on 401/400, and error messages that never contain the API key.
- Built the **first working request**: `src/assistant.mjs` (system prompt, input validation, empty-answer check) and `src/cli.mjs` (`npm start -- "question"`, loads `.env`).
- Wrote **7 project tests** with a mocked API: text replies, tool-call parsing, retry then success, retry budget, auth error without key leak, malformed responses, and input validation.
- Documented setup and usage in the README and added an AI assistance statement.

## Important Commits

- Commit hash: `191b4e4`
- Description: Week 11: OpenAI adapter, first working request, tests and setup docs
- Link: https://github.com/AkamenYY/css4007-ai-agents-final/commit/191b4e4

## Current Functionality

The user asks a question from the command line, for example `npm start -- "Give me 3 title ideas for a Roblox Short"`. ShortsPilot sends it to the OpenAI model with a creator-focused system prompt and prints the answer. Invalid input and API failures produce readable errors instead of crashes. The adapter already supports tool calls, which will be used from Week 13.

## Problems Encountered

- Tests must not call the real API: that would cost money, need a key, and give non-deterministic results.
- API failures come in different forms: HTTP errors, timeouts, network errors and malformed JSON.
- The API key must never appear in logs or error messages.

## Solutions

- `complete()` accepts an injectable `fetchImpl` and `sleep`, so tests replace the network with a fake and run instantly without a key.
- All failures are converted to one `LLMError` type with a `retryable` flag. Only temporary errors (429, 5xx, timeouts) are retried, and only up to a fixed budget.
- Error text is taken from the API response body only. Request headers are never printed.

## What I Learned

- The structure of the OpenAI Chat Completions request and response: the `messages` roles, the `tools` array, and `tool_calls` with arguments as a JSON **string** that must be parsed and can be invalid.
- Exponential backoff, and which HTTP errors are worth retrying (429/5xx) and which are not (401/400).
- Dependency injection for testing code that talks to external APIs.
- Loading `.env` with Node's built-in `process.loadEnvFile` and keeping secrets out of git.

## Next Week

Week 12: add `data/videos.json`; implement `get_video_stats` and `check_title` as normal functions; add `suggestTitles` with JSON output validation; add core tests.
