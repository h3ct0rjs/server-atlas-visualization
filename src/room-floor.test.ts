import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {roomPanels,panelState,buildRoomFloor} from './room-floor.ts';
test('floor service panels lift individually without removing equipment-bearing panels',()=>{
 assert.equal(new Set(roomPanels.map(p=>p.id)).size,168);
 const free=roomPanels.find(p=>!p.occupied&&p.z>=0)!,loaded=roomPanels.find(p=>p.occupied&&p.z>=0)!;
 assert.equal(panelState(free,'raised',true,[]).visible,false);
 assert.deepEqual(panelState(free,'raised',true,[free.id]),{visible:true,height:.7});
 assert.deepEqual(panelState(loaded,'raised',true,[loaded.id]),{visible:true,height:-.045});
 assert.equal(panelState(free,'slab',false,[free.id]).visible,false);
});
test('room floor architectures keep the equipment contact surface at zero and batch supports',()=>{
 const floor=buildRoomFloor(()=> '#778899');
 floor.update('slab',false,[],true);
 const slab=floor.group.children[1] as T.Mesh;
 assert.ok(Math.abs(new T.Box3().setFromObject(slab).max.y)<1e-6);
 floor.update('raised',true,[],true);
 assert.ok(Math.abs(new T.Box3().setFromObject(slab).max.y+.66)<1e-6);
 assert.equal(floor.tiles.size,168);
 assert.equal((floor.group.children[0] as T.Group).children.length,169);
 floor.update('raised',false,[],false);assert.equal(floor.group.visible,false);
 const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();floor.group.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);materials.add(o.material as T.Material);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
});
