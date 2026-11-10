// Command-line entry point: npm start -- "your question"
import {ask} from './assistant.mjs';

// Load LLM_API_KEY / LLM_MODEL from .env if the file exists (built into Node.js 22).
try {
  process.loadEnvFile('.env');
} catch (err) {
  if (err.code !== 'ENOENT') throw err;
}

const question = process.argv.slice(2).join(' ');

try {
  console.log(await ask(question));
} catch (err) {
  console.error('Error: ' + err.message);
  process.exitCode = 1;
}
