export type Part = {id:string;name:string;group:string;size:[number,number,number];at:[number,number,number];offset:[number,number,number];color:string;description:string;role:string;mode?:'raised'|'slab';cover?:boolean};
const dell='https://www.dell.com/support/manuals/en-us/poweredge-r760/per760_ism_pub/inside-the-system?guid=guid-043d9f52-a16e-4494-a65a-128c47fd4ea4&lang=en-us';
export const references={server:dell,floor:'https://download.schneider-electric.com/files?p_Doc_Ref=SPD_SADE-5TNQYN_EN&p_File_Name=SADE-5TNQYN_R3_EN.pdf&p_enDocType=White+Paper'};
export const serverParts:Part[]=[];
function add(id:string,name:string,group:string,size:Part['size'],at:Part['at'],offset:Part['offset'],color:string,description:string,role:string,extra:Partial<Part>={}){serverParts.push({id,name,group,size,at,offset,color,description,role,...extra});}
add('chassis','Chassis base','Structure',[4.4,.08,6.8],[0,0,0],[0,0,0],'racks','The metal enclosure locates and protects the components. This is a schematic 2U arrangement, not a dimensionally exact Dell assembly.','Mechanical support');
for(const side of [-1,1])add(`wall-${side}`,`${side<0?'Left':'Right'} side wall`,'Structure',[.07,.65,6.8],[side*2.18,.34,0],[side*.65,0,0],'racks','Side walls stiffen the enclosure and provide mounting surfaces.','Enclosure');
add('lid','Removable lid','Structure',[4.4,.06,6.8],[0,.72,0],[0,3,0],'racks','Remove the cover to inspect the fan wall, memory, processors, and expansion cards. The atlas opens the lid without showing a servicing procedure.','Access cover',{cover:true});
add('board','System board','Compute',[3.9,.07,3.7],[0,.12,-.65],[0,.25,-.6],'cooling','The system board connects processor sockets, memory channels, expansion interfaces, and management electronics.','Component interconnect');
for(let n=0;n<2;n++){
 const x=n?1:-1;
 add(`cpu-${n}`,`Processor ${n+1}`,'Compute',[.7,.09,.75],[x,.23,-.55],[x*.15,1.1,0],'power','A processor executes instructions and connects to its memory channels. The two-processor arrangement is illustrative; population varies by server configuration.','Instruction execution');
 add(`sink-${n}`,`Heatsink ${n+1}`,'Cooling',[.85,.28,.95],[x,.43,-.55],[x*.15,2,0],'racks','A heatsink transfers processor heat into the moving air. Its fins increase the surface area available for heat transfer.','Heat transfer');
 for(let j=0;j<4;j++)add(`dimm-${n}-${j}`,`Memory bank ${n+1} · DIMM ${j+1}`,'Compute',[.07,.32,1.1],[x-.4+j*.26,.34,-1.75],[x*.2,1.1,-.9],'cooling','A DIMM provides working memory. This simplified model uses eight modules to show placement; it does not assert a Dell slot count or population rule.','Working memory');
 add(`psu-${n}`,`Power supply ${n+1}`,'Power',[.85,.48,1],[n?1.64:-1.64,.32,-2.85],[n?1:-1,.2,-1.1],'power','A hot-plug power supply converts incoming power for the server. Two modules illustrate redundancy; real resilience also depends on their upstream feeds and configuration.','Power conversion');
}
for(let n=0;n<6;n++){
 add(`drive-${n}`,`Drive carrier ${n+1}`,'Storage',[.62,.48,1.4],[-1.73+n*.69,.32,2.65],[0,.2,1.4],'compute','A removable carrier holds a storage drive and connects it to the backplane. Supported SAS, SATA, or NVMe devices depend on the actual chassis and controller.','Persistent storage');
 add(`fan-${n}`,`Cooling fan ${n+1}`,'Cooling',[.59,.5,.48],[-1.73+n*.69,.34,1.25],[0,1.2,.6],'network','Fans move air from the front drive area toward the rear. Air shrouds guide that flow through heat-producing components. Arrows in this explorer are explanatory, not simulated.','Air movement');
}
add('backplane','Drive backplane','Storage',[4,.48,.09],[0,.33,1.88],[0,.6,1],'power','The drive backplane provides electrical connections behind the drive carriers. Its interfaces and cabling depend on the selected drive configuration.','Drive connectivity');
add('riser','PCIe riser','Expansion',[.1,.48,1.1],[.2,.34,-2.5],[.4,1,-.6],'cooling','A riser changes the orientation of PCIe expansion slots to fit cards inside a low-profile chassis.','Expansion interface');
add('nic','Network adapter','Expansion',[.8,.08,1.1],[.7,.45,-2.5],[.7,1.5,-.8],'network','A network adapter connects the server to the switching fabric. Port type and link speed belong to a specific adapter configuration.','Network connectivity');
add('controller','Storage controller','Storage',[.7,.09,.6],[-.2,.23,.25],[-.4,1.1,.3],'network','A storage controller manages compatible drives. RAID support and data paths depend on the installed controller and drive type.','Storage management');
add('shroud','Air shroud','Cooling',[3.7,.05,2.8],[0,.66,-.55],[0,2.6,-.6],'compute','The air shroud directs cooling air over the processors and memory. Use Show shroud independently of Remove lid; select it in the index to inspect it.','Airflow guidance',{cover:true});
export function floorParts(mode:'raised'|'slab'):Part[]{
 const parts:Part[]=[];
 const push=(id:string,name:string,group:string,size:Part['size'],at:Part['at'],offset:Part['offset'],color:string,description:string,role:string,cover=false)=>parts.push({id,name,group,size,at,offset,color,description,role,cover});
 push('slab','Structural slab','Structure',[9,.32,8],[0,-1.25,0],[0,0,0],'racks','The structural floor supports the installation. Suitability depends on the building, equipment mass, contact points, and delivery route. No load capacity has been assigned to this sample.','Building support');
 if(mode==='raised'){
 for(let x=0;x<6;x++)for(let z=0;z<5;z++){
 const px=(x-2.5)*1.4,pz=(z-2)*1.4,vent=x===2||x===3;
 push(`tile-${x}-${z}`,`${vent?'Perforated':'Solid'} panel ${x+1}.${z+1}`,'Floor panels',[1.36,.09,1.36],[px,0,pz],[0,vent?1.6:.8,0],vent?'cooling':'compute',vent?'This supply panel illustrates air delivery from the underfloor plenum into a cold aisle. Open area and air volume must be selected for the real cooling design.':'A removable access panel forms the walking surface. Its panel rating is only one part of the floor assembly; pedestals, stringers, slab, and local equipment contacts also matter.',vent?'Supply air outlet':'Access surface',true);
 push(`pedestal-${x}-${z}`,`Pedestal ${x+1}.${z+1}`,'Understructure',[.07,1.05,.07],[px-.68,-.57,pz-.68],[0,0,0],'racks','Adjustable supports transfer load from the raised floor to the structural slab. Their spacing, bracing, and ratings are specific to the installed system.','Load transfer');
 }
 for(let z=0;z<6;z++)push(`stringer-${z}`,`Stringer ${z+1}`,'Understructure',[8.4,.07,.07],[0,-.12,(z-2.5)*1.4],[0,.25,0],'racks','Horizontal supports connect pedestals and support panel edges. The cutaway simplifies the full support grid.','Panel edge support');
 push('cable-tray','Underfloor cable tray','Services',[.6,.16,6.6],[-3,-.72,0],[-1,0,0],'network','Cable routes share limited underfloor space. Congestion can obstruct cooling air when this void is used as a supply plenum.','Cable routing');
 push('grommet','Sealed cable opening','Services',[.3,.13,.3],[-2.25,.04,2.6],[0,.9,0],'power','Sealing around cable penetrations reduces unintended air leakage from a supply plenum. This is a separate schematic example, not a machined hole in the panel mesh.','Leakage control');
 }else{
 push('overhead','Overhead cable tray','Services',[.65,.16,6.5],[-2.8,2.8,0],[-1,.8,0],'network','Overhead trays route cables without occupying an underfloor air path. Access, support, separation, and clearances still need a site design.','Cable routing');
 push('row-cooler','Row cooling unit','Cooling',[1,2.5,1.3],[3.15,.16,0],[1,0,0],'cooling','This example uses row-based air cooling on a slab. A raised floor is not required for every cooling architecture.','Room heat removal');
 }
 const base=mode==='raised'?.05:-1.09;
 for(let i=0;i<2;i++)push(`rack-foot-${i}`,`Rack contact ${i+1}`,'Loads',[.28,.2,.28],[-2,base+.1,(i-.5)*2],[0,.2,0],'power','Equipment loads enter the floor at discrete feet or casters. Concentrated and rolling loads must be assessed separately; weight divided by footprint does not certify suitability.','Concentrated load');
 return parts;
}
export function partPosition(part:Part,amount:number):Part['at']{return part.at.map((n,i)=>n+part.offset[i]*amount) as Part['at'];}
