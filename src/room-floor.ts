import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {equipment} from './atlas.ts';
import {FLOOR,createFloorGeometry,floorSupports,type FloorShape} from './floor-kit.ts';
export type RoomFloorMode='raised'|'slab';
export const roomPanels=Array.from({length:168},(_,index)=>{
 const column=index%14,row=Math.floor(index/14),x=column-6.5,z=row-5.5;
 const occupied=equipment.some(e=>(e.system==='racks'||!e.rack&&e.system!=='network')&&Math.abs(x-e.position[0])<.5+e.size[0]/2&&Math.abs(z-e.position[2])<.5+e.size[2]/2);
 const shape:FloorShape=!occupied&&column===11&&(row===3||row===8)?'service':!occupied&&Math.abs(z)<1&&Math.abs(x)<3.5?'vent':'solid';
 return {id:`panel-${column+1}-${row+1}`,name:`${shape==='service'?'Service opening':shape==='vent'?'Perforated':'Solid'} panel ${column+1}.${row+1}`,x,z,occupied,shape};
});
export function panelState(panel:typeof roomPanels[number],mode:RoomFloorMode,cutaway:boolean,lifted:readonly string[]){
 return {visible:mode==='raised'&&(!(cutaway&&panel.z>=0&&!panel.occupied)||lifted.includes(panel.id)),height:mode==='raised'&&!panel.occupied&&lifted.includes(panel.id)?.7:-.045};
}
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
