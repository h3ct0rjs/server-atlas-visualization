import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
export type FloorShape='solid'|'vent'|'service'|'grommet';
export const FLOOR={pitch:1,panelSize:.97,panelThickness:.09,panelY:-.045,slabThickness:.22,raisedSlabTop:-.66,serviceOpening:.32,grommetOuter:.38,grommetHeight:.045,grommetLocalY:.0675} as const;
type Vec=[number,number,number];
/** Actual open geometry, rather than dark decals on an intact surface. */
export function createFloorGeometry(shape:FloorShape,size:Vec):T.BufferGeometry{
 if(shape==='solid')return new T.BoxGeometry(...size);
 const [w,h,d]=size,parts:T.BufferGeometry[]=[];
 const strip=(sx:number,sz:number,x:number,z:number)=>parts.push(new T.BoxGeometry(sx,h,sz).translate(x,0,z));
 if(shape==='service'||shape==='grommet'){
  const hole=shape==='service'?FLOOR.serviceOpening:.14;
  strip((w-hole)/2,d,-(w+hole)/4,0);strip((w-hole)/2,d,(w+hole)/4,0);
  strip(hole,(d-hole)/2,0,-(d+hole)/4);strip(hole,(d-hole)/2,0,(d+hole)/4);
 }else{
  const rim=.09,innerW=w-rim*2,innerD=d-rim*2;
  strip(rim,d,-(w-rim)/2,0);strip(rim,d,(w-rim)/2,0);
  strip(innerW,rim,0,-(d-rim)/2);strip(innerW,rim,0,(d-rim)/2);
  // Six open slots, separated by structural strips.
  for(let i=1;i<6;i++)strip(innerW,.028,0,-innerD/2+i*innerD/6);
 }
 const merged=mergeGeometries(parts)!;parts.forEach(p=>p.dispose());return merged;
}
export type FloorSupport={id:string;name:string;kind:'pedestal'|'foot'|'stringer';size:Vec;at:Vec};
export function floorSupports(columns:number,rows:number):FloorSupport[]{
 const result:FloorSupport[]=[];
 for(let x=0;x<=columns;x++)for(let z=0;z<=rows;z++){
  const px=x-columns/2,pz=z-rows/2;
  result.push({id:`pedestal-${x}-${z}`,name:`Pedestal ${x+1}.${z+1}`,kind:'pedestal',size:[.045,.54,.045],at:[px,-.36,pz]});
  result.push({id:`support-foot-${x}-${z}`,name:`Pedestal base ${x+1}.${z+1}`,kind:'foot',size:[.14,.025,.14],at:[px,-.6475,pz]});
 }
 for(let z=0;z<=rows;z++)result.push({id:`stringer-z-${z}`,name:`Cross stringer ${z+1}`,kind:'stringer',size:[columns,.055,.045],at:[0,-.115,z-rows/2]});
 for(let x=0;x<=columns;x++)result.push({id:`stringer-x-${x}`,name:`Longitudinal stringer ${x+1}`,kind:'stringer',size:[.045,.055,rows],at:[x-columns/2,-.115,0]});
 return result;
}
