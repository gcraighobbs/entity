// Offline check of src/data/species.json. Runs as prebuild; no network, no dependencies.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'species.json');
const failures = [];
const fail = (msg) => failures.push(msg);

let catalog;
try {
  catalog = JSON.parse(readFileSync(file, 'utf8'));
} catch (err) {
  console.error(`verify:catalog: cannot read species.json: ${err.message}`);
  process.exit(1);
}

if (typeof catalog.media_base !== 'string' || !catalog.media_base.startsWith('https://')) {
  fail('media_base must be an https URL');
}
if (!Array.isArray(catalog.species) || catalog.species.length === 0) {
  fail('species must be a non-empty array');
}

const REQUIRED = ['scientific_name', 'common_name', 'year_extinct', 'last_seen', 'extinction_cause', 'image_key'];
const KEY = /^(images|videos)\/[^/]+\.(png|mp4)$/;
const ids = new Set();
const names = new Set();
const noVideo = [];

for (const [i, s] of (catalog.species ?? []).entries()) {
  const label = `species[${i}] (${s?.id ?? 'no id'})`;
  if (typeof s.id !== 'string' || !/^[a-z0-9-]+$/.test(s.id)) fail(`${label}: id must match ^[a-z0-9-]+$`);
  else if (ids.has(s.id)) fail(`${label}: duplicate id`);
  else ids.add(s.id);

  for (const field of REQUIRED) {
    if (typeof s[field] !== 'string' || s[field].trim() === '') fail(`${label}: ${field} must be a non-empty string`);
  }
  if (typeof s.scientific_name === 'string') {
    const name = s.scientific_name.trim().toLowerCase();
    if (names.has(name)) fail(`${label}: duplicate scientific_name "${s.scientific_name}"`);
    names.add(name);
  }

  if (s.video_key !== null && typeof s.video_key !== 'string') fail(`${label}: video_key must be a string or null`);
  if (s.video_key === null) noVideo.push(s.id);

  for (const [field, dir, ext] of [['image_key', 'images', 'png'], ['video_key', 'videos', 'mp4']]) {
    const key = s[field];
    if (typeof key !== 'string') continue;
    const m = KEY.exec(key);
    if (!m) fail(`${label}: ${field} "${key}" does not match ${KEY}`);
    else if (m[1] !== dir || m[2] !== ext) fail(`${label}: ${field} "${key}" must be ${dir}/*.${ext}`);
  }
}

console.log(`verify:catalog: ${catalog.species?.length ?? 0} species, ${noVideo.length} with no video${noVideo.length ? `: ${noVideo.join(', ')}` : ''}`);
if (failures.length) {
  console.error(`verify:catalog: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log('verify:catalog: ok');
