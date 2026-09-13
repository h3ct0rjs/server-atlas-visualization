import * as T from 'three';
import {rackSlots,rackMountHeight,RACK_UNIT_HEIGHT,type Equipment} from './atlas.ts';

// All dimensions are illustrative scene units. No vendor service envelope is implied.
export function buildRackModel(e:Equipment,color:(id:string)=>string):T.Group {
 const group=new T.Group(),[w,h,d]=e.size;
 const material=(token:string)=>new T.MeshStandardMaterial({color:color(token),roughness:.7,metalness:.3});
 const metal=material('racks'),dark=material('inset'),label=material('server-metal');
 const localY=(worldY:number)=>worldY-e.position[1];
 function box(name:string,size:[number,number,number],at:[number,number,number],mat=metal){
  const mesh=new T.Mesh(new T.BoxGeometry(...size),mat);mesh.name=name;mesh.userData.id=e.id;mesh.position.set(...at);group.add(mesh);return mesh;
 }
 // Frame and leveling feet stay within the original cabinet envelope.
 for(const x of [-w/2+.035,w/2-.035])for(const z of [-d/2+.035,d/2-.035]){
  box('Cabinet corner post',[.055,h-.14,.055],[x,.07,z]);
  box('Leveling foot',[.11,.08,.11],[Math.sign(x)*(w/2-.065),-h/2+.04,Math.sign(z)*(d/2-.065)],dark);
 }
 box('Cabinet roof',[w,.055,d],[0,h/2-.0275,0]);
 box('Cabinet base',[w,.06,d],[0,-h/2+.11,0]);
 for(const z of [-d/2+.12,d/2-.095])for(const x of [-.56,.56])
  box('Numbered mounting rail',[.05,2.94,.045],[x,localY(.18+2.94/2),z]);
 for(const x of [-w/2+.055,w/2-.055]){
  box('Vertical cable manager',[.055,2.79,.075],[x,localY(1.63),-d/2+.24],dark);
  for(let i=0;i<9;i++)box('Cable management finger',[.095,.018,.09],[x,localY(.39+i*.3),-d/2+.24],metal);
 }
 // Blank panels correspond exactly to free rack units, including gaps between servers.
 for(const slot of rackSlots(e.id))if(!slot.equipmentId){
  const blank=box('Blanking panel',[1.075,RACK_UNIT_HEIGHT-.006,.025],[0,localY(rackMountHeight(slot.u,1)),d/2-.08],dark);
  blank.userData.rackUnit=slot.u;
 }
 // Seven-segment numbers are geometry, so they remain available without canvas/texture support.
 const digits=['abcdef','bc','abdeg','abcdg','bcfg','acdfg','acdefg','abc','abcdefg','abcdfg'];
 const segments:Record<string,[number,number,number,number]>={a:[0,1,1,.18],b:[.5,.5,.18,1],c:[.5,-.5,.18,1],d:[0,-1,1,.18],e:[-.5,-.5,.18,1],f:[-.5,.5,.18,1],g:[0,0,1,.18]};
 const numberTransforms:T.Matrix4[]=[];
 for(let u=1;u<=42;u++){
  const number=String(u).padStart(2,'0');
  for(let digit=0;digit<2;digit++)for(const segment of digits[Number(number[digit])]){
   const [sx,sy,sw,sh]=segments[segment],scale=.015;
   numberTransforms.push(new T.Matrix4().compose(new T.Vector3(-.563+(digit-.5)*.021+sx*scale,localY(rackMountHeight(u,1))+sy*scale,d/2-.069),new T.Quaternion(),new T.Vector3(sw*scale,sh*scale,.003)));
  }
 }
 const numbering=new T.InstancedMesh(new T.BoxGeometry(1,1,1),label,numberTransforms.length);
 numbering.name='Rack unit numbers 01–42, bottom to top';numbering.userData.id=e.id;numberTransforms.forEach((matrix,index)=>numbering.setMatrixAt(index,matrix));group.add(numbering);
 // Service guides are deliberately qualitative. Root controls their visibility.
 for(const [side,z] of [['Front',d/2+.5],['Rear',-d/2-.5]] as const){
  const mat=material(side==='Front'?'network':'cooling');mat.transparent=true;mat.opacity=.3;mat.depthWrite=false;
  const guide=box(`${side} service zone (schematic)`,[w,.008,1],[0,localY(.012),z],mat);
  guide.userData.serviceClearance=true;guide.userData.serviceSide=side;guide.visible=false;
 }
 return group;
}
