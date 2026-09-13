import {test} from 'node:test';
import assert from 'node:assert/strict';
import {serverParts,floorParts,partPosition} from './detail-models.ts';
test('detail assemblies have unique IDs and finite, positive geometry',()=>{for(const parts of [serverParts,floorParts('raised'),floorParts('slab')]){assert.equal(new Set(parts.map(p=>p.id)).size,parts.length);for(const p of parts){assert.ok(p.size.every(v=>v>0&&Number.isFinite(v)));assert.ok(partPosition(p,1).every(Number.isFinite));assert.deepEqual(partPosition(p,0),p.at);}}});
test('floor architectures provide distinct distribution systems over a slab',()=>{const raised=floorParts('raised'),slab=floorParts('slab');assert.ok(raised.some(p=>p.group==='Understructure'));assert.ok(raised.some(p=>p.name.startsWith('Perforated')));assert.ok(slab.some(p=>p.id==='overhead'));assert.ok(!slab.some(p=>p.group==='Understructure'||p.group==='Floor panels'));for(const parts of [raised,slab]){assert.ok(parts.some(p=>p.id==='slab'));assert.equal(parts.filter(p=>p.group==='Loads').length,2);}});
test('server cover and shroud can be removed independently of essential components',()=>{assert.deepEqual(serverParts.filter(p=>p.cover).map(p=>p.id).sort(),['lid','shroud']);for(const id of ['board','cpu-0','cpu-1','backplane','nic','psu-0','psu-1'])assert.ok(serverParts.some(p=>p.id===id&&!p.cover));});

test('server memory modules do not intersect the rear power supplies',()=>{
 const modules=serverParts.filter(p=>p.id.startsWith('dimm-'));
 const supplies=serverParts.filter(p=>p.id.startsWith('psu-'));
 for(const dimm of modules)for(const psu of supplies){
  const intersects=[0,1,2].every(axis=>Math.abs(dimm.at[axis]-psu.at[axis])<(dimm.size[axis]+psu.size[axis])/2);
  assert.equal(intersects,false,`${dimm.id} intersects ${psu.id}`);
 }
});
