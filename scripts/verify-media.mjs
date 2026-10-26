// Network check: HEAD every image_key and video_key in src/data/species.json at media_base.
// Not part of the build. Run after any key change: npm run verify:media
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONCURRENCY = 8;
const RETRIES = 3;
const TYPES = { images: 'image/png', videos: 'video/mp4' };

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'species.json');
const catalog = JSON.parse(readFileSync(file, 'utf8'));
const base = catalog.media_base.replace(/\/+$/, '');
if (!base.startsWith('https://')) {
  console.error('verify:media: media_base must be an https URL');
  process.exit(1);
}

const keys = catalog.species.flatMap((s) => [s.image_key, s.video_key].filter((k) => typeof k === 'string'));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function check(key) {
  const url = `${base}/${key}`;
  const expected = TYPES[key.split('/')[0]];
  let problem = '';
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    if (attempt > 0) await sleep(500 * attempt);
    try {
      const res = await fetch(url, { method: 'HEAD' });
      const type = (res.headers.get('content-type') ?? '').split(';')[0].trim();
      const length = Number(res.headers.get('content-length') ?? 0);
      if (res.status !== 200) problem = `status ${res.status}`;
      else if (type !== expected) problem = `content-type "${type}", expected ${expected}`;
      else if (!(length > 0)) problem = 'zero or missing content-length';
      else return null;
    } catch (err) {
      problem = `network error: ${err.message}`;
    }
  }
  return `${url}: ${problem} (after ${RETRIES} retries)`;
}

const failures = [];
let next = 0;
async function worker() {
  while (next < keys.length) {
    const key = keys[next++];
    const result = await check(key);
    if (result) failures.push(result);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const images = keys.filter((k) => k.startsWith('images/')).length;
console.log(`verify:media: ${keys.length} keys checked (${images} images, ${keys.length - images} videos) at ${base}, ${failures.length} failed`);
if (failures.length) {
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('verify:media: ok');
