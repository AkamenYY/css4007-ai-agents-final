// Command-line entry point.
//   npm start -- "your question"            ask the assistant
//   npm start -- titles "video idea"        3 validated titles (JSON from the model)
//   npm start -- stats views 3              top videos (no LLM)
//   npm start -- check "title to check"     title rule check (no LLM)
import {ask} from './assistant.mjs';
import {suggestTitles} from './titles.mjs';
import {getVideoStats, checkTitle} from './tools.mjs';

// Load LLM_API_KEY / LLM_MODEL from .env if the file exists (built into Node.js 22).
try {
  process.loadEnvFile('.env');
} catch (err) {
  if (err.code !== 'ENOENT') throw err;
}

const [command, ...rest] = process.argv.slice(2);

try {
  if (command === 'titles') {
    for (const t of await suggestTitles(rest.join(' '))) {
      console.log(`${t.ok ? 'OK ' : '!! '} ${t.title}${t.ok ? '' : '  → ' + t.problems.join('; ')}`);
    }
  } else if (command === 'stats') {
    const limit = rest[1] === undefined ? 3 : Number(rest[1]);
    console.log(JSON.stringify(getVideoStats({sort_by: rest[0] ?? 'views', limit}), null, 2));
  } else if (command === 'check') {
    console.log(JSON.stringify(checkTitle({title: rest.join(' ')}), null, 2));
  } else {
    console.log(await ask(process.argv.slice(2).join(' ')));
  }
} catch (err) {
  console.error('Error: ' + err.message);
  process.exitCode = 1;
}
