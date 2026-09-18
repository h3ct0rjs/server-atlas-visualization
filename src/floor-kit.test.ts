import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {FLOOR,createFloorGeometry,floorSupports} from './floor-kit.ts';
import {floorParts,partPosition} from './detail-models.ts';
import {buildRoomFloor,roomPanels} from './room-floor.ts';
function hits(mesh:T.Mesh,x=0,z=0){mesh.updateMatrixWorld(true);return new T.Raycaster(new T.Vector3(x,3,z),new T.Vector3(0,-1,0)).intersectObject(mesh,true);}
test('service panels, seals and vents contain physical through-openings',()=>{
 for(const shape of ['service','grommet','vent'] as const){
  const size:[number,number,number]=shape==='grommet'?[.38,.045,.38]:[.97,.09,.97];
  const geometry=createFloorGeometry(shape,size),material=new T.MeshBasicMaterial(),mesh=new T.Mesh(geometry,material);
  assert.equal(hits(mesh,0,shape==='vent'?.06:0).length,0,shape);
  assert.ok(hits(mesh,size[0]/2-.015).length>0,`${shape} retains edges`);geometry.dispose();material.dispose();
 }
});
test('support grids include every perimeter corner and both stringer axes',()=>{
 for(const [columns,rows] of [[6,5],[14,12]]){
  const supports=floorSupports(columns,rows);
  assert.equal(supports.filter(p=>p.kind==='pedestal').length,(columns+1)*(rows+1));
  assert.equal(supports.filter(p=>p.kind==='foot').length,(columns+1)*(rows+1));
  assert.equal(supports.filter(p=>p.kind==='stringer').length,columns+rows+2);
  for(const x of [-columns/2,columns/2])for(const z of [-rows/2,rows/2])assert.ok(supports.some(p=>p.kind==='pedestal'&&p.at[0]===x&&p.at[2]===z));
 }
});
test('detail and room share surface, plenum and aligned service seal geometry',()=>{
 const parts=floorParts('raised'),seal=parts.find(p=>p.id==='grommet')!,panel=parts.find(p=>p.id===seal.parentPanel)!;
 assert.ok(Math.abs(seal.at[1]-seal.size[1]/2-(panel.at[1]+panel.size[1]/2))<1e-9,'seal seats on panel top');
 assert.ok(seal.size[0]>FLOOR.serviceOpening,'seal overlaps opening rim');
 for(const amount of [0,.5,1]){
  const a=partPosition(panel,amount),b=partPosition(seal,amount);assert.equal(a[0],b[0]);assert.equal(a[2],b[2]);assert.ok(Math.abs(b[1]-a[1]-FLOOR.grommetLocalY)<1e-9);
 }
 for(const mode of ['raised','slab'] as const){
  const assembly=floorParts(mode),slab=assembly.find(p=>p.id==='slab')!;
  assert.ok(Math.abs(slab.at[1]+slab.size[1]/2-(mode==='raised'?FLOOR.raisedSlabTop:0))<1e-9);
  for(const foot of assembly.filter(p=>p.group==='Loads')){
   assert.equal(foot.at[1]-foot.size[1]/2,0);
   if(mode==='raised')assert.ok(assembly.some(p=>p.group==='Floor panels'&&!p.cover&&p.at[0]===foot.at[0]&&p.at[2]===foot.at[2]));
  }
 }
 const floor=buildRoomFloor(()=> '#778899');
 for(const service of roomPanels.filter(p=>p.shape==='service')){
  assert.equal(service.occupied,false);const tile=floor.tiles.get(service.id)!;
  assert.equal(tile.children.length,1);assert.equal(tile.children[0].userData.floorPanel,service.id);
  assert.equal(hits(tile,service.x,service.z).length,0);
  floor.update('raised',false,[service.id],true);assert.equal(tile.position.y,.7);assert.equal(tile.children[0].position.y,FLOOR.grommetLocalY);
  floor.update('raised',true,[],true);if(service.z>=0)assert.equal(tile.visible,false);
 }
 const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();floor.group.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);materials.add(o.material as T.Material);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
});
