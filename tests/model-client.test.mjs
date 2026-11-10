// Project tests for the OpenAI adapter and the first assistant request.
// They use a fake fetch / fake model, so no API key or network is needed.
import test from 'node:test';
import assert from 'node:assert/strict';
import {complete, LLMError} from '../src/model-client.mjs';
import {ask, SYSTEM_PROMPT} from '../src/assistant.mjs';

const KEY = 'sk-test-secret-key';
const noSleep = async () => {};

function jsonResponse(status, body) {
  return {ok: status >= 200 && status < 300, status, statusText: 'status ' + status, json: async () => body};
}

// Fake fetch that returns the given responses in order and records each request.
function fakeFetch(responses) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({url, init, body: JSON.parse(init.body)});
    const next = responses[calls.length - 1];
    if (next instanceof Error) throw next;
    return next;
  };
  return {impl, calls};
}

const opts = fetchImpl => ({apiKey: KEY, model: 'test-model', fetchImpl, sleep: noSleep});
const textReply = text => jsonResponse(200, {choices: [{message: {role: 'assistant', content: text}}]});

test('returns model text and sends model + messages to the API', async () => {
  const {impl, calls} = fakeFetch([textReply('Hello creator')]);
  const result = await complete([{role: 'user', content: 'hi'}], [], opts(impl));
  assert.equal(result.text, 'Hello creator');
  assert.deepEqual(result.toolCalls, []);
  assert.equal(calls[0].body.model, 'test-model');
  assert.equal(calls[0].body.tools, undefined);
  assert.equal(calls[0].init.headers.Authorization, 'Bearer ' + KEY);
});

test('converts tool definitions and parses tool calls', async () => {
  const tool = {name: 'find_top_videos', description: 'Rank videos', parameters: {type: 'object', properties: {limit: {type: 'integer'}}}};
  const reply = jsonResponse(200, {choices: [{message: {role: 'assistant', content: null, tool_calls: [
    {id: 'call_1', type: 'function', function: {name: 'find_top_videos', arguments: '{"limit":5}'}},
    {id: 'call_2', type: 'function', function: {name: 'find_top_videos', arguments: '{broken'}},
  ]}}]});
  const {impl, calls} = fakeFetch([reply]);
  const result = await complete([{role: 'user', content: 'top videos'}], [tool], opts(impl));
  assert.deepEqual(calls[0].body.tools, [{type: 'function', function: tool}]);
  assert.equal(result.text, '');
  assert.deepEqual(result.toolCalls[0], {id: 'call_1', name: 'find_top_videos', arguments: {limit: 5}, argumentsError: null});
  assert.equal(result.toolCalls[1].arguments, null);
  assert.match(result.toolCalls[1].argumentsError, /not valid JSON/);
});

test('retries on rate limit and server errors, then succeeds', async () => {
  const {impl, calls} = fakeFetch([
    jsonResponse(429, {error: {message: 'Rate limit'}}),
    jsonResponse(503, {error: {message: 'Overloaded'}}),
    textReply('ok after retry'),
  ]);
  const result = await complete([{role: 'user', content: 'hi'}], [], opts(impl));
  assert.equal(result.text, 'ok after retry');
  assert.equal(calls.length, 3);
});

test('stops after the retry budget on repeated timeouts', async () => {
  const timeout = Object.assign(new Error('timed out'), {name: 'TimeoutError'});
  const {impl, calls} = fakeFetch([timeout, timeout, timeout, timeout]);
  await assert.rejects(complete([{role: 'user', content: 'hi'}], [], {...opts(impl), maxRetries: 2}), /timed out/);
  assert.equal(calls.length, 3); // first try + 2 retries
});

test('does not retry auth errors and never leaks the API key', async () => {
  const {impl, calls} = fakeFetch([jsonResponse(401, {error: {message: 'Incorrect API key provided'}})]);
  await assert.rejects(complete([{role: 'user', content: 'hi'}], [], opts(impl)), err => {
    assert.ok(err instanceof LLMError);
    assert.equal(err.status, 401);
    assert.ok(!err.message.includes(KEY));
    return true;
  });
  assert.equal(calls.length, 1);
});

test('gives clear errors for missing key, missing model and malformed responses', async () => {
  await assert.rejects(complete([{role: 'user', content: 'hi'}], [], {apiKey: '', model: 'm'}), /LLM_API_KEY is not set/);
  await assert.rejects(complete([{role: 'user', content: 'hi'}], [], {apiKey: KEY, model: ''}), /LLM_MODEL is not set/);
  const {impl} = fakeFetch([jsonResponse(200, {choices: []})]);
  await assert.rejects(complete([{role: 'user', content: 'hi'}], [], opts(impl)), /no message/);
});

test('assistant sends the system prompt, validates input and rejects empty answers', async () => {
  let seen;
  const fakeModel = async messages => { seen = messages; return {text: '  1. Yeti lost his egg  ', toolCalls: []}; };
  assert.equal(await ask('title ideas please', fakeModel), '1. Yeti lost his egg');
  assert.equal(seen[0].content, SYSTEM_PROMPT);
  assert.equal(seen[1].content, 'title ideas please');
  await assert.rejects(ask('   ', fakeModel), /Please enter a question/);
  await assert.rejects(ask('x'.repeat(2001), fakeModel), /too long/);
  await assert.rejects(ask('hi', async () => ({text: '', toolCalls: []})), /empty answer/);
});
