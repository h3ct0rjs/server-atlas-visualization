import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {gzipSync} from 'node:zlib';
const manifest=JSON.parse(await readFile(new URL('../dist/asset-manifest.json',import.meta.url),'utf8'));
function dependencies(key,seen=new Set()) {if(seen.has(key))return seen;seen.add(key);for(const dependency of manifest[key].imports??[])dependencies(dependency,seen);return seen;}
const shell=dependencies('index.html');
for(const path of ['src/DetailExplorer.tsx']){
 assert.ok(manifest[path]?.isDynamicEntry,`${path} must remain lazy-loaded`);
 assert.ok(!shell.has(path),`${path} must not be an eager shell dependency`);
}

for(const [name,key] of [['room','index.html'],['detail','src/DetailExplorer.tsx']]){
 let bytes=0,gzipBytes=0;for(const dependency of dependencies(key)){const source=await readFile(new URL(`../dist/${manifest[dependency].file}`,import.meta.url));bytes+=source.length;gzipBytes+=gzipSync(source).length;}
 console.log(`${name} JavaScript (including shared dependencies): ${bytes} bytes; gzip ${gzipBytes} bytes`);
}
