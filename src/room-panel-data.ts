import {equipment} from './atlas.ts';
import type {FloorShape} from './floor-kit.ts';
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
