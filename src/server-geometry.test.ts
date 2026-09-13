import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {serverParts} from './detail-models.ts';
import {buildServerPart} from './server-geometry.ts';

test('every visible server detail resolves picking to its component and has finite geometry',()=>{
 for(const part of serverParts){
  const group=buildServerPart(part,()=> '#627d87');
  let count=0;group.traverse(object=>{
   if(!(object instanceof T.Mesh))return;
   count++;assert.equal(object.userData.id,part.id);
   assert.ok(object.material instanceof T.MeshStandardMaterial,'selection expects a standard material');
   object.geometry.computeBoundingBox();
   const bounds=object.geometry.boundingBox!;
   assert.ok([...bounds.min.toArray(),...bounds.max.toArray()].every(Number.isFinite));
  });
  assert.ok(count>1,`${part.id} should have recognizable subgeometry`);
 }
});
test('heatsinks expose parallel fins and adapters expose rear-facing ports',()=>{
 const sink=buildServerPart(serverParts.find(p=>p.id==='sink-0')!,()=> '#627d87');
 const fins=sink.children.filter(p=>p.name==='Air-aligned cooling fin');
 assert.equal(fins.length,13);
 const nic=buildServerPart(serverParts.find(p=>p.id==='nic')!,()=> '#627d87');
 const ports=nic.children.filter(p=>p.name==='Network port opening');
 assert.equal(ports.length,2);assert.ok(ports.every(p=>p.position.z<0));
});
