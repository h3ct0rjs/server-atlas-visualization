import {test} from 'node:test';
import assert from 'node:assert/strict';
import {equipment,networkLinks,searchEquipment,positionFor} from './atlas.ts';
test('equipment IDs, parents, and fabric endpoints remain valid',()=>{
 const ids=new Set(equipment.map(e=>e.id));assert.equal(ids.size,equipment.length);
 for(const e of equipment){if(e.rack)assert.equal(equipment.find(p=>p.id===e.rack)?.system,'racks');assert.ok(e.size.every(n=>n>0));}
 for(const l of networkLinks){assert.ok(ids.has(l.source));assert.ok(ids.has(l.target));}
 for(const e of equipment.filter(e=>e.kind==='Top-of-rack switch'))assert.equal(new Set(networkLinks.filter(l=>l.source===e.id).map(l=>l.target)).size,2);
});
test('search respects system filters and case-insensitive rack identifiers',()=>{assert.ok(searchEquipment('a01').every(e=>e.id.startsWith('A01')));assert.equal(searchEquipment('a01',['compute']).length,6);assert.equal(searchEquipment('missing-device').length,0);assert.equal(searchEquipment('',[]).length,0);});
test('server geometry stays inside its rack in the assembled view',()=>{for(const e of equipment.filter(e=>e.system==='compute')){const rack=equipment.find(r=>r.id===e.rack)!;for(let axis=0;axis<3;axis++)assert.ok(Math.abs(e.position[axis]-rack.position[axis])+e.size[axis]/2<=rack.size[axis]/2);assert.deepEqual(positionFor(e,0),e.position);}});
