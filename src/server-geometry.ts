import * as T from 'three';
import type {Part} from './detail-models';

/** Authored schematic geometry, in atlas units. +Z is the drive/front side. */
export function buildServerPart(part:Part,color:(id:string)=>string):T.Group {
 const g=new T.Group();g.name=part.id;g.userData.id=part.id;
 const [w,h,d]=part.size;
 const metal=color('server-metal'),dark=color('server-dark'),board=color('server-board'),chip=color('server-chip'),gold=color('server-gold'),indicator=color('server-indicator'),accent=color(part.color);
 const materials=new Map<string,T.MeshStandardMaterial>();
 function material(c:string){let m=materials.get(c);if(!m){m=new T.MeshStandardMaterial({color:c,metalness:c===metal?.7:.18,roughness:c===metal?.4:.68});materials.set(c,m);}return m;}
 function mesh(geometry:T.BufferGeometry,at:[number,number,number],c:string,name:string){const m=new T.Mesh(geometry,material(c));m.position.set(...at);m.name=name;m.userData.id=part.id;g.add(m);return m;}
 function box(size:[number,number,number],at:[number,number,number],c:string,name:string){return mesh(new T.BoxGeometry(...size),at,c,name);}
 function cylinder(radius:number,depth:number,at:[number,number,number],c:string,name:string,axis:'y'|'z'='y') {const m=mesh(new T.CylinderGeometry(radius,radius,depth,12),at,c,name);if(axis==='z')m.rotation.x=Math.PI/2;return m;}
 function grille(at:[number,number,number],width:number,height:number,count:number){for(let i=0;i<count;i++)box([width/count*.36,height,.014],[at[0]-width/2+width*(i+.5)/count,at[1],at[2]],dark,'Vent slot');}
 function pcb(size:[number,number,number]){box(size,[0,0,0],board,'Printed circuit board');}
 function screws(xs:number[],zs:number[],y:number){for(const x of xs)for(const z of zs)cylinder(.027,.013,[x,y,z],metal,'Captive fastener');}

 if(part.id==='chassis'){
  box([w,h,d],[0,0,0],metal,'Chassis tray');
  for(const x of [-w/2,w/2]){
   box([.18,.55,.12],[x,.24,d/2],metal,'Rack mounting ear');
   for(const y of [.08,.38])cylinder(.045,.015,[x,y,d/2+.07],dark,'Mounting hole','z');
   box([.1,.1,d-.3],[x,-.025,0],dark,'Sliding rail track');
  }
  box([w,.1,.08],[0,.04,-d/2],metal,'Rear sill');
  box([1.25,.5,.035],[-.95,.3,-d/2],metal,'Rear ventilation panel');
  box([1.25,.12,.035],[.95,.11,-d/2],metal,'Expansion aperture sill');
  grille([-.95,.3,-d/2-.022],1.15,.33,14);
  grille([.95,.11,-d/2-.022],1.15,.07,14);
  screws([-1.95,1.95],[-2.8,0,2.8],h/2+.015);
 }else if(part.id.startsWith('wall-')){
  box([w,h,d],[0,0,0],metal,'Chassis side');
  box([.13,.025,d],[0,h/2,0],metal,'Folded top flange');
  box([.12,.065,d-.2],[0,-h/3,0],dark,'Rail channel');
 }else if(part.id==='lid'){
  box([w,h,d],[0,0,0],metal,'Cover panel');
  for(const x of [-w/2,w/2])box([.025,.1,d],[x,-.04,0],metal,'Cover lip');
  box([.5,.02,.3],[0,h/2+.015,-1.8],dark,'Cover release latch');
 }else if(part.id==='board'){
  pcb([w,h,d]);
  for(const x of [-1.45,0,1.45])for(const z of [-1.25,-.35,.7])box([.16,.055,.18],[x,.06,z],chip,'Board logic package');
  for(const x of [-1,1]){
   box([.77,.035,.82],[x,.055,.1],dark,'Processor socket');
   for(let j=0;j<4;j++)box([.095,.08,1.14],[x-.4+j*.26,.075,-1.1],dark,'Memory socket');
   for(let j=0;j<5;j++)box([.06,.095,.09],[x-.45+j*.18,.075,.68],metal,'Power regulation component');
  }
  for(let i=0;i<5;i++)box([.22,.08,.12],[-1.3+i*.58,.075,1.62],dark,'Board edge connector');
  screws([-1.8,1.8],[-1.7,1.7],.05);
 }else if(part.id.startsWith('cpu-')){
  box([w,h,d],[0,0,0],board,'Processor substrate');
  box([w*.85,.035,d*.85],[0,h/2+.012,0],metal,'Integrated heat spreader');
  for(const x of [-w/2,w/2])box([.015,.018,d*.7],[x,0,0],gold,'Package edge');
 }else if(part.id.startsWith('sink-')){
  box([w,.045,d],[0,-h/2+.023,0],metal,'Heatsink contact base');
  for(let i=0;i<13;i++)box([.022,h-.045,d],[-w/2+.025+i*(w-.05)/12,.023,0],metal,'Air-aligned cooling fin');
  screws([-w*.38,w*.38],[-d*.38,d*.38],h/2+.009);
 }else if(part.id.startsWith('dimm-')){
  pcb([w,h,d]);
  for(const x of [-w/2-.011,w/2+.011])for(let i=0;i<5;i++)box([.023,h*.55,.14],[x,.025,-d*.39+i*d*.195],chip,'Memory package');
  box([w+.004,.055,d*.86],[0,-h/2,0],gold,'Gold edge contacts');
  for(const z of [-d/2,d/2])box([w+.055,.1,.045],[0,-h/2+.035,z],metal,'Socket retaining clip');
 }else if(part.id.startsWith('drive-')){
  box([w*.84,h*.75,d-.1],[0,0,-.045],metal,'Drive housing');
  box([w,h,.07],[0,0,d/2],dark,'Hot-swap carrier bezel');
  grille([0,.035,d/2+.043],w*.72,h*.52,7);
  box([w*.74,.055,.035],[0,-h*.32,d/2+.06],accent,'Carrier release handle');
  box([.047,.1,.03],[w*.4,0,d/2+.053],accent,'Release latch');
  for(const y of [.11,.16])box([.025,.018,.019],[-w*.43,y,d/2+.049],indicator,'Status indicator');
  box([w*.5,.045,.06],[0,-.04,-d/2],dark,'Backplane connector');
 }else if(part.id.startsWith('fan-')){
  const edge=.055;
  for(const x of [-w/2+edge/2,w/2-edge/2])box([edge,h,d],[x,0,0],dark,'Fan module side');
  for(const y of [-h/2+edge/2,h/2-edge/2])box([w,edge,d],[0,y,0],dark,'Fan module frame');
  const radius=Math.min(w,h)*.36;
  const ring=mesh(new T.TorusGeometry(radius,.018,6,24),[0,0,d/2],metal,'Fan guard ring');ring.rotation.z=Math.PI/4;
  cylinder(.066,.15,[0,0,.1],accent,'Fan motor hub','z');
  for(let i=0;i<7;i++){
   const a=i*Math.PI*2/7;
   const blade=box([radius*.53,radius*.93,.032],[Math.cos(a)*radius*.56,Math.sin(a)*radius*.56,.07],metal,'Fan blade');blade.rotation.z=a-.45;
  }
  box([w*.55,.025,.07],[0,h/2+.014,0],accent,'Fan lift tab');
 }else if(part.id.startsWith('psu-')){
  box([w,h,d],[0,0,0],metal,'Power supply enclosure');
  box([w*.91,h*.87,.03],[0,0,-d/2-.015],dark,'Rear supply face');
  grille([-.19,.025,-d/2-.036],w*.38,h*.55,7);
  box([.28,.23,.04],[.18,-.015,-d/2-.04],metal,'AC inlet rim');
  box([.235,.185,.05],[.18,-.015,-d/2-.055],dark,'AC inlet recess');
  for(const x of [.11,.25])box([.025,.065,.016],[x,-.025,-d/2-.083],metal,'Inlet contact');
  box([.025,.045,.016],[.18,.04,-d/2-.083],metal,'Inlet contact');
  for(const x of [-.26,.26])box([.035,.075,.15],[x,-.14,-d/2-.08],accent,'Supply handle arm');
  box([.55,.035,.03],[0,-.16,-d/2-.16],accent,'Supply extraction handle');
  box([w*.5,.04,.1],[0,-.04,d/2],dark,'Power output connector');
 }else if(part.id==='backplane'){
  pcb([w,h,d]);
  for(let i=0;i<6;i++)box([.36,.1,.08],[-1.73+i*.69,0,d/2+.03],dark,'Drive connector');
  for(let i=0;i<5;i++)box([.12,.13,.025],[-1.5+i*.75,.12,-d/2-.02],chip,'Backplane logic');
 }else if(part.id==='riser'){
  pcb([w,h,d]);
  box([.13,.1,d*.8],[.07,h/2,0],dark,'PCIe card socket');
  box([.14,h,.05],[0,0,-d/2],metal,'Riser support bracket');
 }else if(part.id==='nic'||part.id==='controller'){
  pcb([w,h,d]);
  box([w*.4,.04,d*.42],[0,h/2+.02,0],chip,'Controller package');
  for(let i=0;i<6;i++)box([.025,.07,d*.32],[-w*.17+i*w*.068,h/2+.07,0],metal,'Adapter heatsink fin');
  if(part.id==='nic'){
   box([w,.28,.035],[0,.06,-d/2],metal,'Rear adapter bracket');
   for(const x of [-w*.23,w*.23]){
    box([.23,.18,.2],[x,.04,-d/2-.04],metal,'Network port cage');
    box([.18,.13,.012],[x,.04,-d/2-.146],dark,'Network port opening');
   }
  }else for(const x of [-w*.3,w*.3])box([.18,.08,.11],[x,.05,d/2],dark,'Storage cable socket');
 }else if(part.id==='shroud'){
  box([w,h,d],[0,0,0],dark,'Air shroud roof');
  for(const x of [-w/2,0,w/2])box([.035,.32,d],[x,-.17,0],dark,'Air guide wall');
 }else box([w,h,d],[0,0,0],accent,part.name);
 return g;
}
