# Semester Week 10 Progress Report

## Completed Work

- Chose the project topic: **ShortsPilot**, an AI agent for YouTube Shorts creators, based on my own work running Roblox Shorts channels.
- Chose **level C** (tool-using agent) and **OpenAI** as the model provider.
- Wrote the full project proposal (`reports/proposal.md`): problem, target users, 9 proposed functions with inputs and outputs, 3 LLM-callable tools (`get_channel_summary`, `find_top_videos`, `check_metadata_policy`), architecture diagram, example requests, evaluation plan and milestones for weeks 10–17.

Note: I started late. The proposal was committed on 10 November, at the start of the Week 11 window, so I am doing the Week 10 and Week 11 deliverables together this week.

## Important Commits

- Commit hash: `33cb69a`
- Description: Add Week 10 project proposal: ShortsPilot (C level)
- Link: https://github.com/AkamenYY/css4007-ai-agents-final/commit/33cb69a

## Current Functionality

No application code yet. The repository contains the completed proposal and the instructor starter.

## Problems Encountered

- Choosing a topic that is useful in practice and also needs real tools, not just a chatbot with a prompt.
- Deciding what data the agent can use without a complicated YouTube OAuth setup.

## Solutions

- I picked my own problem: writing Shorts metadata, analysing which videos performed, and avoiding YouTube spam-policy strikes.
- The analytics come from a CSV that YouTube Studio exports (Analytics → Advanced mode → Export). This gives real data with no OAuth. The policy checker is pure code, which makes it testable and deterministic.

## What I Learned

- The difference between D, C and A levels. At C level the **LLM itself must choose the tool**, and its answers must be grounded in real tool results. Hard-coded routing does not count.
- How function calling works conceptually: tools are described with a JSON Schema, the model returns a tool name and arguments, my code validates and executes them, and the result goes back to the model.
- Why deterministic checks, like the policy checker, belong in code and not only in the prompt.

## Next Week

Week 11: implement the OpenAI adapter in `src/model-client.mjs` with error handling, make the first working request through a CLI, add setup documentation and the first tests.
