import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {equipment} from './atlas.ts';
export type RoomFloorMode='raised'|'slab';
export const roomPanels=Array.from({length:168},(_,index)=>{
 const column=index%14,row=Math.floor(index/14),x=column-6.5,z=row-5.5;
 const occupied=equipment.some(e=>(e.system==='racks'||!e.rack&&e.system!=='network')&&Math.abs(x-e.position[0])<.5+e.size[0]/2&&Math.abs(z-e.position[2])<.5+e.size[2]/2);
 return {id:`panel-${column+1}-${row+1}`,name:`Panel ${column+1}.${row+1}`,x,z,occupied};
});
export function panelState(panel:typeof roomPanels[number],mode:RoomFloorMode,cutaway:boolean,lifted:readonly string[]){
 return {visible:mode==='raised'&&(!(cutaway&&panel.z>=0&&!panel.occupied)||lifted.includes(panel.id)),height:mode==='raised'&&!panel.occupied&&lifted.includes(panel.id)?.7:-.045};
}
export function buildRoomFloor(color:(id:string)=>string){
 const group=new T.Group(),raised=new T.Group(),tiles=new Map<string,T.Mesh>();group.add(raised);
 const resources=new Set<T.BufferGeometry>(),materials=new Map<string,T.MeshStandardMaterial>();
 function box(parent:T.Group,size:[number,number,number],at:[number,number,number],tone:string){
  const key=size.join(',');let geometry=[...resources].find(g=>g.name===key);if(!geometry){geometry=new T.BoxGeometry(...size);geometry.name=key;resources.add(geometry);}
  let material=materials.get(tone);if(!material){material=new T.MeshStandardMaterial({color:color(tone),roughness:.85});materials.set(tone,material);}
  const mesh=new T.Mesh(geometry,material);mesh.position.set(...at);parent.add(mesh);return mesh;
 }
 const slab=box(group,[14.1,.22,12.1],[0,-.77,0],'grid');
 for(const panel of roomPanels){const tile=box(raised,[.97,.09,.97],[panel.x,-.045,panel.z],'paper');tile.userData.floorPanel=panel.id;tiles.set(panel.id,tile);}
 // Shared vertices at panel corners, including the perimeter.
 for(let x=0;x<=14;x++)for(let z=0;z<=12;z++){
  box(raised,[.045,.54,.045],[x-7,-.36,z-6],'racks');
  box(raised,[.14,.025,.14],[x-7,-.6475,z-6],'racks');
 }
 for(let z=0;z<=12;z++)box(raised,[14,.055,.045],[0,-.115,z-6],'racks');
 for(let x=0;x<=14;x++)box(raised,[.045,.055,12],[x-7,-.115,0],'racks');
 // Batch the static support structure while retaining individual selectable panels.
 const supports=raised.children.filter(o=>o instanceof T.Mesh&&!o.userData.floorPanel) as T.Mesh[];
 const transformed=supports.map(mesh=>{mesh.updateMatrix();return mesh.geometry.clone().applyMatrix4(mesh.matrix);});
 const supportGeometry=mergeGeometries(transformed);transformed.forEach(g=>g.dispose());
 if(supportGeometry){const merged=new T.Mesh(supportGeometry,materials.get('racks'));raised.add(merged);supports.forEach(mesh=>raised.remove(mesh));}
 // Original shared support buffers are no longer referenced by the scene.
 const retained=new Set([slab.geometry,...[...tiles.values()].map(t=>t.geometry)]);for(const geometry of resources)if(!retained.has(geometry))geometry.dispose();
 return {group,tiles,update(mode:RoomFloorMode,cutaway:boolean,lifted:readonly string[],visible:boolean){
  group.visible=visible;raised.visible=mode==='raised';slab.position.y=mode==='raised'?-.77:-.11;
  for(const panel of roomPanels){const state=panelState(panel,mode,cutaway,lifted),mesh=tiles.get(panel.id)!;mesh.visible=state.visible;mesh.position.y=state.height;}
 }};
}
