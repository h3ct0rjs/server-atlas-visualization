export type ServerConnection = {
 id:string;
 from:string;
 to:string;
 kind:'power'|'data';
 medium:string;
 description:string;
};

// Teaching relationships only. Lines are neither vendor wiring routes nor pinouts.
// Data endpoints identify peers; their order does not imply one-way traffic.
export const serverConnections:ServerConnection[]=[];
function connect(from:string,to:string,kind:ServerConnection['kind'],medium:string,description:string){
 serverConnections.push({id:`${kind}:${from}:${to}`,from,to,kind,medium,description});
}

for(let n=0;n<2;n++){
 connect(`psu-${n}`,'board','power','Mating connector · distribution path','Illustrative DC supply path through a hot-plug connector and power distribution circuitry. Intermediate distribution boards are omitted; two supplies do not alone guarantee redundancy.');
 connect('board',`cpu-${n}`,'power','Board traces · voltage regulation · socket','The board distributes power through processor voltage regulation and socket contacts. Regulators and individual rails are omitted.');
 for(let j=0;j<4;j++){
  connect('board',`dimm-${n}-${j}`,'power','Board traces · DIMM socket','Illustrative memory power distribution through the board and DIMM socket. Rail regulation and module power circuitry depend on the memory generation.');
  connect(`cpu-${n}`,`dimm-${n}-${j}`,'data','Board traces · socket contacts','Conceptual processor-to-memory relationship across board traces and socket contacts. Lines do not specify memory channels, slot order, or a population rule.');
 }
}
connect('cpu-0','cpu-1','data','Board traces · processor interconnect','A conceptual interprocessor link for this two-socket example. Protocol, lane count, and board topology are configuration dependent.');
connect('board','backplane','power','Illustrative cable · distribution connectors','This example supplies the drive backplane through an illustrative power cable. Real assemblies may use separate distribution boards or different connectors.');
connect('board','controller','power','Board traces · expansion connector','Power reaches this illustrative controller through its expansion interface. The actual mounting and power arrangement depend on the controller.');
connect('board','controller','data','Board traces · expansion connector','The controller exchanges host storage traffic through a board expansion interface. Intermediate processor or chipset connections are omitted.');
connect('controller','backplane','data','Illustrative storage cable','Example controller-to-backplane storage path. This does not describe all SAS, SATA, or NVMe topologies; some configurations connect drives directly to processor PCIe lanes.');
connect('board','riser','power','Board traces · mating connector','Power reaches the riser through its board connector. Available power and any supplemental supply depend on the riser and cards.');
connect('board','riser','data','Board traces · mating connector','Conceptual PCIe path from the system board into the riser. Lane allocation and processor ownership are omitted.');
connect('riser','nic','power','Expansion slot contacts','The illustrated network card receives power through the riser slot. This is one adapter form factor; the example does not specify a power budget.');
connect('riser','nic','data','PCIe slot contacts','The adapter exchanges host traffic through the riser slot. External network cables are outside this internal connection layer.');
for(let n=0;n<6;n++){
 connect('backplane',`drive-${n}`,'power','Backplane traces · mating connector','Power passes through the backplane and the inserted drive connector. The carrier is mechanical; the electrical endpoint represents the drive inside it.');
 connect('backplane',`drive-${n}`,'data','Backplane traces · mating connector','Conceptual bidirectional storage connection to the inserted drive. A line does not specify protocol, speed, lane count, or backplane switching.');
 connect('board',`fan-${n}`,'power','Distribution path · fan connector','Illustrative fan power path. A real server may use a fan board, harness, or direct board connector; control and tachometer signals are omitted.');
}

export const componentNotes:Record<string,string>={
 chassis:'A mechanical support, so it has no power or data line in this layer. Real enclosures also participate in grounding and shielding; those relationships are not drawn.',
 'wall--1':'A mechanical enclosure part. Rails, fasteners, clearances, and grounding details vary by chassis and are not modeled.',
 'wall-1':'A mechanical enclosure part. Rails, fasteners, clearances, and grounding details vary by chassis and are not modeled.',
 lid:'The removable cover completes the enclosure and affects the intended air path. Removing it here is an inspection view, not an operating or servicing instruction.',
 board:'Hosts sockets, connectors, traces, and distribution circuitry. Connection lines collapse intermediate regulators, chipsets, and distribution boards; they are not a circuit schematic.',
 backplane:'Combines drive-facing connectors with upstream power and storage paths. Direct-attached NVMe, expander, and controller-based arrangements can differ substantially from this example.',
 controller:'Shown as a board-connected controller with a cable to the backplane. RAID capability, cache, protection hardware, and supported drive protocols depend on the installed option.',
 riser:'Reorients expansion cards inside the chassis while carrying slot signals and power. Slot width, electrical lane count, and supplemental power are configuration dependent.',
 nic:'Shown as a PCIe card in a riser. Other servers use different adapter form factors; port speed, media, transceivers, and external cabling are unspecified.',
 shroud:'A passive airflow guide with no electrical connection. Its shape depends on processor cooling, memory, and expansion-card configuration; the separate visibility control exposes covered components.',
};
for(let n=0;n<2;n++){
 componentNotes[`cpu-${n}`]='Receives regulated power and exchanges memory and interprocessor traffic. The drawing omits detailed I/O topology; processor count, socket type, and memory support are configuration dependent.';
 componentNotes[`sink-${n}`]='A passive thermal component, so no power or data line terminates here. Heat crosses the processor interface into the fins; retention and cooling options vary by processor configuration.';
 componentNotes[`psu-${n}`]='Converts the incoming supply into server DC power. The drawn link is an internal distribution relationship; upstream A/B feeds, load sharing, capacity, and failover behavior are not simulated.';
 for(let j=0;j<4;j++)componentNotes[`dimm-${n}-${j}`]='Receives power through its socket and exchanges data with the associated processor in this teaching layout. Eight pictured DIMMs do not specify supported slot count, channel mapping, or installation order.';
}
for(let n=0;n<6;n++){
 componentNotes[`drive-${n}`]='The visible carrier holds the electrical drive endpoint. Backplane contacts carry data and power; drive interface, capacity, hot-plug support, and carrier compatibility depend on the actual system.';
 componentNotes[`fan-${n}`]='Consumes power to move cooling air. Only the supply relationship is drawn; control and speed feedback, fan-board layout, redundancy, and supported fan type depend on the system.';
}
