import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {FLOOR,createFloorGeometry,floorSupports,type FloorShape} from './floor-kit.ts';
export {roomPanels,panelState,type RoomFloorMode} from './room-panel-data.ts';
import {roomPanels,panelState,type RoomFloorMode} from './room-panel-data.ts';
export function buildRoomFloor(color:(id:string)=>string){
 const group=new T.Group(),raised=new T.Group(),tiles=new Map<string,T.Mesh>();group.add(raised);
 const resources=new Set<T.BufferGeometry>(),materials=new Map<string,T.MeshStandardMaterial>();
 function box(parent:T.Object3D,size:[number,number,number],at:[number,number,number],tone:string,shape:FloorShape='solid'){
  const key=shape+size.join(',');let geometry=[...resources].find(g=>g.name===key);if(!geometry){geometry=createFloorGeometry(shape,size);geometry.name=key;resources.add(geometry);}
  let material=materials.get(tone);if(!material){material=new T.MeshStandardMaterial({color:color(tone),roughness:.85});materials.set(tone,material);}
  const mesh=new T.Mesh(geometry,material);mesh.position.set(...at);parent.add(mesh);return mesh;
 }
 const slab=box(group,[14.1,.22,12.1],[0,-.77,0],'grid');
 for(const panel of roomPanels){
  const tile=box(raised,[FLOOR.panelSize,FLOOR.panelThickness,FLOOR.panelSize],[panel.x,FLOOR.panelY,panel.z],panel.shape==='vent'?'cooling':'paper',panel.shape);
  tile.userData.floorPanel=panel.id;tile.userData.floorShape=panel.shape;tiles.set(panel.id,tile);
  if(panel.shape==='service'){
   const seal=box(tile,[FLOOR.grommetOuter,FLOOR.grommetHeight,FLOOR.grommetOuter],[0,FLOOR.grommetLocalY,0],'inset','grommet');
   seal.name='Sealed service opening';seal.userData.floorPanel=panel.id;seal.userData.floorShape='grommet';
  }
 }
 for(const support of floorSupports(14,12))box(raised,support.size,support.at,'racks');
 // Batch the static support structure while retaining individual selectable panels.
 const supports=raised.children.filter(o=>o instanceof T.Mesh&&!o.userData.floorPanel) as T.Mesh[];
 const transformed=supports.map(mesh=>{mesh.updateMatrix();return mesh.geometry.clone().applyMatrix4(mesh.matrix);});
 const supportGeometry=mergeGeometries(transformed);transformed.forEach(g=>g.dispose());
 if(supportGeometry){const merged=new T.Mesh(supportGeometry,materials.get('racks'));raised.add(merged);supports.forEach(mesh=>raised.remove(mesh));}
 // Original shared support buffers are no longer referenced by the scene.
 const retained=new Set<T.BufferGeometry>();group.traverse(o=>{if(o instanceof T.Mesh)retained.add(o.geometry);});for(const geometry of resources)if(!retained.has(geometry))geometry.dispose();
 return {group,tiles,update(mode:RoomFloorMode,cutaway:boolean,lifted:readonly string[],visible:boolean){
  group.visible=visible;raised.visible=mode==='raised';slab.position.y=mode==='raised'?-.77:-.11;
  for(const panel of roomPanels){const state=panelState(panel,mode,cutaway,lifted),mesh=tiles.get(panel.id)!;mesh.visible=state.visible;mesh.position.y=state.height;}
 }};
}
