import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createRoomServerFactory} from './room-server.ts';
import {equipment} from './atlas.ts';

test('detailed room servers fit inventory bounds and share geometry without sharing selection materials',()=>{
 const factory=createRoomServerFactory(id=>id==='server-metal'?'#8899aa':'#334455');
 const servers=equipment.filter(e=>e.system==='compute').map(e=>{
  const group=factory.create(e.id,e.size);group.position.set(...e.position);group.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(group),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
  e.size.forEach((value,i)=>assert.ok(Math.abs(size.getComponent(i)-value)<1e-5));
  e.position.forEach((value,i)=>assert.ok(Math.abs(center.getComponent(i)-value)<1e-5));
  assert.ok(group.children.length<20,'merge details into a bounded number of material batches');
  assert.ok(group.children.some(o=>o.userData.serverCover));
  for(const mesh of group.children)assert.equal(mesh.userData.id,e.id);
  return group;
 });
 const a=servers[0].children[0] as T.Mesh<T.BufferGeometry,T.MeshStandardMaterial>,b=servers[1].children[0] as typeof a;
 assert.equal(a.geometry,b.geometry);assert.notEqual(a.material,b.material);
 a.material.emissive.set('#ffffff');assert.equal(b.material.emissive.getHex(),0);
 for(const group of servers)for(const mesh of group.children)(mesh as typeof a).material.dispose();
 factory.dispose();
});
