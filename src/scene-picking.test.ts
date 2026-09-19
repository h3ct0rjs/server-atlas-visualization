import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {pickVisible} from './scene-picking.ts';
import {buildRoomFloor,roomPanels,panelState} from './room-floor.ts';
function downward(x:number,z:number){return new T.Raycaster(new T.Vector3(x,4,z),new T.Vector3(0,-1,0));}
test('hidden descendants and hidden ancestors never intercept a visible target',()=>{
 const root=new T.Group(),geometry=new T.BoxGeometry(1,.1,1),material=new T.MeshBasicMaterial();
 const target=new T.Mesh(geometry,material),hidden=new T.Mesh(geometry,material);
 hidden.position.y=1;hidden.visible=false;root.add(target,hidden);root.updateMatrixWorld(true);
 assert.equal(pickVisible(downward(0,0),[root])?.object,target);
 hidden.visible=true;assert.equal(pickVisible(downward(0,0),[root])?.object,hidden);
 root.visible=false;assert.equal(pickVisible(downward(0,0),[target,hidden]),undefined);
 geometry.dispose();material.dispose();
});
test('room panel ray hits track lifting, cutaway, sealed openings and loaded-panel protection',()=>{
 const floor=buildRoomFloor(()=> '#778899');const roots=[...floor.tiles.values()];
 const free=roomPanels.find(p=>!p.occupied&&p.z>0&&p.shape==='solid')!;
 const loaded=roomPanels.find(p=>p.occupied&&p.z>0)!;
 const service=roomPanels.find(p=>p.shape==='service'&&p.z>0)!;
 const hit=(p:typeof free,offset=0)=>{floor.group.updateMatrixWorld(true);return pickVisible(downward(p.x+offset,p.z),roots);};
 floor.update('raised',false,[],true);assert.equal(hit(free)?.object.userData.floorPanel,free.id);
 floor.update('raised',false,[free.id,loaded.id,service.id],true);
 assert.ok(Math.abs(hit(free)!.point.y-.745)<1e-6);
 assert.equal(panelState(loaded,'raised',false,[loaded.id]).height,-.045);
 assert.ok(Math.abs(hit(loaded)!.point.y)<1e-6);
 assert.equal(hit(service,.12)?.object.userData.floorShape,'grommet');
 floor.update('raised',true,[],true);assert.equal(hit(free),undefined);assert.equal(hit(service,.12),undefined);assert.ok(hit(loaded));
 floor.update('raised',true,[free.id],true);assert.ok(hit(free));
 floor.update('slab',false,[],true);assert.equal(hit(loaded),undefined);
 floor.update('raised',false,[],false);assert.equal(hit(loaded),undefined);
 const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();floor.group.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);materials.add(o.material as T.Material);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
});
