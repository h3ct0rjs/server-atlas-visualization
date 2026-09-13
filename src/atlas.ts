export type System = 'racks' | 'compute' | 'network' | 'power' | 'cooling';
export type Equipment = {id:string; name:string; system:System; kind:string; position:[number,number,number]; size:[number,number,number]; rack?:string; rackU?:number; rackUnits?:number; description:string; specs:Record<string,string>};
export const systems: {id:System; name:string; description:string}[] = [
 {id:'racks',name:'Racks',description:'Cabinets & structure'},
 {id:'compute',name:'Compute',description:'Servers & storage'},
 {id:'network',name:'Networking',description:'Switches & fabric'},
 {id:'power',name:'Power',description:'Distribution & backup'},
 {id:'cooling',name:'Cooling',description:'Air handling'}
];
// A schematic mounting zone: 42 equally spaced rack units, above the feet.
export const RACK_UNITS=42, RACK_UNIT_HEIGHT=.07, RACK_MOUNT_BOTTOM=.18;
export function rackMountHeight(u:number, units:number) {return RACK_MOUNT_BOTTOM+(u-1+units/2)*RACK_UNIT_HEIGHT;}
export const equipment:Equipment[] = [];
for(let row=0;row<2;row++) for(let col=0;col<4;col++) {
 const id=`${row?'B':'A'}${String(col+1).padStart(2,'0')}`,x=(col-1.5)*1.8,z=row?2.1:-2.1;
 equipment.push({id,name:`Rack ${id}`,system:'racks',kind:'42U cabinet',position:[x,1.65,z],size:[1.25,3.3,1.45],description:'A 42U cabinet with numbered mounting rails, blanking panels, vertical cable managers, and leveling feet. Empty mounting positions are closed at the front; the rear remains accessible for services.',specs:{Capacity:'42U',Occupied:'14U (12U servers + 2U switches)',Available:'28U behind blanking panels',Support:'Leveling feet; cabinet bottom at floor level',Clearances:'Front / rear service zones are schematic',Row:row?'B':'A',Layout:'Illustrative, not to scale'}});
 for(let n=0;n<6;n++) equipment.push({id:`${id}-SRV-${n+1}`,name:`${n===5?'Storage':'Compute'} ${id}.${String(n+1).padStart(2,'0')}`,system:'compute',kind:n===5?'Storage server':'2U server',rack:id,rackU:3+n*5,rackUnits:2,position:[x,rackMountHeight(3+n*5,2),z],size:[1.08,RACK_UNIT_HEIGHT*2-.008,1.2],description:n===5?'A rack-mounted storage node. Drive bays provide a visual reference for the storage layer.':'A rack-mounted compute node. CPU, memory, local disks, and network interfaces support workloads running in the datacenter.',specs:{Rack:id,'Mounting units':`U${3+n*5}–U${4+n*5}`,Role:n===5?'Shared storage':'Virtualization host',Model:'Generic demonstration hardware'}});
 for(let n=0;n<2;n++) equipment.push({id:`${id}-SW-${n+1}`,name:`Leaf ${id}.${n+1}`,system:'network',kind:'Top-of-rack switch',rack:id,rackU:40+n*2,rackUnits:1,position:[x,rackMountHeight(40+n*2,1),z],size:[1.08,RACK_UNIT_HEIGHT-.008,1],description:'A leaf switch aggregates server connections and connects to the spine layer. Two switches illustrate a redundant fabric.',specs:{Rack:id,'Mounting units':`U${40+n*2}`,Layer:'Leaf',Ports:'Illustrative 24-port face'}});
 equipment.push({id:`${id}-PDU`,name:`PDU ${id}`,system:'power',kind:'Rack power distribution',rack:id,position:[x+.5,1.6,z-.66],size:[.12,2.75,.12],description:'A vertical power distribution unit supplies rack equipment. This model shows one PDU per rack; redundant feeds can be added to the dataset.',specs:{Rack:id,Orientation:'Vertical',Feed:'Illustrative single feed'}});
}
for(let n=0;n<2;n++)equipment.push({id:`SPINE-${n+1}`,name:`Spine ${n+1}`,system:'network',kind:'Spine switch',position:[(n-.5)*2.4,4.05,0],size:[1.7,.22,.85],description:'The spine layer connects leaf switches across the room. Enable Network paths to see the logical fabric; the lines do not represent cable routing.',specs:{Layer:'Spine',Connections:'One link per leaf',Placement:'Exploded above the room'}});
for(let n=0;n<4;n++)equipment.push({id:`CRAC-${n+1}`,name:`Cooling unit ${n+1}`,system:'cooling',kind:'Room air handler',position:[(n-1.5)*1.8,1.25,4.6],size:[1.2,2.5,1.15],description:'An air handling unit illustrates the cooling system serving the rack rows. The model is an educational arrangement, not a thermal simulation.',specs:{System:'Room cooling',Medium:'Air',Placement:'Perimeter'}});
for(let n=0;n<2;n++)equipment.push({id:`UPS-${n+1}`,name:`UPS ${n+1}`,system:'power',kind:'Uninterruptible power supply',position:[-5.2,1.15,(n-.5)*2.2],size:[1.3,2.3,1.45],description:'A UPS provides short-term backup power and power conditioning. Actual capacity and runtime depend on the equipment and site design.',specs:{System:'Electrical backup',Capacity:'Not specified',Runtime:'Not specified'}});
export const networkLinks=equipment.filter(e=>e.kind==='Top-of-rack switch').flatMap(leaf=>['SPINE-1','SPINE-2'].map(spine=>({source:leaf.id,target:spine})));
export function searchEquipment(query:string,visible:System[]=systems.map(s=>s.id)) {const q=query.trim().toLowerCase();return equipment.filter(e=>visible.includes(e.system)&&`${e.id} ${e.name} ${e.kind} ${e.rack??''}`.toLowerCase().includes(q));}
export function positionFor(e:Equipment,explode:number):[number,number,number] {return[e.position[0]*(1+explode*.6),e.position[1]+(e.system==='network'?explode*1.5:0),e.position[2]*(1+explode*.6)];}

export function rackSlots(rackId:string):{u:number;equipmentId?:string}[] {
 if(!equipment.some(e=>e.id===rackId&&e.system==='racks'))return [];
 return Array.from({length:RACK_UNITS},(_,index)=>{const u=index+1;const mounted=equipment.find(e=>e.rack===rackId&&e.rackU!==undefined&&u>=e.rackU&&u<e.rackU+(e.rackUnits??1));return {u,...(mounted?{equipmentId:mounted.id}:{})};});
}
