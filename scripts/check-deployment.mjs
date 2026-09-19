import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin = new URL(process.argv[2]);
const local = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const entryAssets = [...local.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map(match => match[1]);
const manifest=JSON.parse(await readFile(new URL('../dist/asset-manifest.json',import.meta.url),'utf8'));
const assets=[...new Set([...entryAssets,...Object.values(manifest).flatMap(chunk=>[chunk.file,...(chunk.css??[])]).map(file=>`/${file}`)])];
assert.ok(entryAssets.length > 0, 'Build contains no JS/CSS assets');
// DNS and certificates may need time on the first deployment. A failed check
// reports failure without undoing a successfully uploaded Worker.
for (let attempt = 1; attempt <= 12; attempt++) {
  try {
    const response = await fetch(origin, {cache:'no-store', signal:AbortSignal.timeout(15000)});
    assert.equal(response.status, 200, 'Homepage must return 200');
    const html = await response.text();
    for (const asset of assets) {
      if(entryAssets.includes(asset))assert.ok(html.includes(asset), `Homepage does not reference current asset ${asset}`);
      const file = await fetch(new URL(asset, origin), {signal:AbortSignal.timeout(15000)});
      assert.equal(file.status, 200, `Asset unavailable: ${asset}`);
      assert.match(file.headers.get('content-type') ?? '', asset.endsWith('.css') ? /text\/css/ : /javascript/);
    }
    console.log(`Verified ${origin}: current HTML and ${assets.length} assets`);
    process.exit(0);
  } catch (error) {
    console.error(`Attempt ${attempt}/12: ${error.message}`);
    if (attempt === 12) process.exit(1);
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}
