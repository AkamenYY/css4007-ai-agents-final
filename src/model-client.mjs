// OpenAI Chat Completions adapter for ShortsPilot.
// Returns a provider-independent shape: {text, toolCalls: [{id, name, arguments}], message}.
// No external dependencies: uses the built-in fetch of Node.js 22.

const API_URL = 'https://api.openai.com/v1/chat/completions';

// HTTP statuses where trying again can help (rate limit, overload, server errors).
const RETRYABLE_STATUSES = new Set([408, 409, 429, 500, 502, 503, 504]);

export class LLMError extends Error {
  constructor(message, {status = null, retryable = false} = {}) {
    super(message);
    this.name = 'LLMError';
    this.status = status;
    this.retryable = retryable;
  }
}

// Our tool format: {name, description, parameters (JSON Schema)}.
// OpenAI expects: {type: 'function', function: {name, description, parameters}}.
export function toOpenAITools(tools) {
  return tools.map(tool => ({
    type: 'function',
    function: {name: tool.name, description: tool.description, parameters: tool.parameters},
  }));
}

// Turn the raw API JSON into {text, toolCalls, message}.
export function parseResponse(data) {
  const message = data?.choices?.[0]?.message;
  if (!message) throw new LLMError('Model response contains no message');

  const toolCalls = (message.tool_calls ?? []).map(call => {
    // The model sends arguments as a JSON string; it may be malformed.
    let args = null;
    let argumentsError = null;
    try {
      args = JSON.parse(call.function?.arguments || '{}');
    } catch {
      argumentsError = 'Tool arguments are not valid JSON';
    }
    return {id: call.id, name: call.function?.name, arguments: args, argumentsError};
  });

  return {text: message.content ?? '', toolCalls, message};
}

// Convert low-level failures (timeouts, network) into LLMError.
function toLLMError(err) {
  if (err instanceof LLMError) return err;
  if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
    return new LLMError('Request to the model timed out', {retryable: true});
  }
  if (err instanceof TypeError) {
    return new LLMError('Network error while contacting the model: ' + err.message, {retryable: true});
  }
  return new LLMError('Unexpected model client error: ' + (err?.message ?? String(err)));
}

// Read the error text from the API without ever echoing request headers (API key).
async function errorDetail(res) {
  try {
    const body = await res.json();
    return body?.error?.message ?? res.statusText;
  } catch {
    return res.statusText || 'no details';
  }
}

/**
 * Send messages (and optional tools) to the model.
 * options: apiKey, model, fetchImpl, maxRetries, timeoutMs, sleep — mainly for tests.
 */
export async function complete(messages, tools = [], options = {}) {
  const apiKey = options.apiKey ?? process.env.LLM_API_KEY;
  const model = options.model ?? process.env.LLM_MODEL;
  const fetchImpl = options.fetchImpl ?? fetch;
  const maxRetries = options.maxRetries ?? 2;
  const timeoutMs = options.timeoutMs ?? 30_000;
  const sleep = options.sleep ?? (ms => new Promise(resolve => setTimeout(resolve, ms)));

  if (!apiKey) throw new LLMError('LLM_API_KEY is not set. Copy .env.example to .env and add your OpenAI key.');
  if (!model) throw new LLMError('LLM_MODEL is not set. Add a model name (for example gpt-5-mini) to .env.');
  if (!Array.isArray(messages) || messages.length === 0) throw new LLMError('messages must be a non-empty array');

  const body = {model, messages};
  if (tools.length > 0) body.tools = toOpenAITools(tools);

  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetchImpl(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`},
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!res.ok) {
        throw new LLMError(`OpenAI API error ${res.status}: ${await errorDetail(res)}`, {
          status: res.status,
          retryable: RETRYABLE_STATUSES.has(res.status),
        });
      }

      let data;
      try {
        data = await res.json();
      } catch {
        throw new LLMError('Model returned invalid JSON');
      }
      return parseResponse(data);
    } catch (err) {
      const error = toLLMError(err);
      if (!error.retryable || attempt >= maxRetries) throw error;
      await sleep(500 * 2 ** attempt); // exponential backoff: 0.5s, 1s, 2s...
    }
  }
}
